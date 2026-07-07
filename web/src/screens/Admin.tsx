import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Spinner, Pill } from '../components/ui';

type Method = 'password' | 'sms' | 'whatsapp';

export default function Admin() {
  const { member } = useAuth();
  const [method, setMethod] = useState<Method>('password');
  const [wa, setWa] = useState<any>(null);
  const [smsCfg, setSmsCfg] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api.get<any>('/admin/auth');
      setMethod(d.method); setWa(d.whatsapp); setSmsCfg(!!d.sms?.configured);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, []);

  const setMethodM = useMutation({ mutationFn: (m: Method) => api.post('/admin/auth/method', { method: m }), onSuccess: () => load() });
  const restart = useMutation({ mutationFn: () => api.post('/admin/whatsapp/restart', {}), onSuccess: () => load() });
  const logoutWa = useMutation({ mutationFn: () => api.post('/admin/whatsapp/logout', {}), onSuccess: () => load() });

  if (!member?.superAdmin) {
    return <div className="card pad"><div className="empty"><div className="ic"><Icon name="settings" size={38} /></div><div style={{ fontWeight: 700 }}>Super admin access required</div><div className="muted">Only super admins can manage authentication.</div></div></div>;
  }

  const Opt = ({ m, label, icon }: { m: Method; label: string; icon: string }) => (
    <button className={`btn ${method === m ? 'primary' : 'outline'}`} onClick={() => setMethodM.mutate(m)} disabled={setMethodM.isPending}>
      <Icon name={icon} size={16} /> {label}
    </button>
  );

  return (
    <>
      <div className="page-head"><div><h1>System Admin</h1><div className="sub">Authentication method &amp; WhatsApp link</div></div></div>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="card-title">Login Method</div>
        <p className="muted" style={{ fontSize: 14 }}>Choose how members sign in. <b>Password</b> is the default for App Store / Play Store submission (reviewers sign in with a phone + password).</p>
        <div className="btn-row" style={{ marginTop: 10 }}>
          <Opt m="password" label="Password" icon="settings" />
          <Opt m="sms" label="SMS OTP" icon="phone" />
          <Opt m="whatsapp" label="WhatsApp OTP" icon="chat" />
        </div>
        <div style={{ marginTop: 12 }}>
          {method === 'password' && <Pill tone="blue">Active: Password</Pill>}
          {method === 'sms' && (smsCfg ? <Pill tone="green">SMS (MSG91 configured)</Pill> : <Pill tone="red">SMS selected &mdash; set MSG91_AUTH_KEY &amp; MSG91_OTP_FLOW_ID in server/.env</Pill>)}
          {method === 'whatsapp' && <Pill tone="gold">Active: WhatsApp OTP</Pill>}
        </div>
        <div className="hint" style={{ marginTop: 10 }}>Super admin always signs in with phone <b>8905496456</b> + the fixed password (default <code>Omsinv@8786</code>), regardless of method. Set other members&rsquo; passwords from <b>Manage Roster</b>.</div>
      </div>

      <div className="card pad">
        <div className="card-title">WhatsApp Link (for WhatsApp OTP)</div>
        <p className="muted" style={{ fontSize: 14 }}>Only needed when the method is WhatsApp OTP. Scan with your phone&rsquo;s WhatsApp &rarr; Linked Devices &rarr; Link a device.</p>
        {loading ? <Spinner /> : !wa?.installed ? (
          <div className="pill red">WhatsApp module not installed. Run <code>cd server &amp;&amp; npm install</code>, then restart the server.</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0', flexWrap: 'wrap' }}>
              <Pill tone={wa.status === 'open' ? 'green' : wa.status === 'qr' ? 'gold' : wa.status === 'error' || wa.status === 'closed' ? 'red' : 'gray'}>Status: {wa.status}</Pill>
              {wa.reconnects > 0 && <Pill tone="gray">Reconnects: {wa.reconnects}</Pill>}
            </div>
            {wa.status === 'open' ? <div className="muted">WhatsApp connected and ready.</div>
              : wa.qr ? <img src={wa.qr} alt="WhatsApp QR" style={{ width: 260, height: 260, borderRadius: 12, background: '#fff', padding: 10 }} />
              : <div className="muted">Waiting for QR…</div>}
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn primary" onClick={() => restart.mutate()} disabled={restart.isPending || logoutWa.isPending}><Icon name="settings" size={16} /> Reconnect</button>
              <button className="btn outline" onClick={() => logoutWa.mutate()} disabled={restart.isPending || logoutWa.isPending}><Icon name="trash" size={16} /> Clear session &amp; new QR</button>
            </div>
            {(wa.status === 'closed' || wa.status === 'error') && (
              <div className="hint" style={{ marginTop: 10, color: 'var(--red)' }}>Connection lost. Try <b>Reconnect</b> first. If that fails, use <b>Clear session &amp; new QR</b> and re-scan.</div>
            )}
          </>
        )}
        <div className="hint" style={{ marginTop: 14 }}>Unofficial WhatsApp Web link (interim). For production, prefer SMS or the official WhatsApp Business API, and run this always-on bot on a VPS.</div>
      </div>
    </>
  );
}