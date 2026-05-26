export function normalizePhoneIN(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith('091')) return `+${digits.slice(1)}`;
  if (raw.startsWith('+') && digits.length >= 11) return `+${digits}`;
  throw new Error('Invalid phone number');
}

export function maskPhone(e164: string): string {
  if (e164.length < 6) return e164;
  return e164.slice(0, 3) + '••••••' + e164.slice(-3);
}
