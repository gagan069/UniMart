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

function populateListing(item, photosTable, usersTable, pendingEditsTable) {
  if (!item) return null;
  const photos = (photosTable || [])
    .filter((p) => p.listing_id === item.id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((p) => p.url);

  const seller = (usersTable || []).find((u) => u.id === item.seller_id);
  const sellerDisplayName = seller
    ? (seller.department ? `${seller.name} (${seller.department})` : seller.name)
    : (item.seller || 'Campus Student');
  const catObj = categories.find((c) => c.id === item.category_id);
  const subcatObj = catObj?.subcategories?.find((s) => s.id === item.subcategory_id);

  // Check pending edits for this listing
  const pendingEdits = pendingEditsTable !== undefined ? pendingEditsTable : (getTable('listing_pending_edits') || []);
  const pendingEditEntry = (pendingEdits || []).find((pe) => Number(pe.listing_id) === Number(item.id));

  return {
    ...item,
    photos,
    image: photos[0] || null,
    seller: sellerDisplayName,
    seller_name: seller ? seller.name : 'Campus Student',
    seller_department: seller?.department || null,
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
      : (item.badge || 'Verified'),
    hasPendingEdit: Boolean(pendingEditEntry),
    pendingEdit: pendingEditEntry ? pendingEditEntry.proposed_changes : null,
    pendingEditCreatedAt: pendingEditEntry ? pendingEditEntry.created_at : null
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
    const pendingEdits = getTable('listing_pending_edits') || [];

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
        const subcatObj = catObj?.subcategories?.find((s) => s.id === item.subcategory_id);
        const subcatName = subcatObj ? subcatObj.name.toLowerCase() : (item.subcategory || '').toLowerCase();
        const seller = users.find((u) => u.id === item.seller_id);
        const sellerName = seller ? seller.name.toLowerCase() : '';
        return (
          (item.title || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.meetup_spot || '').toLowerCase().includes(q) ||
          catName.includes(q) ||
          subcatName.includes(q) ||
          sellerName.includes(q)
        );
      });
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const populated = filtered.map((item) => populateListing(item, photos, users, pendingEdits));
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
    const pendingEdits = getTable('listing_pending_edits') || [];

    const item = listings.find((l) => Number(l.id) === Number(id));
    if (!item) {
      throw new Error('Listing not found');
    }

    const isAdmin = currentUser?.role === 'admin';
    const isOwner = currentUser?.id && item.seller_id === currentUser.id;

    if (item.status !== 'approved' && !isAdmin && !isOwner) {
      throw new Error('Listing is pending approval and visible only to its creator.');
    }

    return { data: populateListing(item, photos, users, pendingEdits) };
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
    const pendingEdits = getTable('listing_pending_edits') || [];

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

    const populated = populateListing(newListing, photosTable, users, pendingEdits);
    return { data: populated, message: 'Listing submitted for campus admin approval.' };
  },

  /**
   * Update existing listing:
   * - A NEW listing that hasn't been approved yet (or was rejected): updates in place and keeps status 'pending'.
   * - Price-only change on approved listing: updates immediately, remains approved.
   * - Non-price change on approved listing: live listing stays 'approved', visible and unchanged.
   *   Proposed changes are recorded in listing_pending_edits. Replaces any prior pending edit.
   */
  async updateListing(id, updates, currentUser) {
    await delay(300);
    if (!currentUser) {
      throw new Error('Authentication required to edit listings.');
    }

    const listings = getTable('listings') || [];
    const photosTable = getTable('listing_photos') || [];
    let pendingEditsTable = getTable('listing_pending_edits') || [];
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

    // Fetch existing live photos to compare
    const currentListingPhotos = photosTable
      .filter((p) => Number(p.listing_id) === Number(existingItem.id))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((p) => p.url);

    // Compare each submitted field's VALUE to the live listing.
    // Fields sent with unchanged values count as unchanged.
    const isTitleChanged =
      updates.title !== undefined &&
      (updates.title || '').trim() !== (existingItem.title || '').trim();

    const isCategoryChanged =
      updates.category_id !== undefined &&
      String(updates.category_id) !== String(existingItem.category_id);

    const existingSubcat = existingItem.subcategory_id != null ? String(existingItem.subcategory_id) : null;
    const newSubcat = updates.subcategory_id != null ? String(updates.subcategory_id) : null;
    const isSubcategoryChanged = updates.subcategory_id !== undefined && newSubcat !== existingSubcat;

    const updatedCondition = updates.condition !== undefined ? updates.condition : updates.item_condition;
    const isConditionChanged =
      updatedCondition !== undefined &&
      updatedCondition !== (existingItem.item_condition || existingItem.condition || '');

    const updatedMeetup = updates.notes !== undefined ? updates.notes : updates.meetup_spot;
    const isMeetupChanged =
      updatedMeetup !== undefined &&
      updatedMeetup.trim() !== (existingItem.meetup_spot || existingItem.notes || '').trim();

    const isDescChanged =
      updates.description !== undefined &&
      (updates.description || '').trim() !== (existingItem.description || '').trim();

    const updatedHasNotes = updates.hasNotes !== undefined ? updates.hasNotes : updates.has_notes;
    const isNotesChanged =
      updatedHasNotes !== undefined &&
      Boolean(updatedHasNotes) !== Boolean(existingItem.has_notes ?? existingItem.hasNotes);

    const isPhotosChanged =
      Array.isArray(updates.photos)
        ? (updates.photos.length !== currentListingPhotos.length ||
           updates.photos.some((url, idx) => url !== currentListingPhotos[idx]))
        : (updates.image !== undefined && updates.image !== currentListingPhotos[0]);

    const isNonPriceContentChanged =
      isTitleChanged ||
      isCategoryChanged ||
      isSubcategoryChanged ||
      isConditionChanged ||
      isMeetupChanged ||
      isDescChanged ||
      isNotesChanged ||
      isPhotosChanged;

    const isPriceChanged =
      updates.price !== undefined &&
      Number(updates.price) !== Number(existingItem.price);

    const isOrigPriceChanged =
      updates.origPrice !== undefined &&
      (existingItem.original_price == null
        ? updates.origPrice != null
        : Number(updates.origPrice) !== Number(existingItem.original_price));

    const isStatusOnly =
      updates.status !== undefined &&
      !isNonPriceContentChanged &&
      !isPriceChanged &&
      !isOrigPriceChanged;

    const isPriceOnly =
      !isNonPriceContentChanged &&
      (isPriceChanged || isOrigPriceChanged);

    if (isStatusOnly || isAdmin) {
      // Direct status or admin updates apply immediately
      listings[itemIndex] = {
        ...existingItem,
        status: updates.status || existingItem.status,
        badge: updates.badge !== undefined ? updates.badge : existingItem.badge,
        price: newPrice,
        original_price: updates.origPrice !== undefined ? (updates.origPrice ? Number(updates.origPrice) : null) : existingItem.original_price,
        updated_at: new Date().toISOString()
      };
      setTable('listings', listings);

      const populated = populateListing(listings[itemIndex], photosTable, users, pendingEditsTable);
      return {
        data: populated,
        editType: isStatusOnly ? 'status_only' : 'admin_update',
        message: isStatusOnly ? `Status updated to ${updates.status}` : 'Listing updated'
      };
    }

    if (!isNonPriceContentChanged && !isPriceChanged && !isOrigPriceChanged) {
      const populated = populateListing(existingItem, photosTable, users, pendingEditsTable);
      return {
        data: populated,
        editType: 'no_change',
        message: 'No changes detected'
      };
    }

    // CASE A: NEW listing not approved yet, or a REJECTED listing being resubmitted
    // "A NEW listing that hasn't been approved yet: editing it just updates it in place and keeps it pending (there's no live version to protect)."
    // "The owner sees it in My Listings with the existing 'Rejected' badge, and can edit it to resubmit (it goes back to pending) or delete it."
    if (existingItem.status === 'pending' || existingItem.status === 'rejected') {
      listings[itemIndex] = {
        ...existingItem,
        title: updates.title !== undefined ? updates.title.trim() : existingItem.title,
        category_id: updates.category_id !== undefined ? updates.category_id : existingItem.category_id,
        subcategory_id: updates.subcategory_id !== undefined ? updates.subcategory_id : existingItem.subcategory_id,
        price: newPrice,
        original_price: updates.origPrice !== undefined ? (updates.origPrice ? Number(updates.origPrice) : null) : existingItem.original_price,
        item_condition: updates.condition || updates.item_condition || existingItem.item_condition,
        meetup_spot: updates.notes || updates.meetup_spot || existingItem.meetup_spot,
        description: updates.description !== undefined ? updates.description : existingItem.description,
        has_notes: updates.hasNotes !== undefined ? Boolean(updates.hasNotes) : (updates.has_notes !== undefined ? Boolean(updates.has_notes) : existingItem.has_notes),
        status: 'pending',
        pending_type: 'new',
        badge: 'Waiting for Approval',
        updated_at: new Date().toISOString()
      };
      setTable('listings', listings);

      // If photos provided, update listing_photos
      if (Array.isArray(updates.photos)) {
        let remainingPhotos = photosTable.filter((p) => Number(p.listing_id) !== Number(existingItem.id));
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

      // Remove any pending edit record if one somehow existed
      pendingEditsTable = pendingEditsTable.filter((pe) => Number(pe.listing_id) !== Number(existingItem.id));
      setTable('listing_pending_edits', pendingEditsTable);

      const currentPhotos = getTable('listing_photos') || [];
      const populated = populateListing(listings[itemIndex], currentPhotos, users, pendingEditsTable);
      return {
        data: populated,
        editType: existingItem.status === 'rejected' ? 'resubmission' : 'pending_resubmission',
        message: existingItem.status === 'rejected' ? 'Listing resubmitted for admin approval!' : 'Listing updated!'
      };
    }

    // CASE B: Price-only change on approved listing
    if (isPriceOnly) {
      listings[itemIndex] = {
        ...existingItem,
        price: newPrice,
        original_price: updates.origPrice !== undefined ? (updates.origPrice ? Number(updates.origPrice) : null) : existingItem.original_price,
        updated_at: new Date().toISOString()
      };
      setTable('listings', listings);

      const populated = populateListing(listings[itemIndex], photosTable, users, pendingEditsTable);
      return {
        data: populated,
        editType: 'price_only',
        message: 'Price updated live!'
      };
    }

    // CASE C: Non-price edits on LIVE / APPROVED listing
    // "1. Edits must not hide the live listing. Today a non-price edit sets the listing to 'pending', which hides it from everyone.
    //  - Store the proposed changes in listing_pending_edits.
    //  - The live listing stays 'approved', visible and unchanged.
    //  - Show the owner a small 'Edit pending review' marker on their own card, styled like the existing 'Waiting for Approval' strip.
    //  - Approve: copy the proposed fields onto the live listing and delete the pending edit.
    //  - Reject an edit: delete the pending edit only; the live listing is untouched.
    //  - Editing a listing that already has a pending edit replaces that pending edit (never more than one per listing)."

    // Remove any previous pending edit for this listing so there's never more than one
    pendingEditsTable = pendingEditsTable.filter((pe) => Number(pe.listing_id) !== Number(existingItem.id));

    const proposedPhotos = Array.isArray(updates.photos) ? updates.photos : currentListingPhotos;

    const proposedChanges = {
      title: updates.title !== undefined ? updates.title.trim() : existingItem.title,
      category_id: updates.category_id !== undefined ? updates.category_id : existingItem.category_id,
      subcategory_id: updates.subcategory_id !== undefined ? updates.subcategory_id : existingItem.subcategory_id,
      price: newPrice,
      original_price: updates.origPrice !== undefined ? Number(updates.origPrice) : existingItem.original_price,
      item_condition: updates.condition || updates.item_condition || existingItem.item_condition,
      meetup_spot: updates.notes || updates.meetup_spot || existingItem.meetup_spot,
      description: updates.description !== undefined ? updates.description : existingItem.description,
      has_notes: updates.hasNotes !== undefined ? Boolean(updates.hasNotes) : (updates.has_notes !== undefined ? Boolean(updates.has_notes) : existingItem.has_notes),
      photos: proposedPhotos
    };

    pendingEditsTable.push({
      id: Date.now(),
      listing_id: existingItem.id,
      proposed_changes: proposedChanges,
      created_at: new Date().toISOString()
    });
    setTable('listing_pending_edits', pendingEditsTable);

    // CRITICAL: The live listing stays 'approved', visible and unchanged in the listings table.
    // We populate with the updated pendingEditsTable so that hasPendingEdit = true
    const populated = populateListing(existingItem, photosTable, users, pendingEditsTable);
    return {
      data: populated,
      editType: 'pending_approval',
      message: 'Edits submitted to admin for approval.'
    };
  },

  /**
   * Approve listing (Admin only)
   * - If pending edit: copies proposed fields onto the live listing and deletes the pending edit.
   * - If new listing: marks status 'approved' and keeps each listing's own badge. Brand-new student listings get 'Verified'.
   */
  async approveListing(id, currentUser) {
    await delay(250);
    if (currentUser?.role !== 'admin') {
      throw new Error('Only campus administrators can approve marketplace listings.');
    }

    const listings = getTable('listings') || [];
    let pendingEdits = getTable('listing_pending_edits') || [];
    let photos = getTable('listing_photos') || [];
    const users = getTable('users') || [];

    const itemIndex = listings.findIndex((l) => Number(l.id) === Number(id));
    if (itemIndex === -1) throw new Error('Listing not found');

    const item = listings[itemIndex];
    const pendingEdit = pendingEdits.find((pe) => Number(pe.listing_id) === Number(item.id));

    if (pendingEdit && pendingEdit.proposed_changes) {
      // Approve proposed edit: copy proposed fields onto the live listing and delete the pending edit
      const prop = pendingEdit.proposed_changes;
      listings[itemIndex] = {
        ...item,
        title: prop.title !== undefined ? prop.title : item.title,
        category_id: prop.category_id !== undefined ? prop.category_id : item.category_id,
        subcategory_id: prop.subcategory_id !== undefined ? prop.subcategory_id : item.subcategory_id,
        price: prop.price !== undefined ? prop.price : item.price,
        original_price: prop.original_price !== undefined ? prop.original_price : item.original_price,
        item_condition: prop.item_condition !== undefined ? prop.item_condition : item.item_condition,
        meetup_spot: prop.meetup_spot !== undefined ? prop.meetup_spot : item.meetup_spot,
        description: prop.description !== undefined ? prop.description : item.description,
        has_notes: prop.has_notes !== undefined ? prop.has_notes : item.has_notes,
        status: 'approved',
        updated_at: new Date().toISOString()
      };

      // If proposed photos provided, update listing_photos
      if (Array.isArray(prop.photos) && prop.photos.length > 0) {
        photos = photos.filter((p) => Number(p.listing_id) !== Number(item.id));
        prop.photos.forEach((url, idx) => {
          photos.push({
            id: Date.now() + idx,
            listing_id: item.id,
            url,
            sort_order: idx
          });
        });
        setTable('listing_photos', photos);
      }

      // Delete the pending edit
      pendingEdits = pendingEdits.filter((pe) => Number(pe.listing_id) !== Number(item.id));
      setTable('listing_pending_edits', pendingEdits);
      setTable('listings', listings);

      return {
        data: populateListing(listings[itemIndex], photos, users, pendingEdits),
        message: `Edits for "${listings[itemIndex].title}" approved and live!`
      };
    }

    // New listing approval:
    // Rule 3: Approving keeps each listing's own badge (don't overwrite it with "Admin Approved").
    // A brand-new student listing can get "Verified" on approval.
    item.status = 'approved';
    item.pending_type = null;
    if (!item.badge || item.badge === 'Waiting for Approval') {
      item.badge = 'Verified';
    }
    item.updated_at = new Date().toISOString();
    setTable('listings', listings);

    // Clean up any pending edits record if existed
    pendingEdits = pendingEdits.filter((pe) => Number(pe.listing_id) !== Number(item.id));
    setTable('listing_pending_edits', pendingEdits);

    return {
      data: populateListing(item, photos, users, pendingEdits),
      message: `Listing "${item.title}" approved!`
    };
  },

  /**
   * Reject listing (Admin only):
   * - If pending edit: deletes the pending edit only; the live listing is untouched.
   * - If new listing: sets status 'rejected' instead of deleting it. Owner sees it in My Listings.
   */
  async rejectListing(id, currentUser) {
    await delay(250);
    if (currentUser?.role !== 'admin') {
      throw new Error('Only campus administrators can reject marketplace listings.');
    }

    let listings = getTable('listings') || [];
    let pendingEdits = getTable('listing_pending_edits') || [];
    const photos = getTable('listing_photos') || [];
    const users = getTable('users') || [];

    const itemIndex = listings.findIndex((l) => Number(l.id) === Number(id));
    if (itemIndex === -1) throw new Error('Listing not found');

    const item = listings[itemIndex];
    const pendingEdit = pendingEdits.find((pe) => Number(pe.listing_id) === Number(item.id));

    // Case 1: Rejecting an edit on an approved listing
    // "Reject an edit: delete the pending edit only; the live listing is untouched."
    if (pendingEdit) {
      pendingEdits = pendingEdits.filter((pe) => Number(pe.listing_id) !== Number(item.id));
      setTable('listing_pending_edits', pendingEdits);

      return {
        data: populateListing(item, photos, users, pendingEdits),
        message: `Pending edits for "${item.title}" rejected; live listing untouched.`
      };
    }

    // Case 2: Rejecting a NEW listing
    // "2. Rejecting a NEW listing sets status 'rejected' instead of deleting it.
    //  - The owner sees it in My Listings with the existing 'Rejected' badge, and can edit it to resubmit (it goes back to pending) or delete it.
    //  - Nobody else sees it, including on /listing/:id."
    listings[itemIndex] = {
      ...item,
      status: 'rejected',
      badge: 'Rejected',
      updated_at: new Date().toISOString()
    };
    setTable('listings', listings);

    return {
      data: populateListing(listings[itemIndex], photos, users, pendingEdits),
      message: `Listing "${item.title}" marked as rejected.`
    };
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
