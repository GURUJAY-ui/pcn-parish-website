import { Router } from 'express';
import { getAdminRoleLabel, type AdminRole, type AuditLogEntry, type AdminUserSummary } from '../db/roles-audit-foundation';

export interface AdminActivityResponse {
  roleLabels: Record<AdminRole, string>;
  auditHistory: AuditLogEntry[];
  currentUser: AdminUserSummary | null;
}

const roleLabels: Record<AdminRole, string> = {
  superadmin: getAdminRoleLabel('superadmin'),
  admin: getAdminRoleLabel('admin'),
  editor: getAdminRoleLabel('editor'),
  viewer: getAdminRoleLabel('viewer'),
};

const demoAuditHistory: AuditLogEntry[] = [];

export const adminActivityRouter = Router();

adminActivityRouter.get('/admin/activity', (_req, res) => {
  const response: AdminActivityResponse = {
    roleLabels,
    auditHistory: demoAuditHistory,
    currentUser: null,
  };

  res.json(response);
});