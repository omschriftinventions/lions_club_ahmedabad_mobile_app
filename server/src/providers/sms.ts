// MSG91 transactional SMS (flow API). Used when the admin selects SMS as the OTP provider.
// Not active until MSG91 credentials + flow are configured in .env.
import { config } from '../config';

export function isConfigured() {
  return !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_FLOW_ID);
}

export async function send(phoneE164: string, code: string): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const flowId = process.env.MSG91_OTP_FLOW_ID;
  if (!authKey || !flowId) return false;
  const mobile = phoneE164.replace(/[^\d]/g, '');
  const varName = process.env.MSG91_OTP_VAR_NAME || 'otp';
  try {
    const res = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: { authkey: authKey, 'content-type': 'application/json' },
      body: JSON.stringify({ flow_id: flowId, recipients: [{ mobiles: mobile, [varName]: code }] }),
    });
    return res.ok;
  } catch (e: any) {
    console.error('[sms] send failed', e?.message || e);
    return false;
  }
}