export type AdminRole = 'superadmin' | 'admin' | 'editor' | 'viewer';

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: AdminRole | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  beforeData: unknown | null;
  afterData: unknown | null;
  createdAt: string;
}

export interface AuditLogInput {
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: AdminRole | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  beforeData?: unknown | null;
  afterData?: unknown | null;
}

const roleRank: Record<AdminRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  superadmin: 3,
};

export function getAdminRoleLabel(role: AdminRole): string {
  switch (role) {
    case 'superadmin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'editor':
      return 'Editor';
    case 'viewer':
      return 'Viewer';
    default:
      return role;
  }
}

export function canManageRole(actorRole: AdminRole, requiredRole: AdminRole): boolean {
  return roleRank[actorRole] >= roleRank[requiredRole];
}

export function normalizeAdminRole(role: unknown): AdminRole {
  if (role === 'superadmin' || role === 'admin' || role === 'editor' || role === 'viewer') {
    return role;
  }

  return 'viewer';
}

export function createAuditLogEntry(input: AuditLogInput): AuditLogEntry {
  return {
    id: cryptoRandomId(),
    actorId: input.actorId ?? null,
    actorName: input.actorName ?? null,
    actorRole: input.actorRole ?? null,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId ?? null,
    beforeData: input.beforeData ?? null,
    afterData: input.afterData ?? null,
    createdAt: new Date().toISOString(),
  };
}

function cryptoRandomId(): string {
  const cryptoObj = globalThis.crypto as Crypto | undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }

  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}