import React from 'react';

function initials(name?: string): string {
  if (!name) return 'LL';
  const parts = name.replace(/\bLion\b/g, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'LL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PALETTE = ['#0A3D7A', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#DC2626', '#475569'];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export const Avatar: React.FC<{ name?: string; color?: string | null; src?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
  name, color, src, size = 'md',
}) => {
  if (src) return <img src={src} alt={name ?? ''} className={`avatar ${size}`} style={{ objectFit: 'cover' }} />;
  const bg = color || colorFor(name ?? 'x');
  return <span className={`avatar ${size}`} style={{ backgroundColor: bg }}>{initials(name)}</span>;
};