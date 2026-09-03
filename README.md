# Frontend — AWS Builders Club Platform

A React + Vite single-page app for event registration, check-in, a live stats
dashboard, and an interactive walkthrough of the AWS architecture behind it.

## Local development

```bash
npm install
cp .env.example .env      # then fill in VITE_API_BASE_URL once the backend is deployed
npm run dev
```

Without `VITE_API_BASE_URL` set, every page that calls the API (Register,
Check-in, Dashboard) will show a clear "API base URL is not configured"
error instead of failing silently — that's intentional, see `src/api.js`.

## Connecting to your AWS backend

All API calls go through **`src/api.js`** — it's the only file that needs to
change when you deploy the backend. Set the deployed API Gateway endpoint in
`.env`:

```
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.<region>.amazonaws.com
```

The five functions in `src/api.js` (`registerStudent`, `checkInStudent`,
`queueCertificate`, `getEvents`/`getEvent`, `getStats`) map 1:1 to the
endpoints in the development plan:

| Function            | Endpoint          |
| -------------------- | ----------------- |
| `registerStudent`    | `POST /register`  |
| `checkInStudent`     | `POST /checkin`   |
| `queueCertificate`   | `POST /certificate` |
| `getEvents`/`getEvent` | `GET /event`     |
| `getStats`           | `GET /stats`      |

If a route name or request shape changes on the backend, update it here —
no page component talks to `fetch` directly.

**CORS**: since the frontend (S3) and API (API Gateway) are different
origins, every endpoint above needs CORS enabled on the API Gateway side
(see Section 4 of the development plan) or the browser will block the
requests.

## Building for deployment

```bash
npm run build
```

Outputs a static bundle to `dist/`. This is what gets uploaded to the S3
bucket configured for static website hosting:

```bash
aws s3 sync dist/ s3://<your-frontend-bucket-name> --delete
```

## Routing

The app uses `HashRouter` (`react-router-dom`) rather than `BrowserRouter`.
A plain S3 static website endpoint serves files by exact path and has no
built-in rule to redirect unknown paths back to `index.html`, so
hash-based routes (`/#/register`) are the zero-config choice here — the
fragment never reaches S3, so every route resolves to `index.html`. If you
later add CloudFront with a custom error-document rewrite (404 →
`index.html`), you can switch to `BrowserRouter` for cleaner URLs.

## Structure

```
src/
├─ api.js              # single source of truth for backend calls
├─ App.jsx             # router + layout shell
├─ components/Nav.jsx
├─ pages/
│  ├─ Home.jsx
│  ├─ Registration.jsx # POST /register
│  ├─ CheckIn.jsx      # POST /checkin (+ manual POST /certificate retry)
│  ├─ Dashboard.jsx    # GET /stats, GET /event
│  └─ Architecture.jsx # static walkthrough, no API calls
└─ styles.css           # design tokens + all component styles
```
