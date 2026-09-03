import { useState } from "react";
import { checkInStudent, queueCertificate, ApiError } from "../api.js";

export default function CheckIn() {
  const [registrationId, setRegistrationId] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | duplicate | error
  const [message, setMessage] = useState(null);
  const [certStatus, setCertStatus] = useState("idle"); // idle | queuing | queued | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);
    setCertStatus("idle");

    try {
      await checkInStudent({ registrationId: registrationId.trim() });
      setStatus("success");
      setMessage("Checked in. A certificate has been queued automatically.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setStatus("duplicate");
        setMessage("This registration has already been checked in — duplicate check-ins are rejected.");
      } else {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    }
  }

  async function handleQueueCertificate() {
    setCertStatus("queuing");
    try {
      await queueCertificate({ registrationId: registrationId.trim() });
      setCertStatus("queued");
    } catch (err) {
      setCertStatus("error");
    }
  }

  return (
    <section className="page page-narrow">
      <p className="eyebrow">Check-in</p>
      <h1 className="page-title">Check in to an event</h1>
      <p className="page-lede">
        Paste the registration code from your confirmation. In production this would come from
        scanning a QR code.
      </p>

      {status === "success" && <div className="banner banner-success">{message}</div>}
      {status === "duplicate" && <div className="banner banner-info">{message}</div>}
      {status === "error" && <div className="banner banner-error">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="registrationId">
            Registration code
          </label>
          <input
            id="registrationId"
            className="form-input"
            type="text"
            required
            value={registrationId}
            onChange={(e) => setRegistrationId(e.target.value)}
            placeholder="Paste your registration code"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Checking in…" : "Check in"}
        </button>
      </form>

      {status === "success" && (
        <div className="card" style={{ marginTop: 24 }}>
          <p className="form-label" style={{ marginBottom: 6 }}>
            Certificate
          </p>
          <p className="form-hint" style={{ marginTop: 0, marginBottom: 14 }}>
            Certificate generation runs asynchronously via SQS, so it doesn't block check-in. Use
            this button to manually re-queue it (matches <code>POST /certificate</code>) if you
            want to demo the flow again.
          </p>
          <button className="btn btn-secondary" onClick={handleQueueCertificate} disabled={certStatus === "queuing"}>
            {certStatus === "queuing" ? "Queuing…" : "Queue certificate"}
          </button>
          {certStatus === "queued" && <p className="form-hint" style={{ color: "var(--success)" }}>Queued.</p>}
          {certStatus === "error" && <p className="form-hint" style={{ color: "var(--danger)" }}>Couldn't queue certificate.</p>}
        </div>
      )}
    </section>
  );
}
