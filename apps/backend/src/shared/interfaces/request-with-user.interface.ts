// ==========================================================================
// Interface para Request con usuario autenticado
// ==========================================================================

import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

export interface RequestWithUser extends Request {
  user: JwtPayload;
  tenantId: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role: string;
  permissions: string[];
}
