import React from 'react';
import ListingCard from './ListingCard.jsx';

export default function ListingGrid({
  filteredProducts,
  catalogTab,
  setCatalogTab,
  myListingsCount,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  conditionFilter,
  setConditionFilter,
  sortBy,
  setSortBy,
  onClearAll,
  listingsStatus,
  listingsError,
  onRetry,
  categories,
  user,
  handleGoToLogin,
  handleSellClick,
  cardPhotoIndex,
  handlePrevPhoto,
  handleNextPhoto,
  setCardPhotoIndex,
  handleWishlistClick,
  handleChatClick,
  handleBuyClick,
  handleEditListingClick,
  handleDeleteListingClick,
  onToggleSoldClick
}) {
  const hasMin = minPrice !== undefined && String(minPrice).trim() !== '';
  const hasMax = maxPrice !== undefined && String(maxPrice).trim() !== '';
  const hasPrice = hasMin || hasMax;
  const hasCondition = conditionFilter && conditionFilter !== '' && conditionFilter !== 'All';
  const hasSort = sortBy && sortBy !== 'newest';
  const hasCategory = selectedCategory && selectedCategory !== 'All';
  const hasSearch = searchQuery && searchQuery.trim() !== '';

  const hasAnyFilter = hasCategory || hasSearch || hasPrice || hasCondition || hasSort;

  return (
    <>
      {/* ================= FEATURED PRODUCTS SECTION (DYNAMIC FILTERING) ================= */}
      <div id="marketplace-catalog" className="unimart-section-header">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <h3 className="unimart-section-title mb-0">
                <span>Marketplace Catalog</span>
                {listingsStatus !== 'loading' && (
                  <span className="badge rounded-pill bg-light text-muted border fs-6 fw-semibold ms-2">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Available
                  </span>
                )}
              </h3>
            </div>

            {/* Catalog Scope Tabs: [ All Listings ] [ My Listings (count) ] */}
            <div className="d-flex align-items-center gap-2 mt-3" role="tablist" aria-label="Catalog Scope">
              <button
                type="button"
                role="tab"
                aria-selected={catalogTab === 'all'}
                className={`unimart-pill-tab ${catalogTab === 'all' ? 'active' : ''}`}
                onClick={() => setCatalogTab('all')}
                id="tab-all-listings"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>apps</span>
                <span>All Listings</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={catalogTab === 'my'}
                className={`unimart-pill-tab ${catalogTab === 'my' ? 'active' : ''}`}
                onClick={() => {
                  if (!user) {
                    handleGoToLogin();
                    return;
                  }
                  setCatalogTab('my');
                }}
                id="tab-my-listings"
                title={!user ? "Sign in to view your listings" : "View your active listings"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                <span>My Listings</span>
                <span className="unimart-tab-count-tag">{myListingsCount}</span>
              </button>
            </div>
          </div>

          {/* Active filter tags */}
          {hasAnyFilter && (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {hasCategory && (
                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                  <span className="text-muted small">Category:</span>
                  <strong>
                    {categories.find((c) => c.id === selectedCategory)?.name ||
                      (selectedCategory === 'Pending' ? 'Waiting Approval' : selectedCategory)}
                  </strong>
                  <button
                    type="button"
                    className="btn-close ms-1"
                    style={{ fontSize: '0.65rem' }}
                    aria-label="Remove category filter"
                    onClick={() => setSelectedCategory('All')}
                  />
                </span>
              )}

              {hasSearch && (
                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                  <span className="text-muted small">Search:</span>
                  <strong>"{searchQuery}"</strong>
                  <button
                    type="button"
                    className="btn-close ms-1"
                    style={{ fontSize: '0.65rem' }}
                    aria-label="Clear search filter"
                    onClick={() => setSearchQuery('')}
                  />
                </span>
              )}

              {hasPrice && (
                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                  <span className="text-muted small">Price:</span>
                  <strong>
                    {hasMin && hasMax
                      ? `₹${minPrice} — ₹${maxPrice}`
                      : hasMin
                      ? `≥ ₹${minPrice}`
                      : `≤ ₹${maxPrice}`}
                  </strong>
                  <button
                    type="button"
                    className="btn-close ms-1"
                    style={{ fontSize: '0.65rem' }}
                    aria-label="Remove price filter"
                    onClick={() => {
                      if (setMinPrice) setMinPrice('');
                      if (setMaxPrice) setMaxPrice('');
                    }}
                  />
                </span>
              )}

              {hasCondition && (
                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                  <span className="text-muted small">Condition:</span>
                  <strong>{conditionFilter}</strong>
                  <button
                    type="button"
                    className="btn-close ms-1"
                    style={{ fontSize: '0.65rem' }}
                    aria-label="Remove condition filter"
                    onClick={() => setConditionFilter && setConditionFilter('')}
                  />
                </span>
              )}

              {hasSort && (
                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                  <span className="text-muted small">Sort:</span>
                  <strong>{sortBy === 'price_asc' ? 'Price: Low → High' : 'Price: High → Low'}</strong>
                  <button
                    type="button"
                    className="btn-close ms-1"
                    style={{ fontSize: '0.65rem' }}
                    aria-label="Reset sort order"
                    onClick={() => setSortBy && setSortBy('newest')}
                  />
                </span>
              )}

              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-danger fw-semibold p-0 ms-1"
                onClick={onClearAll}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading state: Faded placeholder cards matching real card size */}
      {listingsStatus === 'loading' ? (
        <div className="unimart-products-grid" aria-busy="true" aria-label="Loading marketplace listings">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="unimart-product-card unimart-card-placeholder-skeleton">
              <div className="unimart-card-inner">
                <div className="unimart-card-top-content">
                  <div className="unimart-card-placeholder-wrap skeleton-box">
                    <div className="skeleton-shimmer"></div>
                  </div>
                  <div className="unimart-card-body p-3">
                    <div className="skeleton-line skeleton-title mb-2"></div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="skeleton-line skeleton-seller"></div>
                      <div className="skeleton-line skeleton-chat-btn"></div>
                    </div>
                    <div className="unimart-price-row mt-auto pt-2 d-flex justify-content-between align-items-center">
                      <div className="skeleton-line skeleton-price"></div>
                      <div className="skeleton-line skeleton-cart-btn"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : listingsStatus === 'failed' ? (
        /* Error state: existing empty-state box with Retry button */
        <div className="unimart-empty-state">
          <div className="unimart-empty-icon-box">
            <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--unimart-maroon)' }}>
              error_outline
            </span>
          </div>
          <h4 className="fw-bold mb-1">Failed to load listings</h4>
          <p className="text-muted small mb-3 text-center" style={{ maxWidth: '420px' }}>
            {listingsError || 'We could not load marketplace products. Please check your connection and try again.'}
          </p>
          <button
            type="button"
            className="btn btn-dark rounded-pill px-4 py-2 fw-semibold btn-sm d-inline-flex align-items-center gap-2"
            onClick={onRetry}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            <span>Retry</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty states */
        catalogTab === 'my' && myListingsCount === 0 ? (
          <div className="unimart-empty-state">
            <div className="unimart-empty-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--unimart-maroon)' }}>
                storefront
              </span>
            </div>
            <h4 className="fw-bold mb-1">You haven't listed anything yet</h4>
            <p className="text-muted small mb-3 text-center" style={{ maxWidth: '420px' }}>
              Share textbooks, handmade crafts, lab tools, or dorm essentials with fellow Chitkara students.
            </p>
            <button
              type="button"
              className="btn btn-dark rounded-pill px-4 py-2 fw-semibold btn-sm d-inline-flex align-items-center gap-2"
              onClick={handleSellClick}
              id="empty-state-sell-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
              <span>Sell an Item</span>
            </button>
          </div>
        ) : (
          <div className="unimart-empty-state">
            <div className="unimart-empty-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--unimart-maroon)' }}>
                search_off
              </span>
            </div>
            <h4 className="fw-bold mb-1">No Listings Found</h4>
            <p className="text-muted small mb-3 text-center" style={{ maxWidth: '420px' }}>
              {searchQuery.trim()
                ? `No products match "${searchQuery}" in ${selectedCategory === 'All' ? 'any category' : (categories.find((c) => c.id === selectedCategory)?.name || selectedCategory)}.`
                : `No products found matching the selected filters.`}
            </p>
            <button
              type="button"
              className="btn btn-dark rounded-pill px-4 py-2 fw-semibold btn-sm d-inline-flex align-items-center gap-2"
              onClick={onClearAll}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              <span>Reset All Filters</span>
            </button>
          </div>
        )
      ) : (
        /* Product Cards Grid */
        <div className="unimart-products-grid">
          {filteredProducts.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              user={user}
              catalogTab={catalogTab}
              photoIndex={cardPhotoIndex[item.id] || 0}
              onPrevPhoto={handlePrevPhoto}
              onNextPhoto={handleNextPhoto}
              onSelectPhoto={(id, idx) => setCardPhotoIndex((prev) => ({ ...prev, [id]: idx }))}
              onWishlistClick={handleWishlistClick}
              onChatClick={handleChatClick}
              onBuyClick={handleBuyClick}
              handleEditListingClick={handleEditListingClick}
              handleDeleteListingClick={handleDeleteListingClick}
              onToggleSoldClick={onToggleSoldClick}
            />
          ))}
        </div>
      )}
    </>
  );
}
