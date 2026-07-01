import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, fmtDateTime } from '../components/ui';

export default function ChatThread() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    enabled: !!id, queryKey: ['chat', id],
    queryFn: () => api.get<{ thread: any; members: any[]; messages: any[] }>(`/chats/${id}`),
    refetchInterval: 8000,
  });

  const send = useMutation({
    mutationFn: (body: string) => api.post(`/chats/${id}/messages`, { body }),
    onSuccess: () => { setText(''); qc.invalidateQueries({ queryKey: ['chat', id] }); qc.invalidateQueries({ queryKey: ['chats'] }); },
  });

  const messages = data?.messages ?? [];
  const lastId = messages.length ? messages[messages.length - 1].id : 0;
  useEffect(() => { if (id) api.post(`/chats/${id}/read`, { last_id: lastId }).catch(() => {}); }, [id, lastId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const meId = member?.id;
  const title = data?.thread?.title || (data?.members ?? []).filter((m) => m.id !== meId).map((m) => m.name).join(', ') || 'Chat';

  if (isLoading || !data) return <Spinner />;

  return (
    <>
      <div className="page-head">
        <button className="btn ghost sm" onClick={() => nav('/chats')}><Icon name="back" size={16} /> Back</button>
        <div style={{ marginLeft: 8 }}><h1 style={{ fontSize: 18 }}>{title}</h1></div>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: 360 }}>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {data.messages.length === 0 ? <EmptyState icon="chat" title="Say hello" body="Send the first message." /> : data.messages.map((msg) => {
            const mine = msg.sender_id === meId;
            const sender = data.members.find((m) => m.id === msg.sender_id);
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 12, gap: 8 }}>
                {!mine && <Avatar name={sender?.name} color={sender?.avatar_color} size="sm" />}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ background: mine ? 'var(--navy)' : 'var(--surface-2)', color: mine ? '#fff' : 'var(--ink)', padding: '10px 14px', borderRadius: 14, borderBottomRightRadius: mine ? 4 : 14, borderBottomLeftRadius: mine ? 14 : 4 }}>{msg.body}</div>
                  <div className="faint" style={{ fontSize: 11, marginTop: 3, textAlign: mine ? 'right' : 'left' }}>{fmtDateTime(msg.created_at)}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div style={{ display: 'flex', gap: 10, padding: 12, borderTop: '1px solid var(--line)' }}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) send.mutate(text.trim()); }} />
          <button className="btn primary" disabled={!text.trim() || send.isPending} onClick={() => send.mutate(text.trim())}><Icon name="chat" size={16} /></button>
        </div>
      </div>
    </>
  );
}