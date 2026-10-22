import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useChat } from '../context/ChatContext.jsx';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';
import { categories } from '../lib/categories.js';
import {
  CATEGORY_THEME_MAP,
  resolveCategoryId,
  getDisplaySellerName,
  isUserListingOwner
} from '../lib/constants.js';
import {
  fetchListings,
  updateListing as updateListingAction
} from '../store/slices/listingsSlice.js';
import Navbar from '../components/Navbar.jsx';
import NotFound from './NotFound.jsx';
import FloatingChatButton from '../components/chat/FloatingChatButton.jsx';
import ChatModal from '../components/chat/ChatModal.jsx';
import '../Dashboard.css';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, logout } = useAuth() || {};
  const { theme, toggleTheme } = useTheme();
  const { openChatWithItem, closeChat } = useChat();

  const productList = useSelector((state) => state.listings.items) || [];
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [toastAlert, setToastAlert] = useState(null);
  const [detailSearch, setDetailSearch] = useState('');

  useEffect(() => {
    if (productList.length === 0) {
      dispatch(fetchListings({ currentUser: user }));
    }
  }, [dispatch, productList.length, user]);

  const item = productList.find((l) => String(l.id) === String(id));

  // If item doesn't exist, show 404
  if (!item) {
    return <NotFound />;
  }

  // Access control rule: Pending listings visible only to owner and campus admins
  const isOwner = user && (item.seller_id === user.id || isUserListingOwner(item, user));
  const isAdmin = checkIsAdmin(user);

  if ((item.status === 'pending' || item.status === 'rejected') && !isOwner && !isAdmin) {
    return <NotFound />;
  }

  const photosList = item.photos && item.photos.length > 0 ? item.photos : (item.image ? [item.image] : []);
  const currentImg = photosList[activePhotoIdx] || item.image;
  const itemCatId = item.category_id || resolveCategoryId(item);
  const themeClass = CATEGORY_THEME_MAP[itemCatId] || item.categoryTheme || 'theme-academic';

  const catObj = categories.find((c) => c.id === itemCatId);
  const subcatObj = catObj?.subcategories?.find((s) => s.id === item.subcategory_id);
  const subcategoryName = item.subcategory || subcatObj?.name;

  const hasDiscount = typeof item.origPrice === 'number' && !isNaN(item.origPrice) && item.origPrice > item.price;
  const discountPct = hasDiscount ? Math.round(((item.origPrice - item.price) / item.origPrice) * 100) : 0;

  const handleSellClick = () => {
    if (!user) {
      setToastAlert({
        type: 'danger',
        text: 'Please sign in with your college account to sell an item.'
      });
      return;
    }
    navigate('/?sell=true', { state: { openSell: true } });
  };

  const handleChatClick = () => {
    if (!user) {
      setToastAlert({
        type: 'danger',
        text: 'Please sign in to chat with campus sellers.'
      });
      setTimeout(() => navigate('/login'), 1200);
      return;
    }
    if (isOwner) {
      setToastAlert({
        type: 'info',
        text: 'This is your own listing! You can manage it under "My Listings".'
      });
      return;
    }
    openChatWithItem(item);
  };

  const handleWishlistClick = () => {
    if (!user) {
      setToastAlert({
        type: 'danger',
        text: 'Please sign in to add items to your wishlist.'
      });
      return;
    }
    setToastAlert({
      type: 'success',
      text: 'Wishlist feature will be available in Phase 6.'
    });
    setTimeout(() => setToastAlert(null), 3000);
  };

  const handleToggleSold = () => {
    if (!isOwner && !isAdmin) return;
    const newStatus = item.status === 'sold' ? 'approved' : 'sold';
    dispatch(
      updateListingAction({
        id: item.id,
        updates: { status: newStatus },
        currentUser: user
      })
    );
    setToastAlert({
      type: 'success',
      text: newStatus === 'sold' ? 'Listing marked as Sold' : 'Listing marked as Available'
    });
    setTimeout(() => setToastAlert(null), 3000);
  };

  const handleSearchSubmit = (q) => {
    const trimmed = (q !== undefined ? q : detailSearch).trim();
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/');
  };

  return (
    <div className="unimart-dashboard-wrap">
      {/* Navbar */}
      <Navbar
        handleGoToLogin={() => navigate('/login')}
        searchQuery={detailSearch}
        setSearchQuery={setDetailSearch}
        onSearchSubmit={handleSearchSubmit}
        handleSellClick={handleSellClick}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        logout={logout}
        closeChat={closeChat}
        navigate={navigate}
      />

      <main className="container-fluid px-lg-5 py-4">
        {/* Breadcrumb Navigation */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <Link
            to="/"
            className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-1.5 text-muted px-3 py-1.5"
            style={{ textDecoration: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            <span className="fw-semibold">Back to Marketplace</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            {item.status && item.status !== 'approved' && (
              <span className={`unimart-pending-timer-badge status-badge-${item.status}`}>
                <span className={`material-symbols-outlined ${item.status === 'pending' ? 'unimart-timer-pulse' : ''}`} style={{ fontSize: '15px' }}>
                  {item.status === 'pending' ? 'schedule' : item.status === 'sold' ? 'sell' : 'cancel'}
                </span>
                <span className="fw-semibold">
                  {item.status === 'pending' ? 'Waiting for Approval' : item.status === 'sold' ? 'Sold' : 'Rejected'}
                </span>
              </span>
            )}
            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
              Verified Student Exchange
            </span>
          </div>
        </div>

        {/* Toast Alert */}
        {toastAlert && (
          <div className={`unimart-admin-toast ${toastAlert.type === 'danger' ? 'toast-danger' : 'toast-success'} mb-4`} role="alert">
            <div className="d-flex align-items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {toastAlert.type === 'danger' ? 'error' : 'check_circle'}
              </span>
              <span className="fw-semibold small">{toastAlert.text}</span>
              <button
                type="button"
                className="btn-close ms-auto"
                style={{ fontSize: '0.7rem' }}
                onClick={() => setToastAlert(null)}
                aria-label="Dismiss alert"
              ></button>
            </div>
          </div>
        )}

        {/* Detail Layout Grid */}
        <div className="row g-4 mb-5">
          {/* Photo Gallery (Left Column) */}
          <div className="col-12 col-lg-6">
            <div className={`unimart-product-card ${themeClass}`} style={{ cursor: 'default' }}>
              <div className="unimart-card-inner" style={{ cursor: 'default' }}>
                <div className={`unimart-card-placeholder-wrap ${themeClass}`} style={{ minHeight: '360px', height: 'auto', maxHeight: '520px' }}>
                  <img
                    src={currentImg}
                    alt={item.title}
                    className="unimart-card-image"
                    style={{ position: 'relative', width: '100%', height: '360px', objectFit: 'contain', background: '#f8fafc' }}
                  />
                  <div className="unimart-category-translucent-tint"></div>
                  <div className="unimart-card-glow-border"></div>

                  <span className="unimart-condition-badge">{item.condition}</span>

                  <button
                    type="button"
                    className="unimart-wishlist-btn"
                    title="Add to wishlist"
                    onClick={handleWishlistClick}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      favorite_border
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnails row if multiple photos */}
            {photosList.length > 1 && (
              <div className="d-flex gap-2.5 mt-3 flex-wrap">
                {photosList.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className="btn p-0 border rounded-3 overflow-hidden"
                    style={{
                      width: '74px',
                      height: '74px',
                      borderColor: activePhotoIdx === idx ? 'var(--unimart-maroon)' : '#cbd5e1',
                      borderWidth: activePhotoIdx === idx ? '2.5px' : '1px'
                    }}
                    title={`View photo ${idx + 1}`}
                  >
                    <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions (Right Column) */}
          <div className="col-12 col-lg-6">
            <div className="bg-white rounded-4 p-4 p-lg-4 border shadow-sm h-100 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="unimart-card-category" style={{ fontSize: '0.85rem' }}>
                  {item.category}{subcategoryName ? ` • ${subcategoryName}` : ''}
                </span>
                <span className="unimart-badge-chip">
                  {item.badge || 'Verified'}
                </span>
              </div>

              <h2 className="fw-bolder mb-2" style={{ letterSpacing: '-0.02em', color: 'var(--unimart-text-dark)' }}>
                {item.title}
              </h2>

              {/* Price row */}
              <div className="d-flex align-items-baseline gap-2 mb-3 flex-wrap">
                <span className="unimart-current-price" style={{ fontSize: '1.85rem' }}>
                  {item.price === 0 ? 'Free' : `₹${item.price.toLocaleString('en-IN')}`}
                </span>
                {hasDiscount && (
                  <span className="unimart-orig-price" style={{ fontSize: '1.1rem' }}>
                    ₹{item.origPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && discountPct > 0 && (
                  <span className="unimart-discount-tag" style={{ fontSize: '0.82rem', padding: '0.2rem 0.6rem' }}>
                    {discountPct}% OFF
                  </span>
                )}
                {item.isNegotiable && (
                  <span className="badge bg-light text-dark border ms-1">Negotiable</span>
                )}
              </div>

              {/* Key metadata pills */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                <div className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1.5 fw-medium">
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>person</span>
                  <span>Seller: <strong>{getDisplaySellerName(item, user)}</strong></span>
                </div>

                <div className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1.5 fw-medium">
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>location_on</span>
                  <span>Meetup: <strong>{item.notes || item.meetupSpot || 'Library Entrance'}</strong></span>
                </div>

                <div className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1.5 fw-medium">
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>verified_user</span>
                  <span>Condition: <strong>{item.condition}</strong></span>
                </div>

                {(item.hasNotes || item.has_notes) && (
                  <div className="badge border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1.5 fw-medium" style={{ background: 'var(--unimart-maroon-subtle)', color: 'var(--unimart-maroon)', borderColor: 'var(--unimart-maroon-border)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span>
                    <span>Includes Course Notes / Highlights</span>
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div className="mb-4">
                <h6 className="fw-bold small text-muted text-uppercase mb-2">Item Description</h6>
                <div className="p-3 bg-light rounded-3 text-secondary" style={{ lineHeight: '1.65', fontSize: '0.92rem', minHeight: '90px' }}>
                  {item.description || 'No additional details provided. Meetup available at designated campus spot.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-3 mt-auto pt-3 border-top flex-wrap">
                {isOwner && (
                  <button
                    type="button"
                    className="btn btn-outline-dark rounded-pill px-4 py-2 d-inline-flex align-items-center gap-1.5 fw-semibold"
                    onClick={handleToggleSold}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {item.status === 'sold' ? 'published_with_changes' : 'sell'}
                    </span>
                    <span>{item.status === 'sold' ? 'Mark as Available' : 'Mark as Sold'}</span>
                  </button>
                )}

                {!isOwner && (
                  <button
                    type="button"
                    className="unimart-sell-btn py-2 px-4 justify-content-center"
                    onClick={handleChatClick}
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
                    <span>Chat with Seller</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4 py-2 d-inline-flex align-items-center gap-1.5 fw-semibold"
                  onClick={handleWishlistClick}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>favorite_border</span>
                  <span>Wishlist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="unimart-dash-footer">
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <span className="fw-bold">UNIMART</span> — The Peer-to-Peer College E-Commerce Platform.
          </div>
          <div className="d-flex gap-4">
            <Link to="/" className="text-muted small text-decoration-none">Marketplace Catalog</Link>
            <span className="text-muted small">Campus Meetup Safety</span>
            <span className="text-muted small">Student Maker Guidelines</span>
          </div>
        </div>
      </footer>

      <ChatModal />
      <FloatingChatButton />
    </div>
  );
}
