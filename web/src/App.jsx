import { NavLink, Route, Routes } from "react-router-dom";
import ComparePage from "./pages/ComparePage.jsx";
import TrendsPage from "./pages/TrendsPage.jsx";
import SnapshotsPage from "./pages/SnapshotsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

const links = [
  { to: "/", label: "Vergelijken" },
  { to: "/trends", label: "Trends" },
  { to: "/snapshots", label: "Markdown" },
  { to: "/instellingen", label: "Instellingen" },
];

export default function App() {
  return (
    <div className="app">
      <header className="masthead">
        <div className="brand">
          <span className="brand-kicker">NL · dual meter</span>
          <h1>Energievergelijker</h1>
          <p>Lokale desk bovenop Gaslicht, Independer, Pricewise en de rest.</p>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ComparePage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/snapshots" element={<SnapshotsPage />} />
          <Route path="/instellingen" element={<SettingsPage />} />
        </Routes>
      </main>
      <footer>
        Prijzen komen van publieke vergelijkingssites. Geen advies, wel een archief van wat die sites op een moment toonden.
      </footer>
    </div>
  );
}
