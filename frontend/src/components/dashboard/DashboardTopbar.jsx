import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Search, LogOut, X, History, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInterviewHistory, normalizeSession } from "../../services/workspaceService";

export default function DashboardTopbar({ onMenuClick }) {
 const { user, logout }=useAuth(); const navigate=useNavigate(); const [term,setTerm]=useState(""); const [open,setOpen]=useState(false); const [notifications,setNotifications]=useState([]); const [loading,setLoading]=useState(false); const panel=useRef(null);
 const initial=user?.name?.trim()?.charAt(0)?.toUpperCase()||"U";
 useEffect(()=>{let active=true;setLoading(true);getInterviewHistory().then(rows=>{if(active)setNotifications(rows.map(normalizeSession).slice(0,5));}).catch(()=>{if(active)setNotifications([]);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 useEffect(()=>{const close=e=>{if(panel.current&&!panel.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close);},[]);
 function submitSearch(e){e.preventDefault();const q=term.trim();if(q)navigate(`/dashboard/reports?q=${encodeURIComponent(q)}`);else navigate("/dashboard/reports");}
 function handleLogout(){logout();navigate("/login",{replace:true});}
 return <header className="sa-topbar"><button className="sa-menu-button" onClick={onMenuClick} aria-label="Open navigation"><Menu size={21}/></button><div className="sa-crumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="sa-top-actions">
 <form className="sa-search" onSubmit={submitSearch}><Search size={16}/><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search interviews, reports…" aria-label="Search interviews and reports"/><button type="submit" aria-label="Submit search"><Search size={14}/></button></form>
 <div className="sa-notification-wrap" ref={panel}><button className="sa-bell" aria-label="Notifications" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Bell size={19}/>{notifications.length>0&&<i/>}</button>{open&&<section className="sa-notification-popover"><div className="sa-notification-head"><strong>Recent activity</strong><button onClick={()=>setOpen(false)} aria-label="Close notifications"><X size={15}/></button></div>{loading?<p>Loading activity…</p>:notifications.length===0?<p>No interview activity yet.</p>:notifications.map((n,i)=>{const term=Boolean(n.terminated||n.terminationReason||/terminated/i.test(n.status));return <button className="sa-notification-item" key={n.id||i} onClick={()=>{setOpen(false);navigate("/dashboard/reports");}}><span>{term?<ShieldAlert size={16}/>:<History size={16}/>}</span><span><strong>{term?"Interview auto-submitted":"Interview activity"}</strong><small>{n.title} · {n.status}</small></span></button>;})}<button className="sa-notification-all" onClick={()=>{setOpen(false);navigate("/dashboard/reports");}}>View interview history</button></section>}</div>
 <div className="sa-user-avatar" title={user?.name||"User"}>{initial}</div><button type="button" className="sa-logout-button" onClick={handleLogout} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div></header>;
}
