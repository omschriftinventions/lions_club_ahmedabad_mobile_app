import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, fmtDateTime } from '../components/ui';

export default function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => api.get<{ notifications: any[] }>('/notifications?limit=100') });
  const list = data?.notifications ?? [];
  const unread = list.filter((n) => !n.read_at).length;

  const mark = useMutation({
    mutationFn: (ids?: number[]) => api.post('/notifications/read', ids ? { ids } : {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  useEffect(() => { if (unread > 0) { const t = setTimeout(() => mark.mutate(list.filter((n) => !n.read_at).map((n) => n.id)), 1500); return () => clearTimeout(t); } }, [data]);

  return (
    <>
      <div className="page-head">
        <div><h1>Notifications</h1><div className="sub">{unread} unread of {list.length}</div></div>
        {unread > 0 && <button className="btn outline sm" onClick={() => mark.mutate(undefined)} disabled={mark.isPending}>Mark all read</button>}
      </div>
      <div className="card">
        {isLoading ? <Spinner /> :
          list.length === 0 ? <EmptyState icon="bell" title="No notifications" body="Event and news updates will appear here." /> :
          list.map((n) => (
            <div key={n.id} className="list-row" style={{ background: n.read_at ? 'transparent' : 'rgba(10,61,122,.04)' }}>
              <div className="avatar md" style={{ background: 'var(--navy)' }}><Icon name="bell" size={18} /></div>
              <div className="meta">
                <div className="title">{n.title}{!n.read_at && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 5, background: 'var(--gold)', marginLeft: 8, verticalAlign: 'middle' }} />}</div>
                {n.body && <div className="sub">{n.body}</div>}
                <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{fmtDateTime(n.created_at)}</div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}