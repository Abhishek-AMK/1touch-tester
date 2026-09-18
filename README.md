# Apex-Mixed-Upgrade

The next advanced version of the Apex Growth Labs personal task board. Apex-Mixed-Upgrade is a lightweight, local-first Node.js web app with a polished home page, live UTC clock, interactive task board, and persistent JSON storage.

## Product Positioning

**"The distraction-free personal task board that lives on your machine."**

- No signup, no cloud, no subscription.
- Open/done filters to focus on what matters now.
- Persistent local storage across restarts.
- Clean, lightweight UI with a live UTC clock.

See [GTM_PLAN.md](./GTM_PLAN.md) for the full go-to-market plan, market research, and campaign ideas.

## Features

- **Polished home page** at `/` with a header, live UTC clock, and a working task board.
- **Task board** lets you add, complete, reopen, and delete tasks without a full page reload.
- **Open/Done filters** let you focus on the tasks that matter right now.
- **Task persistence** across restarts using a local `tasks.json` file.
- **Task API** at `/api/tasks`:
  - `GET /api/tasks` — list all tasks
  - `GET /api/tasks?status=open` — list open tasks
  - `GET /api/tasks?status=done` — list done tasks
  - `POST /api/tasks` — create a task (`{ "title": "..." }`)
  - `PATCH /api/tasks/:id` — update task status (`{ "status": "done" }` or `{ "status": "open" }`)
  - `DELETE /api/tasks/:id` — remove a task
- **Health check** at `GET /health` returns `{"ok":true}`.

## Getting Started

```bash
npm install
npm start
```

The app listens on the port defined by the `PORT` environment variable, defaulting to `3000`.

Tasks are stored in `tasks.json` in the project root by default. You can override the data directory with the `DATA_DIR` environment variable.

## Testing

```bash
npm test
```

Tests cover the health endpoint, home page rendering, task API lifecycle, open/done filters, persistence across restarts, and error handling.
