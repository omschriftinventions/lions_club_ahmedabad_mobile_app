import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Pill, fmtDate } from '../components/ui';

export default function DistrictNews() {
  const nav = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['news', 'district'], queryFn: () => api.get<{ news: any[] }>('/news?limit=100&scope=district') });
  const news = data?.news ?? [];
  return (
    <>
      <div className="page-head"><div><h1>District News</h1><div className="sub">Updates from District 3232 B1</div></div></div>
      {isLoading ? <Spinner /> : news.length === 0 ? <EmptyState icon="globe" title="No district news" /> : (
        <div className="grid grid-2">
          {news.map((n) => (
            <div key={n.id} className="card clickable" style={{ overflow: 'hidden' }} onClick={() => nav(`/news/${n.id}`)}>
              {n.cover_url && <img className="cover" src={n.cover_url} alt="" style={{ height: 130 }} />}
              <div className="pad"><div style={{ marginBottom: 8 }}>{n.tag && <Pill tone="blue">{n.tag}</Pill>}</div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{n.title}</div>
                {n.excerpt && <div className="muted" style={{ marginTop: 6 }}>{n.excerpt}</div>}
                <div className="faint" style={{ marginTop: 10, fontSize: 12 }}>{fmtDate(n.published_at)}</div></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}