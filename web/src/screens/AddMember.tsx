import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Field } from '../components/ui';

const ROLES = ['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'VP1', 'VP2', 'MEMBERSHIP_CHAIR', 'SERVICE_CHAIR', 'TAIL_TWISTER'];

export default function AddMember() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [f, setF] = useState({ name: '', role: 'MEMBER', designation: '', profession: '', business: '', area: '', phone: '', email: '', joined_year: '', bio: '' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const m = useMutation({
    mutationFn: () => api.post('/members', { name: f.name, role: f.role, designation: f.designation || null, profession: f.profession || null, business: f.business || null, area: f.area || null, phone: f.phone || null, phone_e164: f.phone || null, email: f.email || null, joined_year: f.joined_year ? Number(f.joined_year) : null, bio: f.bio || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roster'] }); qc.invalidateQueries({ queryKey: ['roster', 'all'] }); nav('/roster'); },
  });

  if (!member?.canEdit) return <div className="card pad"><div className="empty"><div className="ic"><Icon name="user" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div></div></div>;
  const I = (k: string, label: string, opts: { area?: boolean; num?: boolean } = {}) => (
    <Field label={label}>{opts.area ? <textarea className="textarea" value={(f as any)[k]} onChange={set(k)} /> : <input className="input" type={opts.num ? 'number' : 'text'} value={(f as any)[k]} onChange={set(k)} />}</Field>
  );

  return (
    <>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => nav(-1)}><Icon name="back" size={16} /> Back</button>
      <div className="page-head"><div><h1>Add Member</h1><div className="sub">Register a new Lion</div></div></div>
      <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (f.name) m.mutate(); }}>
        {I('name', 'Full name')}
        <div className="row-2"><Field label="Role"><select className="select" value={f.role} onChange={set('role')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>{I('designation', 'Designation')}</div>
        <div className="row-2">{I('profession', 'Profession')}{I('business', 'Business')}</div>
        <div className="row-2">{I('area', 'Area')}{I('joined_year', 'Joined year', { num: true })}</div>
        <div className="row-2">{I('phone', 'Phone')}{I('email', 'Email')}</div>
        {I('bio', 'Bio', { area: true })}
        {m.error && <div className="pill red" style={{ marginBottom: 12 }}>{(m.error as any).message}</div>}
        <button className="btn primary" disabled={m.isPending || !f.name}>{m.isPending ? 'Adding...' : 'Add member'}</button>
      </form>
    </>
  );
}