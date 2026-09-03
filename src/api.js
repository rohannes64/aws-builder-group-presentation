/**
 * API client for the AWS Builders Club Platform backend.
 *
 * Configure the deployed API Gateway endpoint via an environment variable
 * so nothing here needs to change once you deploy to AWS -- set it in
 * frontend/.env (see .env.example) before running `npm run build`:
 *
 *   VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com
 *
 * Every function below maps 1:1 to an endpoint from Section 5 of the
 * development plan (POST /register, POST /checkin, GET /event, GET /stats,
 * POST /certificate). If you change a route or add auth headers on the
 * backend, this file is the only place the frontend needs to change.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new ApiError(
      "API base URL is not configured. Set VITE_API_BASE_URL in frontend/.env once the backend is deployed.",
      0,
      null
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON or empty response body -- leave body as null.
  }

  if (!res.ok) {
    const message = (body && body.error) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return body;
}

/** POST /register */
export function registerStudent({ name, universityId, email, eventId }) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify({ name, universityId, email, eventId }),
  });
}

/** POST /checkin */
export function checkInStudent({ registrationId }) {
  return request("/checkin", {
    method: "POST",
    body: JSON.stringify({ registrationId }),
  });
}

/** POST /certificate */
export function queueCertificate({ registrationId }) {
  return request("/certificate", {
    method: "POST",
    body: JSON.stringify({ registrationId }),
  });
}

/** GET /event  (all events) or GET /event?eventId=... (one event) */
export function getEvents() {
  return request("/event").then((data) => data.events || []);
}

export function getEvent(eventId) {
  return request(`/event?eventId=${encodeURIComponent(eventId)}`);
}

/** GET /stats or GET /stats?eventId=... */
export function getStats(eventId) {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  return request(`/stats${query}`);
}

export { ApiError, BASE_URL as apiBaseUrl };
