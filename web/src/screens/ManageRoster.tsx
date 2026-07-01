import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, Pill, Modal, Field } from '../components/ui';

export default function ManageRoster() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [pwFor, setPwFor] = useState<any | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const deact = useMutation({ mutationFn: (id: number) => api.delete(`/members/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['roster'] }) });

  if (!member?.canEdit) return <div className="card pad"><div className="empty"><div className="ic"><Icon name="users" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div></div></div>;
  const list = data?.members ?? [];

  return (
    <>
      <div className="page-head">
        <div><h1>Manage Roster</h1><div className="sub">{list.length} active member{list.length === 1 ? '' : 's'}</div></div>
        <button className="btn primary" onClick={() => nav('/add-member')}><Icon name="plus" size={16} /> Add member</button>
      </div>
      {isLoading ? <Spinner /> : list.length === 0 ? <EmptyState icon="users" title="No members" /> : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Member</th><th>Role</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="sm" /> <span style={{ fontWeight: 600 }}>{m.name}</span></div></td>
                  <td>{m.role_label && <Pill tone="blue">{m.role_label}</Pill>}</td>
                  <td className="muted">{m.phone || '\u2014'}</td>
                  <td>
                    <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                      {member?.superAdmin && (<button className="btn ghost sm" title="Set password" onClick={() => setPwFor(m)}><Icon name="settings" size={15} /></button>)}
                      <button className="btn ghost sm" title="Deactivate" onClick={() => { if (confirm(`Remove ${m.name}? (deactivates, keeps history)`)) deact.mutate(m.id); }}><Icon name="trash" size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pwFor && <SetPwModal member={pwFor} onClose={() => setPwFor(null)} />}
    </>
  );
}

const SetPwModal: React.FC<{ member: any; onClose: () => void }> = ({ member, onClose }) => {
  const [pw, setPw] = useState('');
  const m = useMutation({
    mutationFn: (password: string) => api.post(`/admin/members/${member.id}/password`, { password }),
    onSuccess: () => { alert('Password updated'); onClose(); },
    onError: (e: any) => alert(e.message || 'Failed'),
  });
  return (
    <Modal title={`Set password · ${member.name}`} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={m.isPending || pw.length < 6} onClick={() => m.mutate(pw)}>{m.isPending ? 'Saving...' : 'Save password'}</button></>}>
      <Field label="New password (min 6 characters)"><input className="input" type="text" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus placeholder="Set a temporary password" /></Field>
      <div className="hint">Share this with the member. They can change it later from their profile (when password login is active).</div>
    </Modal>
  );
};