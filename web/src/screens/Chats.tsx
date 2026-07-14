import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, Modal, Field, fmtDateTime } from '../components/ui';
import type { Member } from '../types';

export default function Chats() {
  const nav = useNavigate();
  const { member } = useAuth();
  const [add, setAdd] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['chats'], queryFn: () => api.get<{ threads: any[] }>('/chats'), refetchInterval: 15000 });
  const threads = data?.threads ?? [];
  const members = useQuery({ queryKey: ['roster', 'chat'], queryFn: () => api.get<{ members: Member[] }>('/members?limit=500&include_admins=1') });

  return (
    <>
      <div className="page-head">
        <div><h1>Chats</h1><div className="sub">{threads.length} conversation{threads.length === 1 ? '' : 's'}</div></div>
        <button className="btn primary" onClick={() => setAdd(true)}><Icon name="plus" size={16} /> New chat</button>
      </div>
      {isLoading ? <Spinner /> : threads.length === 0 ? <EmptyState icon="chat" title="No conversations" body="Start a chat with a fellow Lion." /> : (
        <div className="card">
          {threads.map((t) => (
            <div key={t.id} className="list-row clickable" onClick={() => nav(`/chats/${t.id}`)}>
              <div className="avatar md" style={{ background: t.is_group ? 'var(--blue)' : 'var(--navy)' }}><Icon name={t.is_group ? 'users' : 'chat'} size={18} /></div>
              <div className="meta">
                <div className="title" style={{ fontWeight: t.unread > 0 ? 800 : 600 }}>{t.title || t.others || 'Direct chat'}</div>
                <div className="sub">{t.last_body ? t.last_body.slice(0, 60) : 'No messages yet'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {t.last_at && <div className="faint" style={{ fontSize: 12 }}>{fmtDateTime(t.last_at)}</div>}
                {t.unread > 0 && (
                  <span style={{ background: 'var(--blue)', color: '#fff', borderRadius: 999, minWidth: 20, height: 20, padding: '0 6px', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.unread > 99 ? '99+' : t.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {add && <NewChat members={members.data?.members ?? []} meId={member?.id} onDone={(id) => { setAdd(false); nav(`/chats/${id}`); }} onClose={() => setAdd(false)} />}
    </>
  );
}

const NewChat: React.FC<{ members: Member[]; meId?: number; onDone: (id: number) => void; onClose: () => void }> = ({ members, meId, onDone, onClose }) => {
  const [sel, setSel] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const m = useMutation({
    mutationFn: () => api.post<{ id: number }>('/chats', { member_ids: sel, title: sel.length > 1 ? (title || undefined) : undefined, is_group: sel.length > 1 }),
    onSuccess: (d: any) => onDone(d.id),
  });
  const others = members.filter((mm) => mm.id !== meId);
  return (
    <Modal title="New chat" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={m.isPending || sel.length === 0} onClick={() => m.mutate()}>{m.isPending ? 'Creating...' : 'Start chat'}</button></>}>
      <Field label="Members">
        <div style={{ maxHeight: 260, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 10 }}>
          {others.map((mm) => (
            <label key={mm.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--line-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={sel.includes(mm.id)} onChange={(e) => setSel(e.target.checked ? [...sel, mm.id] : sel.filter((x) => x !== mm.id))} />
              <Avatar name={mm.name} color={mm.avatar_color} size="sm" /> <span>{mm.name}</span>
            </label>
          ))}
        </div>
      </Field>
      {sel.length > 1 && <Field label="Group title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Group name" /></Field>}
      {m.error && <div className="pill red" style={{ marginTop: 10 }}>{(m.error as any).message}</div>}
    </Modal>
  );
};