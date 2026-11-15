import { NavLink } from "react-router-dom";
import { BrainCircuit, LayoutDashboard, FileText, Mic2, ChartNoAxesCombined, Settings } from "lucide-react";

const items = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["My Resume", "/dashboard/resume", FileText],
  ["Interviews", "/dashboard/interviews", Mic2],
  ["Reports", "/dashboard/reports", ChartNoAxesCombined],
];

export default function DashboardSidebar({ mobileOpen, onNavigate }) {
  return <>
    {mobileOpen && <button className="sa-backdrop" aria-label="Close menu" onClick={onNavigate} />}
    <aside className={`sa-sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sa-brand"><span><BrainCircuit size={21} /></span>Skill<span className="sa-lime">Arena</span></div>
      <small className="sa-nav-label">WORKSPACE</small>
      <nav>{items.map(([label, to, Icon], i) => <NavLink key={to} to={to} end={i === 0} onClick={onNavigate} className={({ isActive }) => `sa-nav-link ${isActive ? "active" : ""}`}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
      <div className="sa-sidebar-bottom">
        <NavLink to="/dashboard/settings" className="sa-nav-link" onClick={onNavigate}>
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
        <div className="sa-sidebar-note"><BrainCircuit size={19} /><strong>Your growth, your pace.</strong><p>Build confidence through consistent practice.</p></div>
        <small className="sa-version">SKILLARENA · PREVIEW</small>
      </div>
    </aside>
  </>;
}
