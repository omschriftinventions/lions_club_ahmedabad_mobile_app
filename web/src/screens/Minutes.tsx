import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Modal, Field, Pill, fmtDate } from '../components/ui';

export default function Minutes() {
  const qc = useQueryClient();
  const { member } = useAuth();
  const [view, setView] = useState<any | null>(null);
  const [add, setAdd] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['minutes'], queryFn: () => api.get<{ minutes: any[] }>('/meeting-minutes') });
  const mins = data?.minutes ?? [];

  const del = useMutation({ mutationFn: (id: number) => api.delete(`/meeting-minutes/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['minutes'] }) });

  return (
    <>
      <div className="page-head">
        <div><h1>Meeting Minutes</h1><div className="sub">{mins.length} record{mins.length === 1 ? '' : 's'}</div></div>
        {member?.canEdit && <button className="btn primary" onClick={() => setAdd(true)}><Icon name="plus" size={16} /> Add minutes</button>}
      </div>
      {isLoading ? <Spinner /> : mins.length === 0 ? <EmptyState icon="doc" title="No minutes yet" /> : (
        <div className="card">
          {mins.map((mm) => (
            <div key={mm.id} className="list-row clickable" onClick={() => setView(mm)}>
              <div className="avatar md" style={{ background: 'var(--navy)' }}><Icon name="doc" size={18} /></div>
              <div className="meta"><div className="title">{mm.title}</div><div className="sub">{fmtDate(mm.meeting_date)}{mm.attendees ? ` \u00b7 ${mm.attendees} attended` : ''}{mm.created_by_name ? ` \u00b7 by ${mm.created_by_name}` : ''}</div></div>
              {member?.canEdit && <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); if (confirm('Delete these minutes?')) del.mutate(mm.id); }}><Icon name="trash" size={15} /></button>}
            </div>
          ))}
        </div>
      )}
      {view && (
        <Modal title={view.title} onClose={() => setView(null)}>
          <Pill tone="blue">{fmtDate(view.meeting_date)}</Pill>
          {view.attendees != null && <div className="muted" style={{ marginTop: 8 }}>{view.attendees} attended</div>}
          {view.body && <div className="prose" style={{ marginTop: 14 }}>{view.body.split('\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}</div>}
          {view.doc_url && <a href={view.doc_url} target="_blank" rel="noreferrer" className="btn outline sm" style={{ marginTop: 14 }}><Icon name="doc" size={15} /> Open document</a>}
        </Modal>
      )}
      {add && <AddMinutes onClose={() => setAdd(false)} qc={qc} />}
    </>
  );
}

const AddMinutes: React.FC<{ onClose: () => void; qc: any }> = ({ onClose, qc }) => {
  const [f, setF] = useState({ title: '', meeting_date: new Date().toISOString().slice(0, 10), attendees: '', body: '', doc_url: '' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const m = useMutation({
    mutationFn: () => api.post('/meeting-minutes', { title: f.title, meeting_date: f.meeting_date, attendees: f.attendees ? Number(f.attendees) : null, body: f.body || null, doc_url: f.doc_url || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['minutes'] }); onClose(); },
  });
  return (
    <Modal title="Add meeting minutes" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={m.isPending || !f.title} onClick={() => m.mutate()}>{m.isPending ? 'Saving...' : 'Save'}</button></>}>
      <Field label="Title"><input className="input" value={f.title} onChange={set('title')} /></Field>
      <div className="row-2"><Field label="Meeting date"><input className="input" type="date" value={f.meeting_date} onChange={set('meeting_date')} /></Field>
        <Field label="Attendees"><input className="input" type="number" value={f.attendees} onChange={set('attendees')} /></Field></div>
      <Field label="Minutes (body)"><textarea className="textarea" style={{ minHeight: 200 }} value={f.body} onChange={set('body')} /></Field>
      <Field label="Document URL (optional)"><input className="input" value={f.doc_url} onChange={set('doc_url')} placeholder="https://..." /></Field>
    </Modal>
  );
};