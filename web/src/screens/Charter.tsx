import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/Icon';
import { Pill } from '../components/ui';

export default function Charter() {
  const { member } = useAuth();
  const invite = `You are warmly invited to join Lions Club Ahmedabad Host (District 3232 B1).

Lions Clubs International is the world's largest service organisation, empowering communities through service. Our members serve causes like sight, hunger, environment, diabetes and childhood cancer.

To learn more or to be sponsored by ${member?.name ?? 'a member'}, reply to this message or reach the club office. We'd love to welcome you as a Lion. \uD83D\uDE4F`;

  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(invite); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };

  return (
    <>
      <div className="page-head"><div><h1>Charter Invite</h1><div className="sub">Share this invite to grow the club</div></div></div>
      <div className="card pad" style={{ maxWidth: 680 }}>
        <Pill tone="gold">District 3232 B1</Pill>
        <h3 style={{ fontSize: 20, marginTop: 12 }}>Invite a prospective member</h3>
        <p className="muted" style={{ marginTop: 6 }}>Copy the message below and send it via WhatsApp, SMS or email.</p>
        <div className="card pad" style={{ marginTop: 14, background: 'var(--surface-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{invite}</div>
        <button className="btn primary" style={{ marginTop: 14 }} onClick={copy}><Icon name={copied ? 'check' : 'doc'} size={16} /> {copied ? 'Copied!' : 'Copy invite text'}</button>
      </div>
    </>
  );
}