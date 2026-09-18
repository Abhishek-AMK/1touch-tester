# Apex-Tester-Advanced

An advanced Node.js web app for the 1Touch tester. It serves a polished home page with a live UTC clock and an interactive task board, plus a JSON task API and a health check endpoint.

## Features

- **Polished home page** at `/` with a header, live UTC clock, and a working task board.
- **Task board** lets you add, complete, and delete tasks without a full page reload.
- **Task API** at `/api/tasks` with in-memory storage:
  - `GET /api/tasks` — list all tasks
  - `POST /api/tasks` — create a task (`{ "title": "..." }`)
  - `PATCH /api/tasks/:id` — update task status (`{ "status": "done" }`)
  - `DELETE /api/tasks/:id` — remove a task
- **Health check** at `GET /health` returns `{"ok":true}`.

## Getting Started

```bash
npm install
npm start
```

The app listens on the port defined by the `PORT` environment variable, defaulting to `3000`.

## Testing

```bash
npm test
```

Tests cover the health endpoint, home page rendering, and the full task API lifecycle.
