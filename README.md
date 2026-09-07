# Azure Coast Guide 🌊

> See **[client/README.md](client/README.md)** for full documentation.

## Quick Start

```bash
# Install all dependencies (client + server)
npm run install:all

# Run client + server together
npm run dev
```

| Script              | What it does                        |
|---------------------|-------------------------------------|
| `npm run dev`       | Start client (port 5173) + server (port 5001) concurrently |
| `npm run dev:client`| Start only the React/Vite frontend  |
| `npm run dev:server`| Start only the Express backend      |
| `npm run build`     | Build the React app for production  |

## Project Layout

```
local_tourism/
├── client/          # React + Vite frontend
├── server/          # Express + MongoDB backend
├── package.json     # Root scripts (monorepo coordinator)
└── .gitignore
```
