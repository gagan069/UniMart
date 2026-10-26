import React, { useState } from 'react';
import ListingCard from './ListingCard.jsx';
import Pagination from './Pagination.jsx';

export default function ListingGrid({
  filteredProducts,
  catalogTab,
  setCatalogTab,
  myListingsCount,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  // Reset to page 1 whenever category, search, or tab changes (render-phase state adjustment)
  const [prevFilterKey, setPrevFilterKey] = useState(
    () => `${selectedCategory || ''}__${searchQuery || ''}__${catalogTab || ''}`
  );
  const currentFilterKey = `${selectedCategory || ''}__${searchQuery || ''}__${catalogTab || ''}`;
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      {/* ================= FEATURED PRODUCTS SECTION (DYNAMIC FILTERING) ================= */}
      <div id="marketplace-catalog" className="unimart-section-header">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <h3 className="unimart-section-title mb-0">
                <span>Marketplace Catalog</span>
                <span className="badge rounded-pill bg-light text-muted border fs-6 fw-semibold">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Available
                </span>
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
          {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {selectedCategory !== 'All' && (
                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                  <span className="text-muted small">Category:</span>
                  <strong>{categories.find((c) => c.id === selectedCategory)?.name || (selectedCategory === 'Pending' ? 'Waiting Approval' : selectedCategory)}</strong>
                  <button
                    type="button"
                    className="btn-close ms-1"
                    style={{ fontSize: '0.65rem' }}
                    aria-label="Remove category filter"
                    onClick={() => setSelectedCategory('All')}
                  />
                </span>
              )}
              {searchQuery.trim() !== '' && (
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
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-danger fw-semibold p-0 ms-1"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Cards Grid or Empty State */}
      {filteredProducts.length === 0 ? (
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
                : `No products available currently in "${categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}".`}
            </p>
            <button
              type="button"
              className="btn btn-dark rounded-pill px-4 py-2 fw-semibold btn-sm d-inline-flex align-items-center gap-2"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              <span>Reset All Filters</span>
            </button>
          </div>
        )
      ) : (
        <>
          <div className="unimart-products-grid">
            {paginatedProducts.map((item) => (
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
                onEditListingClick={handleEditListingClick}
                onDeleteListingClick={handleDeleteListingClick}
                onToggleSoldClick={onToggleSoldClick}
              />
            ))}
          </div>

          {/* Pagination Controls (25 items per page) */}
          <Pagination
            currentPage={activePage}
            totalItems={filteredProducts.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemLabel="products"
            targetScrollId="marketplace-catalog"
          />
        </>
      )}
    </>
  );
}
