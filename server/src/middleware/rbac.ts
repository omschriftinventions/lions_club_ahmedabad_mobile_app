import { NextFunction, Response } from 'express';
import { AuthedRequest } from './auth';

// Super admins bypass all role checks.
export function requireEditor(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (req.user.superAdmin || req.user.canEdit) return next();
  return res.status(403).json({ error: 'forbidden', reason: 'editor_role_required' });
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (req.user.superAdmin || roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'forbidden' });
  };
}
export function requireSuperAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  if (!req.user.superAdmin) return res.status(403).json({ error: 'forbidden', reason: 'super_admin_required' });
  next();
}
