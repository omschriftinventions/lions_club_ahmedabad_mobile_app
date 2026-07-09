import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Modal, Field, Pill } from '../components/ui';
import type { Cause } from '../types';

// Colorful icon palette (emoji) a super admin can pick from when adding a cause.
const ICONS = [
  '👁️', '👓', '🩺', '👂', '🧠',
  '🍱', '🍎', '🥖', '🍲', '🥗',
  '🌳', '🌱', '🌍', '♻️', '🌊', '🪴',
  '💉', '🩸', '🧪', '💊', '🦷', '❤️', '🩹', '🧑‍⚕️',
  '🎗️', '❤️‍🩹', '🏥', '🚨', '🆘', '🛟',
  '💧', '🚰', '📚', '✏️', '🎓', '📝', '🎒', '📖',
  '🧒', '🧸', '🎈', '⚽', '🎨', '🎸', '🧩',
  '🤝', '🏘️', '🙌', '🏠', '👴', '👵', '🐕', '🐾',
];

const COLORS = [
  '#003F87', '#2A6FDB', '#0EA5E9', '#0891B2', '#1F8A5B', '#059669', '#65A30D',
  '#E08E1A', '#CA8A04', '#EA580C', '#C8362D', '#DC2626', '#E11D48', '#DB2777',
  '#7A3FB8', '#7C3AED', '#9333EA', '#4F46E5',
];

export default function CauseAdmin() {
  const { member } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Cause | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useQuery({ queryKey: ['causes'], queryFn: () => api.get<{ causes: Cause[] }>('/causes') });

  if (!member?.superAdmin) {
    return <div className="card pad"><div className="empty"><div className="ic"><Icon name="settings" size={38} /></div><div style={{ fontWeight: 700 }}>Super admin access required</div><div className="muted">Only super admins can manage causes.</div></div></div>;
  }

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/causes/${encodeURIComponent(id)}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['causes'] }),
    onError: (e: any) => alert(e.message || 'Could not delete cause'),
  });

  const remove = (c: Cause) => {
    if (!confirm(`Delete cause "${c.name}"? This cannot be undone.`)) return;
    del.mutate(c.id);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Causes</h1><div className="sub">Global service causes used when logging projects. New causes appear in the Log project picker immediately.</div></div>
        <button className="btn gold" onClick={() => setCreating(true)}><Icon name="plus" size={16} /> Add cause</button>
      </div>

      {list.isLoading ? <Spinner /> :
        (list.data?.causes.length ?? 0) === 0 ? <EmptyState icon="heart" title="No causes yet" body="Add your first cause to start tracking service impact." /> :
        <div className="card">
          {list.data!.causes.map((c) => (
            <div key={c.id} className="list-row">
              <div className="avatar md" style={{ background: `${c.color}22`, fontSize: 22 }}>{c.icon}</div>
              <div className="meta">
                <div className="title">{c.name}</div>
                <div className="sub">{c.unit_label || '—'}<span style={{ margin: '0 6px', opacity: .4 }}>·</span><code style={{ fontSize: 12 }}>{c.id}</code></div>
              </div>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: c.color, border: '1px solid var(--line)' }} title={c.color} />
              <Pill tone="gray">{c.sort_order}</Pill>
              <button className="btn ghost sm" onClick={() => setEditing(c)}><Icon name="edit" size={15} /></button>
              <button className="btn ghost sm" onClick={() => remove(c)} disabled={del.isPending}><Icon name="trash" size={15} /></button>
            </div>
          ))}
        </div>}

      {(creating || editing) && (
        <CauseModal
          cause={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); qc.invalidateQueries({ queryKey: ['causes'] }); }}
        />
      )}
    </>
  );
}

const CauseModal: React.FC<{ cause: Cause | null; onClose: () => void; onSaved: () => void }> = ({ cause, onClose, onSaved }) => {
  const qc = useQueryClient();
  const [name, setName] = useState(cause?.name ?? '');
  const [id, setId] = useState(cause?.id ?? '');
  const [icon, setIcon] = useState(cause?.icon ?? ICONS[0]);
  const [color, setColor] = useState(cause?.color ?? COLORS[0]);
  const [unitLabel, setUnitLabel] = useState(cause?.unit_label ?? '');
  const [sortOrder, setSortOrder] = useState(String(cause?.sort_order ?? ''));
  const [err, setErr] = useState('');

  const m = useMutation({
    mutationFn: async () => {
      const body = {
        name: name.trim(),
        icon,
        color,
        unit_label: unitLabel.trim() || null,
        sort_order: Number(sortOrder) || undefined,
        ...(cause ? {} : { id: id.trim() || undefined }),
      };
      if (cause) return api.put(`/causes/${encodeURIComponent(cause.id)}`, body);
      return api.post<{ id: string }>('/causes', body);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['causes'] }); qc.invalidateQueries({ queryKey: ['impact'] }); onSaved(); },
    onError: (e: any) => setErr(e.message || 'Could not save cause'),
  });

  return (
    <Modal title={cause ? 'Edit cause' : 'Add cause'} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={m.isPending || name.trim().length < 2} onClick={() => m.mutate()}>{m.isPending ? 'Saving...' : 'Save cause'}</button></>}>
      <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vision" /></Field>
      {!cause && <Field label="Slug (optional)" hint="Lowercase, no spaces. Auto-generated from the name if left blank."><input className="input" value={id} onChange={(e) => setId(e.target.value.toLowerCase())} placeholder="e.g. vision" /></Field>}
      <Field label="Unit label (optional)" hint="What one unit means, e.g. meals served, screenings done."><input className="input" value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="e.g. people served" /></Field>
      <Field label="Sort order (optional)"><input className="input" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="10" /></Field>

      <div className="field">
        <label>Icon</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 6, maxHeight: 200, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 10, padding: 10 }}>
          {ICONS.map((ic) => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              style={{ fontSize: 22, lineHeight: '34px', borderRadius: 8, border: icon === ic ? '2px solid var(--blue)' : '1px solid transparent', background: icon === ic ? '#E0EBFF' : 'transparent' }}>{ic}</button>
          ))}
        </div>
        <div className="hint">Selected: <span style={{ fontSize: 18 }}>{icon}</span></div>
      </div>

      <div className="field">
        <label>Color</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {COLORS.map((col) => (
            <button key={col} type="button" onClick={() => setColor(col)} title={col}
              style={{ width: 30, height: 30, borderRadius: 8, background: col, border: color === col ? '3px solid var(--ink)' : '1px solid var(--line)', cursor: 'pointer' }} />
          ))}
        </div>
      </div>

      {err && <div className="pill red">{err}</div>}
    </Modal>
  );
};
