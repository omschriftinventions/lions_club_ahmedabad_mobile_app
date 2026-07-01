import React from 'react';
import { Icon } from './Icon';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className ?? 'center'}><div className="spinner" /></div>
);

export const EmptyState: React.FC<{ icon?: string; title: string; body?: string }> = ({ icon, title, body }) => (
  <div className="empty">
    {icon && <div className="ic"><Icon name={icon} size={38} /></div>}
    <div style={{ fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>{title}</div>
    {body && <div className="muted">{body}</div>}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; tone?: 'gray' | 'gold' | 'green' | 'blue' | 'red' }> = ({ children, tone = 'gray' }) => (
  <span className={`pill ${tone}`}>{children}</span>
);

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, onClose, children, footer }) => (
  <div className="modal-mask" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-head">
        <h3>{title}</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-foot">{footer}</div>}
    </div>
  </div>
);

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="field">
    <label>{label}</label>
    {children}
    {hint && <div className="hint">{hint}</div>}
  </div>
);

export function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}