import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

// Searchable single-member picker. Stores a member id (sponsor_id, etc).
export const MemberSelect: React.FC<{
  value: number | null;
  onChange: (id: number | null) => void;
  excludeId?: number;
  placeholder?: string;
}> = ({ value, onChange, excludeId, placeholder = 'Search member…' }) => {
  const { data } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const members = data?.members ?? [];
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const selected = members.find((m) => m.id === value);
  const filtered = useMemo(
    () => members.filter((m) => m.id !== excludeId && m.name.toLowerCase().includes(q.toLowerCase())),
    [members, q, excludeId]
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={box} style={{ position: 'relative' }}>
      {selected ? (
        <div className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span>{selected.name}{selected.role_label ? ` · ${selected.role_label}` : ''}</span>
          <button type="button" className="btn ghost sm" onClick={() => { onChange(null); setQ(''); }}>Change</button>
        </div>
      ) : (
        <input className="input" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder} />
      )}
      {open && !selected && (
        <div style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, background: 'var(--card,#fff)', border: '1px solid var(--line,#e5e7eb)', borderRadius: 8, marginTop: 4, maxHeight: 240, overflowY: 'auto', boxShadow: '0 6px 20px rgba(0,0,0,.12)' }}>
          {filtered.length === 0 ? (
            <div className="muted" style={{ padding: 10, fontSize: 13 }}>No match</div>
          ) : filtered.map((m) => (
            <div key={m.id} className="clickable" style={{ padding: '8px 12px', cursor: 'pointer' }}
              onClick={() => { onChange(m.id); setOpen(false); setQ(''); }}>
              {m.name}{m.role_label ? <span className="muted" style={{ fontSize: 12 }}> · {m.role_label}</span> : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
