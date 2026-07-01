import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Pill } from '../components/ui';
import type { Member } from '../types';

export default function Find() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const { data, isFetching } = useQuery({
    enabled: q.length >= 2, queryKey: ['find', q],
    queryFn: () => api.get<{ members: Member[] }>(`/members?search=${encodeURIComponent(q)}&limit=50`),
  });
  const list = data?.members ?? [];

  return (
    <>
      <div className="page-head"><div><h1>Find a Lion</h1><div className="sub">Search the roster by name, profession or business</div></div></div>
      <div className="card pad" style={{ marginBottom: 16, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--faint)' }}><Icon name="search" size={18} /></span>
        <input className="input" style={{ paddingLeft: 38 }} autoFocus placeholder="Search name, profession, business, area, role..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {q.length < 2 ? <EmptyState icon="search" title="Start typing" body="Enter a name, profession or business to search." /> :
        isFetching ? <Spinner /> : list.length === 0 ? <EmptyState icon="users" title="No matches" /> : (
          <div className="card">
            {list.map((m) => (
              <div key={m.id} className="list-row clickable" onClick={() => nav(`/members/${m.id}`)}>
                <Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="sm" />
                <div className="meta"><div className="title">{m.name}</div><div className="sub">{m.profession || m.business}{m.area ? ` \u00b7 ${m.area}` : ''}</div></div>
                {m.role_label && <Pill tone="blue">{m.role_label}</Pill>}
              </div>
            ))}
          </div>
        )}
    </>
  );
}