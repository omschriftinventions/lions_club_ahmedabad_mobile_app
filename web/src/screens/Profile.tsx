import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import { Spinner, Modal, Field, Pill, EmptyState } from '../components/ui';
import { RichEditor } from '../components/RichEditor';
import type { Member } from '../types';

// Render E-GAINS values (stored as HTML) on the profile page.
const EGAINS_FIELDS: [string, string][] = [
  ['expertise', 'Expertise'], ['goals', 'Goals'], ['accomplishments', 'Accomplishments'],
  ['interests', 'Interests'], ['network', 'Network'], ['social', 'Social connections'],
];
const hasHtml = (v?: string | null) => !!v && v.replace(/<[^>]*>/g, '').trim().length > 0;

const EgainsView: React.FC<{ m: any }> = ({ m }) => {
  const rows = EGAINS_FIELDS.filter(([k]) => hasHtml(m[k]));
  if (!rows.length) return null;
  return (
    <div className="card pad" style={{ marginTop: 16 }}>
      <div className="card-title">Networking (E-GAINS)</div>
      {rows.map(([k, label]) => (
        <div key={k} style={{ marginBottom: 14 }}>
          <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700, marginBottom: 4 }}>{label}</div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: m[k] }} />
        </div>
      ))}
    </div>
  );
};

export default function Profile() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { member: authMember } = useAuth();
  const [editing, setEditing] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => api.get<{ member: Member }>('/members/me') });
  const m = data?.member;

  const save = useMutation({
    mutationFn: (body: any) => api.patch(`/members/${authMember?.id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); qc.invalidateQueries({ queryKey: ['roster'] }); setEditing(false); },
  });

  if (isLoading) return <Spinner />;
  if (!m) return <EmptyState icon="user" title="Profile not found" />;

  const Row = ({ icon, label, value }: { icon: string; label: string; value?: string | null }) => (
    <div style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}>
      <span style={{ color: 'var(--faint)', width: 20 }}><Icon name={icon} size={18} /></span>
      <div style={{ flex: 1 }}>
        <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{label}</div>
        <div style={{ marginTop: 2 }}>{value || '\u2014'}</div>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-head with-back">
        <button className="back-btn" onClick={() => nav(-1)} title="Back"><Icon name="back" size={20} /></button>
        <h1 style={{ flex: 1 }}>My Profile</h1>
        <button className="btn primary" onClick={() => setEditing(true)}><Icon name="edit" size={16} /> Edit profile</button>
        <button className="btn outline" onClick={() => setPwOpen(true)}><Icon name="settings" size={16} /> Change password</button>
      </div>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="xl" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 24 }}>{m.name}</h1>
            {m.designation && <div className="muted" style={{ marginTop: 2 }}>{m.designation}</div>}
            <div style={{ marginTop: 10 }}>{m.role_label && <Pill tone="blue">{m.role_label}</Pill>}</div>
          </div>
        </div>
        {m.bio && <div className="prose" style={{ marginTop: 16 }}><p>{m.bio}</p></div>}
      </div>

      <div className="grid grid-2">
        <div className="card pad">
          <div className="card-title">Professional</div>
          <Row icon="briefcase" label="Profession" value={m.profession} />
          <Row icon="briefcase" label="Business" value={m.business} />
          <Row icon="pin" label="Area" value={m.area} />
          <Row icon="calendar" label="Joined" value={m.joined_year ? String(m.joined_year) : ''} />
        </div>
        <div className="card pad">
          <div className="card-title">Contact &amp; Personal</div>
          <Row icon="phone" label="Phone" value={m.phone} />
          <Row icon="mail" label="Email" value={m.email} />
          <Row icon="heart" label="Birthday" value={m.dob} />
          <Row icon="heart" label="Anniversary" value={m.anniv} />
          <Row icon="users" label="Spouse" value={m.spouse} />
        </div>
      </div>

      <EgainsView m={m} />

      {editing && (
        <EditModal member={m} onClose={() => setEditing(false)}
          onSave={(body) => save.mutate(body)} saving={save.isPending} error={save.error as any} />
      )}
      {pwOpen && <ChangePwModal onClose={() => setPwOpen(false)} />}
    </>
  );
}

const EditModal: React.FC<{ member: Member; onClose: () => void; onSave: (b: any) => void; saving: boolean; error?: any }> = ({ member, onClose, onSave, saving, error }) => {
  const [f, setF] = useState({
    name: member.name ?? '', designation: member.designation ?? '', profession: member.profession ?? '',
    business: member.business ?? '', area: member.area ?? '', phone: member.phone ?? '',
    email: member.email ?? '', bio: member.bio ?? '', dob: member.dob ?? '', anniv: member.anniv ?? '', spouse: member.spouse ?? '', expertise: member.expertise ?? '', goals: member.goals ?? '', accomplishments: member.accomplishments ?? '', interests: member.interests ?? '', network: member.network ?? '', social: member.social ?? '',
  });
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url ?? '');
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        const r = await api.post<{ url: string }>('/members/me/avatar', { file: reader.result as string });
        setAvatarUrl(r.url);
        qc.invalidateQueries({ queryKey: ['me'] });
      } catch (err: any) { alert(err?.message || 'Upload failed'); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => { e.preventDefault(); onSave(f); };

  const I = (k: string, label: string, opts: { area?: boolean } = {}) => (
    <Field label={label}>
      {opts.area
        ? <textarea className="textarea" value={(f as any)[k]} onChange={set(k)} />
        : <input className="input" value={(f as any)[k]} onChange={set(k)} />}
    </Field>
  );

  // Rich-text field (E-GAINS) — stores HTML.
  const R = (k: string, label: string) => (
    <Field label={label}>
      <RichEditor value={(f as any)[k]} onChange={(html) => setF((s) => ({ ...s, [k]: html }))} minHeight={110} placeholder={`Add ${label.toLowerCase()}…`} />
    </Field>
  );

  return (
    <Modal title="Edit profile" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={saving} onClick={submit}>{saving ? 'Saving...' : 'Save changes'}</button></>}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <Avatar name={member.name} src={avatarUrl || null} size="lg" />
          <div>
            <label className="btn outline sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              {uploading ? 'Uploading...' : 'Change photo'}
              <input type="file" accept="image/*" hidden onChange={onAvatar} />
            </label>
            <div className="hint" style={{ marginTop: 6 }}>JPG/PNG/WebP, up to 4 MB.</div>
          </div>
        </div>
        {I('name', 'Full name')}
        <div className="row-2">{I('designation', 'Designation')}{I('profession', 'Profession')}</div>
        <div className="row-2">{I('business', 'Business')}{I('area', 'Area')}</div>
        <div className="row-2">{I('phone', 'Phone')}{I('email', 'Email')}</div>
        {I('bio', 'Bio', { area: true })}
        <div className="row-2">{I('dob', 'Birthday (e.g. Mar 14)')}{I('anniv', 'Anniversary')}</div>
        {I('spouse', 'Spouse')}
      <hr className="divider" />
      <div className="card-title">Networking (E-GAINS)</div>
      <div className="hint" style={{ marginBottom: 8 }}>Formatting, lists, links and images supported.</div>
      {R('expertise', 'Expertise')}
      {R('goals', 'Goals')}
      {R('accomplishments', 'Accomplishments')}
      {R('interests', 'Interests')}
      {R('network', 'Network')}
      {R('social', 'Social connections')}
        {error && <div className="pill red" style={{ marginTop: 8 }}>{(error as any).message || 'Save failed'}</div>}
      </form>
    </Modal>
  );
};

const ChangePwModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const m = useMutation({
    mutationFn: () => api.post('/auth/change-password', { oldPassword: oldPw, newPassword: newPw }),
    onSuccess: () => { alert('Password changed'); onClose(); },
    onError: (e: any) => setErr(e.message === 'invalid_credentials' ? 'Current password is incorrect' : (e.message || 'Failed')),
  });
  const submit = () => {
    setErr('');
    if (newPw.length < 6) { setErr('New password must be at least 6 characters'); return; }
    if (newPw !== confirm) { setErr('New passwords do not match'); return; }
    m.mutate();
  };
  return (
    <Modal title="Change password" onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={m.isPending} onClick={submit}>{m.isPending ? 'Saving...' : 'Change password'}</button></>}>
      <Field label="Current password"><input className="input" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoFocus /></Field>
      <Field label="New password (min 6)"><input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></Field>
      <Field label="Confirm new password"><input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      {err && <div className="pill red" style={{ marginTop: 8 }}>{err}</div>}
    </Modal>
  );
};
