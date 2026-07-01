import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Spinner, Pill, EmptyState } from '../components/ui';
import type { Member } from '../types';

export default function MemberDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    enabled: !!id,
    queryKey: ['member', id],
    queryFn: () => api.get<{ member: Member }>(`/members/${id}`),
  });
  const m = data?.member;

  if (isLoading) return <Spinner />;
  if (!m) return <EmptyState icon="user" title="Member not found" body="This member may have been removed." />;

  const Row = ({ icon, label, value }: { icon: string; label: string; value?: string | null }) => (
    <div style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}>
      <span style={{ color: 'var(--faint)', width: 20 }}><Icon name={icon} size={18} /></span>
      <div style={{ flex: 1 }}>
        <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{label}</div>
        <div style={{ marginTop: 2 }}>{value || '\u2014'}</div>
      </div>
    </div>
  );

  return (
    <>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => nav(-1)}><Icon name="back" size={16} /> Back</button>
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="xl" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 24 }}>{m.name}</h1>
            {m.designation && <div className="muted" style={{ marginTop: 2 }}>{m.designation}</div>}
            <div style={{ marginTop: 10 }}>{m.role_label && <Pill tone="blue">{m.role_label}</Pill>}</div>
          </div>
        </div>
        {m.bio && <div className="prose" style={{ marginTop: 16 }}><p>{m.bio}</p></div>}
      </div>

      <div className="grid grid-2">
        <div className="card pad">
          <div className="card-title">Professional</div>
          <Row icon="briefcase" label="Profession" value={m.profession} />
          <Row icon="briefcase" label="Business" value={m.business} />
          <Row icon="pin" label="Area" value={m.area} />
          <Row icon="calendar" label="Joined" value={m.joined_year ? String(m.joined_year) : ''} />
        </div>
        <div className="card pad">
          <div className="card-title">Contact</div>
          <Row icon="phone" label="Phone" value={m.phone} />
          <Row icon="mail" label="Email" value={m.email} />
          <hr className="divider" />
          <div className="card-title">Personal</div>
          <Row icon="heart" label="Birthday" value={m.dob} />
          <Row icon="heart" label="Anniversary" value={m.anniv} />
          <Row icon="users" label="Spouse" value={m.spouse} />
        </div>
      </div>
      <Egains m={m} />
    </>
  );
}
const Egains: React.FC<{ m: any }> = ({ m }) => {
  const rows: [string, string | null | undefined][] = [
    ['Expertise', m.expertise], ['Goals', m.goals], ['Accomplishments', m.accomplishments],
    ['Interests', m.interests], ['Network', m.network], ['Social connections', m.social],
  ];
  if (!rows.some(([, v]) => v && v.trim())) return null;
  return (
    <div className="card pad" style={{ marginTop: 16 }}>
      <div className="card-title">Networking (E-GAINS)</div>
      {rows.map(([label, v]) => v && v.trim() ? (
        <div key={label} style={{ marginBottom: 12 }}>
          <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{label}</div>
          <div style={{ marginTop: 4, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' }}>{v}</div>
        </div>
      ) : null)}
    </div>
  );
};
