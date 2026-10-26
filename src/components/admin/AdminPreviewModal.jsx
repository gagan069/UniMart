import React, { useState, useEffect } from 'react';
import ListingCard from '../ListingCard.jsx';
import { categories } from '../../lib/categories.js';
import { SEEDED_USERS } from '../../lib/mockUsers.js';

export default function AdminPreviewModal({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject
}) {
  // Active photo index for current (or single) listing and proposed listing
  const [photoIdxCurrent, setPhotoIdxCurrent] = useState(0);
  const [photoIdxProposed, setPhotoIdxProposed] = useState(0);
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (enlargedPhoto) {
          setEnlargedPhoto(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, enlargedPhoto]);

  if (!isOpen || !item) return null;

  const isEdit = Boolean(item.hasPendingEdit);
  const prop = item.pendingEdit || null;

  // Resolve Seller Details (from item, users table, or mock users)
  const sellerUser = SEEDED_USERS.find(
    (u) =>
      u.id === item.seller_id ||
      u.email === item.seller_email ||
      u.name === item.seller_name ||
      u.name === item.seller
  );

  const sellerName = item.seller_name || sellerUser?.name || item.seller || 'Campus Student';
  const sellerDept = item.seller_department || sellerUser?.department || (item.seller_id === 'student_a' ? 'Computer Science & Engineering' : 'Chitkara University');
  const sellerStudentId = item.seller_student_id || sellerUser?.studentId || sellerUser?.student_id || (item.seller_id === 'student_a' ? '2110990696' : (item.seller_id || 'N/A'));
  const sellerEmail = item.seller_email || sellerUser?.email || (item.seller_id === 'student_a' ? 'satkar0696.becse25@chitkara.edu.in' : (sellerUser?.email || 'student@chitkara.edu.in'));

  const submittedDateStr = item.created_at
    ? new Date(item.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : (item.submittedAt || 'Today');

  const editSubmittedDateStr = item.pendingEditCreatedAt
    ? new Date(item.pendingEditCreatedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : (item.created_at
      ? new Date(item.created_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      : 'Recently');

  // Category and Subcategory Resolution for Current
  const currentCatObj = categories.find((c) => c.id === item.category_id);
  const currentSubcatObj = currentCatObj?.subcategories?.find(
    (s) => s.id === item.subcategory_id || s.name === item.subcategory
  );
  const currentCategoryStr = currentCatObj ? currentCatObj.name : item.category;
  const currentSubcategoryStr = currentSubcatObj ? currentSubcatObj.name : (item.subcategory || 'General');

  // Photos for Current
  const currentPhotos = (item.photos && item.photos.length > 0)
    ? item.photos
    : (item.image ? [item.image] : []);

  // Props and Items for Proposed (if Edit)
  let proposedItem = null;
  let proposedCategoryStr = currentCategoryStr;
  let proposedSubcategoryStr = currentSubcategoryStr;
  let proposedPhotos = currentPhotos;
  let changes = {};

  if (isEdit && prop) {
    const propCatObj = categories.find((c) => c.id === prop.category_id) || currentCatObj;
    const propSubcatObj = propCatObj?.subcategories?.find((s) => s.id === prop.subcategory_id);
    proposedCategoryStr = propCatObj ? propCatObj.name : currentCategoryStr;
    proposedSubcategoryStr = propSubcatObj
      ? propSubcatObj.name
      : (prop.subcategory || currentSubcategoryStr);

    if (Array.isArray(prop.photos) && prop.photos.length > 0) {
      proposedPhotos = prop.photos;
    }

    // Detect exact changes between current live item and proposed
    const isTitleChanged = (prop.title !== undefined) && (prop.title || '').trim() !== (item.title || '').trim();
    const isPriceChanged = (prop.price !== undefined) && Number(item.price) !== Number(prop.price);
    const isOrigPriceChanged = (prop.original_price !== undefined) && String(item.origPrice || '') !== String(prop.original_price || '');
    const isCategoryChanged = prop.category_id && String(prop.category_id) !== String(item.category_id);
    const isSubcategoryChanged = prop.subcategory_id !== undefined && String(prop.subcategory_id) !== String(item.subcategory_id);
    const isConditionChanged = (prop.item_condition || prop.condition) && (prop.item_condition || prop.condition).trim() !== (item.condition || '').trim();
    const isMeetupChanged = (prop.meetup_spot || prop.notes) && (prop.meetup_spot || prop.notes).trim() !== (item.notes || '').trim();
    const isDescChanged = prop.description !== undefined && (prop.description || '').trim() !== (item.description || '').trim();
    const isNotesChanged = prop.has_notes !== undefined && Boolean(prop.has_notes) !== Boolean(item.hasNotes || item.has_notes);

    const isPhotosChanged =
      currentPhotos.length !== proposedPhotos.length ||
      currentPhotos.some((url, idx) => url !== proposedPhotos[idx]);

    changes = {
      title: isTitleChanged,
      price: isPriceChanged,
      origPrice: isOrigPriceChanged,
      category: isCategoryChanged,
      subcategory: isSubcategoryChanged,
      condition: isConditionChanged,
      meetup: isMeetupChanged,
      description: isDescChanged,
      hasNotes: isNotesChanged,
      photos: isPhotosChanged
    };

    proposedItem = {
      ...item,
      title: prop.title !== undefined ? prop.title : item.title,
      price: prop.price !== undefined ? Number(prop.price) : item.price,
      origPrice: prop.original_price !== undefined ? (prop.original_price ? Number(prop.original_price) : null) : item.origPrice,
      category: proposedCategoryStr,
      category_id: prop.category_id || item.category_id,
      subcategory: proposedSubcategoryStr,
      subcategory_id: prop.subcategory_id !== undefined ? prop.subcategory_id : item.subcategory_id,
      condition: prop.item_condition || prop.condition || item.condition,
      notes: prop.meetup_spot || prop.notes || item.notes,
      description: prop.description !== undefined ? prop.description : item.description,
      hasNotes: prop.has_notes !== undefined ? Boolean(prop.has_notes) : (item.hasNotes || item.has_notes),
      has_notes: prop.has_notes !== undefined ? Boolean(prop.has_notes) : (item.hasNotes || item.has_notes),
      photos: proposedPhotos,
      image: proposedPhotos[0] || item.image,
      badge: item.badge || 'Verified',
      status: 'approved' // Render as live catalog appearance
    };
  }

  // Live preview item for new listing
  const newListingPreviewItem = {
    ...item,
    status: 'approved' // Render without yellow pending strip to show exact catalog result
  };

  const isBooksCategory = (catId, catName) => {
    return catId === 'books-notes' || (catName && catName.toLowerCase().includes('book'));
  };

  return (
    <div
      className="unimart-sell-modal-overlay unimart-preview-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-preview-title"
    >
      <div
        className={`unimart-preview-modal-box ${isEdit ? 'modal-comparison-wide' : 'modal-single-wide'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="unimart-preview-modal-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className={`unimart-preview-header-badge ${isEdit ? 'badge-edit' : 'badge-new'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {isEdit ? 'compare' : 'storefront'}
              </span>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 id="admin-preview-title" className="fw-bold mb-0 unimart-preview-modal-title">
                  {isEdit ? 'Review Proposed Changes' : 'Admin Preview — New Listing'}
                </h5>
                <span className={`badge rounded-pill px-2.5 py-1 fw-semibold ${isEdit ? 'bg-warning text-dark' : 'bg-primary text-white'}`} style={{ fontSize: '0.72rem' }}>
                  {isEdit ? 'Edit Pending Review' : 'New Submission'}
                </span>
              </div>
              <p className="text-muted small mb-0 mt-0.5">
                {isEdit
                  ? `Comparing live catalog listing #${item.id} with student's submitted updates`
                  : `Previewing listing #${item.id} exactly as buyers will see it once approved`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="unimart-close-btn"
            onClick={onClose}
            aria-label="Close preview"
            title="Close (Esc)"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="unimart-preview-modal-body">
          {!isEdit ? (
            /* ================= CASE 1: NEW LISTING → ONE CARD + DETAILS ================= */
            <div className="row g-4 align-items-start">
              {/* Product Card Column */}
              <div className="col-lg-5 col-md-6 col-12">
                <div className="unimart-preview-card-wrapper">
                  <div className="unimart-preview-column-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                    <span>Live Catalog Card Preview</span>
                  </div>
                  
                  <div className="unimart-preview-card-stage">
                    <ListingCard
                      item={newListingPreviewItem}
                      catalogTab="all"
                      photoIndex={photoIdxCurrent}
                      onPrevPhoto={(e) => {
                        e.stopPropagation();
                        setPhotoIdxCurrent((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
                      }}
                      onNextPhoto={(e) => {
                        e.stopPropagation();
                        setPhotoIdxCurrent((prev) => (prev < currentPhotos.length - 1 ? prev + 1 : 0));
                      }}
                      onSelectPhoto={(_, idx) => setPhotoIdxCurrent(idx)}
                    />
                  </div>
                  <div className="text-center text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
                    💡 Hover card arrows or click thumbnails to cycle product images
                  </div>
                </div>
              </div>

              {/* Comprehensive Details Panel Column */}
              <div className="col-lg-7 col-md-6 col-12">
                <div className="unimart-preview-details-panel">
                  {/* Full Description Section */}
                  <div className="unimart-preview-section mb-3">
                    <div className="unimart-preview-section-title">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                      <span>Full Description</span>
                    </div>
                    <div className="unimart-preview-desc-box">
                      {item.description ? (
                        <p className="mb-0 text-break" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      ) : (
                        <span className="text-muted fst-italic">No additional description provided by the seller.</span>
                      )}
                    </div>
                  </div>

                  {/* Specifications & Campus Details */}
                  <div className="unimart-preview-section mb-3">
                    <div className="unimart-preview-section-title">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
                      <span>Item Specifications</span>
                    </div>

                    <div className="row g-2.5">
                      <div className="col-sm-6 col-12">
                        <div className="unimart-preview-spec-item">
                          <span className="spec-label">Category & Subcategory</span>
                          <span className="spec-value">
                            {currentCategoryStr}
                            {currentSubcategoryStr ? ` • ${currentSubcategoryStr}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="col-sm-6 col-12">
                        <div className="unimart-preview-spec-item">
                          <span className="spec-label">Condition</span>
                          <span className="spec-value">
                            <span className="badge bg-light text-dark border px-2 py-0.5 rounded-pill">
                              {item.condition || 'Good'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="col-sm-6 col-12">
                        <div className="unimart-preview-spec-item">
                          <span className="spec-label">Campus Meetup Spot</span>
                          <span className="spec-value">
                            📍 {item.notes || 'Library Entrance'}
                          </span>
                        </div>
                      </div>

                      <div className="col-sm-6 col-12">
                        <div className="unimart-preview-spec-item">
                          <span className="spec-label">Handwritten Notes (Books)</span>
                          <span className="spec-value">
                            {isBooksCategory(item.category_id, currentCategoryStr) ? (
                              item.hasNotes || item.has_notes ? (
                                <span className="badge bg-warning bg-opacity-20 text-warning border border-warning px-2 py-0.5 rounded-pill fw-semibold">
                                  ✏️ Notes Included
                                </span>
                              ) : (
                                <span className="text-muted">No Notes</span>
                              )
                            ) : (
                              <span className="text-muted">N/A (Non-book item)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo Thumbnails Strip */}
                  <div className="unimart-preview-section mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1.5">
                      <div className="unimart-preview-section-title mb-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_library</span>
                        <span>Product Photos ({currentPhotos.length})</span>
                      </div>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        Click thumbnail to select or view larger
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap pt-1">
                      {currentPhotos.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`unimart-preview-thumb-box ${photoIdxCurrent === idx ? 'active' : ''}`}
                          onClick={() => {
                            setPhotoIdxCurrent(idx);
                            setEnlargedPhoto(imgUrl);
                          }}
                          title={`Photo ${idx + 1} — Click to view larger`}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="unimart-preview-thumb-img" />
                          <span className="unimart-preview-thumb-overlay">
                            <span className="material-symbols-outlined">zoom_in</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seller & Submission Info Card */}
                  <div className="unimart-preview-section">
                    <div className="unimart-preview-section-title">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span>
                      <span>Seller & Verification Details</span>
                    </div>

                    <div className="unimart-preview-seller-card">
                      <div className="d-flex align-items-center gap-3">
                        <div className="unimart-seller-avatar" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                          {sellerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold fs-6 seller-name">{sellerName}</div>
                          <div className="text-muted small seller-dept">{sellerDept}</div>
                        </div>
                      </div>

                      <div className="row g-2 mt-2 pt-2 border-top border-opacity-10">
                        <div className="col-sm-4 col-12">
                          <span className="text-muted small d-block">Student ID:</span>
                          <span className="fw-semibold small seller-id">{sellerStudentId}</span>
                        </div>
                        <div className="col-sm-5 col-12">
                          <span className="text-muted small d-block">Student Email:</span>
                          <span className="fw-semibold small seller-email text-break">{sellerEmail}</span>
                        </div>
                        <div className="col-sm-3 col-12">
                          <span className="text-muted small d-block">Submitted:</span>
                          <span className="fw-semibold small">{submittedDateStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= CASE 2: EDIT LISTING → TWO CARDS SIDE BY SIDE ================= */
            <div>
              {/* Diff Summary Bar */}
              <div className="unimart-preview-diff-summary mb-3 p-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-warning" style={{ fontSize: '20px' }}>
                    difference
                  </span>
                  <span className="small fw-semibold">
                    Comparing Live Catalog Listing with Proposed Student Updates
                  </span>
                </div>
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  {Object.entries(changes).filter(([, val]) => val).length > 0 ? (
                    Object.entries(changes)
                      .filter(([, val]) => val)
                      .map(([key]) => (
                        <span key={key} className="badge bg-danger bg-opacity-15 text-danger border border-danger border-opacity-25 rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)} Changed
                        </span>
                      ))
                  ) : (
                    <span className="badge bg-secondary text-white rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                      Identical Values
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Container */}
              <div className="row g-4 align-items-stretch">
                {/* LEFT CARD: Current (Live) */}
                <div className="col-lg-6 col-12">
                  <div className="unimart-comparison-col current-side">
                    <div className="unimart-preview-column-label label-current">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
                      <span>Current (Live in Catalog)</span>
                    </div>

                    {/* Live Product Card */}
                    <div className="unimart-preview-card-stage mb-3">
                      <ListingCard
                        item={{ ...item, status: 'approved' }}
                        catalogTab="all"
                        photoIndex={photoIdxCurrent}
                        onPrevPhoto={(e) => {
                          e.stopPropagation();
                          setPhotoIdxCurrent((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
                        }}
                        onNextPhoto={(e) => {
                          e.stopPropagation();
                          setPhotoIdxCurrent((prev) => (prev < currentPhotos.length - 1 ? prev + 1 : 0));
                        }}
                        onSelectPhoto={(_, idx) => setPhotoIdxCurrent(idx)}
                      />
                    </div>

                    {/* Live Details Panel */}
                    <div className="unimart-preview-details-panel">
                      <div className="unimart-preview-section mb-2.5">
                        <span className="spec-label">Description</span>
                        <div className="unimart-preview-desc-box mt-1" style={{ maxHeight: '110px' }}>
                          {item.description || <span className="text-muted fst-italic">No description</span>}
                        </div>
                      </div>

                      <div className="row g-2 mb-2.5">
                        <div className="col-6">
                          <div className="unimart-preview-spec-item">
                            <span className="spec-label">Category</span>
                            <span className="spec-value">{currentCategoryStr} • {currentSubcategoryStr}</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="unimart-preview-spec-item">
                            <span className="spec-label">Condition</span>
                            <span className="spec-value">{item.condition || 'Good'}</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="unimart-preview-spec-item">
                            <span className="spec-label">Meetup Spot</span>
                            <span className="spec-value">{item.notes || 'Library Entrance'}</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="unimart-preview-spec-item">
                            <span className="spec-label">Handwritten Notes</span>
                            <span className="spec-value">
                              {item.hasNotes || item.has_notes ? '✏️ Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Current Photos */}
                      <div className="unimart-preview-section mb-2.5">
                        <span className="spec-label d-block mb-1">Photos ({currentPhotos.length})</span>
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          {currentPhotos.map((url, idx) => (
                            <div
                              key={idx}
                              className={`unimart-preview-thumb-box thumb-sm ${photoIdxCurrent === idx ? 'active' : ''}`}
                              onClick={() => {
                                setPhotoIdxCurrent(idx);
                                setEnlargedPhoto(url);
                              }}
                              title="Click to view larger"
                            >
                              <img src={url} alt={`Current photo ${idx + 1}`} className="unimart-preview-thumb-img" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Seller & Submitted Date */}
                      <div className="unimart-preview-spec-item" style={{ background: 'transparent', padding: '0.25rem 0' }}>
                        <div className="d-flex align-items-center justify-content-between text-muted small" style={{ fontSize: '0.74rem' }}>
                          <span>Seller: <strong>{sellerName}</strong> ({sellerDept})</span>
                          <span>Live since: {submittedDateStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT CARD: Proposed Changes */}
                <div className="col-lg-6 col-12">
                  <div className="unimart-comparison-col proposed-side">
                    <div className="unimart-preview-column-label label-proposed">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span>
                      <span>Proposed Changes (Awaiting Admin)</span>
                    </div>

                    {/* Proposed Product Card (with Changed indicator if title/price/photos changed) */}
                    <div className={`unimart-preview-card-stage mb-3 ${changes.title || changes.price || changes.photos ? 'proposed-card-highlight' : ''}`}>
                      <ListingCard
                        item={proposedItem}
                        catalogTab="all"
                        photoIndex={photoIdxProposed}
                        onPrevPhoto={(e) => {
                          e.stopPropagation();
                          setPhotoIdxProposed((prev) => (prev > 0 ? prev - 1 : proposedPhotos.length - 1));
                        }}
                        onNextPhoto={(e) => {
                          e.stopPropagation();
                          setPhotoIdxProposed((prev) => (prev < proposedPhotos.length - 1 ? prev + 1 : 0));
                        }}
                        onSelectPhoto={(_, idx) => setPhotoIdxProposed(idx)}
                      />
                    </div>

                    {/* Proposed Details Panel with Changed Highlights */}
                    <div className="unimart-preview-details-panel">
                      <div className="unimart-preview-section mb-2.5">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="spec-label">Description</span>
                          {changes.description && (
                            <span className="unimart-changed-badge">Changed</span>
                          )}
                        </div>
                        <div className={`unimart-preview-desc-box mt-1 ${changes.description ? 'spec-changed-border' : ''}`} style={{ maxHeight: '110px' }}>
                          {proposedItem.description || <span className="text-muted fst-italic">No description</span>}
                        </div>
                      </div>

                      <div className="row g-2 mb-2.5">
                        <div className="col-6">
                          <div className={`unimart-preview-spec-item ${changes.category || changes.subcategory ? 'spec-changed-border' : ''}`}>
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="spec-label">Category</span>
                              {(changes.category || changes.subcategory) && (
                                <span className="unimart-changed-badge">Changed</span>
                              )}
                            </div>
                            <span className="spec-value fw-semibold">
                              {proposedCategoryStr} • {proposedSubcategoryStr}
                            </span>
                          </div>
                        </div>

                        <div className="col-6">
                          <div className={`unimart-preview-spec-item ${changes.condition ? 'spec-changed-border' : ''}`}>
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="spec-label">Condition</span>
                              {changes.condition && (
                                <span className="unimart-changed-badge">Changed</span>
                              )}
                            </div>
                            <span className="spec-value fw-semibold">{proposedItem.condition || 'Good'}</span>
                          </div>
                        </div>

                        <div className="col-6">
                          <div className={`unimart-preview-spec-item ${changes.meetup ? 'spec-changed-border' : ''}`}>
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="spec-label">Meetup Spot</span>
                              {changes.meetup && (
                                <span className="unimart-changed-badge">Changed</span>
                              )}
                            </div>
                            <span className="spec-value fw-semibold">{proposedItem.notes || 'Library Entrance'}</span>
                          </div>
                        </div>

                        <div className="col-6">
                          <div className={`unimart-preview-spec-item ${changes.hasNotes ? 'spec-changed-border' : ''}`}>
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="spec-label">Handwritten Notes</span>
                              {changes.hasNotes && (
                                <span className="unimart-changed-badge">Changed</span>
                              )}
                            </div>
                            <span className="spec-value fw-semibold">
                              {proposedItem.hasNotes || proposedItem.has_notes ? '✏️ Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Proposed Photos */}
                      <div className="unimart-preview-section mb-2.5">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="spec-label">Photos ({proposedPhotos.length})</span>
                          {changes.photos && (
                            <span className="unimart-changed-badge">Changed</span>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          {proposedPhotos.map((url, idx) => (
                            <div
                              key={idx}
                              className={`unimart-preview-thumb-box thumb-sm ${photoIdxProposed === idx ? 'active' : ''} ${changes.photos ? 'thumb-changed' : ''}`}
                              onClick={() => {
                                setPhotoIdxProposed(idx);
                                setEnlargedPhoto(url);
                              }}
                              title="Click to view larger"
                            >
                              <img src={url} alt={`Proposed photo ${idx + 1}`} className="unimart-preview-thumb-img" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Seller & Edit Submitted Date */}
                      <div className="unimart-preview-spec-item" style={{ background: 'transparent', padding: '0.25rem 0' }}>
                        <div className="d-flex align-items-center justify-content-between text-muted small" style={{ fontSize: '0.74rem' }}>
                          <span>Submitted by: <strong>{sellerName}</strong></span>
                          <span>Edit submitted: {editSubmittedDateStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Direct Actions */}
        <div className="unimart-preview-modal-footer d-flex align-items-center justify-content-between flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3.5 py-1.5 d-inline-flex align-items-center gap-1"
            onClick={onClose}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>arrow_back</span>
            <span>Dismiss</span>
          </button>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill px-3.5 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm fw-semibold"
              onClick={() => onReject(item)}
              title={isEdit ? 'Reject proposed edits' : 'Reject new listing'}
              id="admin-preview-reject-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              <span>{isEdit ? 'Reject Edits' : 'Reject Listing'}</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-success rounded-pill px-4 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm fw-semibold"
              onClick={() => onApprove(item)}
              title={isEdit ? 'Apply proposed edits to live catalog' : 'Approve and publish to marketplace'}
              id="admin-preview-approve-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
              <span>{isEdit ? 'Apply & Approve' : 'Approve & Publish'}</span>
            </button>
          </div>
        </div>

        {/* Enlarged Photo Lightbox Inside Popup */}
        {enlargedPhoto && (
          <div
            className="unimart-preview-lightbox"
            onClick={() => setEnlargedPhoto(null)}
            title="Click anywhere to return to preview"
          >
            <div className="unimart-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={enlargedPhoto} alt="Enlarged preview" className="unimart-lightbox-img" />
              <button
                type="button"
                className="unimart-lightbox-close"
                onClick={() => setEnlargedPhoto(null)}
                aria-label="Close enlarged photo"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
