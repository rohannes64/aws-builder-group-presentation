import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/register", label: "Register" },
  { to: "/checkin", label: "Check in" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/architecture", label: "Architecture" },
];

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-brand">
          <span className="nav-brand-mark">A</span>
          AWS Builders Club
        </NavLink>
        <nav className="nav-links">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
