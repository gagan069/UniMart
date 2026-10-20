/**
 * Permissions helper library for UNIMART
 * Centralizes role-based access control (RBAC) across the platform.
 */

export function isAdmin(user) {
  return Boolean(user && user.role === 'admin');
}

export function isStudent(user) {
  return Boolean(user && user.role === 'student');
}

export function isGuest(user) {
  return !user;
}

/**
 * Checks if the current user can manage (edit, mark sold, or delete) a listing.
 * - Admin: can manage ANY listing.
 * - Student: can manage ONLY their own listings (listing.seller_id === user.id).
 * - Guest: cannot manage any listing.
 */
export function canManageListing(user, listing) {
  if (!user || !listing) return false;
  if (isAdmin(user)) return true;
  return Boolean(listing.seller_id && user.id && listing.seller_id === user.id);
}
