import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, EmptyState, Modal, Field } from '../components/ui';

export default function Photos() {
  const qc = useQueryClient();
  const { member } = useAuth();
  const [view, setView] = useState<any | null>(null);
  const [add, setAdd] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['photos', 'all'], queryFn: () => api.get<{ photos: any[] }>('/photos?limit=200') });
  const photos = data?.photos ?? [];

  return (
    <>
      <div className="page-head">
        <div><h1>Photo Gallery</h1><div className="sub">{photos.length} photo{photos.length === 1 ? '' : 's'}</div></div>
        {member?.canEdit && <button className="btn primary" onClick={() => setAdd(true)}><Icon name="upload" size={16} /> Upload</button>}
      </div>
      {isLoading ? <Spinner /> : photos.length === 0 ? <EmptyState icon="image" title="No photos yet" body="Upload photos from events and projects." /> : (
        <div className="card pad"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: 'relative' }} className="clickable">
              <img src={p.url} alt={p.caption || ''} onClick={() => setView(p)} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, cursor: 'pointer' }} />
              {p.caption && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption}</div>}
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
      {add && <UploadModal onClose={() => { setAdd(false); qc.invalidateQueries({ queryKey: ['photos', 'all'] }); }} />}
    </>
  );
}

const UploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const m = useMutation({ mutationFn: (file: string) => api.post('/photos/upload', { file, caption: caption || null }), onSuccess: onClose });
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setPreview(r.result as string); r.readAsDataURL(f);
  };
  const submit = () => { if (preview) m.mutate(preview); };
  return (
    <Modal title="Upload photo" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!preview || m.isPending} onClick={submit}>{m.isPending ? 'Uploading...' : 'Upload'}</button></>}>
      <Field label="Choose image"><input type="file" accept="image/*" onChange={onPick} /></Field>
      {preview && <img src={preview} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 10, marginTop: 10 }} />}
      <Field label="Caption (optional)"><input className="input" value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
      <div className="hint">JPG/PNG/WebP, max 8 MB.</div>
    </Modal>
  );
};