import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useListings } from '../context/ListingsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { isAdmin } from '../lib/permissions.js';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const { productList, removeListing, approveListing, rejectListing } = useListings();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const pendingListings = productList.filter((item) => item.status === 'pending');

  const filteredListings = productList.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.seller && item.seller.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.condition && item.condition.toLowerCase().includes(q))
    );
  });

  const totalMarketValue = productList
    .filter((item) => item.status !== 'pending')
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const handleApprove = (item) => {
    approveListing(item.id);
    setToastMessage(`Listing "${item.title}" approved and live in catalog!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleReject = (item) => {
    const isEdit = item.pendingType === 'edit';
    const confirmed = window.confirm(
      isEdit
        ? `Reject pending edits for '${item.title}'? The listing will be restored to its previously approved version.`
        : `Reject and remove '${item.title}'?`
    );
    if (!confirmed) return;

    rejectListing(item.id);
    setToastMessage(
      isEdit
        ? `Pending edits for "${item.title}" rejected — listing restored to previous version`
        : `Listing "${item.title}" rejected`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRemove = (item) => {
    const confirmed = window.confirm(
      `Delete '${item.title}'? This can't be undone.`
    );
    if (!confirmed) return;

    removeListing(item.id);
    setToastMessage(`Listing deleted`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="unimart-admin-page py-4 px-3 px-lg-5">
      <div className="unimart-admin-container">
        
        {/* Top Navigation Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="unimart-logo-group cursor-pointer"
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              title="Return to Marketplace"
              style={{ cursor: 'pointer' }}
            >
              <div className="unimart-logo-badge" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                <span className="material-symbols-outlined text-white">admin_panel_settings</span>
              </div>
              <span className="fw-bold fs-5">UNIMART Admin</span>
            </div>
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill small fw-semibold">
              Admin Portal
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-dark rounded-pill px-3.5 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
              onClick={() => navigate('/')}
              id="return-to-marketplace-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
              <span>Return to Marketplace</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="alert alert-success d-flex align-items-center gap-2 rounded-4 shadow-sm py-2.5 px-3 mb-4" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
            <span className="fw-semibold small">{toastMessage}</span>
            <button
              type="button"
              className="btn-close ms-auto"
              style={{ fontSize: '0.7rem' }}
              onClick={() => setToastMessage(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Header Summary Banner */}
        <div className="unimart-admin-panel unimart-admin-header-panel">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <div className="d-inline-flex align-items-center gap-1.5 text-danger small fw-bold mb-1">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
                <span>Campus Marketplace Administration</span>
              </div>
              <h2 className="fw-bold mb-1">Admin Dashboard</h2>
              <p className="text-muted small mb-0">
                Logged in as <strong>{user?.name || 'Campus Admin'}</strong> ({user?.email || 'admin@chitkara.edu.in'}). You have full privileges to monitor and manage all active listings across campus.
              </p>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center justify-content-md-end gap-3 flex-wrap">
                <div className="unimart-stat-card stat-danger">
                  <div className="text-muted small fw-semibold" style={{ fontSize: '0.72rem' }}>TOTAL LISTINGS</div>
                  <div className="fs-4 fw-bold text-danger">{productList.length}</div>
                </div>
                <div className="unimart-stat-card stat-warning">
                  <div className="text-muted small fw-semibold" style={{ fontSize: '0.72rem' }}>PENDING APPROVAL</div>
                  <div className="fs-4 fw-bold text-warning">{pendingListings.length}</div>
                </div>
                <div className="unimart-stat-card stat-success">
                  <div className="text-muted small fw-semibold" style={{ fontSize: '0.72rem' }}>TOTAL VALUE</div>
                  <div className="fs-4 fw-bold text-success">₹{totalMarketValue.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PENDING APPROVALS SECTION ================= */}
        <div className="unimart-admin-panel unimart-admin-pending-panel" id="admin-pending-approvals-section">
          <div className="p-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2.5">
              <div className="unimart-pending-icon-bubble">
                <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '20px', color: '#d97706' }}>
                  schedule
                </span>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="fw-bold mb-0">Pending Approvals</h5>
                  <span className="badge rounded-pill bg-warning text-dark fw-bold px-2.5 py-1" style={{ fontSize: '0.75rem' }}>
                    {pendingListings.length} {pendingListings.length === 1 ? 'Request' : 'Requests'}
                  </span>
                </div>
                <span className="text-muted small">New submissions and edited listings awaiting campus admin review</span>
              </div>
            </div>
          </div>

          {pendingListings.length === 0 ? (
            <div className="text-center py-4 px-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                style={{ width: '48px', height: '48px', background: '#ecfdf5', color: '#059669' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>task_alt</span>
              </div>
              <h6 className="fw-bold mb-1">All Caught Up!</h6>
              <p className="text-muted small mb-0">
                There are currently no listings pending approval. New submissions and edited products will appear here.
              </p>
            </div>
          ) : (
            <div className="unimart-admin-table-responsive">
              <table className="table unimart-admin-table align-middle mb-0" id="admin-pending-table">
                <thead className="table-light text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  <tr>
                    <th scope="col" style={{ width: '90px' }} className="ps-4">Photo</th>
                    <th scope="col">Title & Category</th>
                    <th scope="col">Type</th>
                    <th scope="col">Seller</th>
                    <th scope="col">Price</th>
                    <th scope="col" className="text-end pe-4">Review Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingListings.map((item) => (
                    <tr key={item.id} className="unimart-pending-row">
                      <td className="ps-4 py-3 position-relative">
                        <img src={item.image} alt={item.title} className="unimart-admin-thumb" />
                        {item.photos && item.photos.length > 1 && (
                          <span className="badge bg-dark position-absolute bottom-0 start-0 ms-4 mb-2 rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.62rem' }}>
                            {item.photos.length} 📷
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold text-dark mb-0.5" style={{ fontSize: '0.92rem' }}>
                          {item.title}
                        </div>
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          <span className="badge bg-light text-dark border rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                            {item.category}
                          </span>
                          <span className="badge bg-light text-muted border rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                            {item.condition}
                          </span>
                          {item.notes && (
                            <span className="badge bg-light text-muted border rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              📍 {item.notes}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-muted small mt-1 text-truncate" style={{ maxWidth: '380px', fontSize: '0.78rem' }}>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {item.pendingType === 'edit' ? (
                          <span className="badge bg-warning bg-opacity-15 text-dark border border-warning rounded-pill px-2.5 py-1 small fw-semibold d-inline-flex align-items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>edit</span>
                            <span>Student Edit</span>
                          </span>
                        ) : (
                          <span className="badge bg-info bg-opacity-15 text-primary border border-info rounded-pill px-2.5 py-1 small fw-semibold d-inline-flex align-items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add_circle</span>
                            <span>New Listing</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: '0.84rem' }}>{item.seller}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>ID: {item.seller_id || 'N/A'}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-success rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1 shadow-sm"
                            style={{ fontSize: '0.78rem', fontWeight: 600 }}
                            onClick={() => handleApprove(item)}
                            title={`Approve ${item.title}`}
                            id={`admin-approve-btn-${item.id}`}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1.5 d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => handleReject(item)}
                            title={`Reject ${item.title}`}
                            id={`admin-reject-btn-${item.id}`}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Listings Table Card */}
        <div className="unimart-admin-panel unimart-admin-table-panel">
          <div className="p-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">All Marketplace Listings</h5>
              <span className="text-muted small">Manage pre-owned textbooks, tech, handcrafted goods & scents</span>
            </div>
            
            {/* Live Search Filter */}
            <div className="d-flex align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ width: '280px' }}>
                <span className="input-group-text bg-transparent border-end-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Filter listings or sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-5">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '56px', height: '56px', background: '#fee2e2', color: '#dc2626' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>inventory_2</span>
              </div>
              <h5 className="fw-bold">No Listings Found</h5>
              <p className="text-muted small mb-0">
                {searchQuery ? `No listings match query "${searchQuery}".` : 'No listings currently exist in the catalog.'}
              </p>
            </div>
          ) : (
            <div className="unimart-admin-table-responsive">
              <table className="table unimart-admin-table table-hover align-middle mb-0" id="admin-listings-table">
                <thead className="table-light text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  <tr>
                    <th scope="col" style={{ width: '90px' }} className="ps-4">Photo</th>
                    <th scope="col">Title & Category</th>
                    <th scope="col">Seller</th>
                    <th scope="col">Price</th>
                    <th scope="col" className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((item) => (
                    <tr key={item.id}>
                      {/* Photo */}
                      <td className="ps-4 py-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="unimart-admin-thumb"
                        />
                      </td>

                      {/* Title & Category */}
                      <td>
                        <div className="fw-bold text-dark mb-0.5" style={{ fontSize: '0.92rem' }}>
                          {item.title}
                        </div>
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          <span className="badge bg-light text-dark border rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                            {item.category}
                          </span>
                          <span className="badge bg-light text-muted border rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                            {item.condition}
                          </span>
                          {item.status === 'pending' ? (
                            <span className="badge bg-warning bg-opacity-15 text-dark border border-warning rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              ⏳ Pending Approval
                            </span>
                          ) : item.badge && (
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Seller */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: '28px',
                              height: '28px',
                              background: '#f1f5f9',
                              color: '#334155',
                              fontSize: '0.76rem'
                            }}
                          >
                            {item.seller ? item.seller.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: '0.84rem' }}>{item.seller}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>ID: {item.seller_id || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <div className="fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </div>
                        {item.origPrice && (
                          <div className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                            ₹{Number(item.origPrice).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-end pe-4">
                        <div className="d-inline-flex align-items-center gap-1.5">
                          {item.status === 'pending' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success rounded-pill px-2.5 py-1.5 d-inline-flex align-items-center gap-1 shadow-sm"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleApprove(item)}
                              title={`Approve ${item.title}`}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check</span>
                              <span>Approve</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => handleRemove(item)}
                            title={`Remove ${item.title}`}
                            id={`admin-remove-btn-${item.id}`}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
