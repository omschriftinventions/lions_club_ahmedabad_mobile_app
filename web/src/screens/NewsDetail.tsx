import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import { Spinner, Pill, EmptyState, fmtDate } from '../components/ui';

export default function NewsDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    enabled: !!id,
    queryKey: ['news-item', id],
    queryFn: () => api.get<{ news: any }>(`/news/${id}`),
  });
  const n = data?.news;

  if (isLoading) return <Spinner />;
  if (!n) return <EmptyState icon="news" title="Article not found" />;

  return (
    <>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => nav(-1)}><Icon name="back" size={16} /> Back</button>
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
          {n.body && <div className="prose">{n.body.split('\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}</div>}
        </div>
      </div>
    </>
  );
}