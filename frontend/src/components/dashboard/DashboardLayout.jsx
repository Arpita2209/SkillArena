import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import "../../styles/dashboard.css";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="sa-app-shell">
    <DashboardSidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)}/>
    <div className="sa-main-shell">
      <DashboardTopbar onMenuClick={() => setMobileOpen(v => !v)}/>
      <div className="sa-content"><div className="sa-page-enter"><Outlet/></div></div>
    </div>
  </div>;
}
