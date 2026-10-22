import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from './context/ThemeContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useChat } from './context/ChatContext.jsx';
import { canManageListing } from './lib/permissions.js';
import { categories } from './lib/categories.js';
import {
  fetchListings,
  updateListing as updateListingAction,
  deleteListing as deleteListingAction
} from './store/slices/listingsSlice.js';
import {
  selectVisibleListings,
  selectMyListings
} from './store/selectors.js';
import { useListingForm } from './hooks/useListingForm.js';
import { useToast } from './hooks/useToast.js';
import ToastAlert from './components/ToastAlert.jsx';

import {
  CONDITION_OPTIONS,
  MEETUP_OPTIONS,
  CATEGORY_THEME_MAP,
  resolveCategoryId,
  getDisplaySellerName,
  isUserListingOwner
} from './lib/constants.js';

import Navbar from './components/Navbar.jsx';
import CategoryBar from './components/CategoryBar.jsx';
import SpotlightCard from './components/SpotlightCard.jsx';
import ListingGrid from './components/ListingGrid.jsx';
import SellListingModal from './components/SellListingModal/SellListingModal.jsx';
import FloatingChatButton from './components/chat/FloatingChatButton.jsx';
import ChatModal from './components/chat/ChatModal.jsx';
import './Dashboard.css';

// Re-export constants and helpers for backward compatibility
export {
  CONDITION_OPTIONS,
  MEETUP_OPTIONS,
  CATEGORY_THEME_MAP,
  resolveCategoryId,
  getDisplaySellerName,
  isUserListingOwner
};

export default function Dashboard({ onGoToLogin }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth() || {};
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { openChatWithItem, closeChat } = useChat();

  const { toast: adminAlert, showToast: setAdminAlert, hideToast: hideAdminAlert } = useToast(3500);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const q = new URLSearchParams(window.location.search).get('q');
        if (q) return q;
      }
    } catch {
      // ignore
    }
    return '';
  });
  const [cardPhotoIndex, setCardPhotoIndex] = useState({});

  // Listings from Redux store using centralized selectors
  const visibleListings = useSelector(selectVisibleListings(user));
  const myListings = useSelector(selectMyListings(user?.id));
  const rawListings = useSelector((state) => state.listings.items) || [];

  // Form management via custom hook
  const listingForm = useListingForm({
    user,
    productList: rawListings,
    dispatch,
    setAdminAlert
  });

  const handleGoToLogin = () => {
    if (closeChat) closeChat();
    if (onGoToLogin) onGoToLogin();
  };

  // Fetch listings on mount and user change
  useEffect(() => {
    dispatch(fetchListings({ currentUser: user }));
  }, [dispatch, user]);

  // Listen for access denied redirect from /admin route
  useEffect(() => {
    if (location.state?.accessDeniedToast) {
      setAdminAlert({
        type: 'danger',
        text: location.state.accessDeniedToast
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Sync search query and sell modal triggers when navigating with URL params or router state
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q !== null && q !== undefined) {
        setSearchQuery((prev) => (prev !== q ? q : prev));
      }
      if (location.state?.openSell || params.get('sell') === 'true') {
        if (user) {
          listingForm.openSellModal();
        }
        window.history.replaceState({}, document.title, location.pathname + (q ? `?q=${encodeURIComponent(q)}` : ''));
      }
    } catch {
      // ignore
    }
  }, [location.search, location.state, location.pathname, user, listingForm]);

  const [catalogTab, setCatalogTab] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const t = new URLSearchParams(window.location.search).get('tab');
        if (t === 'my' || t === 'all') return t;
      }
    } catch {
      // ignore
    }
    return 'all';
  });

  // Revert to 'all' if user logs out while on 'my' tab
  useEffect(() => {
    if (!user && catalogTab === 'my') {
      setCatalogTab('all');
    }
  }, [user, catalogTab]);

  // Photo carousel navigation on individual cards
  const handlePrevPhoto = (e, itemId, totalPhotos) => {
    if (e) e.stopPropagation();
    setCardPhotoIndex((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + totalPhotos) % totalPhotos
    }));
  };

  const handleNextPhoto = (e, itemId, totalPhotos) => {
    if (e) e.stopPropagation();
    setCardPhotoIndex((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % totalPhotos
    }));
  };

  // Category filter definitions derived from categories.js
  const categoryDefs = [
    { key: 'All', name: 'All Categories', icon: 'apps' },
    ...categories.map((c) => ({
      key: c.id,
      name: c.name,
      icon: c.icon
    }))
  ];

  // Active pool of products scoped by catalog tab ('all' vs 'my')
  const activeScopedProducts = catalogTab === 'my' && user ? myListings : visibleListings;
  const myListingsCount = myListings.length;
  const pendingCount = activeScopedProducts.filter((item) => item.status === 'pending').length;

  const getCategoryCount = (key) => {
    if (key === 'All') return `${activeScopedProducts.length} items`;
    if (key === 'Pending') return `${pendingCount} items`;
    const count = activeScopedProducts.filter((item) => {
      const itemCatId = resolveCategoryId(item);
      const catObj = categories.find((c) => c.id === key);
      return itemCatId === key || item.category === key || (catObj && item.category === catObj.name);
    }).length;
    return `${count} items`;
  };

  // Dynamic product filtering by category and live search query
  const filteredProducts = activeScopedProducts.filter((item) => {
    const itemCatId = resolveCategoryId(item);
    const catObj = categories.find((c) => c.id === selectedCategory);
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Pending'
        ? item.status === 'pending'
        : itemCatId === selectedCategory ||
          item.category === selectedCategory ||
          (catObj && item.category === catObj.name);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesSearch =
      (item.title || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.seller || '').toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q)) ||
      (item.condition && item.condition.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleDeleteListingClick = (e, item) => {
    if (e) e.stopPropagation();
    if (!canManageListing(user, item)) return;

    const confirmed = window.confirm(`Delete '${item.title}'? This can't be undone.`);
    if (!confirmed) return;

    dispatch(deleteListingAction({ id: item.id, currentUser: user }));
    setAdminAlert({
      type: 'success',
      text: 'Listing deleted'
    });
    setTimeout(() => setAdminAlert(null), 3500);
  };

  const handleToggleSoldClick = (e, item) => {
    if (e) e.stopPropagation();
    if (!canManageListing(user, item)) return;
    const nextStatus = item.status === 'sold' ? 'approved' : 'sold';
    dispatch(
      updateListingAction({
        id: item.id,
        updates: { status: nextStatus },
        currentUser: user
      })
    );
    setAdminAlert({
      type: 'success',
      text: nextStatus === 'sold' ? `"${item.title}" marked as Sold.` : `"${item.title}" marked as Available.`
    });
    setTimeout(() => setAdminAlert(null), 3000);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to add items to your wishlist.'
      });
      return;
    }
    setAdminAlert({
      type: 'success',
      text: 'Wishlist feature will be available in Phase 6.'
    });
    setTimeout(() => setAdminAlert(null), 2500);
  };

  const handleChatClick = (e, item) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to chat with campus sellers.'
      });
      return;
    }
    if (isUserListingOwner(item, user)) {
      setAdminAlert({
        type: 'info',
        text: 'This is your own listing! You can manage it under "My Listings".'
      });
      return;
    }
    openChatWithItem(item);
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to buy items on UNIMART.'
      });
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === listingForm.formData.category_id);
  const isBooksCategory = selectedCategoryObj?.name === 'Books & Notes' || selectedCategoryObj?.id === 'books-notes';

  return (
    <div className="unimart-dashboard-wrap">
      {/* Top Navbar */}
      <Navbar
        handleGoToLogin={handleGoToLogin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSellClick={listingForm.openSellModal}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        logout={logout}
        closeChat={closeChat}
        navigate={navigate}
      />

      {/* Subnav & Mobile Search */}
      <CategoryBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryDefs={categoryDefs}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        getCategoryCount={getCategoryCount}
        pendingCount={pendingCount}
      />

      {/* Main Dashboard Body */}
      <main className="container-fluid px-lg-5 py-4">
        {/* Welcome Banner */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <div className="d-inline-flex align-items-center gap-1 text-muted small fw-semibold mb-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--unimart-maroon)' }}>verified</span>
              <span>Chitkara Campus Student Exchange</span>
            </div>
            <h2 className="fw-bolder mb-1" style={{ letterSpacing: '-0.025em' }}>
              {user ? `Hi ${user.name ? user.name.split(' ')[0] : 'there'}!` : 'Hi Guest!'} What are you looking for today?
            </h2>
            <p className="text-muted mb-0">
              Explore pre-owned textbooks, handmade crafts, campus tech tools, and student-crafted products.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
              Verified Campus Exchange
            </span>
          </div>
        </div>

        {/* Hero Spotlight Cards */}
        <div className="unimart-hero-grid">
          <SpotlightCard
            colorClass="card-lime-yellow"
            categoryKey="books-notes"
            icon="menu_book"
            tagName="Books & Notes"
            serifTitle="Pre-owned books"
            subtitle="Course textbooks & verified notes starting at just ₹250"
            collectionLabel="Academic Collection"
            artIcon="📚"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <SpotlightCard
            colorClass="card-soft-pink"
            categoryKey="handmade-art"
            icon="palette"
            tagName="Handmade & Art"
            serifTitle="Best of student art"
            subtitle="Canvases, Posters, Crochet & Tote bags from ₹199"
            collectionLabel="Art Collections"
            artIcon="🎨"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <SpotlightCard
            colorClass="card-sky-blue"
            categoryKey="lab-engineering-gear"
            icon="precision_manufacturing"
            tagName="Lab & Engineering"
            serifTitle="Tech & Engineering tools"
            subtitle="Calculators, robotics kits & lab equipment from ₹450"
            collectionLabel="Lab & Tech Collection"
            artIcon="⚙️"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Admin Toast Alert */}
        <ToastAlert toast={adminAlert} onClose={hideAdminAlert} />

        {/* Catalog & Product Grid */}
        <ListingGrid
          filteredProducts={filteredProducts}
          catalogTab={catalogTab}
          setCatalogTab={setCatalogTab}
          myListingsCount={myListingsCount}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          user={user}
          handleGoToLogin={handleGoToLogin}
          handleSellClick={listingForm.openSellModal}
          cardPhotoIndex={cardPhotoIndex}
          handlePrevPhoto={handlePrevPhoto}
          handleNextPhoto={handleNextPhoto}
          setCardPhotoIndex={setCardPhotoIndex}
          handleWishlistClick={handleWishlistClick}
          handleChatClick={handleChatClick}
          handleBuyClick={handleBuyClick}
          handleEditListingClick={listingForm.handleEditListingClick}
          handleDeleteListingClick={handleDeleteListingClick}
          onToggleSoldClick={handleToggleSoldClick}
        />

        {/* Sell CTA Banner */}
        <div className="rounded-4 p-4 p-lg-5 mb-5 text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--unimart-maroon) 0%, var(--unimart-maroon-dark) 100%)' }}>
          <div className="row align-items-center">
            <div className="col-12 col-lg-8">
              <span className="badge bg-white text-dark mb-2 px-3 py-1 fw-bold rounded-pill">
                Earn Extra Cash on Campus • Direct UPI / Cash 💸
              </span>
              <h2 className="fw-bold mb-2">Have Finished Textbooks or Create Handmade Crafts?</h2>
              <p className="mb-4 text-white-50" style={{ maxWidth: '640px' }}>
                Listing an item takes under 120 seconds. Connect directly with students from Chitkara for safe on-campus meetups at the library or square 1.
              </p>
              <button 
                type="button" 
                className="btn btn-light rounded-pill px-4 py-2 fw-bold text-dark d-inline-flex align-items-center gap-2"
                onClick={listingForm.openSellModal}
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span>Sell on Campus</span>
              </button>
            </div>
            <div className="col-12 col-lg-4 text-center mt-4 mt-lg-0">
              <span style={{ fontSize: '6.5rem', opacity: '0.9' }}>✨🎓</span>
            </div>
          </div>
        </div>
      </main>

      {/* Sell Item Modal */}
      <SellListingModal
        isOpen={listingForm.isSellModalOpen}
        onClose={listingForm.closeSellModal}
        isEditing={listingForm.isEditing}
        currentStep={listingForm.currentStep}
        setCurrentStep={listingForm.setCurrentStep}
        isPublishedSuccess={listingForm.isPublishedSuccess}
        setIsPublishedSuccess={listingForm.setIsPublishedSuccess}
        editResultType={listingForm.editResultType}
        formData={listingForm.formData}
        setFormData={listingForm.setFormData}
        formErrors={listingForm.formErrors}
        categories={categories}
        selectedCategoryObj={selectedCategoryObj}
        isBooksCategory={isBooksCategory}
        handleFieldChange={listingForm.handleFieldChange}
        handleCategoryChange={listingForm.handleCategoryChange}
        handleBlur={listingForm.handleBlur}
        handleNextStep={listingForm.handleNextStep}
        conditionDropdownRef={listingForm.conditionDropdownRef}
        isConditionOpen={listingForm.isConditionOpen}
        setIsConditionOpen={listingForm.setIsConditionOpen}
        handleSelectCondition={listingForm.handleSelectCondition}
        handleMeetupChange={listingForm.handleMeetupChange}
        resetForm={listingForm.resetForm}
        fileInputRef={listingForm.fileInputRef}
        handlePhotoFiles={listingForm.handlePhotoFiles}
        isDragging={listingForm.isDragging}
        setIsDragging={listingForm.setIsDragging}
        handleAddSamplePhoto={listingForm.handleAddSamplePhoto}
        handleMovePhoto={listingForm.handleMovePhoto}
        handleRemovePhoto={listingForm.handleRemovePhoto}
        handlePublishListing={listingForm.handlePublishListing}
      />

      {/* Footer */}
      <footer className="unimart-dash-footer">
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <span className="fw-bold">UNIMART</span> — The Peer-to-Peer College E-Commerce Platform.
          </div>
          <div className="d-flex gap-4">
            <button type="button" className="btn btn-link p-0 text-muted small text-decoration-none" onClick={handleGoToLogin}>
              View Onboarding / Login
            </button>
            <span className="text-muted small">Campus Meetup Safety</span>
            <span className="text-muted small">Student Maker Guidelines</span>
          </div>
        </div>
      </footer>

      {/* Real-time Campus Marketplace Chat */}
      <ChatModal />
      {/* Hide FloatingChatButton while Sell modal is open so it doesn't obstruct or show above backdrop */}
      {!listingForm.isSellModalOpen && <FloatingChatButton />}
    </div>
  );
}
