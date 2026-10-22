import React from 'react';

/**
 * Standard UNIMART toast alert component.
 * Types:
 * - success: green with check_circle icon
 * - warning: amber with schedule/warning icon
 * - error / danger: red with error icon
 * - info: neutral with info icon
 */
export default function ToastAlert({ toast, onClose, className = 'mb-4' }) {
  if (!toast) return null;

  const type = toast.type === 'danger' ? 'error' : (toast.type || 'info');
  const typeClass =
    type === 'success'
      ? 'toast-success'
      : type === 'warning'
      ? 'toast-warning'
      : type === 'error'
      ? 'toast-error'
      : 'toast-info';

  const defaultIcon =
    type === 'success'
      ? 'check_circle'
      : type === 'warning'
      ? 'schedule'
      : type === 'error'
      ? 'error'
      : 'info';

  const icon = toast.icon || defaultIcon;

  return (
    <div className={`unimart-admin-toast ${typeClass} ${className}`} role="alert">
      <div className="d-flex align-items-center gap-2">
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          {icon}
        </span>
        <span className="fw-semibold small">{toast.text}</span>
        {onClose && (
          <button
            type="button"
            className="btn-close ms-auto"
            style={{ fontSize: '0.7rem' }}
            onClick={onClose}
            aria-label="Close"
          />
        )}
      </div>
    </div>
  );
}
