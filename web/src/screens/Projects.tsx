import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Pill, fmtDate } from '../components/ui';

export default function Projects() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const causeId = params.get('causeId') ?? undefined;
  const qc = useQueryClient();
  const { member } = useAuth();
  const [sel, setSel] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['projects', causeId], queryFn: () => api.get<{ projects: any[] }>(`/service-projects${causeId ? `?cause_id=${encodeURIComponent(causeId)}` : ''}`) });
  const projects = data?.projects ?? [];
  const cur = sel ? projects.find((p) => p.id === sel) : projects[0];
  const photos = useQuery({ enabled: !!cur?.id, queryKey: ['photos', 'project', cur?.id], queryFn: () => api.get<{ photos: any[] }>(`/photos?project_id=${cur!.id}`) });

  const [pick, setPick] = useState(false);
  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !cur) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await api.post('/photos/upload', { file: reader.result as string, project_id: cur.id });
      qc.invalidateQueries({ queryKey: ['photos', 'project', cur.id] });
      setPick(false);
    };
    reader.readAsDataURL(f);
  };

  return (
    <>
      <div className="page-head with-back">
        <button className="back-btn" onClick={() => nav(-1)} title="Back"><Icon name="back" size={20} /></button>
        <div><h1>Service Projects</h1><div className="sub">{causeId ? `Cause: ${causeId}` : 'All projects'}</div></div>
      </div>
      {isLoading ? <Spinner /> : projects.length === 0 ? <EmptyState icon="heart" title="No projects logged" /> : (
        <div className="grid grid-2">
          <div className="card">
            {projects.map((p) => (
              <div key={p.id} className={`list-row${(cur?.id === p.id) ? ' clickable' : ' clickable'}`} style={{ background: cur?.id === p.id ? 'rgba(10,61,122,.06)' : undefined }} onClick={() => setSel(p.id)}>
                <div className="meta"><div className="title">{p.title}</div><div className="sub">{fmtDate(p.occurred_on)}</div></div>
                <Pill tone="blue">{p.units} units</Pill>
              </div>
            ))}
          </div>
          <div className="card pad">
            {cur ? (
              <>
                <Pill tone="gold">{cur.cause_id}</Pill>
                <h3 style={{ fontSize: 20, marginTop: 10 }}>{cur.title}</h3>
                <div className="row-2" style={{ marginTop: 14 }}>
                  <div className="card stat" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}><div className="k">Units</div><div className="v" style={{ fontSize: 22 }}>{cur.units}</div></div>
                  <div className="card stat" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}><div className="k">Spent</div><div className="v" style={{ fontSize: 22 }}>&#8377;{Number(cur.amount_inr).toLocaleString('en-IN')}</div></div>
                </div>
                {cur.notes && <div className="prose" style={{ marginTop: 14 }}><p>{cur.notes}</p></div>}
                <div style={{ marginTop: 18, fontWeight: 700, marginBottom: 8 }}>Gallery</div>
                {member?.canEdit && (
                  <label className="btn outline sm" style={{ marginBottom: 10 }}>
                    <Icon name="upload" size={15} /> Upload photo
                    <input type="file" accept="image/*" hidden onChange={onPick} />
                  </label>
                )}
                {photos.isLoading ? <Spinner /> : (photos.data?.photos.length ?? 0) === 0 ? <div className="muted" style={{ fontSize: 13 }}>No photos yet.</div> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {photos.data?.photos.map((ph) => <img key={ph.id} src={ph.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} />)}
                  </div>
                )}
              </>
            ) : <EmptyState icon="folder-open" title="Select a project" />}
          </div>
        </div>
      )}
    </>
  );
}