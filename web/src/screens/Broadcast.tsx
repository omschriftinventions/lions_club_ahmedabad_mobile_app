import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Field } from '../components/ui';

export default function Broadcast() {
  const { member } = useAuth();
  const [f, setF] = useState({ title: '', body: '', icon: '\uD83D\uDCE3' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const [done, setDone] = useState(0);
  const m = useMutation({
    mutationFn: () => api.post<{ recipients: number }>('/broadcast', { title: f.title, body: f.body || undefined, icon: f.icon || undefined }),
    onSuccess: (d: any) => { setDone(d.recipients); setF({ title: '', body: '', icon: '\uD83D\uDCE3' }); },
  });

  if (!member?.canEdit) return <div className="card pad"><div className="empty"><div className="ic"><Icon name="megaphone" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div></div></div>;

  return (
    <>
      <div className="page-head"><div><h1>Broadcast</h1><div className="sub">Push an alert to every member of the club</div></div></div>
      {done > 0 && <div className="card pad" style={{ marginBottom: 16, background: '#DCFCE7', border: '1px solid #BBF7D0' }}><Icon name="check" size={16} /> Sent to {done} member{done === 1 ? '' : 's'}.</div>}
      <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (f.title) m.mutate(); }}>
        <Field label="Title"><input className="input" value={f.title} onChange={set('title')} placeholder="e.g. Urgent: meeting rescheduled" required /></Field>
        <Field label="Message (optional)"><textarea className="textarea" value={f.body} onChange={set('body')} placeholder="Details shown in the notification..." /></Field>
        <Field label="Icon (emoji, optional)"><input className="input" value={f.icon} onChange={set('icon')} maxLength={4} /></Field>
        {m.error && <div className="pill red" style={{ marginBottom: 12 }}>{(m.error as any).message}</div>}
        <button className="btn primary" disabled={m.isPending || !f.title}>{m.isPending ? 'Sending...' : 'Send broadcast'}</button>
      </form>
    </>
  );
}