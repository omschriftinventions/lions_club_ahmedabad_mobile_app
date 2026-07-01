import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Pill } from '../components/ui';

export default function Settings() {
  const nav = useNavigate();
  const { member, logout } = useAuth();
  const Row = ({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) => (
    <button className="list-row clickable" style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={onClick}>
      <span style={{ color: danger ? 'var(--danger)' : 'var(--faint)' }}><Icon name={icon} size={18} /></span>
      <div className="meta"><div className="title" style={{ color: danger ? 'var(--danger)' : 'var(--ink)' }}>{label}</div></div>
      <Icon name="chevron" size={16} />
    </button>
  );
  return (
    <>
      <div className="page-head"><div><h1>Settings</h1></div></div>
      <div className="card pad" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar name={member?.name} size="lg" />
        <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{member?.name}</div><div style={{ marginTop: 6 }}>{member?.role && <Pill tone="blue">{member.role.toUpperCase()}</Pill>}</div></div>
      </div>
      <div className="card">
        <Row icon="edit" label="Edit my profile" onClick={() => nav('/profile')} />
        <Row icon="user" label="My profile page" onClick={() => nav('/profile')} />
        <Row icon="bell" label="Notifications" onClick={() => nav('/notifications')} />
        <Row icon="help" label="Help &amp; FAQ" onClick={() => nav('/help')} />
        <Row icon="settings" label="About this app" onClick={() => nav('/about')} />
        <div style={{ borderTop: '1px solid var(--line)' }} />
        <Row icon="logout" label="Sign out" danger onClick={() => logout()} />
      </div>
    </>
  );
}