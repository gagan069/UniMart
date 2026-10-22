import React, { useEffect } from 'react';

/**
 * Reusable modal for admin confirmation actions (Approve, Reject, Remove).
 * Styled consistently with the existing UNIMART sell modal.
 */
export default function AdminConfirmModal({
  isOpen,
  type, // 'approve' | 'reject' | 'remove'
  item,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !item) return null;

  const isEdit = Boolean(item.hasPendingEdit);

  let icon = 'check_circle';
  let iconBg = '#ecfdf5';
  let iconColor = '#059669';
  let title = 'Approve Listing';
  let message = `Approve "${item.title}"? It will go live immediately on the campus marketplace.`;
  let confirmBtnText = 'Approve Listing';
  let confirmBtnClass = 'btn-success';

  if (type === 'approve') {
    if (isEdit) {
      title = 'Approve Proposed Edits';
      message = `Apply proposed updates to "${item.title}"? The live listing will be updated immediately.`;
      confirmBtnText = 'Apply & Approve';
    } else {
      title = 'Approve New Listing';
      confirmBtnText = 'Approve & Publish';
    }
  } else if (type === 'reject') {
    icon = isEdit ? 'rule' : 'cancel';
    iconBg = '#fffbeb';
    iconColor = '#d97706';
    if (isEdit) {
      title = 'Reject Proposed Edits';
      message = `Reject pending edits for "${item.title}"? The live listing will remain untouched with its existing details.`;
      confirmBtnText = 'Reject Edits';
      confirmBtnClass = 'btn-warning text-dark';
    } else {
      title = 'Reject New Listing';
      message = `Reject "${item.title}"? The owner will see it as Rejected in My Listings and can edit it to resubmit.`;
      confirmBtnText = 'Reject Listing';
      confirmBtnClass = 'btn-warning text-dark';
    }
  } else if (type === 'remove') {
    icon = 'delete';
    iconBg = '#fee2e2';
    iconColor = '#dc2626';
    title = 'Delete Listing';
    message = `Are you sure you want to permanently delete "${item.title}"? This cannot be undone.`;
    confirmBtnText = 'Delete Listing';
    confirmBtnClass = 'btn-danger';
  }

  return (
    <div
      className="unimart-sell-modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
    >
      <div
        className="unimart-sell-modal-box"
        style={{ maxWidth: '440px', padding: '2rem 1.85rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{ width: '46px', height: '46px', background: iconBg, color: iconColor }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              {icon}
            </span>
          </div>
          <button
            type="button"
            className="unimart-close-btn"
            onClick={onCancel}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <h5 id="admin-confirm-title" className="fw-bold mb-2">
          {title}
        </h5>
        <p className="text-muted small mb-4" style={{ lineHeight: '1.5' }}>
          {message}
        </p>

        <div className="d-flex align-items-center justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3.5 py-1.5"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-sm ${confirmBtnClass} rounded-pill px-4 py-1.5 fw-semibold shadow-sm`}
            onClick={() => onConfirm(item)}
            id="admin-modal-confirm-btn"
          >
            {confirmBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}
