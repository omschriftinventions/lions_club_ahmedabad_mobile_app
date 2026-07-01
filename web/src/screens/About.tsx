import React from 'react';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Pill } from '../components/ui';

export default function About() {
  const { member } = useAuth();
  return (
    <>
      <div className="page-head"><div><h1>About</h1><div className="sub">Lions Club Ahmedabad Host</div></div></div>
      <div className="card pad" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="avatar xl" style={{ background: 'linear-gradient(135deg,var(--gold),#F2B800)', color: 'var(--navy)' }}>L</div>
          <div><Pill tone="gold">District 3232 B1</Pill><h2 style={{ fontSize: 22, marginTop: 8 }}>Lions Club Ahmedabad Host</h2></div>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>Lions Clubs International is the world's largest service club organisation, with over 1.4 million members in 200+ countries. Lions serve causes including sight, hunger, environment, diabetes, childhood cancer and disaster relief.</p>
          <p>This portal helps members of Lions Club Ahmedabad Host stay connected &mdash; events, news, the club roster, service impact, photos and more.</p>
        </div>
        <hr className="divider" />
        <div className="kv">
          <dt>Signed in as</dt><dd>{member?.name ?? '—'}</dd>
          <dt>Role</dt><dd>{(member?.role ?? 'MEMBER').toUpperCase()}</dd>
          <dt>Access</dt><dd>{member?.canEdit ? 'Officer (can manage club data)' : 'Member (read-only)'}</dd>
        </div>
      </div>
    </>
  );
}