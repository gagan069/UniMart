import React from 'react';

/**
 * Reusable Pagination Component (25 items per page)
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 25,
  onPageChange,
  itemLabel = 'items',
  targetScrollId = null
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageSelect = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    if (onPageChange) onPageChange(page);

    if (targetScrollId) {
      const el = document.getElementById(targetScrollId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Generate page numbers array with ellipsis for larger sets
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="unimart-pagination-container d-flex align-items-center justify-content-between flex-wrap gap-3 py-3 px-2">
      <div className="unimart-pagination-info text-muted small">
        Showing <span className="fw-bold text-body">{startItem}</span> to{' '}
        <span className="fw-bold text-body">{endItem}</span> of{' '}
        <span className="fw-bold text-body">{totalItems}</span> {itemLabel}
        {totalPages > 1 && (
          <span className="ms-1.5 opacity-75">
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>

      <div className="unimart-pagination-controls d-flex align-items-center gap-1.5" role="navigation" aria-label="Pagination Navigation">
        {/* Previous Page Button */}
        <button
          type="button"
          className="unimart-page-nav-btn prev-btn"
          disabled={currentPage <= 1}
          onClick={() => handlePageSelect(currentPage - 1)}
          aria-label="Previous page"
          title="Go to previous page"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
          <span className="d-none d-sm-inline">Previous</span>
        </button>

        {/* Page Number Buttons */}
        <div className="d-flex align-items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="unimart-page-ellipsis px-1.5 text-muted">
                  …
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                className={`unimart-page-number-btn ${isCurrent ? 'active' : ''}`}
                onClick={() => handlePageSelect(p)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          className="unimart-page-nav-btn next-btn"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageSelect(currentPage + 1)}
          aria-label="Next page"
          title="Go to next page"
        >
          <span className="d-none d-sm-inline">Next</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
        </button>
      </div>
    </div>
  );
}
