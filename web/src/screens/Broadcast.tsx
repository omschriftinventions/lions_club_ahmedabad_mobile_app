import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, Field, Pill } from '../components/ui';

type Mode = 'push' | 'whatsapp';

export default function Broadcast() {
  const { member } = useAuth();
  const [mode, setMode] = useState<Mode>('push');

  // Push form
  const [pf, setPf] = useState({ title: '', body: '', icon: '\uD83D\uDCE3' });
  const setP = (k: string) => (e: any) => setPf({ ...pf, [k]: e.target.value });
  const [pushDone, setPushDone] = useState(0);
  const pushMut = useMutation({
    mutationFn: () => api.post<{ recipients: number }>('/broadcast', { title: pf.title, body: pf.body || undefined, icon: pf.icon || undefined }),
    onSuccess: (d: any) => { setPushDone(d.recipients); setPf({ title: '', body: '', icon: '\uD83D\uDCE3' }); },
  });

  // WhatsApp form
  const [waMsg, setWaMsg] = useState('');
  const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [waResult, setWaResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const { data: memData } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const members = useMemo(() => {
    const list = memData?.members ?? [];
    if (!search) return list;
    const lc = search.toLowerCase();
    return list.filter((m) => `${m.name} ${m.phone ?? ''}`.toLowerCase().includes(lc));
  }, [memData, search]);

  const waMut = useMutation({
    mutationFn: () => api.post<any>('/broadcast/whatsapp', {
      message: waMsg,
      memberIds: recipientMode === 'selected' ? Array.from(selected) : undefined,
    }),
    onSuccess: (d: any) => { setWaResult({ sent: d.sent, failed: d.failed, total: d.total }); if (d.sent > 0) setWaMsg(''); },
  });

  if (!member?.canEdit) return <div className="card pad"><div className="empty"><div className="ic"><Icon name="megaphone" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div></div></div>;

  const toggleSel = (id: number) => { const s = new Set(selected); if (s.has(id)) s.delete(id); else s.add(id); setSelected(s); };

  return (
    <>
      <div className="page-head"><div><h1>Broadcast</h1><div className="sub">Send a message to club members</div></div></div>

      {/* Mode toggle */}
      <div className="chip-row" style={{ marginBottom: 16 }}>
        <button className={`chip${mode === 'push' ? ' active' : ''}`} onClick={() => setMode('push')}><Icon name="bell" size={15} /> Push Notification</button>
        <button className={`chip${mode === 'whatsapp' ? ' active' : ''}`} onClick={() => setMode('whatsapp')}><Icon name="chat" size={15} /> WhatsApp Message</button>
      </div>

      {mode === 'push' ? (
        <>
          {pushDone > 0 && <div className="card pad" style={{ marginBottom: 16, background: '#DCFCE7', border: '1px solid #BBF7D0' }}><Icon name="check" size={16} /> Push sent to {pushDone} member{pushDone === 1 ? '' : 's'}.</div>}
          <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (pf.title) pushMut.mutate(); }}>
            <Field label="Title"><input className="input" value={pf.title} onChange={setP('title')} placeholder="e.g. Urgent: meeting rescheduled" required /></Field>
            <Field label="Message (optional)"><textarea className="textarea" value={pf.body} onChange={setP('body')} placeholder="Details shown in the notification..." /></Field>
            <Field label="Icon (emoji, optional)"><input className="input" value={pf.icon} onChange={setP('icon')} maxLength={4} /></Field>
            {pushMut.error && <div className="pill red" style={{ marginBottom: 12 }}>{(pushMut.error as any).message}</div>}
            <button className="btn primary" disabled={pushMut.isPending || !pf.title}>{pushMut.isPending ? 'Sending...' : 'Send push notification'}</button>
          </form>
        </>
      ) : (
        <>
          {waResult && (
            <div className="card pad" style={{ marginBottom: 16, background: waResult.sent > 0 ? '#DCFCE7' : '#FEE2E2', border: `1px solid ${waResult.sent > 0 ? '#BBF7D0' : '#FECACA'}` }}>
              <Icon name={waResult.sent > 0 ? 'check' : 'x'} size={16} /> WhatsApp: {waResult.sent} sent, {waResult.failed} failed, {waResult.total} total.
              {waResult.sent === 0 && waResult.failed > 0 && <div style={{ marginTop: 6 }}><Pill tone="red">Is WhatsApp linked? Check System Admin &rarr; WhatsApp QR.</Pill></div>}
            </div>
          )}

          <div className="card pad" style={{ maxWidth: 640 }}>
            <Field label="WhatsApp message"><textarea className="textarea" style={{ minHeight: 100 }} value={waMsg} onChange={(e) => setWaMsg(e.target.value)} placeholder="Type your message..." /></Field>

            <div className="card-title" style={{ marginTop: 16 }}>Recipients</div>
            <div className="chip-row" style={{ marginBottom: 12 }}>
              <button className={`chip${recipientMode === 'all' ? ' active' : ''}`} onClick={() => setRecipientMode('all')}>All members</button>
              <button className={`chip${recipientMode === 'selected' ? ' active' : ''}`} onClick={() => setRecipientMode('selected')}>Selected ({selected.size})</button>
            </div>

            {recipientMode === 'selected' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--faint)' }}><Icon name="search" size={16} /></span>
                  <input className="input" style={{ paddingLeft: 36 }} placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 10 }}>
                  {members.length === 0 ? <div className="muted" style={{ padding: 14 }}>No members found.</div> :
                    members.map((m) => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--line-2)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSel(m.id)} />
                        <Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="sm" />
                        <span style={{ flex: 1 }}>{m.name}</span>
                        {m.phone ? <Pill tone="green">has phone</Pill> : <Pill tone="red">no phone</Pill>}
                      </label>
                    ))
                  }
                </div>
                {selected.size > 0 && <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => setSelected(new Set())}>Clear selection</button>}
              </div>
            )}

            {recipientMode === 'all' && (
              <div className="hint" style={{ marginBottom: 12 }}>Sends to all active members who have a phone number on file. Members without a phone are skipped.</div>
            )}

            {waMut.error && <div className="pill red" style={{ marginBottom: 12 }}>{(waMut.error as any).message}</div>}
            <button className="btn primary" disabled={waMut.isPending || !waMsg || (recipientMode === 'selected' && selected.size === 0)}
              onClick={() => waMut.mutate()}>
              {waMut.isPending ? 'Sending via WhatsApp...' : 'Send WhatsApp message'}
            </button>
          </div>
        </>
      )}
    </>
  );
};