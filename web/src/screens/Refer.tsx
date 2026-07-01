import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Field, Pill, fmtDate } from '../components/ui';

const STATUSES = ['new', 'contacted', 'inducted', 'declined'];

export default function Refer() {
  const qc = useQueryClient();
  const { member } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['referrals'], queryFn: () => api.get<{ referrals: any[] }>('/referrals') });
  const list = data?.referrals ?? [];

  const upd = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/referrals/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });

  return (
    <>
      <div className="page-head"><div><h1>Refer a Lion</h1><div className="sub">Suggest prospective members</div></div></div>
      <ReferForm onDone={() => qc.invalidateQueries({ queryKey: ['referrals'] })} />
      <h3 style={{ fontSize: 16, margin: '24px 0 12px' }}>Referrals {member?.canEdit ? '(all)' : '(yours)'}</h3>
      {isLoading ? <Spinner /> : list.length === 0 ? <EmptyState icon="user" title="No referrals yet" /> : (
        <div className="card">
          {list.map((r) => (
            <div key={r.id} className="list-row">
              <div className="avatar md" style={{ background: 'var(--blue)' }}><Icon name="user" size={18} /></div>
              <div className="meta">
                <div className="title">{r.candidate_name}</div>
                <div className="sub">{[r.candidate_profession, r.candidate_phone, r.candidate_email].filter(Boolean).join(' \u00b7 ')}{r.referrer_name ? ` \u00b7 referred by ${r.referrer_name}` : ''}</div>
                {r.notes && <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{r.notes}</div>}
                <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{fmtDate(r.created_at)}</div>
              </div>
              {member?.canEdit ? (
                <select className="select sm" style={{ height: 32, width: 130 }} value={r.status} onChange={(e) => upd.mutate({ id: r.id, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : <Pill tone={r.status === 'inducted' ? 'green' : r.status === 'declined' ? 'red' : 'gray'}>{r.status}</Pill>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const ReferForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [f, setF] = useState({ candidate_name: '', candidate_phone: '', candidate_email: '', candidate_profession: '', notes: '' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const m = useMutation({
    mutationFn: () => api.post('/referrals', { candidate_name: f.candidate_name, candidate_phone: f.candidate_phone || null, candidate_email: f.candidate_email || null, candidate_profession: f.candidate_profession || null, notes: f.notes || null }),
    onSuccess: () => { setF({ candidate_name: '', candidate_phone: '', candidate_email: '', candidate_profession: '', notes: '' }); onDone(); },
  } as any);
  return (
    <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (f.candidate_name) (m as any).mutate(); }}>
      <div className="row-2"><Field label="Candidate name"><input className="input" value={f.candidate_name} onChange={set('candidate_name')} required /></Field><Field label="Profession"><input className="input" value={f.candidate_profession} onChange={set('candidate_profession')} /></Field></div>
      <div className="row-2"><Field label="Phone"><input className="input" value={f.candidate_phone} onChange={set('candidate_phone')} /></Field><Field label="Email"><input className="input" value={f.candidate_email} onChange={set('candidate_email')} /></Field></div>
      <Field label="Notes"><textarea className="textarea" style={{ minHeight: 70 }} value={f.notes} onChange={set('notes')} /></Field>
      <button className="btn primary" disabled={(m as any).isPending || !f.candidate_name}>{(m as any).isPending ? 'Submitting...' : 'Submit referral'}</button>
    </form>
  );
};