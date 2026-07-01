import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Spinner, EmptyState, Pill, Modal, Field } from '../components/ui';

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

const ManageMemberModal: React.FC<{ member: any; onClose: () => void }> = ({ member, onClose }) => {
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [pw, setPw] = useState('');

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