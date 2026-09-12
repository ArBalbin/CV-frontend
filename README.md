# Queue Flow Frontend

React + TypeScript frontend for the thesis Queue Flow backend.

## Project Structure

```text
queue-flow-frontend/
|-- src/
|   |-- components/        # Shared UI layout components
|   |-- config/            # Backend API client and app configuration
|   |-- contexts/          # React context providers
|   |-- pages/             # Dashboard and login views
|   |-- App.tsx            # Routes and protected dashboard access
|   |-- index.css          # Tailwind styles
|   `-- main.tsx           # React entry point
|-- .env                   # Frontend environment variables
|-- index.html             # Vite HTML entry
|-- package.json           # Frontend scripts and dependencies
|-- tailwind.config.js
|-- tsconfig.json
`-- vite.config.ts
```

Generated folders such as `node_modules/` and `dist/` are intentionally ignored.

## Backend Connection

The frontend reads the backend base URL from `VITE_API_URL`.

```env
VITE_API_URL=http://localhost:5000
```

Change `.env` if your backend runs somewhere else.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

By default, Vite runs the frontend on `http://localhost:3000`. The backend is expected at `http://localhost:5000` unless `VITE_API_URL` is changed.

## Main Views

- `/login` - authentication screen
- `/computer-vision` - live people detection and queue zone dashboard
- `/queueflow` - Queue Flow operations and counter management dashboard

## Backend Endpoints Used

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/crowd/data`
- `GET /api/crowd/video`
- `GET /api/queue/data`
- `GET /api/queue/list`
- `POST /api/queue/done`
- `POST /api/queue/reset`
- `GET /api/queue/noshow_config`
- `POST /api/queue/noshow_config`
- `POST /api/queue/adjust_counters`
