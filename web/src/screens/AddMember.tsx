import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Field } from '../components/ui';
import { MemberSelect } from '../components/MemberSelect';
import { useUnsavedGuard, confirmDiscard } from '../lib/useUnsavedGuard';

export default function AddMember() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { data: rolesData } = useQuery({ queryKey: ['roles'], queryFn: () => api.get<{ roles: any[] }>('/members/meta/roles') });
  const roles = rolesData?.roles ?? [];
  const [f, setF] = useState({ name: '', role: 'MEMBER', designation: '', profession: '', business: '', area: '', phone: '', email: '', joined_date: '', alias: '', bio: '' });
  const [sponsorId, setSponsorId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const dirty = !saved && (Object.values(f).some((v) => v !== '' && v !== 'MEMBER') || f.role !== 'MEMBER' || sponsorId != null);
  useUnsavedGuard(dirty);

  const missing = !f.name.trim() || !f.joined_date || !f.phone.trim() || sponsorId == null;

  const m = useMutation({
    mutationFn: () => api.post('/members', {
      name: f.name, role: f.role, designation: f.designation || null, profession: f.profession || null,
      business: f.business || null, area: f.area || null, phone: f.phone || null, phone_e164: f.phone || null,
      email: f.email || null, joined_date: f.joined_date || null, alias: f.alias || null, sponsor_id: sponsorId, bio: f.bio || null,
    }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['roster'] });
      qc.invalidateQueries({ queryKey: ['roster', 'all'] });
      alert(`${f.name} added successfully. Login password is their phone number (last 10 digits).`);
      nav('/roster');
    },
  });

  if (!member?.canEdit) return <div className="card pad"><div className="empty"><div className="ic"><Icon name="user" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div></div></div>;
  const canDesig = !!member?.canEdit; // designation editable by admins/super admins only
  const I = (k: string, label: string, opts: { area?: boolean; type?: string } = {}) => (
    <Field label={label}>{opts.area ? <textarea className="textarea" value={(f as any)[k]} onChange={set(k)} /> : <input className="input" type={opts.type || 'text'} value={(f as any)[k]} onChange={set(k)} />}</Field>
  );

  return (
    <>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => { if (confirmDiscard(dirty)) { setSaved(true); nav(-1); } }}><Icon name="back" size={16} /> Back</button>
      <div className="page-head"><div><h1>Add Member</h1><div className="sub">Register a new Lion · <span className="faint">* required</span></div></div></div>
      <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (!missing) m.mutate(); }}>
        {I('name', 'Full name *')}
        <div className="row-2">
          <Field label="Position"><select className="select" value={f.role} onChange={set('role')}>{roles.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}</select></Field>
          <Field label="Designation">{canDesig ? <input className="input" value={f.designation} onChange={set('designation')} placeholder="PMJF / MJF" /> : <input className="input" value={f.designation} disabled title="Admins only" />}</Field>
        </div>
        <div className="row-2">{I('alias', 'Alias / nickname')}{I('joined_date', 'Joined date *', { type: 'date' })}</div>
        <div className="row-2">{I('profession', 'Profession')}{I('business', 'Business')}</div>
        <div className="row-2">{I('area', 'Area')}{I('phone', 'Phone *')}</div>
        {I('email', 'Email')}
        <Field label="Sponsor (member) *"><MemberSelect value={sponsorId} onChange={setSponsorId} placeholder="Search sponsoring member…" /></Field>
        <div className="hint" style={{ marginTop: -6, marginBottom: 10 }}>Login password is set automatically to the member's phone number (last 10 digits).</div>
        {I('bio', 'Bio', { area: true })}
        {missing && <div className="hint" style={{ marginBottom: 8, color: 'var(--danger,#b3261e)' }}>Name, Joined date, Phone and Sponsor are required.</div>}
        {m.error && <div className="pill red" style={{ marginBottom: 12 }}>{(m.error as any).message}</div>}
        <button className="btn primary" disabled={m.isPending || missing}>{m.isPending ? 'Adding...' : 'Add member'}</button>
      </form>
    </>
  );
}
