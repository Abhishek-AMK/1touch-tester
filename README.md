# Apex-Tester-App

A small Node.js web app for the 1Touch tester.

## Features

- Serves a single page at `/` showing **"1Touch tester"** and the current UTC time.
- Exposes a `GET /health` endpoint returning `{"ok":true}`.

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
