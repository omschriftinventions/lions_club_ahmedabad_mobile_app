import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Icon } from '../components/Icon';

type Method = 'password' | 'sms' | 'whatsapp' | null;

export default function Login() {
  const { requestOtp, verifyOtp, devLogin, loginWithPassword } = useAuth();
  const [method, setMethod] = useState<Method>(null);

  useEffect(() => {
    api.get<{ method: string }>('/auth/method')
      .then((d) => setMethod(d.method as Method))
      .catch(() => setMethod('password'));
  }, []);

  if (method === null) {
    return <div className="center" style={{ minHeight: '100vh', background: 'var(--navy)' }}><div className="spinner" style={{ borderTopColor: 'var(--gold)' }} /></div>;
  }
  if (method === 'password') return <PasswordLogin onLogin={loginWithPassword} />;
  return <OtpLogin requestOtp={requestOtp} verifyOtp={verifyOtp} devLogin={devLogin} />;
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="login-wrap">
    <div className="login-art">
      <div className="mark">L</div>
      <div>
        <h1>Lions Club Ahmedabad Host</h1>
        <p>Member portal for events, news, the club roster and service impact. Sign in with your registered phone number.</p>
      </div>
      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>District 3232 B1</div>
    </div>
    <div className="login-form"><div className="login-card">{children}</div></div>
  </div>
);

const PasswordLogin: React.FC<{ onLogin: (phone: string, password: string) => Promise<void> }> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (phone.replace(/\D/g, '').length < 7) { setErr('Enter a valid phone number'); return; }
    setLoading(true);
    try { await onLogin(phone, password); }
    catch (e: any) {
      setErr(e.message === 'invalid_credentials' ? 'Incorrect phone or password' : e.message === 'password_not_set' ? 'No password set for this account. Ask an admin to set one.' : (e.message || 'Sign in failed'));
    } finally { setLoading(false); }
  };

  return (
    <Shell>
      <h2>Sign in</h2>
      <p className="lead">Enter your registered phone number and password.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label>Phone number</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 98765 43210" inputMode="tel" autoFocus />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
        </div>
        {err && <div className="pill red" style={{ marginBottom: 12 }}>{err}</div>}
        <button className="btn primary block" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </Shell>
  );
};

const OtpLogin: React.FC<{ requestOtp: (p: string) => Promise<void>; verifyOtp: (p: string, c: string) => Promise<void>; devLogin: () => Promise<void> }> = ({ requestOtp, verifyOtp, devLogin }) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (phone.replace(/\D/g, '').length < 7) { setErr('Enter a valid phone number'); return; }
    setLoading(true);
    try { await requestOtp(phone); setStep('code'); setTimeout(() => refs.current[0]?.focus(), 50); }
    catch { setErr('Could not send OTP. Try again.'); } finally { setLoading(false); }
  };
  const setDigit = (i: number, v: string) => { const d = v.replace(/\D/g, '').slice(-1); const n = [...code]; n[i] = d; setCode(n); if (d && i < 5) refs.current[i + 1]?.focus(); };
  const onKey = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus(); };
  const onPaste = (e: React.ClipboardEvent) => { const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (!t) return; e.preventDefault(); const n = ['', '', '', '', '', '']; t.split('').forEach((c, i) => (n[i] = c)); setCode(n); refs.current[Math.min(t.length, 5)]?.focus(); };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); const c = code.join(''); if (c.length !== 6) { setErr('Enter the 6-digit code'); return; }
    setLoading(true);
    try { await verifyOtp(phone, c); }
    catch (e: any) { setErr(e.message === 'otp_invalid_or_expired' ? 'Code is invalid or expired' : (e.message || 'Verification failed')); setCode(['', '', '', '', '', '']); refs.current[0]?.focus(); }
    finally { setLoading(false); }
  };
  const quickLogin = async () => { setErr(''); setLoading(true); try { await devLogin(); } catch { setErr('Dev login failed (disabled in production).'); } finally { setLoading(false); } };

  return (
    <Shell>
      {step === 'phone' ? (
        <>
          <h2>Sign in</h2>
          <p className="lead">Enter the phone number registered with the club.</p>
          <form onSubmit={sendOtp}>
            <div className="field"><label>Phone number</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 98765 43210" inputMode="tel" autoFocus /></div>
            {err && <div className="pill red" style={{ marginBottom: 12 }}>{err}</div>}
            <button className="btn primary block" disabled={loading}>{loading ? 'Sending...' : 'Send login code'}</button>
          </form>
          <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--faint)', fontSize: 12 }}>&mdash; or &mdash;</div>
          <button type="button" className="btn outline block" onClick={quickLogin} disabled={loading}><Icon name="logout" size={16} /> Quick dev login (skip OTP)</button>
        </>
      ) : (
        <>
          <h2>Enter code</h2>
          <p className="lead">We sent a 6-digit code to <b>{phone}</b>.</p>
          <form onSubmit={verify}>
            <div className="code-input" onPaste={onPaste} style={{ marginBottom: 16 }}>
              {code.map((d, i) => <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} inputMode="numeric" maxLength={1} autoFocus={i === 0} />)}
            </div>
            {err && <div className="pill red" style={{ marginBottom: 12 }}>{err}</div>}
            <button className="btn primary block" disabled={loading}>{loading ? 'Verifying...' : 'Verify & continue'}</button>
          </form>
          <button className="btn ghost" style={{ marginTop: 14, width: '100%' }} onClick={() => { setStep('phone'); setCode(['', '', '', '', '', '']); setErr(''); }}><Icon name="back" size={16} /> Use a different number</button>
        </>
      )}
    </Shell>
  );
};