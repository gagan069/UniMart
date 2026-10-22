import React from 'react';
import { useNavigate } from 'react-router-dom';
import { canManageListing, isAdmin as checkIsAdmin } from '../lib/permissions.js';
import { categories } from '../lib/categories.js';
import { CATEGORY_THEME_MAP, resolveCategoryId, getDisplaySellerName, isUserListingOwner } from '../lib/constants.js';

export default function ListingCard({
  item,
  user,
  catalogTab,
  photoIndex = 0,
  onPrevPhoto,
  onNextPhoto,
  onSelectPhoto,
  onWishlistClick,
  onChatClick,
  onBuyClick,
  onEditListingClick,
  onDeleteListingClick,
  onToggleSoldClick
}) {
  const navigate = useNavigate();
  const hasDiscount = typeof item.origPrice === 'number' && !isNaN(item.origPrice) && item.origPrice > item.price;
  const discountPct = hasDiscount ? Math.round(((item.origPrice - item.price) / item.origPrice) * 100) : 0;
  const photosList = item.photos && item.photos.length > 0 ? item.photos : (item.image ? [item.image] : []);
  const activePhotoIdx = photoIndex || 0;
  const currentImg = photosList[activePhotoIdx] || item.image;
  const hasMultiplePhotos = photosList.length > 1;
  const itemCatId = item.category_id || resolveCategoryId(item);
  const themeClass = CATEGORY_THEME_MAP[itemCatId] || item.categoryTheme || 'theme-academic';

  const subcategoryName = item.subcategory || (
    categories.find((c) => c.id === itemCatId)?.subcategories?.find((s) => s.id === item.subcategory_id)?.name
  );

  const handleCardClick = (e) => {
    // Prevent navigating if clicking an interactive control
    if (e.target.closest('button') || e.target.closest('.unimart-card-photo-dot') || e.target.closest('a')) {
      return;
    }
    navigate(`/listing/${item.id}`);
  };

  return (
    <div className={`unimart-product-card ${themeClass}`}>
      <div className="unimart-card-inner" onClick={handleCardClick} role="button" tabIndex={0}>
        <div className="unimart-card-top-content">
          {/* Image and placeholder banner with category theme */}
          <div className={`unimart-card-placeholder-wrap ${themeClass}`}>
            <img 
              src={currentImg} 
              className="unimart-card-image" 
              alt={item.title} 
              loading="lazy"
            />
            <div className="unimart-category-translucent-tint"></div>
            <div className="unimart-card-glow-border"></div>

            {/* Multi-Photo Carousel Arrows & Indicator */}
            {hasMultiplePhotos && (
              <>
                <button
                  type="button"
                  className="unimart-card-nav-arrow unimart-card-nav-prev"
                  onClick={(e) => onPrevPhoto && onPrevPhoto(e, item.id, photosList.length)}
                  title="Previous photo"
                  aria-label="Previous photo"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>
                <button
                  type="button"
                  className="unimart-card-nav-arrow unimart-card-nav-next"
                  onClick={(e) => onNextPhoto && onNextPhoto(e, item.id, photosList.length)}
                  title="Next photo"
                  aria-label="Next photo"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
                <div className="unimart-card-photo-counter" title={`${photosList.length} photos available`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>photo_library</span>
                  <span>{activePhotoIdx + 1}/{photosList.length}</span>
                </div>
                <div className="unimart-card-photo-dots">
                  {photosList.map((_, pIdx) => (
                    <span
                      key={pIdx}
                      className={`unimart-card-photo-dot ${pIdx === activePhotoIdx ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectPhoto) onSelectPhoto(item.id, pIdx);
                      }}
                      title={`Photo ${pIdx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="unimart-placeholder-icon-box">
              <span className="material-symbols-outlined unimart-placeholder-icon">
                {item.icon || 'sell'}
              </span>
            </div>
            <span className="unimart-placeholder-label">
              {item.notes || item.meetupSpot || item.pickupSpot || item.category} 
            </span>
            
            {/* Condition Badge */}
            <span className="unimart-condition-badge">{item.condition}</span>

            {/* Status Badge: In My Listings show Pending / Approved / Rejected / Sold */}
            {catalogTab === 'my' ? (
              <span className={`unimart-pending-timer-badge status-badge-${item.status || 'approved'}`} title={`Status: ${item.status || 'approved'}`}>
                <span className={`material-symbols-outlined ${item.status === 'pending' ? 'unimart-timer-pulse' : ''}`} style={{ fontSize: '14px' }}>
                  {item.status === 'pending' ? 'schedule' : item.status === 'sold' ? 'sell' : item.status === 'rejected' ? 'cancel' : 'check_circle'}
                </span>
                <span>
                  {item.status === 'pending' ? 'Pending' : item.status === 'sold' ? 'Sold' : item.status === 'rejected' ? 'Rejected' : 'Approved'}
                </span>
              </span>
            ) : (
              item.status === 'pending' && (
                <span className="unimart-pending-timer-badge" title="Waiting to be approved by campus admin">
                  <span className="material-symbols-outlined unimart-timer-pulse">schedule</span>
                  <span>Waiting to be approved</span>
                </span>
              )
            )}
            
            {/* Wishlist Icon */}
            <button 
              type="button" 
              className="unimart-wishlist-btn" 
              title="Add to wishlist"
              onClick={(e) => onWishlistClick && onWishlistClick(e, item)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                favorite_border
              </span>
            </button>
          </div>

          {/* Card Body */}
          <div className="unimart-card-body">
            {item.status === 'pending' ? (
              <div className="unimart-pending-strip mb-2">
                <div className="d-flex align-items-center gap-1">
                  <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '15px', color: '#d97706' }}>schedule</span>
                  <span className="fw-semibold" style={{ fontSize: '0.72rem', color: '#b45309' }}>Waiting for Approval</span>
                </div>
                <span className="text-muted" style={{ fontSize: '0.68rem' }}>{item.submittedAt || 'Pending'}</span>
              </div>
            ) : (isUserListingOwner(item, user) && item.hasPendingEdit) ? (
              <div className="unimart-pending-strip mb-2" title="Your proposed edits are waiting for campus admin review">
                <div className="d-flex align-items-center gap-1">
                  <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '15px', color: '#d97706' }}>schedule</span>
                  <span className="fw-semibold" style={{ fontSize: '0.72rem', color: '#b45309' }}>Edit pending review</span>
                </div>
                <span className="text-muted" style={{ fontSize: '0.68rem' }}>Under review</span>
              </div>
            ) : null}

            <div className="d-flex justify-content-between align-items-center mb-1" style={{ minWidth: 0, gap: '0.5rem' }}>
              <span
                className="unimart-card-category"
                title={subcategoryName ? `${item.category} • ${subcategoryName}` : item.category}
              >
                {item.category}{subcategoryName ? ` • ${subcategoryName}` : ''}
              </span>
              <span className={`unimart-badge-chip flex-shrink-0 ${item.status === 'pending' ? 'chip-pending' : ''}`}>
                {item.status === 'sold' ? 'Sold' : (item.badge || 'Verified')}
              </span>
            </div>

            <h6 className="unimart-card-title" title={item.title}>
              {item.title}
            </h6>

            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="unimart-seller-info">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>person</span>
                <span>{getDisplaySellerName(item, user)}</span>
              </div>
              {!isUserListingOwner(item, user) && (
                <button
                  type="button"
                  className="unimart-card-quick-chat-btn"
                  onClick={(e) => onChatClick && onChatClick(e, item)}
                  title={`Chat with ${getDisplaySellerName(item, user)}`}
                  aria-label={`Chat with seller ${getDisplaySellerName(item, user)}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>chat</span>
                  <span>Chat</span>
                </button>
              )}
            </div>

            {/* Pricing in Indian Rupees (₹) */}
            <div className="unimart-price-row mt-auto pt-2">
              <div className="d-flex align-items-baseline gap-2 flex-wrap">
                <span className="unimart-current-price">
                  {item.price === 0 ? 'Free' : `₹${item.price.toLocaleString('en-IN')}`}
                </span>
                {hasDiscount && (
                  <span className="unimart-orig-price">₹{item.origPrice.toLocaleString('en-IN')}</span>
                )}
                {hasDiscount && discountPct > 0 && (
                  <span className="unimart-discount-tag">{discountPct}% OFF</span>
                )}
                {item.isNegotiable && (
                  <span className="badge bg-light text-dark border ms-1" style={{ fontSize: '0.65rem' }}>
                    Negotiable
                  </span>
                )}
              </div>

              {/* Only inside "My Listings" tab, show Mark as Sold, Edit, and Delete */}
              {catalogTab === 'my' && canManageListing(user, item) && !checkIsAdmin(user) ? (
                <div className="d-flex align-items-center gap-1.5 unimart-my-card-actions">
                  <button
                    type="button"
                    className={`unimart-card-icon-btn ${item.status === 'sold' ? 'unimart-btn-available' : 'unimart-btn-sold'}`}
                    title={item.status === 'sold' ? "Mark as Available" : "Mark as Sold"}
                    onClick={(e) => onToggleSoldClick && onToggleSoldClick(e, item)}
                    aria-label={item.status === 'sold' ? `Mark ${item.title} as Available` : `Mark ${item.title} as Sold`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                      {item.status === 'sold' ? 'published_with_changes' : 'sell'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="unimart-card-icon-btn unimart-btn-edit"
                    title="Edit"
                    onClick={(e) => onEditListingClick && onEditListingClick(e, item)}
                    aria-label={`Edit ${item.title}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>edit</span>
                  </button>
                  <button
                    type="button"
                    className="unimart-card-icon-btn unimart-btn-delete"
                    title="Delete"
                    onClick={(e) => onDeleteListingClick && onDeleteListingClick(e, item)}
                    aria-label={`Delete ${item.title}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>delete</span>
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="unimart-add-cart-btn"
                  title="Add to cart"
                  onClick={(e) => onBuyClick && onBuyClick(e, item)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Details Section */}
        <div className="unimart-expanded-details" style={{ '--card-img': `url(${currentImg})` }}>
          <h6 className="unimart-expanded-title" title={item.title}>
            {item.title}
          </h6>
          <div className="unimart-expanded-meta">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>badge</span>
            <span style={{ fontSize: '0.78rem', marginLeft: '6px' }}>{getDisplaySellerName(item, user)}</span>
          </div>
          <p className="unimart-expanded-desc">
            {item.description || (item.notes ? `Includes: ${item.notes}. ` : '') + `Verified pre-owned item in ${(item.condition || '').toLowerCase()} condition.`}
          </p>
          <div className="unimart-expanded-price-row">
            <span className="unimart-expanded-price">
              {item.price === 0 ? 'Free' : `₹${item.price.toLocaleString('en-IN')}`}
            </span>
            <span className="unimart-expanded-location">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
              {item.meetupSpot || item.notes || item.pickupSpot || 'Chitkara Campus'}
            </span>
          </div>
          <div className="unimart-expanded-actions">
            {catalogTab === 'my' && canManageListing(user, item) && !checkIsAdmin(user) ? (
              <>
                <button
                  type="button"
                  className="unimart-btn-secondary"
                  onClick={(e) => onToggleSoldClick && onToggleSoldClick(e, item)}
                  title={item.status === 'sold' ? "Mark as Available" : "Mark as Sold"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {item.status === 'sold' ? 'published_with_changes' : 'sell'}
                  </span>
                  {item.status === 'sold' ? 'Available' : 'Mark Sold'}
                </button>
                <button
                  type="button"
                  className="unimart-btn-secondary"
                  onClick={(e) => onEditListingClick && onEditListingClick(e, item)}
                  title="Edit listing"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  Edit
                </button>
                <button
                  type="button"
                  className="unimart-btn-primary bg-danger border-danger"
                  onClick={(e) => onDeleteListingClick && onDeleteListingClick(e, item)}
                  title="Delete listing"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="unimart-btn-secondary"
                  onClick={(e) => onChatClick && onChatClick(e, item)}
                  title="Chat with seller"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                  Chat
                </button>
                <button
                  type="button"
                  className="unimart-btn-primary"
                  onClick={(e) => onBuyClick && onBuyClick(e, item)}
                  title="Add to cart"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                  + Cart
                </button>
              </>
            )}
            <button
              type="button"
              className="unimart-btn-icon"
              title="Quick preview"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/listing/${item.id}`);
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
