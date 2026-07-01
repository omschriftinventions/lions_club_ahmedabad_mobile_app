import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface AccessPayload {
  sub: number;          // member_id
  role: string;         // role.code
  canEdit: boolean;     // can_edit_club_data
  clubId: number;
  superAdmin: boolean;   // bypasses all RBAC, hidden from roster
}

export function signAccess(payload: AccessPayload): string {
  const opts: SignOptions = { expiresIn: config.jwt.accessTtl as any };
  return jwt.sign(payload, config.jwt.accessSecret, opts);
}

export function verifyAccess(token: string): AccessPayload {
  return jwt.verify(token, config.jwt.accessSecret) as unknown as AccessPayload;
}

export function newRefreshToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export async function hashRefresh(token: string): Promise<string> {
  return bcrypt.hash(token, 8);
}

export async function verifyRefresh(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
