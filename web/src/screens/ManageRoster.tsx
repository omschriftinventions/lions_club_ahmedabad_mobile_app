import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, Pill, Modal, Field } from '../components/ui';
import { RichEditor } from '../components/RichEditor';

export default function ManageRoster() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [manageFor, setManageFor] = useState<any | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['roster', 'all'], queryFn: () => api.get<{ members: any[] }>('/members?limit=500') });
  const deact = useMutation({ mutationFn: (id: number) => api.delete(`/members/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['roster'] }) });

  if (!member?.canEdit) return <div className="card pad"><div className="empty"><div className="ic"><Icon name="users" size={38} /></div><div style={{ fontWeight: 700 }}>Officer access required</div></div></div>;
  const list = data?.members ?? [];

  return (
    <>
      <div className="page-head">
        <div><h1>Manage Roster</h1><div className="sub">{list.length} active member{list.length === 1 ? '' : 's'}</div></div>
        <button className="btn primary" onClick={() => nav('/add-member')}><Icon name="plus" size={16} /> Add member</button>
      </div>
      {isLoading ? <Spinner /> : list.length === 0 ? <EmptyState icon="users" title="No members" /> : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Member</th><th>Role</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={m.name} color={m.avatar_color} src={m.avatar_url} size="sm" /> <span style={{ fontWeight: 600 }}>{m.name}</span></div></td>
                  <td>{m.role_label && <Pill tone="blue">{m.role_label}</Pill>}</td>
                  <td className="muted">{m.phone || '\u2014'}</td>
                  <td>
                    <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
                      {member?.superAdmin && (
                        <button className="btn ghost sm" title="Manage member" onClick={() => setManageFor(m)}><Icon name="settings" size={15} /></button>
                      )}
                      <button className="btn ghost sm" title="Deactivate" onClick={() => { if (confirm(`Remove ${m.name}? (deactivates, keeps history)`)) deact.mutate(m.id); }}><Icon name="trash" size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {manageFor && <ManageMemberModal member={manageFor} onClose={() => { setManageFor(null); qc.invalidateQueries({ queryKey: ['roster'] }); }} />}
    </>
  );
}

const ROLES = ['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'VP1', 'VP2', 'MEMBERSHIP_CHAIR', 'SERVICE_CHAIR', 'TAIL_TWISTER'];

const ManageMemberModal: React.FC<{ member: any; onClose: () => void }> = ({ member, onClose }) => {
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [pw, setPw] = useState('');
  const [f, setF] = useState({
    name: member.name ?? '', role: member.role ?? 'MEMBER',
    designation: member.designation ?? '', profession: member.profession ?? '',
    business: member.business ?? '', area: member.area ?? '',
    phone: member.phone ?? '', email: member.email ?? '',
    joined_year: member.joined_year ? String(member.joined_year) : '',
    dob: member.dob ?? '', anniv: member.anniv ?? '', spouse: member.spouse ?? '',
    bio: member.bio ?? '', expertise: member.expertise ?? '', goals: member.goals ?? '',
    accomplishments: member.accomplishments ?? '', interests: member.interests ?? '',
    network: member.network ?? '', social: member.social ?? '',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const saveDetails = useMutation({
    mutationFn: () => api.patch(`/members/${member.id}`, {
      name: f.name, role: f.role,
      designation: f.designation || null, profession: f.profession || null,
      business: f.business || null, area: f.area || null,
      phone: f.phone || null, phone_e164: f.phone || null, email: f.email || null,
      joined_year: f.joined_year && /^\d{4}$/.test(f.joined_year) ? Number(f.joined_year) : null,
      dob: f.dob || null, anniv: f.anniv || null, spouse: f.spouse || null,
      bio: f.bio || null, expertise: f.expertise || null, goals: f.goals || null,
      accomplishments: f.accomplishments || null, interests: f.interests || null,
      network: f.network || null, social: f.social || null,
    }),
    onSuccess: () => alert('Member details saved'),
    onError: (e: any) => alert(e.message || 'Save failed'),
  });

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        const r = await api.post<{ url: string }>(`/admin/members/${member.id}/avatar`, { file: reader.result as string });
        setAvatarUrl(r.url);
      } catch (err: any) { alert(err?.message || 'Upload failed'); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const pwMutation = useMutation({
    mutationFn: (password: string) => api.post(`/admin/members/${member.id}/password`, { password }),
    onSuccess: () => { alert('Password updated'); setPw(''); },
    onError: (e: any) => alert(e.message || 'Failed'),
  });

  return (
    <Modal title={`Manage \u00b7 ${member.name}`} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Close</button></>}>
      {/* Avatar section */}
      <div className="card-title">Profile Photo</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <Avatar name={member.name} src={avatarUrl || null} size="lg" />
        <div>
          <label className="btn outline sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
            {uploading ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/*" hidden onChange={uploadAvatar} />
          </label>
          <div className="hint" style={{ marginTop: 6 }}>JPG/PNG/WebP, up to 4 MB.</div>
        </div>
      </div>

      <hr className="divider" />

      {/* Full member details */}
      <div className="card-title">Member Details</div>
      <div className="row-2">
        <Field label="Name"><input className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Role"><select className="select" value={f.role} onChange={set('role')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
      </div>
      <div className="row-2">
        <Field label="Designation"><input className="input" value={f.designation} onChange={set('designation')} placeholder="PMJF / MJF" /></Field>
        <Field label="Joined year"><input className="input" value={f.joined_year} onChange={set('joined_year')} placeholder="2015" /></Field>
      </div>
      <div className="row-2">
        <Field label="Profession"><input className="input" value={f.profession} onChange={set('profession')} /></Field>
        <Field label="Business"><input className="input" value={f.business} onChange={set('business')} /></Field>
      </div>
      <div className="row-2">
        <Field label="Area"><input className="input" value={f.area} onChange={set('area')} /></Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={set('phone')} placeholder="+91 98250 12345" /></Field>
      </div>
      <div className="row-2">
        <Field label="Email"><input className="input" value={f.email} onChange={set('email')} /></Field>
        <Field label="Spouse"><input className="input" value={f.spouse} onChange={set('spouse')} /></Field>
      </div>
      <div className="row-2">
        <Field label="Birthday"><input className="input" value={f.dob} onChange={set('dob')} placeholder="Mar 14" /></Field>
        <Field label="Anniversary"><input className="input" value={f.anniv} onChange={set('anniv')} placeholder="Nov 22" /></Field>
      </div>
      <Field label="Bio"><textarea className="textarea" value={f.bio} onChange={set('bio')} rows={2} /></Field>

      <div className="card-title" style={{ marginTop: 12 }}>Networking (E-GAINS)</div>
      <div className="hint" style={{ marginBottom: 8 }}>Rich text — formatting, lists, links, images supported.</div>
      {(['expertise','goals','accomplishments','interests','network','social'] as const).map((k) => (
        <Field key={k} label={k === 'social' ? 'Social connections' : k.charAt(0).toUpperCase() + k.slice(1)}>
          <RichEditor value={(f as any)[k]} onChange={(html) => setF((s) => ({ ...s, [k]: html }))} minHeight={100} placeholder={`Add ${k}…`} />
        </Field>
      ))}
      <button className="btn primary sm" style={{ marginTop: 10 }} disabled={saveDetails.isPending || f.name.trim().length < 2} onClick={() => saveDetails.mutate()}>
        {saveDetails.isPending ? 'Saving...' : 'Save member details'}
      </button>

      <hr className="divider" />

      {/* Password section */}
      <div className="card-title">Password</div>
      <Field label="New password (min 6 characters)">
        <input className="input" type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Set a temporary password" />
      </Field>
      <button className="btn primary sm" style={{ marginTop: 10 }} disabled={pwMutation.isPending || pw.length < 6} onClick={() => pwMutation.mutate(pw)}>
        {pwMutation.isPending ? 'Saving...' : 'Save password'}
      </button>
      <div className="hint" style={{ marginTop: 8 }}>Share this with the member. They can change it later from their profile.</div>
    </Modal>
  );
};