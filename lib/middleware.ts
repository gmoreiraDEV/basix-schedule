import { requireAuth } from "./auth"

/**
 * Middleware helper to get current user's organization ID
 * Throws error if user is not authenticated
 */
export async function getOrganizationId(): Promise<string> {
  const user = await requireAuth()
  return user.organizationId
}

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: string[]): Promise<void> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }
}
