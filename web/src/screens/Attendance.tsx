import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, Pill, fmtDateTime } from '../components/ui';

export default function Attendance() {
  const qc = useQueryClient();
  const { member } = useAuth();
  const [eventId, setEventId] = useState<number | null>(null);
  const events = useQuery({ queryKey: ['events', 'all'], queryFn: () => api.get<{ events: any[] }>('/events?limit=100') });
  const att = useQuery({ enabled: !!eventId, queryKey: ['attendance', eventId], queryFn: () => api.get<{ attendance: any[] }>(`/attendance/${eventId}`) });

  const toggle = useMutation({
    mutationFn: ({ memberId, attended }: { memberId: number; attended: boolean }) => api.put(`/attendance/${eventId}/${memberId}`, { attended }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance', eventId] }),
  });

  if (!member?.canEdit) return <div className="card pad"><div className="empty"><div className="ic"><Icon name="checkbox" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div></div></div>;
  const rows = att.data?.attendance ?? [];

  return (
    <>
      <div className="page-head"><div><h1>Attendance</h1><div className="sub">Mark who attended an event</div></div>
        <select className="select" style={{ maxWidth: 320 }} value={eventId ?? ''} onChange={(e) => setEventId(Number(e.target.value))}>
          <option value="" disabled>Select an event...</option>
          {events.data?.events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title} &mdash; {fmtDateTime(ev.starts_at)}</option>)}
        </select>
      </div>
      {!eventId ? <EmptyState icon="calendar" title="Select an event" body="Pick an event above to mark attendance." /> :
        att.isLoading ? <Spinner /> : rows.length === 0 ? <EmptyState icon="users" title="No members" /> : (
          <div className="card">
            <table className="table">
              <thead><tr><th>Member</th><th>RSVP</th><th>Present</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={r.name} color={r.avatar_color} size="sm" /> {r.name}</div></td>
                    <td><Pill tone={r.rsvp_status === 'yes' ? 'green' : r.rsvp_status === 'no' ? 'red' : 'gray'}>{r.rsvp_status}</Pill></td>
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!r.attended} onChange={(e) => toggle.mutate({ memberId: r.id, attended: e.target.checked })} /> Present
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}