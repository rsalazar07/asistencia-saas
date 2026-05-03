// ==========================================================================
// Interface para Request multi-tenant
// ==========================================================================

import { Request } from 'express';

export interface TenantRequest extends Request {
  tenantId: string;
  user?: {
    id: string;
    email: string;
    tenantId: string;
    role: string;
    [key: string]: any;
  };
}
