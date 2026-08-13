# Doctor Tracker

Doctor Tracker is organized as two independently runnable TypeScript applications:

- `client`: Next.js App Router frontend
- `server`: standalone Express REST API

## Prerequisites

- Node.js 20.9 or newer
- npm
- MongoDB (required when database-backed features are added)

## Client

```bash
cd client
copy .env.example .env.local
npm install
npm run dev
```

The client runs at `http://localhost:3000` by default.

## Server

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

The API runs at `http://localhost:5000` by default. Its health check is available at `GET /api/health`.

Each application also provides `build`, `start`, `lint`, and `type-check` scripts.
