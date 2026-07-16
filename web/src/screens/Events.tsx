import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Pill, fmtDateTime } from '../components/ui';
import type { ClubEvent } from '../types';

export default function Events() {
  const nav = useNavigate();
  const [upcoming, setUpcoming] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['events', upcoming],
    queryFn: () => api.get<{ events: ClubEvent[] }>(`/events?limit=100${upcoming ? '&upcoming=true' : ''}`),
  });
  const events = data?.events ?? [];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Events</h1>
          <div className="sub">{events.length} event{events.length === 1 ? '' : 's'}</div>
        </div>
        <div className="chip-row">
          <button className={`chip${upcoming ? ' active' : ''}`} onClick={() => setUpcoming(true)}>Upcoming</button>
          <button className={`chip${!upcoming ? ' active' : ''}`} onClick={() => setUpcoming(false)}>All</button>
        </div>
      </div>

      {isLoading ? <Spinner /> :
        events.length === 0 ? (
          <div className="card"><EmptyState icon="calendar" title="No events" body={upcoming ? 'No upcoming events scheduled.' : 'No events found.'} /></div>
        ) : (
          <div className="grid grid-2">
            {events.map((e) => (
              <div key={e.id} className="card clickable" onClick={() => nav(`/events/${e.id}`)} style={{ overflow: 'hidden' }}>
                {e.cover_url && <img className="cover" src={e.cover_url} alt="" style={{ height: 130 }} />}
                <div className="pad">
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Pill tone="blue">{e.type}</Pill>
                    {e.my_status && <Pill tone={e.my_status === 'yes' ? 'green' : 'gray'}>RSVP: {e.my_status}</Pill>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{e.title}</div>
                  <div className="muted" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="calendar" size={15} /> {fmtDateTime(e.starts_at)}
                  </div>
                  {e.venue && <div className="muted" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="pin" size={15} /> {e.venue}
                  </div>}
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="faint" style={{ fontSize: 13 }}>{e.going} going</span>
                    <span className="faint" style={{ fontSize: 13 }}>View details <Icon name="chevron" size={14} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  );
}