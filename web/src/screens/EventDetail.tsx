import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { richHtml } from '../lib/rich';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Spinner, Pill, EmptyState, fmtDateTime } from '../components/ui';

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [status, setStatus] = useState<'yes' | 'no' | 'maybe' | null>(null);
  const { member } = useAuth();

  const { data, isLoading } = useQuery({
    enabled: !!id,
    queryKey: ['event', id],
    queryFn: () => api.get<{ event: any; attendees: any[] }>(`/events/${id}`),
  });
  const e = data?.event;
  const attendees = data?.attendees ?? [];

  const rsvp = useMutation({
    mutationFn: (s: 'yes' | 'no' | 'maybe') => api.put(`/events/${id}/rsvp`, { status: s, guests: 0 }),
    onSuccess: (_x, s) => { setStatus(s); qc.invalidateQueries({ queryKey: ['event', id] }); qc.invalidateQueries({ queryKey: ['events'] }); },
  });

  const del = useMutation({
    mutationFn: () => api.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); nav(-1); },
  });

  if (isLoading) return <Spinner />;
  if (!e) return <EmptyState icon="calendar" title="Event not found" />;

  const myStatus = status ?? e.my_status;
  const isPast = e.starts_at ? new Date(e.starts_at).getTime() < Date.now() : false;
  const going = attendees.filter((a) => a.status === 'yes');
  const RsvpBtn = ({ s, label, tone }: { s: 'yes' | 'no' | 'maybe'; label: string; tone: 'green' | 'red' | 'gray' }) => (
    <button className={`btn ${myStatus === s ? (tone === 'green' ? 'primary' : tone === 'red' ? 'danger' : 'outline') : 'outline'}`}
      disabled={rsvp.isPending} onClick={() => rsvp.mutate(s)}>{label}</button>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button className="btn ghost sm" onClick={() => nav(-1)}><Icon name="back" size={16} /> Back</button>
        {member?.canEdit && (
          <button className="btn ghost sm" style={{ color: 'var(--danger, #b3261e)' }} disabled={del.isPending}
            onClick={() => { if (confirm('Delete this event? Members will no longer see it.')) del.mutate(); }}>
            <Icon name="trash" size={16} /> Delete
          </button>
        )}
      </div>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        {e.cover_url && <img className="cover" src={e.cover_url} alt="" style={{ height: 220 }} />}
        <div className="pad">
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <Pill tone="blue">{e.type}</Pill>
            {e.cause_id && <Pill tone="gold">{e.cause_id}</Pill>}
          </div>
          <h1 style={{ fontSize: 24 }}>{e.title}</h1>
          <div className="muted" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={16} /> {fmtDateTime(e.starts_at)}{e.ends_at ? ` \u2013 ${fmtDateTime(e.ends_at)}` : ''}</span>
            {e.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="pin" size={16} /> {e.venue}</span>}
          </div>
          {e.description && <div className="prose" style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: richHtml(e.description) }} />}
        </div>
      </div>

      {(e.code_no || e.time_in || e.no_of_members || e.expenses != null || e.beneficiaries != null || e.member_names || (e.members_present?.length)) && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title">Service Activity Report</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
            {e.code_no && <ReportStat label="Code No." value={e.code_no} />}
            {e.time_in && <ReportStat label="Time in" value={e.time_in} />}
            {e.time_out && <ReportStat label="Time out" value={e.time_out} />}
            {e.no_of_members != null && <ReportStat label="No. of members" value={e.no_of_members} />}
            {e.no_of_hours != null && <ReportStat label="No. of hours" value={e.no_of_hours} />}
            {e.no_of_man_hours != null && <ReportStat label="No. of man hours" value={e.no_of_man_hours} />}
            {e.expenses != null && <ReportStat label="Expenses" value={`₹${Number(e.expenses).toLocaleString('en-IN')}`} />}
            {e.beneficiaries != null && <ReportStat label="Beneficiaries" value={e.beneficiaries} />}
          </div>
          {(e.members_present?.length > 0 || e.member_names) && (
            <div style={{ marginTop: 12 }}>
              <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700, marginBottom: 6 }}>Members present</div>
              {e.members_present?.length > 0
                ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{e.members_present.map((m: any) => <span key={m.id} className="pill" style={{ background: 'var(--bg)' }}>{m.name}</span>)}</div>
                : <div style={{ color: 'var(--ink-2)' }}>{e.member_names}</div>}
            </div>
          )}
        </div>
      )}

      {isPast ? (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="calendar" size={16} /> This event has ended. RSVP is closed.</div>
        </div>
      ) : (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="card-title">Are you going?</div>
          <div className="btn-row">
            <RsvpBtn s="yes" label="Yes, I'll be there" tone="green" />
            <RsvpBtn s="maybe" label="Maybe" tone="gray" />
            <RsvpBtn s="no" label="Can't make it" tone="red" />
          </div>
        </div>
      )}

      <div className="card">
        <div className="page-head" style={{ padding: '18px 18px 0' }}>
          <h3 style={{ fontSize: 16 }}>Attendees ({going.length} going)</h3>
        </div>
        {attendees.length === 0 ? <EmptyState icon="users" title="No responses yet" /> :
          attendees.map((a) => (
            <div key={a.id} className="list-row">
              <Avatar name={a.name} color={a.avatar_color} size="sm" />
              <div className="meta"><div className="title">{a.name}</div></div>
              <Pill tone={a.status === 'yes' ? 'green' : a.status === 'no' ? 'red' : 'gray'}>{a.status}</Pill>
            </div>
          ))}
      </div>
    </>
  );
}
const ReportStat: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div>
    <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>{value}</div>
  </div>
);
