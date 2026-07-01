// WhatsApp OTP sender via a QR-linked account (unofficial, Baileys).
// The admin links a WhatsApp number by scanning a QR on the admin page.
// NOTE: unofficial automation — interim until the official SMS (MSG91) / WhatsApp
// Business API is ready. For production, run this always-on process on a VPS, not
// cPanel Passenger. Deps installed at runtime via require() so the server still
// boots if @whiskeysockets/baileys / qrcode are not present.
import path from 'path';

let baileys: any = null;
let qrcode: any = null;
try { baileys = require('@whiskeysockets/baileys'); } catch { baileys = null; }
try { qrcode = require('qrcode'); } catch { qrcode = null; }

export interface WaStatus { installed: boolean; status: string; qr: string | null; }

let sock: any = null;
let status = 'idle'; // idle | connecting | qr | open | closed | error | not_installed
let qr: string | null = null;
let starting = false;

const AUTH_DIR = path.resolve(process.cwd(), 'wa-auth');
const silentLogger: any = {
  level: 'silent', trace() {}, debug() {}, info() {}, warn() {}, error() {}, fatal() {},
  child() { return silentLogger; },
};

export function isInstalled() { return !!(baileys && qrcode); }

export async function start() {
  if (!isInstalled()) { status = 'not_installed'; return; }
  if (starting) return;
  if (sock && status === 'open') return;
  starting = true;
  try {
    const { useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket, DisconnectReason } = baileys;
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();
    status = 'connecting';
    sock = makeWASocket({ auth: state, version, logger: silentLogger, printQRInTerminal: false, browser: ['LionsClub', 'Chrome', '1.0'] });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (upd: any) => {
      const { connection, qr: qrStr, lastDisconnect } = upd;
      if (qrStr) {
        try { qr = await qrcode.toDataURL(qrStr); } catch { qr = null; }
        status = 'qr';
      }
      if (connection === 'open') { qr = null; status = 'open'; }
      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode;
        status = 'closed';
        const loggedOut = code === (DisconnectReason?.loggedOut ?? 401) || code === 401 || code === 403;
        if (!loggedOut) { setTimeout(() => { starting = false; start(); }, 3000); }
      }
    });
  } catch (e: any) {
    console.error('[wa] start failed', e?.message || e);
    status = 'error';
  } finally {
    starting = false;
  }
}

export function getStatus(): WaStatus { return { installed: isInstalled(), status, qr }; }

export async function send(phoneE164: string, text: string): Promise<boolean> {
  if (!sock || status !== 'open') return false;
  try {
    const jid = phoneE164.replace(/[^\d]/g, '') + '@s.whatsapp.net';
    await sock.sendMessage(jid, { text });
    return true;
  } catch (e: any) {
    console.error('[wa] send failed', e?.message || e);
    return false;
  }
}