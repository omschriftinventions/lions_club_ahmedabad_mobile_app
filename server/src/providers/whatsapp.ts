// WhatsApp OTP sender via a QR-linked account (unofficial, Baileys).
// The admin links a WhatsApp number by scanning a QR on the admin page.
// NOTE: unofficial automation — interim until the official SMS (MSG91) / WhatsApp
// Business API is ready. For production, run this always-on process on a VPS, not
// cPanel Passenger. Deps installed at runtime via require() so the server still
// boots if @whiskeysockets/baileys / qrcode are not present.
import path from "path";
import fs from "fs";

let baileys: any = null;
let qrcode: any = null;
try { baileys = require("@whiskeysockets/baileys"); } catch { baileys = null; }
try { qrcode = require("qrcode"); } catch { qrcode = null; }

export interface WaStatus { installed: boolean; status: string; qr: string | null; reconnects: number; }

const AUTH_DIR = path.resolve(process.cwd(), "wa-auth");

const silentLogger: any = {
  level: "silent", trace() {}, debug() {}, info() {}, warn() {}, error() {}, fatal() {},
  child() { return silentLogger; },
};

let sock: any = null;
let status = "idle"; // idle | connecting | qr | open | closed | error | not_installed
let qr: string | null = null;
let starting = false;
let reconnectCount = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let evHandlersBound = false;

export function isInstalled() { return !!(baileys && qrcode); }

/** Remove the auth state directory so a fresh QR can be generated. */
function clearAuthState() {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
  } catch (e: any) {
    console.error("[wa] clearAuthState failed", e?.message || e);
  }
}

/** Tear down the current socket and remove all event listeners. */
function teardownSocket() {
  if (sock) {
    try { sock.ev.removeAllListeners(); } catch {}
    try { sock.end(undefined); } catch {}
    try { sock.destroy(); } catch {}
    sock = null;
  }
  evHandlersBound = false;
}

/** Cancel any pending reconnect timer. */
function cancelReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export async function start() {
  if (!isInstalled()) { status = "not_installed"; return; }
  if (starting) return;
  if (sock && status === "open") return;

  starting = true;
  cancelReconnect();
  teardownSocket();

  try {
    const { useMultiFileAuthState, fetchLatestBaileysVersion, makeWASocket, DisconnectReason } = baileys;
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();
    status = "connecting";
    qr = null;

    sock = makeWASocket({
      auth: state,
      version,
      logger: silentLogger,
      printQRInTerminal: false,
      browser: ["LionsClub", "Chrome", "1.0"],
      connectTimeoutMs: 20_000,
      retryRequestDelayMs: 2000,
    });

    sock.ev.on("creds.update", saveCreds);
    evHandlersBound = true;

    sock.ev.on("connection.update", async (upd: any) => {
      const { connection, qr: qrStr, lastDisconnect } = upd;

      if (qrStr) {
        try { qr = await qrcode.toDataURL(qrStr); } catch { qr = null; }
        status = "qr";
      }

      if (connection === "open") {
        qr = null;
        status = "open";
        reconnectCount = 0; // reset counter on successful connection
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = code === (DisconnectReason?.loggedOut ?? 401) || code === 401 || code === 403;

        status = "closed";
        teardownSocket();

        if (loggedOut) {
          // Session was invalidated (logged out from phone or banned).
          // Clear auth state so a fresh QR is generated on next start.
          console.warn("[wa] logged out — clearing auth state, admin must re-scan QR");
          clearAuthState();
          qr = null;
          reconnectCount = 0;
          starting = false;
          // Do NOT auto-reconnect; admin must trigger restart manually after re-scanning.
          return;
        }

        // Exponential backoff: 3s, 6s, 12s, 24s, 30s cap
        reconnectCount++;
        const delay = Math.min(3000 * Math.pow(2, reconnectCount - 1), 30000);
        console.warn("[wa] connection closed (code " + code + "), reconnect #" + reconnectCount + " in " + delay + "ms");

        if (reconnectCount > 10) {
          console.error("[wa] max reconnects exceeded, giving up. Admin must restart manually.");
          status = "error";
          starting = false;
          return;
        }

        reconnectTimer = setTimeout(async () => {
          starting = false;
          await start();
        }, delay);
      }
    });
  } catch (e: any) {
    console.error("[wa] start failed", e?.message || e);
    status = "error";
    teardownSocket();

    // Retry on start failure with backoff
    reconnectCount++;
    if (reconnectCount <= 5) {
      const delay = Math.min(3000 * Math.pow(2, reconnectCount - 1), 30000);
      console.warn("[wa] start failed, retry #" + reconnectCount + " in " + delay + "ms");
      reconnectTimer = setTimeout(async () => {
        starting = false;
        await start();
      }, delay);
    } else {
      starting = false;
    }
  } finally {
    // Only clear starting flag if we're not in the middle of async connection setup
    // The connection.update handler will manage reconnection; we clear starting
    // here because makeWASocket has returned and event handlers are bound.
    starting = false;
  }
}

/** Force a fresh restart — clears the old socket and starts over. */
export async function restart() {
  cancelReconnect();
  teardownSocket();
  starting = false;
  reconnectCount = 0;
  status = "idle";
  qr = null;
  await start();
}

/** Force logout — clears auth state and restarts to generate a fresh QR. */
export async function logout() {
  cancelReconnect();
  teardownSocket();
  starting = false;
  reconnectCount = 0;
  clearAuthState();
  status = "idle";
  qr = null;
  await start();
}

export function getStatus(): WaStatus {
  return { installed: isInstalled(), status, qr, reconnects: reconnectCount };
}

export async function send(phoneE164: string, text: string): Promise<boolean> {
  if (!sock || status !== "open") return false;
  try {
    const jid = phoneE164.replace(/[^\d]/g, "") + "@s.whatsapp.net";
    await sock.sendMessage(jid, { text });
    return true;
  } catch (e: any) {
    console.error("[wa] send failed", e?.message || e);
    return false;
  }
}