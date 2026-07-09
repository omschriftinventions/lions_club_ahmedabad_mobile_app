import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Field, Pill } from '../components/ui';
import { RichEditor } from '../components/RichEditor';

const EVENT_TYPES = ['Signature', 'Service', 'Meeting', 'Fellowship', 'Other'];

function toDbDt(v: string): string | null {
  if (!v) return null;
  return v.replace('T', ' ');
}

export default function Manage() {
  const { member } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') === 'news' ? 'news' : 'event') as 'event' | 'news';
  const setTab = (t: 'event' | 'news') => setParams(t === 'event' ? {} : { tab: 'news' });

  if (!member?.canEdit) {
    return <div className="card pad"><div className="empty"><div className="ic"><Icon name="settings" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div><div className="muted">Only President, Secretary and Treasurer can manage club content.</div></div></div>;
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Manage Club</h1><div className="sub">Create events and publish news for your members</div></div>
      </div>
      <div className="chip-row" style={{ marginBottom: 18 }}>
        <button className={`chip${tab === 'event' ? ' active' : ''}`} onClick={() => setTab('event')}><Icon name="calendar" size={15} /> New event</button>
        <button className={`chip${tab === 'news' ? ' active' : ''}`} onClick={() => setTab('news')}><Icon name="news" size={15} /> Publish news</button>
      </div>
      {tab === 'event' ? <EventForm onDone={() => nav('/events')} /> : <NewsForm onDone={() => nav('/news')} qc={qc} />}
    </>
  );
}

const EventForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const qc = useQueryClient();
  const [f, setF] = useState({ title: '', type: 'Meeting', starts_at: '', ends_at: '', venue: '', description: '', cause_id: '', cover_url: '' });
  const [done, setDone] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const m = useMutation({
    mutationFn: () => api.post('/events', {
      title: f.title, type: f.type, starts_at: toDbDt(f.starts_at), ends_at: toDbDt(f.ends_at),
      venue: f.venue || null, description: f.description || null, cause_id: f.cause_id || null, cover_url: f.cover_url || null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setDone(true); },
  });

  if (done) return (
    <div className="card pad" style={{ textAlign: 'center' }}>
      <div className="ic" style={{ fontSize: 40, color: 'var(--success)' }}><Icon name="check" size={40} /></div>
      <h3 style={{ marginTop: 10 }}>Event created</h3>
      <p className="muted">Members have been notified by push.</p>
      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <button className="btn outline" onClick={() => { setDone(false); setF({ title: '', type: 'Meeting', starts_at: '', ends_at: '', venue: '', description: '', cause_id: '', cover_url: '' }); }}>Create another</button>
        <button className="btn primary" onClick={onDone}>View events</button>
      </div>
    </div>
  );

  return (
    <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (f.title && f.starts_at) m.mutate(); }}>
      <Field label="Event title"><input className="input" value={f.title} onChange={set('title')} placeholder="e.g. Monthly Fellowship Dinner" required /></Field>
      <div className="row-2">
        <Field label="Type">
          <select className="select" value={f.type} onChange={set('type')}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <Field label="Cause (optional)"><input className="input" value={f.cause_id} onChange={set('cause_id')} placeholder="e.g. diabetes" /></Field>
      </div>
      <div className="row-2">
        <Field label="Starts"><input className="input" type="datetime-local" value={f.starts_at} onChange={set('starts_at')} required /></Field>
        <Field label="Ends (optional)"><input className="input" type="datetime-local" value={f.ends_at} onChange={set('ends_at')} /></Field>
      </div>
      <Field label="Venue"><input className="input" value={f.venue} onChange={set('venue')} placeholder="Address / location" /></Field>
      <Field label="Description"><RichEditor value={f.description} onChange={(h) => setF({ ...f, description: h })} minHeight={180} placeholder="Describe the event. Paste HTML, insert images or a PDF." /></Field>
      <Field label="Cover image URL (optional)"><input className="input" value={f.cover_url} onChange={set('cover_url')} placeholder="https://..." /></Field>
      {m.error && <div className="pill red" style={{ marginBottom: 12 }}>{(m.error as any).message || 'Could not create event'}</div>}
      <button className="btn primary" disabled={m.isPending}>{m.isPending ? 'Creating...' : 'Create event & notify'}</button>
    </form>
  );
};

const NewsForm: React.FC<{ onDone: () => void; qc: any }> = ({ onDone, qc }) => {
  const [f, setF] = useState({ title: '', tag: '', excerpt: '', body: '', cover_url: '', published: true });
  const [done, setDone] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const m = useMutation({
    mutationFn: () => api.post('/news', { title: f.title, tag: f.tag || null, excerpt: f.excerpt || null, body: f.body || null, cover_url: f.cover_url || null, published: f.published }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['news'] }); setDone(true); },
  });

  if (done) return (
    <div className="card pad" style={{ textAlign: 'center' }}>
      <div style={{ color: 'var(--success)' }}><Icon name="check" size={40} /></div>
      <h3 style={{ marginTop: 10 }}>News published</h3>
      <p className="muted">Members have been notified by push.</p>
      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <button className="btn outline" onClick={() => { setDone(false); setF({ title: '', tag: '', excerpt: '', body: '', cover_url: '', published: true }); }}>Write another</button>
        <button className="btn primary" onClick={onDone}>View news</button>
      </div>
    </div>
  );

  return (
    <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (f.title) m.mutate(); }}>
      <Field label="Headline"><input className="input" value={f.title} onChange={set('title')} placeholder="News title" required /></Field>
      <div className="row-2">
        <Field label="Tag (optional)"><input className="input" value={f.tag} onChange={set('tag')} placeholder="e.g. Announcement" /></Field>
        <Field label="Cover image URL (optional)"><input className="input" value={f.cover_url} onChange={set('cover_url')} placeholder="https://..." /></Field>
      </div>
      <Field label="Excerpt"><textarea className="textarea" style={{ minHeight: 70 }} value={f.excerpt} onChange={set('excerpt')} placeholder="One-line summary shown in the list" /></Field>
      <Field label="Body"><RichEditor value={f.body} onChange={(h) => setF({ ...f, body: h })} minHeight={220} placeholder="Write the article. Paste HTML, insert images or a PDF." /></Field>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 16px' }}>
        <input type="checkbox" checked={f.published} onChange={set('published')} /> <span className="muted">Publish immediately (notify members)</span>
      </label>
      {m.error && <div className="pill red" style={{ marginBottom: 12 }}>{(m.error as any).message || 'Could not publish'}</div>}
      <button className="btn primary" disabled={m.isPending}>{m.isPending ? 'Publishing...' : 'Publish news'}</button>
    </form>
  );
};