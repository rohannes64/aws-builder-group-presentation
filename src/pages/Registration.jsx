import { useEffect, useState } from "react";
import { getEvents, registerStudent, ApiError } from "../api.js";

const initialForm = { name: "", universityId: "", email: "", eventId: "" };

export default function Registration() {
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => setEventsError(err.message));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);

    try {
      const result = await registerStudent(form);
      setRegistrationId(result.registrationId);
      setStatus("success");
      setMessage("You're registered. Save your registration code below — you'll need it to check in.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <section className="page page-narrow">
        <p className="eyebrow">Registration</p>
        <h1 className="page-title">You're in.</h1>
        <div className="banner banner-success">{message}</div>
        <div className="card">
          <p className="form-label" style={{ marginBottom: 10 }}>
            Registration code
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              wordBreak: "break-all",
              margin: 0,
            }}
          >
            {registrationId}
          </p>
          <p className="form-hint">
            Bring this code to the event. In production this would be issued as a QR code on the
            confirmation screen and by email.
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setForm(initialForm);
              setStatus("idle");
              setMessage(null);
              setRegistrationId(null);
            }}
          >
            Register another student
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-narrow">
      <p className="eyebrow">Registration</p>
      <h1 className="page-title">Register for an event</h1>
      <p className="page-lede">Fill in your details to reserve a spot.</p>

      {status === "error" && <div className="banner banner-error">{message}</div>}
      {eventsError && <div className="banner banner-info">Couldn't load events: {eventsError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="form-input"
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Full name"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="universityId">
            University ID
          </label>
          <input
            id="universityId"
            className="form-input"
            type="text"
            required
            value={form.universityId}
            onChange={(e) => updateField("universityId", e.target.value)}
            placeholder="e.g. 12312345"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="form-input"
            type="email"
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="eventId">
            Event
          </label>
          <select
            id="eventId"
            className="form-select"
            required
            value={form.eventId}
            onChange={(e) => updateField("eventId", e.target.value)}
          >
            <option value="" disabled>
              Select an event
            </option>
            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {event.name || event.eventId}
              </option>
            ))}
            <option value="debug">
              Debug
            </option>

          </select>
          <p className="form-hint">
            This list is populated from <code>GET /event</code>.
          </p>
        </div>

        <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Registering…" : "Register"}
        </button>
      </form>
    </section>
  );
}
