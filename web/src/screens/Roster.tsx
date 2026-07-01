import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Pill } from '../components/ui';
import type { Member } from '../types';

const ROLES = ['', 'president', 'secretary', 'treasurer', 'vp', 'member'];

export default function Roster() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['roster', search, role],
    queryFn: () => api.get<{ members: Member[] }>(`/members?limit=500${search ? `&search=${encodeURIComponent(search)}` : ''}${role ? `&role=${role}` : ''}`),
  });

  const members = data?.members ?? [];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Club Roster</h1>
          <div className="sub">{members.length} active member{members.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="row-2">
          <div className="field" style={{ margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--faint)' }}><Icon name="search" size={18} /></span>
              <input className="input" style={{ paddingLeft: 38 }} placeholder="Search name, profession, business, area, role..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="chip-row" style={{ alignItems: 'center' }}>
            {ROLES.map((r) => (
              <button key={r || 'all'} className={`chip${role === r ? ' active' : ''}`} onClick={() => setRole(r)}>
                {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All roles'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? <Spinner /> :
          members.length === 0 ? <EmptyState icon="users" title="No members found" body="Try a different search or role filter." /> :
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Role</th><th>Profession / Business</th><th>Area</th><th>Contact</th></tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="clickable" onClick={() => nav(`/members/${m.id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="sm" />
                        <div>
                          <div style={{ fontWeight: 700 }}>{m.name}</div>
                          {m.designation && <div className="faint" style={{ fontSize: 12 }}>{m.designation}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{m.role_label && <Pill tone="blue">{m.role_label}</Pill>}</td>
                    <td className="muted">{m.profession || m.business || '\u2014'}</td>
                    <td className="muted">{m.area || '\u2014'}</td>
                    <td className="muted" style={{ fontSize: 13 }}>{m.phone || m.email || '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </div>
    </>
  );
}