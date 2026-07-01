import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Pill, fmtDate } from '../components/ui';
import type { NewsItem } from '../types';

export default function News() {
  const nav = useNavigate();
  const [scope, setScope] = useState<'all' | 'club' | 'district'>('all');
  const { data, isLoading } = useQuery({
    queryKey: ['news', scope],
    queryFn: () => api.get<{ news: NewsItem[] }>(`/news?limit=100&scope=${scope}`),
  });
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
            <div key={n.id} className="card clickable" onClick={() => nav(`/news/${n.id}`)} style={{ overflow: 'hidden' }}>
              {n.cover_url && <img className="cover" src={n.cover_url} alt="" style={{ height: 130 }} />}
              <div className="pad">
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {n.tag && <Pill tone="gold">{n.tag}</Pill>}
                  {n.scope === 'district' && <Pill tone="blue">District</Pill>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{n.title}</div>
                {n.excerpt && <div className="muted" style={{ marginTop: 6 }}>{n.excerpt}</div>}
                <div className="faint" style={{ marginTop: 10, fontSize: 12 }}>{fmtDate(n.published_at)}</div>
              </div>
            </div>
          ))}
        </div>}
    </>
  );
}