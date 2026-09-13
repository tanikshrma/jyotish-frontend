import { leadFields, type LeadData } from "@/lib/prospectiq";

/**
 * The fields Prospect IQ's External Tracking script reads when a lead form is
 * submitted.
 *
 * The script builds each capture from `new FormData(form)`, so it only sees
 * inputs that have a `name`; it skips `type="hidden"` inputs entirely; and it
 * maps values onto CRM fields by input name and label. Our visible inputs are
 * custom React controls — split date/time pickers, a national-number phone
 * box, styled dropdowns, multi-step screens — that don't yield clean named
 * values, which is why every submission used to arrive as an empty
 * "Unidentified Form" contact.
 *
 * So each lead form renders its canonical values here instead: visually
 * hidden (but not `type="hidden"`, which the script ignores), named after the
 * live Prospect IQ field keys, labelled with the live field names, and
 * carrying clean values — ISO dates, E.164 phones, exact picklist options.
 * They stay mounted through every step, so a multi-step form still submits
 * everything. The visible inputs deliberately have no `name`, so nothing is
 * captured twice or in two formats. Empty values are left out entirely.
 */
export function TrackingFields({ formId, lead }: { formId: string; lead: LeadData }) {
  const fields = leadFields(lead).trackingFields;
  return (
    <div className="sr-only" aria-hidden="true">
      {fields.map((f) => {
        const id = `${formId}__${f.name}`;
        return (
          <div key={f.name}>
            <label htmlFor={id}>{f.label}</label>
            <input
              id={id}
              type="text"
              name={f.name}
              value={f.value}
              readOnly
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        );
      })}
    </div>
  );
}
