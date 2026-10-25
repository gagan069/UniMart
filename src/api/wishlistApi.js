// src/api/wishlistApi.js
/**
 * UNIMART Wishlist API (Fake REST API layer)
 * 
 * Interacts with wishlist table: wishlist(user_id, listing_id, created_at)
 * Enforces rule: Guests cannot wishlist items (requires authenticated Chitkara account).
 */

import { getTable, setTable, delay } from './db.js';
import { listingsApi } from './listingsApi.js';

export const wishlistApi = {
  /**
   * Retrieve all wishlist items for a given user
   */
  async getWishlist(userId) {
    await delay(250);
    if (!userId) {
      throw new Error('Please log in with your Chitkara account to view your wishlist.');
    }

    const wishlistTable = getTable('wishlist') || [];
    const userWishlist = wishlistTable.filter((w) => w.user_id === userId);

    // Fetch listing details for each wishlisted item
    const listingsRes = await listingsApi.getListings();
    const allListings = listingsRes.data || [];

    const items = userWishlist
      .map((w) => allListings.find((l) => Number(l.id) === Number(w.listing_id)))
      .filter(Boolean);

    return {
      data: items,
      listingIds: userWishlist.map((w) => Number(w.listing_id))
    };
  },

  /**
   * Add a listing to user's wishlist
   */
  async addToWishlist(userId, listingId) {
    await delay(200);
    if (!userId) {
      throw new Error('Please log in with your Chitkara account to save items.');
    }

    const wishlistTable = getTable('wishlist') || [];
    const exists = wishlistTable.some(
      (w) => w.user_id === userId && Number(w.listing_id) === Number(listingId)
    );

    if (!exists) {
      wishlistTable.push({
        user_id: userId,
        listing_id: Number(listingId),
        created_at: new Date().toISOString()
      });
      setTable('wishlist', wishlistTable);
    }

    return { success: true, message: 'Added to wishlist!' };
  },

  /**
   * Remove a listing from user's wishlist
   */
  async removeFromWishlist(userId, listingId) {
    await delay(200);
    if (!userId) {
      throw new Error('Authentication required.');
    }

    let wishlistTable = getTable('wishlist') || [];
    wishlistTable = wishlistTable.filter(
      (w) => !(w.user_id === userId && Number(w.listing_id) === Number(listingId))
    );
    setTable('wishlist', wishlistTable);

    return { success: true, message: 'Removed from wishlist.' };
  },

  /**
   * Toggle item in user's wishlist
   */
  async toggleWishlist(userId, listingId) {
    const wishlistTable = getTable('wishlist') || [];
    const isSaved = wishlistTable.some(
      (w) => w.user_id === userId && Number(w.listing_id) === Number(listingId)
    );

    if (isSaved) {
      return wishlistApi.removeFromWishlist(userId, listingId);
    } else {
      return wishlistApi.addToWishlist(userId, listingId);
    }
  }
};

export default wishlistApi;
