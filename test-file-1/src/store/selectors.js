/**
 * UNIMART Redux Selectors
 * Centralized selectors implementing platform visibility and filtering rules.
 */

export const selectAllListings = (state) => state.listings.items;
export const selectListingsStatus = (state) => state.listings.status;
export const selectListingsError = (state) => state.listings.error;

/**
 * All pending listings waiting for admin review
 */
export const selectPendingListings = (state) =>
  state.listings.items.filter((item) => item.status === 'pending');

/**
 * Single listing by ID
 */
export const selectListingById = (id) => (state) =>
  state.listings.items.find((item) => String(item.id) === String(id));

/**
 * Listings owned by a specific student
 */
export const selectMyListings = (userId) => (state) => {
  if (!userId) return [];
  return state.listings.items.filter((item) => item.seller_id === userId);
};

/**
 * Public catalog visibility rule:
 * - Admin sees all listings (including pending, rejected, sold).
 * - Guests see only approved & reserved listings.
 * - Logged-in students see:
 *     1. All their own listings (with pending/rejected/sold status).
 *     2. Approved & reserved listings from other students.
 */
export const selectVisibleListings = (user) => (state) => {
  const items = state.listings.items;
  if (user?.role === 'admin') {
    return items;
  }
  if (!user) {
    return items.filter(
      (item) => item.status === 'approved' || item.status === 'reserved'
    );
  }
  return items.filter((item) => {
    // Owner sees all their own listings regardless of status
    if (item.seller_id === user.id) return true;
    // For other sellers, only show approved or reserved
    return item.status === 'approved' || item.status === 'reserved';
  });
};

/**
 * Wishlist selectors
 */
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsWishlisted = (id) => (state) =>
  state.wishlist.items.some((item) => (typeof item === 'object' ? item.id === id : item === id));
