import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, Modal, Field, Pill, fmtDate } from '../components/ui';
import type { Member } from '../types';

export default function Awards() {
  const qc = useQueryClient();
  const { member } = useAuth();
  const [add, setAdd] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['awards'], queryFn: () => api.get<{ awards: any[] }>('/awards') });
  const awards = data?.awards ?? [];
  const members = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: Member[] }>('/members?limit=500') });

  return (
    <>
      <div className="page-head">
        <div><h1>Awards Wall</h1><div className="sub">{awards.length} recognition{awards.length === 1 ? '' : 's'}</div></div>
        {member?.canEdit && <button className="btn primary" onClick={() => setAdd(true)}><Icon name="plus" size={16} /> Add award</button>}
      </div>
      {isLoading ? <Spinner /> : awards.length === 0 ? <EmptyState icon="trophy" title="No awards yet" /> : (
        <div className="grid grid-2">
          {awards.map((a) => (
            <div key={a.id} className="card pad">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div className="avatar lg" style={{ background: 'var(--gold-soft)', color: '#8A6D00', fontSize: 30 }}>{a.icon || '\uD83C\uDFC6'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{a.name}</div>
                  {a.category && <div style={{ marginTop: 4 }}><Pill tone="gold">{a.category}</Pill></div>}
                  {a.member_name && <div className="muted" style={{ marginTop: 6 }}><Avatar name={a.member_name} color={a.avatar_color} size="sm" /> <span style={{ verticalAlign: 'middle', marginLeft: 6 }}>{a.member_name}</span></div>}
                  {a.awarded_on && <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>{fmtDate(a.awarded_on)}</div>}
                </div>
              </div>
              {a.description && <div className="prose" style={{ marginTop: 12 }}><p>{a.description}</p></div>}
            </div>
          ))}
        </div>
      )}
      {add && <AddAward members={members.data?.members ?? []} onClose={() => setAdd(false)} qc={qc} />}
    </>
  );
}

const AddAward: React.FC<{ members: Member[]; onClose: () => void; qc: any }> = ({ members, onClose, qc }) => {
  const [f, setF] = useState({ name: '', category: '', member_id: '', awarded_on: '', description: '', icon: '\uD83C\uDFC6' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const m = useMutation({
    mutationFn: () => api.post('/awards', { name: f.name, category: f.category || null, member_id: f.member_id ? Number(f.member_id) : null, awarded_on: f.awarded_on || null, description: f.description || null, icon: f.icon || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['awards'] }); onClose(); },
  });
  return (
    <Modal title="Add award" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={m.isPending || !f.name} onClick={() => m.mutate()}>{m.isPending ? 'Saving...' : 'Save'}</button></>}>
      <Field label="Award name"><input className="input" value={f.name} onChange={set('name')} /></Field>
      <div className="row-2"><Field label="Icon (emoji)"><input className="input" value={f.icon} onChange={set('icon')} maxLength={4} /></Field>
        <Field label="Category"><input className="input" value={f.category} onChange={set('category')} placeholder="e.g. Service" /></Field></div>
      <Field label="Awarded to (optional)"><select className="select" value={f.member_id} onChange={set('member_id')}><option value="">— None —</option>{members.map((mm) => <option key={mm.id} value={mm.id}>{mm.name}</option>)}</select></Field>
      <Field label="Date (optional)"><input className="input" type="date" value={f.awarded_on} onChange={set('awarded_on')} /></Field>
      <Field label="Description"><textarea className="textarea" value={f.description} onChange={set('description')} /></Field>
    </Modal>
  );
};