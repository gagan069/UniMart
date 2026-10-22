// src/api/listingsApi.js
/**
 * UNIMART Listings API (Fake REST API layer)
 * 
 * Interacts with listings, listing_photos, and listing_pending_edits tables.
 * Enforces college business rules:
 * - New listings start as 'pending' for admin verification.
 * - Price-only edits go live immediately.
 * - Non-price edits move to 'pending' state and store proposed changes in listing_pending_edits.
 * - Rejecting an edit reverts to the previously approved version.
 * - Pending/rejected listings are visible only to the listing owner and admins.
 */

import { getTable, setTable, delay } from './db.js';
import { categories } from '../lib/categories.js';

function populateListing(item, photosTable, usersTable) {
  if (!item) return null;
  const photos = (photosTable || [])
    .filter((p) => p.listing_id === item.id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((p) => p.url);

  const seller = (usersTable || []).find((u) => u.id === item.seller_id);
  const catObj = categories.find((c) => c.id === item.category_id);
  const subcatObj = catObj?.subcategories?.find((s) => s.id === item.subcategory_id);

  return {
    ...item,
    photos,
    image: photos[0] || null,
    seller: seller ? seller.name : 'Campus Student',
    seller_name: seller ? seller.name : 'Campus Student',
    seller_email: seller ? seller.email : '',
    category: catObj ? catObj.name : 'General',
    subcategory: subcatObj ? subcatObj.name : (item.subcategory || null),
    subcategory_id: item.subcategory_id || null,
    condition: item.item_condition || item.condition,
    origPrice: item.original_price || item.origPrice,
    notes: item.meetup_spot || item.notes,
    hasNotes: item.hasNotes !== undefined ? item.hasNotes : Boolean(item.has_notes),
    has_notes: item.hasNotes !== undefined ? item.hasNotes : Boolean(item.has_notes),
    badge: item.status === 'pending'
      ? 'Waiting for Approval'
      : item.status === 'sold'
      ? 'Sold'
      : item.status === 'rejected'
      ? 'Rejected'
      : (item.badge || 'Verified')
  };
}

export const listingsApi = {
  /**
   * Fetch all listings accessible to current user (with optional category & search filter)
   */
  async getListings({ category_id, search, seller_id, currentUser } = {}) {
    await delay(300);
    const listings = getTable('listings') || [];
    const photos = getTable('listing_photos') || [];
    const users = getTable('users') || [];

    const isAdmin = currentUser?.role === 'admin';
    const currentUserId = currentUser?.id;

    let filtered = listings.filter((item) => {
      // Visibility rule: Approved listings are public.
      // Pending or rejected items are visible ONLY to their owner and campus admins.
      if (item.status === 'approved') return true;
      if (isAdmin) return true;
      if (currentUserId && item.seller_id === currentUserId) return true;
      return false;
    });

    if (category_id && category_id !== 'All') {
      filtered = filtered.filter((item) => item.category_id === category_id);
    }

    if (seller_id) {
      filtered = filtered.filter((item) => item.seller_id === seller_id);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const catObj = categories.find((c) => c.id === item.category_id);
        const catName = catObj ? catObj.name.toLowerCase() : '';
        return (
          (item.title || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.meetup_spot || '').toLowerCase().includes(q) ||
          catName.includes(q)
        );
      });
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const populated = filtered.map((item) => populateListing(item, photos, users));
    return { data: populated };
  },

  /**
   * Get single listing by ID
   */
  async getListingById(id, currentUser) {
    await delay(200);
    const listings = getTable('listings') || [];
    const photos = getTable('listing_photos') || [];
    const users = getTable('users') || [];

    const item = listings.find((l) => Number(l.id) === Number(id));
    if (!item) {
      throw new Error('Listing not found');
    }

    const isAdmin = currentUser?.role === 'admin';
    const isOwner = currentUser?.id && item.seller_id === currentUser.id;

    if (item.status !== 'approved' && !isAdmin && !isOwner) {
      throw new Error('Listing is pending approval and visible only to its creator.');
    }

    return { data: populateListing(item, photos, users) };
  },

  /**
   * Create new listing (starts in 'pending' status for admin approval)
   */
  async createListing(data, currentUser) {
    await delay(350);
    if (!currentUser) {
      throw new Error('Guests cannot list items. Please log in with your Chitkara credentials.');
    }

    const listings = getTable('listings') || [];
    const photosTable = getTable('listing_photos') || [];
    const users = getTable('users') || [];

    const newId = Date.now();
    const newListing = {
      id: newId,
      seller_id: currentUser.id,
      title: (data.title || '').trim(),
      category_id: data.category_id || 'books-notes',
      subcategory_id: data.subcategory_id || null,
      price: Number(data.price),
      original_price: data.origPrice ? Number(data.origPrice) : null,
      item_condition: data.condition || data.item_condition || 'Good',
      meetup_spot: data.notes || data.meetup_spot || 'Library Entrance',
      description: data.description || '',
      has_notes: Boolean(data.hasNotes || data.has_notes),
      badge: data.badge || null,
      status: 'pending', // Starts pending admin approval
      pending_type: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    listings.unshift(newListing);
    setTable('listings', listings);

    // Save photos to listing_photos table
    const uploadedPhotos = Array.isArray(data.photos) ? data.photos : [];
    uploadedPhotos.forEach((url, idx) => {
      photosTable.push({
        id: Date.now() + idx,
        listing_id: newId,
        url,
        sort_order: idx
      });
    });
    setTable('listing_photos', photosTable);

    const populated = populateListing(newListing, photosTable, users);
    return { data: populated, message: 'Listing submitted for campus admin approval.' };
  },

  /**
   * Update existing listing:
   * - Price-only change: updates immediately, remains approved.
   * - Other field changes: records pending edits, sets status to 'pending'.
   */
  async updateListing(id, updates, currentUser) {
    await delay(300);
    if (!currentUser) {
      throw new Error('Authentication required to edit listings.');
    }

    const listings = getTable('listings') || [];
    const photosTable = getTable('listing_photos') || [];
    const pendingEditsTable = getTable('listing_pending_edits') || [];
    const users = getTable('users') || [];

    const itemIndex = listings.findIndex((l) => Number(l.id) === Number(id));
    if (itemIndex === -1) throw new Error('Listing not found');

    const existingItem = listings[itemIndex];
    const isOwner = currentUser.id === existingItem.seller_id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('Students can only manage their own campus listings.');
    }

    const newPrice = updates.price !== undefined ? Number(updates.price) : existingItem.price;
    const isPriceOnly =
      updates.title === undefined &&
      updates.category_id === undefined &&
      updates.item_condition === undefined &&
      updates.description === undefined &&
      updates.photos === undefined &&
      updates.meetup_spot === undefined;

    const isStatusOnly =
      updates.status !== undefined &&
      updates.title === undefined &&
      updates.category_id === undefined &&
      updates.item_condition === undefined &&
      updates.description === undefined &&
      updates.photos === undefined &&
      updates.meetup_spot === undefined &&
      updates.price === undefined;

    if (isPriceOnly || isStatusOnly || isAdmin) {
      // Price-only, status-only, or admin updates apply immediately
      listings[itemIndex] = {
        ...existingItem,
        status: updates.status || existingItem.status,
        badge: updates.badge !== undefined ? updates.badge : existingItem.badge,
        price: newPrice,
        original_price: updates.origPrice !== undefined ? Number(updates.origPrice) : existingItem.original_price,
        updated_at: new Date().toISOString()
      };
      setTable('listings', listings);

      const populated = populateListing(listings[itemIndex], photosTable, users);
      return {
        data: populated,
        editType: isStatusOnly ? 'status_only' : 'price_only',
        message: isStatusOnly ? `Status updated to ${updates.status}` : 'Price updated live!'
      };
    }

    // Save snapshot of previous approved version in listing_pending_edits
    pendingEditsTable.push({
      listing_id: existingItem.id,
      previous_version: { ...existingItem },
      proposed_changes: {
        title: updates.title || existingItem.title,
        category_id: updates.category_id || existingItem.category_id,
        subcategory_id: updates.subcategory_id !== undefined ? updates.subcategory_id : existingItem.subcategory_id,
        price: newPrice,
        original_price: updates.origPrice !== undefined ? Number(updates.origPrice) : existingItem.original_price,
        item_condition: updates.condition || updates.item_condition || existingItem.item_condition,
        meetup_spot: updates.notes || updates.meetup_spot || existingItem.meetup_spot,
        description: updates.description !== undefined ? updates.description : existingItem.description,
        has_notes: updates.hasNotes !== undefined ? Boolean(updates.hasNotes) : (updates.has_notes !== undefined ? Boolean(updates.has_notes) : existingItem.has_notes)
      },
      created_at: new Date().toISOString()
    });
    setTable('listing_pending_edits', pendingEditsTable);

    // Apply updates and set listing status to 'pending'
    listings[itemIndex] = {
      ...existingItem,
      title: updates.title || existingItem.title,
      category_id: updates.category_id || existingItem.category_id,
      subcategory_id: updates.subcategory_id !== undefined ? updates.subcategory_id : existingItem.subcategory_id,
      price: newPrice,
      original_price: updates.origPrice !== undefined ? Number(updates.origPrice) : existingItem.original_price,
      item_condition: updates.condition || updates.item_condition || existingItem.item_condition,
      meetup_spot: updates.notes || updates.meetup_spot || existingItem.meetup_spot,
      description: updates.description !== undefined ? updates.description : existingItem.description,
      has_notes: updates.hasNotes !== undefined ? Boolean(updates.hasNotes) : (updates.has_notes !== undefined ? Boolean(updates.has_notes) : existingItem.has_notes),
      status: 'pending',
      pending_type: 'edit',
      updated_at: new Date().toISOString()
    };
    setTable('listings', listings);

    // If new photos provided, update listing_photos
    if (Array.isArray(updates.photos)) {
      const remainingPhotos = photosTable.filter((p) => p.listing_id !== existingItem.id);
      updates.photos.forEach((url, idx) => {
        remainingPhotos.push({
          id: Date.now() + idx,
          listing_id: existingItem.id,
          url,
          sort_order: idx
        });
      });
      setTable('listing_photos', remainingPhotos);
    }

    const currentPhotos = getTable('listing_photos') || [];
    const populated = populateListing(listings[itemIndex], currentPhotos, users);
    return { data: populated, editType: 'pending_approval', message: 'Edits submitted to admin for approval.' };
  },

  /**
   * Approve listing (Admin only)
   */
  async approveListing(id, currentUser) {
    await delay(250);
    if (currentUser?.role !== 'admin') {
      throw new Error('Only campus administrators can approve marketplace listings.');
    }

    const listings = getTable('listings') || [];
    const pendingEdits = getTable('listing_pending_edits') || [];
    const photos = getTable('listing_photos') || [];
    const users = getTable('users') || [];

    const item = listings.find((l) => Number(l.id) === Number(id));
    if (!item) throw new Error('Listing not found');

    item.status = 'approved';
    item.pending_type = null;
    item.updated_at = new Date().toISOString();
    setTable('listings', listings);

    // Clean up pending edits record
    const updatedPendingEdits = pendingEdits.filter((pe) => pe.listing_id !== item.id);
    setTable('listing_pending_edits', updatedPendingEdits);

    return { data: populateListing(item, photos, users), message: `Listing "${item.title}" approved!` };
  },

  /**
   * Reject listing (Admin only):
   * - If pending edit: restores previous approved snapshot.
   * - If new listing: marks rejected or removes.
   */
  async rejectListing(id, currentUser) {
    await delay(250);
    if (currentUser?.role !== 'admin') {
      throw new Error('Only campus administrators can reject marketplace listings.');
    }

    let listings = getTable('listings') || [];
    const pendingEdits = getTable('listing_pending_edits') || [];
    const photos = getTable('listing_photos') || [];
    const users = getTable('users') || [];

    const itemIndex = listings.findIndex((l) => Number(l.id) === Number(id));
    if (itemIndex === -1) throw new Error('Listing not found');

    const item = listings[itemIndex];
    const pendingEdit = pendingEdits.find((pe) => pe.listing_id === item.id);

    if (item.pending_type === 'edit' && pendingEdit?.previous_version) {
      // Restore previously approved listing version
      listings[itemIndex] = {
        ...pendingEdit.previous_version,
        status: 'approved',
        pending_type: null,
        updated_at: new Date().toISOString()
      };
      setTable('listings', listings);

      const remainingPending = pendingEdits.filter((pe) => pe.listing_id !== item.id);
      setTable('listing_pending_edits', remainingPending);

      return {
        data: populateListing(listings[itemIndex], photos, users),
        message: `Pending edits for "${item.title}" rejected; previous version restored.`
      };
    }

    // If newly created pending listing rejected, remove it
    listings = listings.filter((l) => Number(l.id) !== Number(id));
    setTable('listings', listings);

    const remainingPhotos = photos.filter((p) => Number(p.listing_id) !== Number(id));
    setTable('listing_photos', remainingPhotos);

    return { message: `Listing "${item.title}" rejected and removed.` };
  },

  /**
   * Delete listing (Owner or Admin)
   */
  async deleteListing(id, currentUser) {
    await delay(250);
    if (!currentUser) throw new Error('Authentication required.');

    let listings = getTable('listings') || [];
    let photos = getTable('listing_photos') || [];
    const item = listings.find((l) => Number(l.id) === Number(id));

    if (!item) throw new Error('Listing not found');
    if (item.seller_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Unauthorized to delete this listing.');
    }

    listings = listings.filter((l) => Number(l.id) !== Number(id));
    photos = photos.filter((p) => Number(p.listing_id) !== Number(id));
    setTable('listings', listings);
    setTable('listing_photos', photos);

    return { success: true, message: 'Listing deleted.' };
  }
};

export default listingsApi;
