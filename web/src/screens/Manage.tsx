import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

const calcHours = (tin: string, tout: string): number | null => {
  const pm = (t: string) => { const m = t.match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
  const a = pm(tin), b = pm(tout);
  if (a == null || b == null) return null;
  let d = b - a; if (d < 0) d += 1440;
  return Math.round((d / 60) * 100) / 100;
};

const EventForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const qc = useQueryClient();
  const emptyForm = { title: '', type: 'Meeting', code_no: '', starts_at: '', ends_at: '', venue: '', description: '', cause_id: '', cover_url: '', time_in: '', time_out: '', expenses: '', beneficiaries: '' };
  const [f, setF] = useState(emptyForm);
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const membersQ = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const noMembers = memberIds.length;
  const hours = calcHours(f.time_in, f.time_out);
  const manHours = hours != null ? Math.round(hours * noMembers * 100) / 100 : null;

  const m = useMutation({
    mutationFn: () => api.post('/events', {
      title: f.title, type: f.type, code_no: f.code_no || null, starts_at: toDbDt(f.starts_at), ends_at: toDbDt(f.ends_at),
      venue: f.venue || null, description: f.description || null, cause_id: f.cause_id || null, cover_url: f.cover_url || null,
      time_in: f.time_in || null, time_out: f.time_out || null, member_ids: memberIds,
      expenses: f.expenses || null, beneficiaries: f.beneficiaries || null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setDone(true); },
  });

  if (done) return (
    <div className="card pad" style={{ textAlign: 'center' }}>
      <div className="ic" style={{ fontSize: 40, color: 'var(--success)' }}><Icon name="check" size={40} /></div>
      <h3 style={{ marginTop: 10 }}>Event created</h3>
      <p className="muted">Members have been notified by push.</p>
      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <button className="btn outline" onClick={() => { setDone(false); setF(emptyForm); setMemberIds([]); }}>Create another</button>
        <button className="btn primary" onClick={onDone}>View events</button>
      </div>
    </div>
  );

  return (
    <>
    <ImportEvents onDone={() => qc.invalidateQueries({ queryKey: ['events'] })} />
    <form className="card pad" style={{ maxWidth: 640 }} onSubmit={(e) => { e.preventDefault(); if (f.title && f.starts_at) m.mutate(); }}>
      <Field label="Event title"><input className="input" value={f.title} onChange={set('title')} placeholder="e.g. Monthly Fellowship Dinner" required /></Field>
      <div className="row-2">
        <Field label="Type">
          <select className="select" value={f.type} onChange={set('type')}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <Field label="Code No."><input className="input" value={f.code_no} onChange={set('code_no')} placeholder="e.g. s17" /></Field>
      </div>
      <div className="row-2">
        <Field label="Cause (optional)"><input className="input" value={f.cause_id} onChange={set('cause_id')} placeholder="e.g. diabetes" /></Field>
        <Field label="Starts"><input className="input" type="datetime-local" value={f.starts_at} onChange={set('starts_at')} required /></Field>
      </div>
      <Field label="Venue"><input className="input" value={f.venue} onChange={set('venue')} placeholder="Address / location" /></Field>

      <Field label="Members present">
        <MemberMultiSelect members={membersQ.data?.members ?? []} value={memberIds} onChange={setMemberIds} />
      </Field>

      <div className="row-2">
        <Field label="Time in"><input className="input" type="time" value={f.time_in} onChange={set('time_in')} /></Field>
        <Field label="Time out"><input className="input" type="time" value={f.time_out} onChange={set('time_out')} /></Field>
      </div>

      <div className="row-2">
        <Field label="No. of members (auto)"><input className="input" value={noMembers} readOnly style={{ background: 'var(--bg)' }} /></Field>
        <Field label="No. of hours (auto)"><input className="input" value={hours ?? ''} readOnly style={{ background: 'var(--bg)' }} /></Field>
      </div>
      <div className="row-2">
        <Field label="No. of man hours (auto)"><input className="input" value={manHours ?? ''} readOnly style={{ background: 'var(--bg)' }} /></Field>
        <Field label="Expenses (₹)"><input className="input" type="number" value={f.expenses} onChange={set('expenses')} placeholder="0" /></Field>
      </div>
      <div className="row-2">
        <Field label="Beneficiaries"><input className="input" type="number" value={f.beneficiaries} onChange={set('beneficiaries')} placeholder="0" /></Field>
        <Field label="Ends (optional)"><input className="input" type="datetime-local" value={f.ends_at} onChange={set('ends_at')} /></Field>
      </div>

      <Field label="Description"><RichEditor value={f.description} onChange={(h) => setF({ ...f, description: h })} minHeight={180} placeholder="Describe the event. Paste HTML, insert images or a PDF." /></Field>
      <Field label="Cover image URL (optional)"><input className="input" value={f.cover_url} onChange={set('cover_url')} placeholder="https://..." /></Field>
      {m.error && <div className="pill red" style={{ marginBottom: 12 }}>{(m.error as any).message || 'Could not create event'}</div>}
      <button className="btn primary" disabled={m.isPending}>{m.isPending ? 'Creating...' : 'Create event & notify'}</button>
    </form>
    </>
  );
};

// Excel import for events (Service Activity Report).
const ImportEvents: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true); setSummary(null);
      try {
        const r = await api.post<any>('/events/import', { file: String(reader.result) });
        setSummary(r); onDone();
      } catch (err: any) { setSummary({ error: err?.message || 'Import failed' }); }
      finally { setBusy(false); }
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="card pad" style={{ maxWidth: 640, marginBottom: 16 }}>
      <div className="card-title">Import from Excel</div>
      <p className="muted" style={{ fontSize: 14 }}>Upload a Service Activity Report (.xlsx). Rows are matched by Code No. (or title + date) and added or updated. Columns: Date, Details of Activity, Code No., Venue, Member present, Time in, Time out, Expenses, Beneficiaries.</p>
      <label className="btn outline" style={{ cursor: 'pointer', display: 'inline-flex', marginTop: 8 }}>
        {busy ? 'Importing…' : 'Choose Excel file'}
        <input type="file" accept=".xlsx,.xls" hidden onChange={onFile} disabled={busy} />
      </label>
      {summary && (summary.error
        ? <div className="pill red" style={{ marginTop: 12 }}>{summary.error}</div>
        : <div style={{ marginTop: 12 }}>
            <Pill tone="green">Created {summary.created}</Pill>{' '}
            <Pill tone="blue">Updated {summary.updated}</Pill>{' '}
            {summary.skipped > 0 && <Pill tone="gray">Skipped {summary.skipped}</Pill>}
            {summary.errors?.length > 0 && <div className="hint" style={{ marginTop: 8, color: 'var(--red)' }}>{summary.errors.join(' · ')}</div>}
          </div>)}
    </div>
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
// Searchable multi-select for "Members present".
const MemberMultiSelect: React.FC<{ members: any[]; value: number[]; onChange: (ids: number[]) => void }> = ({ members, value, onChange }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ql = q.trim().toLowerCase();
  const filtered = ql ? members.filter((m) => `${m.name} ${m.profession ?? ''}`.toLowerCase().includes(ql)) : members;
  const byId = new Map(members.map((m) => [m.id, m]));
  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {value.map((id) => (
            <span key={id} onClick={() => toggle(id)} style={{ background: 'var(--blue)', color: '#fff', borderRadius: 999, padding: '3px 10px', fontSize: 13, cursor: 'pointer' }}>
              {byId.get(id)?.name ?? `#${id}`} ✕
            </span>
          ))}
        </div>
      )}
      <input className="input" value={q} placeholder="Search members to add..." onFocus={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} />
      {open && (
        <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 10, marginTop: 6 }}>
          {filtered.length === 0 ? <div className="muted" style={{ padding: 12 }}>No members</div> :
            filtered.map((m) => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid var(--line-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={value.includes(m.id)} onChange={() => toggle(m.id)} />
                <span>{m.name}</span>{m.profession && <span className="faint" style={{ fontSize: 12 }}>· {m.profession}</span>}
              </label>
            ))}
          <div style={{ textAlign: 'center', padding: 8 }}><button type="button" className="btn ghost sm" onClick={() => setOpen(false)}>Done</button></div>
        </div>
      )}
    </div>
  );
};
