import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Modal, Field, Pill } from '../components/ui';

const PORTAL_URL = 'https://portal.lions3232b1.org/login';

export default function Photos() {
  const { member } = useAuth();
  const [openAlbum, setOpenAlbum] = useState<number | null>(null);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['albums'], queryFn: () => api.get<{ albums: any[] }>('/photos/albums') });
  const albums = data?.albums ?? [];

  const create = useMutation({
    mutationFn: (title: string) => api.post<{ id: number }>('/photos/albums', { title }),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['albums'] }); setOpenAlbum(r.id); },
  });
  const newAlbum = () => { const t = prompt('Album name (e.g. "Blood Donation Camp – Aug 2026")'); if (t && t.trim()) create.mutate(t.trim()); };

  if (openAlbum != null) return <AlbumDetail id={openAlbum} canEdit={!!member?.canEdit} onBack={() => { setOpenAlbum(null); qc.invalidateQueries({ queryKey: ['albums'] }); }} />;

  return (
    <>
      <div className="page-head">
        <div><h1>Photo Gallery</h1><div className="sub">{albums.length} album{albums.length === 1 ? '' : 's'}</div></div>
        {member?.canEdit && <button className="btn primary" onClick={newAlbum}><Icon name="plus" size={16} /> New album</button>}
      </div>
      {isLoading ? <Spinner /> : albums.length === 0 ? (
        <EmptyState icon="image" title="No albums yet" body="Create an album for an event, then upload its photos." />
      ) : (
        <div className="grid grid-3">
          {albums.map((a) => (
            <div key={a.id} className="card clickable" style={{ overflow: 'hidden' }} onClick={() => setOpenAlbum(a.id)}>
              {a.cover_url
                ? <img src={a.cover_url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                : <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--bg)', display: 'grid', placeItems: 'center', color: 'var(--faint)' }}><Icon name="image" size={40} /></div>}
              <div className="pad">
                <div style={{ fontWeight: 700 }}>{a.title}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{a.photo_count} photo{a.photo_count === 1 ? '' : 's'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const AlbumDetail: React.FC<{ id: number; canEdit: boolean; onBack: () => void }> = ({ id, canEdit, onBack }) => {
  const qc = useQueryClient();
  const [view, setView] = useState<any | null>(null);
  const [editPresent, setEditPresent] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['album', id], queryFn: () => api.get<{ album: any; photos: any[] }>(`/photos/albums/${id}`) });
  const album = data?.album;
  const photos = data?.photos ?? [];

  const del = useMutation({ mutationFn: () => api.delete(`/photos/albums/${id}`), onSuccess: onBack });
  const delPhoto = useMutation({ mutationFn: (pid: number) => api.delete(`/photos/${pid}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['album', id] }) });
  const [uploaded, setUploaded] = useState(false);

  if (isLoading) return <Spinner />;
  if (!album) return <EmptyState icon="image" title="Album not found" />;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="back" size={16} /> Albums</button>
        {canEdit && <button className="btn ghost sm" style={{ color: 'var(--danger,#b3261e)' }} onClick={() => { if (confirm('Delete this album and all its photos?')) del.mutate(); }}><Icon name="trash" size={16} /> Delete album</button>}
      </div>
      <div className="page-head"><div><h1>{album.title}</h1><div className="sub">{photos.length} photo{photos.length === 1 ? '' : 's'}</div></div>
        {canEdit && <UploadButton albumId={id} onDone={() => { qc.invalidateQueries({ queryKey: ['album', id] }); setUploaded(true); }} />}
      </div>

      {uploaded && (
        <div className="card pad" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div className="muted">Photos uploaded here. You can also upload them to the District portal.</div>
          <button className="btn outline sm" onClick={() => window.open(PORTAL_URL, '_blank', 'noopener')}><Icon name="globe" size={15} /> Open District portal</button>
        </div>
      )}

      {/* Members present */}
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title" style={{ margin: 0 }}>Members present</div>
          {canEdit && <button className="btn ghost sm" onClick={() => setEditPresent(true)}><Icon name="edit" size={14} /> Edit</button>}
        </div>
        {album.members_present?.length > 0
          ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{album.members_present.map((m: any) => <Pill key={m.id} tone="blue">{m.name}</Pill>)}</div>
          : <div className="muted" style={{ marginTop: 8 }}>No members marked present yet.</div>}
      </div>

      {photos.length === 0 ? <EmptyState icon="image" title="No photos yet" body="Upload photos to this album." /> : (
        <div className="card pad"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: 'relative' }} className="clickable">
              <img src={p.url} alt={p.caption || ''} onClick={() => setView(p)} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, cursor: 'pointer' }} />
              {canEdit && <button className="btn ghost sm" title="Delete photo" onClick={() => { if (confirm('Delete this photo?')) delPhoto.mutate(p.id); }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.5)', color: '#fff', padding: 4 }}><Icon name="trash" size={14} /></button>}
            </div>
          ))}
        </div></div>
      )}

      {view && (
        <Modal title="Photo" onClose={() => setView(null)}>
          <img src={view.url} alt="" style={{ width: '100%', borderRadius: 10 }} />
          {view.caption && <div className="muted" style={{ marginTop: 10 }}>{view.caption}</div>}
        </Modal>
      )}
      {editPresent && <PresentModal albumId={id} current={album.member_ids || []} onClose={() => { setEditPresent(false); qc.invalidateQueries({ queryKey: ['album', id] }); }} />}
    </>
  );
};

const UploadButton: React.FC<{ albumId: number; onDone: () => void }> = ({ albumId, onDone }) => {
  const [busy, setBusy] = useState(false);
  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setBusy(true);
    try {
      for (const f of files) {
        const dataUrl: string = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
        await api.post('/photos/upload', { file: dataUrl, album_id: albumId });
      }
      onDone();
    } catch (err: any) { alert(err?.message || 'Upload failed'); }
    finally { setBusy(false); e.target.value = ''; }
  };
  return (
    <label className="btn primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
      <Icon name="upload" size={16} /> {busy ? 'Uploading...' : 'Upload photos'}
      <input type="file" accept="image/*" multiple hidden onChange={onPick} disabled={busy} />
    </label>
  );
};

const PresentModal: React.FC<{ albumId: number; current: number[]; onClose: () => void }> = ({ albumId, current, onClose }) => {
  const { data } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const members = data?.members ?? [];
  const [sel, setSel] = useState<number[]>(current);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())), [members, q]);
  const toggle = (id: number) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const save = useMutation({ mutationFn: () => api.patch(`/photos/albums/${albumId}`, { member_ids: sel }), onSuccess: onClose });
  return (
    <Modal title="Members present" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving...' : 'Save'}</button></>}>
      <Field label="Search"><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name..." /></Field>
      <div style={{ maxHeight: 320, overflowY: 'auto', marginTop: 8 }}>
        {filtered.map((m) => (
          <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px', cursor: 'pointer' }}>
            <input type="checkbox" checked={sel.includes(m.id)} onChange={() => toggle(m.id)} />
            <span>{m.name}</span>{m.role_label && <span className="muted" style={{ fontSize: 12 }}>· {m.role_label}</span>}
          </label>
        ))}
      </div>
      <div className="hint" style={{ marginTop: 8 }}>{sel.length} selected</div>
    </Modal>
  );
};
