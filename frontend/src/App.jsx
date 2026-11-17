import { HashRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import Registration from "./pages/Registration.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Architecture from "./pages/Architecture.jsx";

// HashRouter rather than BrowserRouter: this app is meant to be hosted
// from a plain S3 website endpoint (Section 3/4 of the plan), which serves
// files by path and has no built-in "redirect unknown paths back to
// index.html" rewrite rule the way CloudFront or a real server would.
// Hash-based routes (#/register) always resolve to index.html because the
// fragment is never sent to S3, so client-side routing works with zero
// extra bucket configuration. Switch to BrowserRouter later if CloudFront
// is added with a custom error-document rewrite.
export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
        <footer className="footer">
          AWS Builders Club &middot; Event Platform &middot; built as a student-scale demo
        </footer>
      </div>
    </HashRouter>
  );
}
