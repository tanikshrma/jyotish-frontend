# Jyotish Now

Vite + React + TypeScript + Tailwind CSS + shadcn/ui.

## Getting started

```sh
npm install
npm run dev
```

Dev server runs on [http://localhost:8080](http://localhost:8080).

## Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Production build                |
| `npm run build:dev` | Build in development mode       |
| `npm run preview`   | Preview the production build    |
| `npm run lint`      | Lint with ESLint                |
| `npm run test`      | Run tests once with Vitest      |
| `npm run test:watch`| Run tests in watch mode         |

## Structure

```
src/
  components/      Feature components
  components/ui/   shadcn/ui primitives
  data/            Static data
  hooks/           Custom React hooks
  lib/             Utilities and API clients
  pages/           Route pages
  test/            Test setup and specs
```
