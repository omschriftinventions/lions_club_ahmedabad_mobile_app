import { getSetting } from '../settings';
import * as wa from './whatsapp';
import * as sms from './sms';
import { config } from '../config';

// Deliver the OTP via the admin-chosen auth method's OTP channel (sms | whatsapp).
// Called only when the auth method is an OTP method.
export async function sendOtp(phoneE164: string, code: string) {
  const method = await getSetting('auth_method', 'password');
  let sent = false;
  if (method === 'sms') sent = await sms.send(phoneE164, code);
  else if (method === 'whatsapp') {
    sent = await wa.send(phoneE164, `Your Lions Club Ahmedabad login code is ${code}. It expires in 5 minutes. Do not share it.`);
  }
  if (config.otp.devLog) console.log(`[OTP] ${phoneE164} -> ${code} (via ${method}, sent=${sent})`);
  return { via: method, sent };
}