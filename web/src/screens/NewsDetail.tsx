import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { richHtml } from '../lib/rich';
import { Icon } from '../components/Icon';
import { Spinner, Pill, EmptyState, fmtDate } from '../components/ui';

export default function NewsDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { data, isLoading } = useQuery({
    enabled: !!id,
    queryKey: ['news-item', id],
    queryFn: () => api.get<{ news: any }>(`/news/${id}`),
  });
  const del = useMutation({
    mutationFn: () => api.delete(`/news/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['news'] }); nav(-1); },
  });
  const n = data?.news;

  if (isLoading) return <Spinner />;
  if (!n) return <EmptyState icon="news" title="Article not found" />;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button className="btn ghost sm" onClick={() => nav(-1)}><Icon name="back" size={16} /> Back</button>
        {member?.canEdit && (
          <button className="btn ghost sm" style={{ color: 'var(--danger, #b3261e)' }} disabled={del.isPending}
            onClick={() => { if (confirm('Delete this news article?')) del.mutate(); }}>
            <Icon name="trash" size={16} /> Delete
          </button>
        )}
      </div>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        {n.cover_url && <img className="cover" src={n.cover_url} alt="" style={{ height: 240 }} />}
        <div className="pad">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {n.tag && <Pill tone="gold">{n.tag}</Pill>}
            {n.scope === 'district' && <Pill tone="blue">District news</Pill>}
          </div>
          <h1 style={{ fontSize: 26 }}>{n.title}</h1>
          <div className="faint" style={{ marginTop: 8, fontSize: 13 }}>{fmtDate(n.published_at)}</div>
          {n.excerpt && <div className="muted" style={{ marginTop: 14, fontSize: 16, fontStyle: 'italic' }}>{n.excerpt}</div>}
          <hr className="divider" />
          {n.body && <div className="prose" dangerouslySetInnerHTML={{ __html: richHtml(n.body) }} />}
        </div>
      </div>
    </>
  );
}