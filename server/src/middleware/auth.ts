import { NextFunction, Request, Response } from 'express';
import { verifyAccess, AccessPayload } from '../utils/jwt';

export interface AuthedRequest extends Request {
  user?: AccessPayload;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const token = header.slice(7);
    req.user = verifyAccess(token);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
