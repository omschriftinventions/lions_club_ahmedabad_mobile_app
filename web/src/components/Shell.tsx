import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useAuth } from '../lib/auth';

const NAV = [
  { section: 'Club', items: [
    { to: '/', label: 'Dashboard', icon: 'home', end: true },
    { to: '/roster', label: 'Roster', icon: 'users' },
    { to: '/events', label: 'Events', icon: 'calendar' },
    { to: '/news', label: 'News', icon: 'news' },
    { to: '/photos', label: 'Photos', icon: 'image' },
  ]},
  { section: 'Service', items: [
    { to: '/impact', label: 'Service Impact', icon: 'heart' },
    { to: '/awards', label: 'Awards Wall', icon: 'trophy' },
  ]},
  { section: 'Connect', items: [
    { to: '/chats', label: 'Chats', icon: 'chat' },
    { to: '/minutes', label: 'Meeting Minutes', icon: 'doc' },
    { to: '/meetings', label: 'AI Meeting Assistant', icon: 'mic' },
    { to: '/notifications', label: 'Notifications', icon: 'bell' },
  ]},
  { section: 'Directory', items: [
    { to: '/directory', label: 'Business Directory', icon: 'briefcase' },
    { to: '/find', label: 'Find a Lion', icon: 'search' },
    { to: '/refer', label: 'Refer a Lion', icon: 'user' },
    { to: '/charter', label: 'Charter Invite', icon: 'ribbon' },
  ]},
  { section: 'Info', items: [
    { to: '/district-news', label: 'District News', icon: 'globe' },
    { to: '/help', label: 'Help & FAQ', icon: 'help' },
    { to: '/about', label: 'About', icon: 'news' },
    { to: '/settings', label: 'Settings', icon: 'settings' },
  ]},
];

const OFFICER_NAV = [
  { to: '/manage', label: 'Create Event / News', icon: 'plus' },
  { to: '/attendance', label: 'Mark Attendance', icon: 'home' },
  { to: '/add-member', label: 'Add Member', icon: 'user' },
  { to: '/manage-roster', label: 'Manage Roster', icon: 'users' },
  { to: '/broadcast', label: 'Broadcast', icon: 'megaphone' },
];

const SUPER_NAV = [
  { to: '/admin', label: 'System Admin', icon: 'settings' },
  { to: '/ads', label: 'Advertisements', icon: 'image' },
];

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { member, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const doLogout = async () => { await logout(); nav('/'); };

  const Link = ({ to, label, icon, end }: { to: string; label: string; icon: string; end?: boolean }) => (
    <NavLink to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
      <span className="nav-ic"><Icon name={icon} size={18} /></span>{label}
    </NavLink>
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="brand">
          <img className="brand-mark" src="/logo.png" alt="Lions Club" style={{ objectFit: "cover" }} />
          <div className="brand-text"><b>Lions Club</b><span>Ahmedabad Host</span></div>
        </div>
        <nav className="nav">
          {NAV.map((g) => (
            <React.Fragment key={g.section}>
              <div className="nav-section">{g.section}</div>
              {g.items.map((it) => <Link key={it.to} {...it} />)}
            </React.Fragment>
          ))}
          {member?.canEdit && (
            <React.Fragment>
              <div className="nav-section">Officer</div>
              {OFFICER_NAV.map((it) => <Link key={it.to} {...it} />)}
            </React.Fragment>
          )}
          {member?.superAdmin && (
            <React.Fragment>
              <div className="nav-section">System</div>
              {SUPER_NAV.map((it) => <Link key={it.to} {...it} />)}
            </React.Fragment>
          )}
        </nav>
        <div className="sidebar-foot">
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 8 }}>{member?.name ?? 'Member'}</div>
          <span className="role-chip">{member?.superAdmin ? 'SUPER ADMIN' : (member?.role ?? 'MEMBER').toUpperCase()}</span>
          <button onClick={doLogout} className="btn ghost sm" style={{ marginTop: 12, color: '#CFE0F2', border: '1px solid rgba(255,255,255,.12)', width: '100%' }}><Icon name="logout" size={16} /> Sign out</button>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <div className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}><Icon name="menu" /></button>
          <div className="tb-title">Lions Club Ahmedabad</div>
        </div>
        <div className="content"><div className="content-inner">{children}</div></div>
      </div>
    </div>
  );
};