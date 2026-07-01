import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState } from '../components/ui';
import type { Member } from '../types';

export default function Directory() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: Member[] }>('/members?limit=500') });
  const list = (data?.members ?? []).filter((m) => !q || `${m.business} ${m.profession} ${m.area} ${m.name} ${m.designation ?? ''} ${m.role_label ?? ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="page-head"><div><h1>Business Directory</h1><div className="sub">Member businesses &amp; professions</div></div></div>
      <div className="card pad" style={{ marginBottom: 16, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--faint)' }}><Icon name="search" size={18} /></span>
        <input className="input" style={{ paddingLeft: 38 }} placeholder="Search business, profession, area, role..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {isLoading ? <Spinner /> : list.length === 0 ? <EmptyState icon="briefcase" title="No businesses found" /> : (
        <div className="grid grid-2">
          {list.map((m) => (
            <div key={m.id} className="card pad clickable" onClick={() => nav(`/members/${m.id}`)}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div className="muted" style={{ marginTop: 2 }}>{m.business || m.profession || '\u2014'}</div>
                  {m.area && <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{m.area}</div>}
                </div>
                {m.phone && <Icon name="phone" size={16} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}