import type { UserRole } from '@/types/database'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 5,
  admin: 4,
  staff: 3,
  trade: 2,
  customer: 1,
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function isAdminRole(role: UserRole): boolean {
  return ['super_admin', 'admin', 'staff'].includes(role)
}

export function canAccessAdmin(role: UserRole): boolean {
  return isAdminRole(role)
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'super_admin'
}

export function canManageSettings(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin'
}

export function canManageProducts(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin'
}

export function canManageServices(role: UserRole): boolean {
  return isAdminRole(role)
}

export function canManageQuotes(role: UserRole): boolean {
  return isAdminRole(role)
}

export function canManageCrm(role: UserRole): boolean {
  return isAdminRole(role)
}

export function requiresTwoFactor(role: UserRole): boolean {
  return ['super_admin', 'admin', 'staff'].includes(role)
}
