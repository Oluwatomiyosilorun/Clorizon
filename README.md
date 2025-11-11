# Clorizon Dashboard

Small Vite + React dashboard composed of modular widgets (Notes, Chat, Analytics).

Quick overview
- Frontend: Vite + React in `src/`
- Widgets: `src/widgets/*` (each widget is a self-contained React component)
- Server/API: serverless API at `api/gemini/...` (used to proxy requests to Google Generative Language / Gemini)
- Env: server needs a Google API key (GEMINI_API_KEY) — keep it server-side only

Prerequisites
- Node 16+ / 18+ (recommended)
- npm or yarn
- (Optional) Vercel CLI for `vercel dev` testing
- A Google Cloud API key with the Generative Language API enabled and billing active

Setup (local)
1. Install deps
   npm install

2. Create a local .env (do NOT commit)
   ```
   GEMINI_API_KEY=ya29_your_server_side_key_here
   ```
   - Remove any `VITE_` prefixed key before production — that exposes the key to the browser.

Local development options
A) Single experience via Vercel (recommended for serverless API parity)
- Ensure `GEMINI_API_KEY` is present in your shell or Vercel environment.
- Run:
  ```
  vercel dev
  ```
- Open http://localhost:3000 and use the app. Watch the terminal for serverless logs (API errors, model discovery, etc).

B) Vite + local Express proxy
- If you prefer running Vite and a local server:
  - Start the API server (example server at `server/index.js` if present):
    ```
    export GEMINI_API_KEY="your_key"
    node server/index.js
    ```
  - Start Vite:
    ```
    npm run dev
    ```
  - The repo may include a Vite proxy (vite.config.js) so frontend fetches to `/api/*` will proxy to the local server.

Environment / deployment
- On Vercel: add `GEMINI_API_KEY` in Project Settings → Environment Variables (Preview & Production).
- Do NOT add server keys as `VITE_` prefixed env vars in production.

Common issues & debugging
- 404 on `/api/gemini`:
  - If using Vercel, ensure the API file is under `api/` (root) and `vercel dev` is running.
  - If using Vite + Express, ensure the proxy is configured or fetch uses the backend host.
- 500 with API_KEY_INVALID:
  - Rotate/regenerate the key immediately if exposed.
  - Confirm the key is for the same Google project where Generative Language API is enabled and billing is active.
  - Test the key directly:
    ```
    curl "https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}"
    ```

Widgets & extensibility
- Each widget lives in `src/widgets/<Name>/index.jsx`. They receive props from `App.jsx` via `widgetProps`.
- To add a widget:
  - Create `src/widgets/<NewWidget>/index.jsx` exporting a default React component.
  - Add an entry in `App.jsx`'s `WIDGET_MAP` (or replace with a dynamic registry for runtime loading).

Security note
- Treat `GEMINI_API_KEY` as a secret. Do not commit it or expose it to the browser.
- Prefer server-side functions for calling Google APIs.


