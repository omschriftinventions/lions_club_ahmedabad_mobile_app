import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Pill, fmtDate } from '../components/ui';
import type { NewsItem } from '../types';

export default function News() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const canEdit = !!(member?.canEdit || member?.superAdmin);
  const [scope, setScope] = useState<'all' | 'club' | 'district'>('all');
  const { data, isLoading } = useQuery({
    queryKey: ['news', scope],
    queryFn: () => api.get<{ news: NewsItem[] }>(`/news?limit=100&scope=${scope}`),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/news/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
    onError: (e: any) => alert(e.message || 'Delete failed'),
  });
  const onDelete = (e: React.MouseEvent, n: NewsItem) => {
    e.stopPropagation();
    if (confirm(`Delete news "${n.title}"? This cannot be undone.`)) del.mutate(n.id);
  };
  const news = data?.news ?? [];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>News &amp; Updates</h1>
          <div className="sub">{news.length} article{news.length === 1 ? '' : 's'}</div>
        </div>
        <div className="chip-row">
          {(['all', 'club', 'district'] as const).map((s) => (
            <button key={s} className={`chip${scope === s ? ' active' : ''}`} onClick={() => setScope(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <Spinner /> :
        news.length === 0 ? <div className="card"><EmptyState icon="news" title="No news yet" /></div> :
        <div className="grid grid-2">
          {news.map((n) => (
            <div key={n.id} className="news-card" onClick={() => nav(`/news/${n.id}`)}>
              {canEdit && (
                <button className="del" title="Delete news" onClick={(e) => onDelete(e, n)} disabled={del.isPending}>
                  <Icon name="trash" size={16} />
                </button>
              )}
              {n.cover_url && <img className="cover" src={n.cover_url} alt="" />}
              <div className="body">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {n.tag && <Pill tone="gold">{n.tag}</Pill>}
                  {n.scope === 'district' && <Pill tone="blue">District</Pill>}
                </div>
                <div className="title">{n.title}</div>
                {n.excerpt && <div className="excerpt">{n.excerpt}</div>}
                <div className="date">{fmtDate(n.published_at)}</div>
              </div>
            </div>
          ))}
        </div>}
    </>
  );
}