import { Bell, Menu, Search } from "lucide-react";

export default function DashboardTopbar({ onMenuClick }) {
  return <header className="sa-topbar">
    <button className="sa-menu-button" onClick={onMenuClick} aria-label="Open navigation"><Menu size={21}/></button>
    <div className="sa-crumb">Workspace <span>/</span> <strong>Overview</strong></div>
    <div className="sa-top-actions">
      <label className="sa-search"><Search size={16}/><input placeholder="Search anything..." aria-label="Search"/></label>
      <button className="sa-bell" aria-label="Notifications"><Bell size={19}/><i/></button>
      <div className="sa-user-avatar" title="Candidate profile">T</div>
    </div>
  </header>;
}
