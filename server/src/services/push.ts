import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { query, exec } from '../db';
import { config } from '../config';
import { RowDataPacket } from 'mysql2';

const expo = new Expo({ accessToken: config.expo.accessToken || undefined });

export interface PushPayload {
  title: string;
  body?: string;
  data?: Record<string, any>;
}

async function tokensForClub(clubId: number): Promise<string[]> {
  const rows = await query<(RowDataPacket & { expo_token: string })[]>(
    `SELECT pt.expo_token
     FROM push_tokens pt JOIN members m ON m.id = pt.member_id
     WHERE m.club_id = :clubId AND m.active = 1 AND pt.active = 1`,
    { clubId }
  );
  return rows.map(r => r.expo_token).filter(Expo.isExpoPushToken);
}

async function tokensForMember(memberId: number): Promise<string[]> {
  const rows = await query<(RowDataPacket & { expo_token: string })[]>(
    `SELECT expo_token FROM push_tokens WHERE member_id = :id AND active = 1`,
    { id: memberId }
  );
  return rows.map(r => r.expo_token).filter(Expo.isExpoPushToken);
}

async function send(tokens: string[], payload: PushPayload): Promise<void> {
  if (!tokens.length) return;
  const messages: ExpoPushMessage[] = tokens.map(to => ({
    to,
    title: payload.title,
    body: payload.body,
    data: payload.data,
    sound: 'default',
  }));
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];
  for (const c of chunks) {
    try {
      const r = await expo.sendPushNotificationsAsync(c);
      tickets.push(...r);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[push] send error', e);
    }
  }
  // Deactivate tokens with DeviceNotRegistered
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i] as any;
    if (t.status === 'error' && t.details?.error === 'DeviceNotRegistered') {
      const tok = (messages[i].to as string);
      await exec(`UPDATE push_tokens SET active = 0 WHERE expo_token = :t`, { t: tok }).catch(() => {});
    }
  }
}

export async function broadcastToClub(clubId: number, payload: PushPayload): Promise<void> {
  const tokens = await tokensForClub(clubId);
  await send(tokens, payload);
}

export async function notifyMember(memberId: number, payload: PushPayload): Promise<void> {
  const tokens = await tokensForMember(memberId);
  await send(tokens, payload);
}
