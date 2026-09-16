import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/**
 * Disk-backed job store for long-running PDF generation.
 *
 * A Complete Bundle renders two PDFs (~28 MB) and can take 60-120s end to end.
 * Cloudflare cuts any request at 100s, so the customer's browser was getting a
 * 520 while the payment had already been captured — the order was lost even
 * though the money was taken. Generation therefore runs in the background and
 * the browser polls this store instead of holding a request open.
 *
 * Disk rather than memory so a job survives a PM2 restart, and so multiple
 * worker processes see the same state. Jobs are keyed by Razorpay payment id,
 * which makes delivery idempotent: a refresh, a retry, or a second tab returns
 * the same job instead of regenerating and burning another API credit.
 */

export type JobStatus = "pending" | "ready" | "failed";

export type DeliveredPdf = { name: string; url: string; fileName: string };

export type Job = {
  id: string;
  paymentId: string;
  orderId: string;
  status: JobStatus;
  tier?: string;
  tierName?: string;
  pdfs: DeliveredPdf[];
  emailed: boolean;
  error?: string;
  /** Set when the upstream subscription is exhausted, so the UI can explain. */
  code?: string;
  /** A booked consultation (jobs keyed `consult:<paymentId>`). */
  booking?: {
    appointmentId: string;
    calendarId: string;
    startTime: string;
    endTime: string;
    label: string;
  };
  createdAt: string;
  updatedAt: string;
};

/**
 * Vercel runs functions on a read-only filesystem — only the OS temp dir is
 * writable — and freezes an instance as soon as it has responded. So there the
 * store lives in the temp dir, and handlers finish their work inside the
 * request rather than in the background. On a long-lived Node server (the
 * Hostinger deploy, behind Cloudflare's 100s ceiling) nothing changes.
 */
export const RUN_INLINE = Boolean(process.env.VERCEL);

const JOBS_DIR =
  process.env.JOBS_DIR ||
  (RUN_INLINE
    ? path.join(os.tmpdir(), "jyotishnow-jobs")
    : path.join(process.env.STORAGE_DIR || path.join(process.cwd(), "storage"), "jobs"));

/** Payment ids are opaque; hash them so they never become a path. */
const keyFor = (paymentId: string) =>
  crypto.createHash("sha256").update(paymentId).digest("hex").slice(0, 32);

const fileFor = (paymentId: string) => path.join(JOBS_DIR, `${keyFor(paymentId)}.json`);

export const readJob = async (paymentId: string): Promise<Job | null> => {
  try {
    return JSON.parse(await fs.readFile(fileFor(paymentId), "utf8")) as Job;
  } catch {
    return null;
  }
};

export const readJobById = async (jobId: string): Promise<Job | null> => {
  if (!/^[a-f0-9]{32}$/.test(jobId)) return null;
  try {
    return JSON.parse(
      await fs.readFile(path.join(JOBS_DIR, `${jobId}.json`), "utf8"),
    ) as Job;
  } catch {
    return null;
  }
};

const write = async (job: Job): Promise<Job> => {
  await fs.mkdir(JOBS_DIR, { recursive: true });
  // Write-then-rename so a poll never reads a half-written file.
  const target = path.join(JOBS_DIR, `${job.id}.json`);
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(job, null, 2));
  await fs.rename(tmp, target);
  return job;
};

export const createJob = async (
  paymentId: string,
  orderId: string,
  tier?: string,
  tierName?: string,
): Promise<Job> => {
  const now = new Date().toISOString();
  return write({
    id: keyFor(paymentId),
    paymentId,
    orderId,
    status: "pending",
    tier,
    tierName,
    pdfs: [],
    emailed: false,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateJob = async (
  paymentId: string,
  patch: Partial<Omit<Job, "id" | "paymentId" | "createdAt">>,
): Promise<Job | null> => {
  const job = await readJob(paymentId);
  if (!job) return null;
  return write({ ...job, ...patch, updatedAt: new Date().toISOString() });
};

/**
 * A job stuck pending for longer than this is treated as failed — the process
 * was almost certainly restarted mid-generation.
 */
export const STALE_AFTER_MS = 10 * 60 * 1000;

export const isStale = (job: Job): boolean =>
  job.status === "pending" &&
  Date.now() - new Date(job.updatedAt).getTime() > STALE_AFTER_MS;
