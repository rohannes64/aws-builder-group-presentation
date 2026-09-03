import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "01",
    title: "Register",
    body: "Sign up for an event with your name, university ID, and email in under a minute.",
    to: "/register",
  },
  {
    icon: "02",
    title: "Check in",
    body: "Scan or paste your registration code at the door to confirm attendance instantly.",
    to: "/checkin",
  },
  {
    icon: "03",
    title: "Dashboard",
    body: "Live counts of registrations, check-ins, and certificates as the event runs.",
    to: "/dashboard",
  },
  {
    icon: "04",
    title: "Architecture",
    body: "Walk through the AWS services behind the platform and what each one does.",
    to: "/architecture",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-mark">A</div>
        <p className="hero-eyebrow">
          <strong>AWS Builders Club</strong> &middot; Event Platform
        </p>
        <h1 className="hero-headline">
          <span>Register.</span>
          <span>Check in.</span>
          <span>Get certified.</span>
        </h1>
        <p className="hero-copy">
          A small, genuinely working event platform for AWS Builders Club events —
          registration, attendance, and certificates, backed by a serverless
          AWS architecture you can inspect page by page.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">
            Register for an event
          </Link>
          <Link to="/checkin" className="btn btn-secondary">
            Check in
          </Link>
        </div>
        <p className="hero-meta">Built and deployed as a student-scale demo project</p>
      </section>

      <section className="page" style={{ paddingTop: 0 }}>
        <div className="home-grid">
          {FEATURES.map((feature) => (
            <Link key={feature.title} to={feature.to} className="card home-card" style={{ textDecoration: "none" }}>
              <div className="home-card-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
