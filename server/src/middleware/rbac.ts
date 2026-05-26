import { NextFunction, Response } from 'express';
import { AuthedRequest } from './auth';

export function requireEditor(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (!req.user.canEdit) return res.status(403).json({ error: 'forbidden', reason: 'editor_role_required' });
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
