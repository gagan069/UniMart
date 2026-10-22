import React from 'react';

export default function CategoryBar({
  searchQuery,
  setSearchQuery,
  categoryDefs,
  selectedCategory,
  setSelectedCategory,
  getCategoryCount,
  pendingCount
}) {
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

      {/* Category Pills Subnav */}
      <div className="unimart-subnav">
        <div className="unimart-cat-pills" role="tablist" aria-label="Category Filters">
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
      </div>
    </>
  );
}
