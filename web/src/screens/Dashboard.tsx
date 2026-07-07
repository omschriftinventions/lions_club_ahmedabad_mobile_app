import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, Pill, fmtDateTime } from '../components/ui';
import type { ImpactRow, ClubEvent, NewsItem } from '../types';
import { AdCarousel } from '../components/AdCarousel';

export default function Dashboard() {
  const nav = useNavigate();
  const { member } = useAuth();

  const impact = useQuery({ queryKey: ['impact'], queryFn: () => api.get<{ impact: ImpactRow[] }>('/causes/impact') });
  const events = useQuery({ queryKey: ['events', 'up'], queryFn: () => api.get<{ events: ClubEvent[] }>('/events?upcoming=true&limit=5') });
  const news = useQuery({ queryKey: ['news', 'recent'], queryFn: () => api.get<{ news: NewsItem[] }>('/news?limit=4') });

  const totalUnits = (impact.data?.impact ?? []).reduce((s, r) => s + (r.units || 0), 0);
  const totalProjects = (impact.data?.impact ?? []).reduce((s, r) => s + (r.projects || 0), 0);
  const totalSpend = (impact.data?.impact ?? []).reduce((s, r) => s + (r.amount_inr || 0), 0);
  const upcomingCount = events.data?.events.length ?? 0;

  return (
    <>
      <div className="hero-strip">
        <Avatar name={member?.name} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="hello">Welcome back,</div>
          <div className="name">{member?.name}</div>
        </div>
        <Pill tone="gold">{member?.superAdmin ? 'SUPER ADMIN' : (member?.role ?? 'MEMBER').toUpperCase()}</Pill>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card stat accent">
          <div className="k">People served</div>
          <div className="v">{totalUnits.toLocaleString('en-IN')}</div>
          <div className="d">across all causes</div>
        </div>
        <div className="card stat">
          <div className="k">Service projects</div>
          <div className="v">{totalProjects}</div>
          <div className="d">logged this year</div>
        </div>
        <div className="card stat">
          <div className="k">Amount spent</div>
          <div className="v">&#8377;{totalSpend.toLocaleString('en-IN')}</div>
          <div className="d">community impact</div>
        </div>
        <div className="card stat">
          <div className="k">Upcoming events</div>
          <div className="v">{upcomingCount}</div>
          <div className="d">in the calendar</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <AdCarousel placement="dashboard" />
      </div>

      {member?.canEdit && (
        <div className="card pad" style={{ marginBottom: 20 }}>
          <div className="card-title">Officer actions</div>
          <div className="btn-row">
            <button className="btn primary" onClick={() => nav('/manage?tab=event')}><Icon name="plus" size={16} /> New event</button>
            <button className="btn gold" onClick={() => nav('/manage?tab=news')}><Icon name="plus" size={16} /> Publish news</button>
            <button className="btn outline" onClick={() => nav('/manage')}><Icon name="settings" size={16} /> Manage club</button>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="page-head" style={{ padding: '18px 18px 0' }}>
            <h3 style={{ fontSize: 16 }}>Upcoming events</h3>
            <button className="btn ghost sm" onClick={() => nav('/events')}>View all</button>
          </div>
          {events.isLoading ? <Spinner /> :
            (events.data?.events.length ?? 0) === 0 ? <EmptyState icon="calendar" title="No upcoming events" /> :
            events.data?.events.map((e) => (
              <div key={e.id} className="list-row clickable" onClick={() => nav(`/events/${e.id}`)}>
                <div className="avatar md" style={{ background: 'var(--navy)' }}><Icon name="calendar" size={18} /></div>
                <div className="meta">
                  <div className="title">{e.title}</div>
                  <div className="sub">{fmtDateTime(e.starts_at)}{e.venue ? ' \u00b7 ' + e.venue : ''}</div>
                </div>
                <Pill tone="blue">{e.going} going</Pill>
              </div>
            ))}
        </div>

        <div className="card">
          <div className="page-head" style={{ padding: '18px 18px 0' }}>
            <h3 style={{ fontSize: 16 }}>Recent news</h3>
            <button className="btn ghost sm" onClick={() => nav('/news')}>View all</button>
          </div>
          {news.isLoading ? <Spinner /> :
            (news.data?.news.length ?? 0) === 0 ? <EmptyState icon="news" title="No news yet" /> :
            news.data?.news.map((n) => (
              <div key={n.id} className="list-row clickable" onClick={() => nav(`/news/${n.id}`)}>
                <div className="avatar md" style={{ background: 'var(--gold)', color: 'var(--navy)' }}><Icon name="news" size={18} /></div>
                <div className="meta">
                  <div className="title">{n.title}</div>
                  <div className="sub">{n.tag || 'News'} &middot; {fmtDateTime(n.published_at)}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}