import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Modal, Field } from '../components/ui';
import type { ImpactRow, Cause } from '../types';

export default function Impact() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [logOpen, setLogOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['impact'], queryFn: () => api.get<{ impact: ImpactRow[] }>('/causes/impact') });
  const causes = useQuery({ queryKey: ['causes'], queryFn: () => api.get<{ causes: Cause[] }>('/causes') });
  const rows = data?.impact ?? [];
  const totalUnits = rows.reduce((s, r) => s + (r.units || 0), 0);

  return (
    <>
      <div className="page-head">
        <div><h1>Service Impact</h1><div className="sub">Lions Global Causes &mdash; tap a cause to see its projects</div></div>
        {member?.canEdit && <button className="btn gold" onClick={() => setLogOpen(true)}><Icon name="plus" size={16} /> Log project</button>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="card stat accent"><div className="k">People served</div><div className="v">{totalUnits.toLocaleString('en-IN')}</div><div className="d">across all causes</div></div>
      </div>

      {isLoading ? <Spinner /> :
        rows.length === 0 ? <EmptyState icon="heart" title="No impact logged yet" /> :
        <div className="card">
          {rows.map((r) => (
            <div key={r.id} className="list-row clickable" onClick={() => nav(`/projects?causeId=${encodeURIComponent(r.id)}`)}>
              <div className="avatar md" style={{ background: `${r.color}22`, color: r.color, fontSize: 22 }}>{r.icon}</div>
              <div className="meta"><div className="title">{r.name}</div><div className="sub">{r.projects} projects</div></div>
              <div style={{ fontWeight: 800, color: r.color, fontSize: 22 }}>{r.units}</div>
              <Icon name="chevron" size={18} />
            </div>
          ))}
        </div>}

      {logOpen && <LogModal causes={causes.data?.causes ?? []} onClose={() => setLogOpen(false)} qc={qc} />}
    </>
  );
}

const LogModal: React.FC<{ causes: Cause[]; onClose: () => void; qc: any }> = ({ causes, onClose, qc }) => {
  const [causeId, setCauseId] = useState(causes[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const m = useMutation({
    mutationFn: () => api.post('/service-projects', { cause_id: causeId, title: title.trim(), units: parseInt(units) || 0, amount_inr: Number(amount) || 0, occurred_on: date || null, notes: notes || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['impact'] }); qc.invalidateQueries({ queryKey: ['projects'] }); onClose(); },
  });
  return (
    <Modal title="Log service project" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={m.isPending || !title} onClick={() => m.mutate()}>{m.isPending ? 'Saving...' : 'Log project'}</button></>}>
      <Field label="Cause"><div className="chip-row">{causes.map((c) => <button key={c.id} className={`chip${causeId === c.id ? ' active' : ''}`} onClick={() => setCauseId(c.id)}>{c.icon} {c.name}</button>)}</div></Field>
      <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Eye check-up camp" /></Field>
      <div className="row-2"><Field label="Units / people served"><input className="input" type="number" value={units} onChange={(e) => setUnits(e.target.value)} /></Field>
        <Field label="Amount (INR)"><input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field></div>
      <Field label="Date"><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Notes"><textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      {m.error && <div className="pill red">{(m.error as any).message}</div>}
    </Modal>
  );
};