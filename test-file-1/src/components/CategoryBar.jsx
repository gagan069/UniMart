import React, { useRef, useEffect, useState } from 'react';

export default function CategoryBar({
  searchQuery,
  setSearchQuery,
  categoryDefs,
  selectedCategory,
  setSelectedCategory,
  getCategoryCount,
  pendingCount,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  conditionFilter,
  setConditionFilter,
  sortBy,
  setSortBy,
  onClearFilters
}) {
  const pillsRef = useRef(null);
  const filterWrapRef = useRef(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  useEffect(() => {
    const el = pillsRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScrollLeft = scrollWidth - clientWidth;
      const canScrollLeft = scrollLeft > 1;
      const canScrollRight = scrollLeft < maxScrollLeft - 1;

      const scrollingRight = e.deltaY > 0;
      const scrollingLeft = e.deltaY < 0;

      // Only prevent default scroll when row can still move in that direction
      if ((scrollingRight && canScrollRight) || (scrollingLeft && canScrollLeft)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
      // At either end, let the wheel scroll the page naturally
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!isFilterDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterDropdownOpen]);

  // Compute active filters count (excluding category and search, which have their own pills)
  const activeFiltersCount = [
    Boolean(minPrice && minPrice.trim() !== ''),
    Boolean(maxPrice && maxPrice.trim() !== ''),
    Boolean(conditionFilter && conditionFilter !== '' && conditionFilter !== 'All'),
    Boolean(sortBy && sortBy !== 'newest')
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <>
      {/* Responsive Mobile Search Bar */}
      <div className="unimart-mobile-search-bar d-md-none px-3 py-2 bg-white border-bottom">
        <div className="unimart-search-bar w-100">
          <span className="material-symbols-outlined text-muted me-2" style={{ fontSize: '20px' }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search textbooks, crafts, tech..."
            className="unimart-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search marketplace products"
          />
          {searchQuery && (
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-0 me-1 d-flex align-items-center"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              style={{ textDecoration: 'none' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Filters Subnav */}
      <div className="unimart-subnav">
        <div className="unimart-subnav-row">
          <div ref={pillsRef} className="unimart-cat-pills" role="tablist" aria-label="Category Filters">
            {categoryDefs.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`unimart-pill-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                  <span className="unimart-tab-count-tag">{getCategoryCount(cat.key)}</span>
                </button>
              );
            })}

            {pendingCount > 0 && (
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'Pending'}
                className={`unimart-pill-tab unimart-pill-pending ${selectedCategory === 'Pending' ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === 'Pending' ? 'All' : 'Pending')}
                title="View items waiting to be approved"
              >
                <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '18px', color: '#d97706' }}>
                  schedule
                </span>
                <span>Waiting Approval</span>
                <span className="unimart-tab-count-tag count-pending">{pendingCount}</span>
              </button>
            )}
          </div>

          {/* Compact Filters Pill & Dropdown */}
          <div className="unimart-filter-wrap" ref={filterWrapRef}>
            <button
              type="button"
              className={`unimart-pill-tab unimart-pill-filters ${hasActiveFilters ? 'active' : ''}`}
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              aria-expanded={isFilterDropdownOpen}
              aria-label="Filter and Sort Marketplace"
              title="Filter by price, condition, or sort order"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                tune
              </span>
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="unimart-tab-count-tag count-active-filter">{activeFiltersCount}</span>
              )}
            </button>

            {isFilterDropdownOpen && (
              <div className="unimart-filters-dropdown-menu" role="dialog" aria-label="Catalog Filters">
                <div className="unimart-filters-dropdown-header">
                  <span className="fw-bold small d-flex align-items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--unimart-maroon)' }}>tune</span>
                    Filter & Sort
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger text-decoration-none p-0 small fw-semibold"
                      onClick={() => {
                        if (setMinPrice) setMinPrice('');
                        if (setMaxPrice) setMaxPrice('');
                        if (setConditionFilter) setConditionFilter('');
                        if (setSortBy) setSortBy('newest');
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="unimart-filters-dropdown-body">
                  {/* Sort Order */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-muted mb-1" htmlFor="subnav-filter-sort">
                      Sort by
                    </label>
                    <select
                      id="subnav-filter-sort"
                      className="form-select form-select-sm rounded-3"
                      value={sortBy || 'newest'}
                      onChange={(e) => setSortBy && setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest first</option>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-muted mb-1">
                      Price Range (₹)
                    </label>
                    <div className="d-flex align-items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min ₹"
                        className="form-control form-control-sm rounded-3"
                        value={minPrice || ''}
                        onChange={(e) => setMinPrice && setMinPrice(e.target.value)}
                        aria-label="Minimum price in rupees"
                      />
                      <span className="text-muted small px-1">—</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max ₹"
                        className="form-control form-control-sm rounded-3"
                        value={maxPrice || ''}
                        onChange={(e) => setMaxPrice && setMaxPrice(e.target.value)}
                        aria-label="Maximum price in rupees"
                      />
                    </div>
                  </div>

                  {/* Condition Filter */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-muted mb-1" htmlFor="subnav-filter-condition">
                      Condition
                    </label>
                    <select
                      id="subnav-filter-condition"
                      className="form-select form-select-sm rounded-3"
                      value={conditionFilter || ''}
                      onChange={(e) => setConditionFilter && setConditionFilter(e.target.value)}
                    >
                      <option value="">All Conditions</option>
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="For Parts">For Parts</option>
                    </select>
                  </div>
                </div>

                <div className="unimart-filters-dropdown-footer d-flex justify-content-between align-items-center mt-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-pill px-3 fw-semibold text-muted"
                    onClick={() => {
                      if (setMinPrice) setMinPrice('');
                      if (setMaxPrice) setMaxPrice('');
                      if (setConditionFilter) setConditionFilter('');
                      if (setSortBy) setSortBy('newest');
                    }}
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                    style={{ background: 'var(--unimart-maroon)', borderColor: 'var(--unimart-maroon)' }}
                    onClick={() => setIsFilterDropdownOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
