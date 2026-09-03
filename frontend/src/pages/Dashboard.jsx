import { useEffect, useState, useCallback } from "react";
import { getStats, getEvents, ApiError } from "../api.js";

const STAT_LABELS = [
  { key: "totalRegistrations", label: "Registrations" },
  { key: "totalCheckIns", label: "Check-ins" },
  { key: "pendingCertificates", label: "Certificates pending" },
  { key: "issuedCertificates", label: "Certificates issued" },
];

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => {});
  }, []);

  const loadStats = useCallback(() => {
    setLoading(true);
    setError(null);
    getStats(eventId || undefined)
      .then(setStats)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load stats"))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <section className="page">
      <p className="eyebrow">Dashboard</p>
      <h1 className="page-title">Live event status</h1>
      <p className="page-lede">Aggregate counts, updated by the analytics worker in response to EventBridge events.</p>

      <div className="dashboard-toolbar">
        <select className="form-select" style={{ width: "auto" }} value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">All events (global)</option>
          {events.map((event) => (
            <option key={event.eventId} value={event.eventId}>
              {event.name || event.eventId}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={loadStats} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      <div className="stat-grid">
        {STAT_LABELS.map(({ key, label }) => (
          <div className="stat-card" key={key}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{stats ? stats[key] ?? 0 : "—"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
