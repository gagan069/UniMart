import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  fetchListings,
  approveListing as approveListingAction,
  rejectListing as rejectListingAction,
  deleteListing as deleteListingAction
} from '../store/slices/listingsSlice.js';
import { useToast } from '../hooks/useToast.js';
import ToastAlert from '../components/ToastAlert.jsx';
import AdminConfirmModal from '../components/admin/AdminConfirmModal.jsx';
import AdminEditDiffViewer from '../components/admin/AdminEditDiffViewer.jsx';
import AdminPreviewModal from '../components/admin/AdminPreviewModal.jsx';
import Pagination from '../components/Pagination.jsx';
import '../Dashboard.css';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.listings.items);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { toast, showToast, hideToast } = useToast(3500);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Approved' | 'Pending' | 'Rejected' | 'Sold'
  const [expandedDiffId, setExpandedDiffId] = useState(null);

  // Pagination state (25 listings per page)
  const [adminPage, setAdminPage] = useState(1);
  const ADMIN_PAGE_SIZE = 25;

  // Reset page when filter or search changes (render-phase adjustment)
  const [prevAdminFilterKey, setPrevAdminFilterKey] = useState(
    () => `${statusFilter}__${searchQuery}`
  );
  const currentAdminFilterKey = `${statusFilter}__${searchQuery}`;
  if (currentAdminFilterKey !== prevAdminFilterKey) {
    setPrevAdminFilterKey(currentAdminFilterKey);
    setAdminPage(1);
  }

  // Preview Modal state
  const [previewModalItem, setPreviewModalItem] = useState(null);

  // Modal confirm state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'approve' | 'reject' | 'remove'
    item: null
  });

  useEffect(() => {
    dispatch(fetchListings({ currentUser: user }));
  }, [dispatch, user]);

  // Pending queue includes brand-new pending listings and approved listings with pending edits
  const pendingQueue = productList.filter((item) => item.status === 'pending' || item.hasPendingEdit);

  // Status counts for filters and stats
  const totalCount = productList.length;
  const pendingCount = pendingQueue.length;
  const approvedCount = productList.filter((item) => item.status === 'approved').length;
  const rejectedCount = productList.filter((item) => item.status === 'rejected').length;
  const soldCount = productList.filter((item) => item.status === 'sold').length;

  const totalMarketValue = productList
    .filter((item) => item.status === 'approved')
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const getStatusCount = (statusKey) => {
    switch (statusKey) {
      case 'Approved':
        return approvedCount;
      case 'Pending':
        return pendingCount;
      case 'Rejected':
        return rejectedCount;
      case 'Sold':
        return soldCount;
      case 'All':
      default:
        return totalCount;
    }
  };

  // Filter all-listings table by status pill and search query
  const filteredListings = productList.filter((item) => {
    // 1. Status Filter
    if (statusFilter === 'Approved' && item.status !== 'approved') return false;
    if (statusFilter === 'Pending' && !(item.status === 'pending' || item.hasPendingEdit)) return false;
    if (statusFilter === 'Rejected' && item.status !== 'rejected') return false;
    if (statusFilter === 'Sold' && item.status !== 'sold') return false;

    // 2. Search Query
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.seller && item.seller.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.condition && item.condition.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  // Action Triggers with Confirmation Modal
  const requestApprove = (item) => {
    setConfirmModal({ isOpen: true, type: 'approve', item });
  };

  const requestReject = (item) => {
    setConfirmModal({ isOpen: true, type: 'reject', item });
  };

  const requestRemove = (item) => {
    setConfirmModal({ isOpen: true, type: 'remove', item });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null, item: null });
  };

  // Preview Modal Handlers
  const handleOpenPreview = (item) => {
    setPreviewModalItem(item);
  };

  const handleClosePreview = () => {
    setPreviewModalItem(null);
  };

  const handleApproveFromPreview = (item) => {
    handleClosePreview();
    requestApprove(item);
  };

  const handleRejectFromPreview = (item) => {
    handleClosePreview();
    requestReject(item);
  };

  const handleModalConfirm = (item) => {
    const { type } = confirmModal;
    closeConfirmModal();

    if (type === 'approve') {
      const isEdit = Boolean(item.hasPendingEdit);
      dispatch(approveListingAction({ id: item.id, currentUser: user }));
      showToast({
        type: 'success',
        text: isEdit
          ? `Proposed edits for "${item.title}" approved and live in catalog!`
          : `Listing "${item.title}" approved and live in catalog!`
      });
      // Collapse diff if it was open
      if (expandedDiffId === item.id) setExpandedDiffId(null);
    } else if (type === 'reject') {
      const isEdit = Boolean(item.hasPendingEdit);
      dispatch(rejectListingAction({ id: item.id, currentUser: user }));
      showToast({
        type: 'warning',
        text: isEdit
          ? `Pending edits for "${item.title}" rejected — live listing untouched.`
          : `Listing "${item.title}" rejected (owner can edit & resubmit).`
      });
      // Collapse diff if it was open
      if (expandedDiffId === item.id) setExpandedDiffId(null);
    } else if (type === 'remove') {
      dispatch(deleteListingAction({ id: item.id, currentUser: user }));
      showToast({
        type: 'error',
        text: `Listing "${item.title}" deleted permanently.`
      });
      if (expandedDiffId === item.id) setExpandedDiffId(null);
    }
  };

  const toggleViewChanges = (id) => {
    setExpandedDiffId((prev) => (prev === id ? null : id));
  };

  // Paginated listings slice (25 items per page)
  const adminTotalPages = Math.max(1, Math.ceil(filteredListings.length / ADMIN_PAGE_SIZE));
  const activeAdminPage = Math.min(Math.max(1, adminPage), adminTotalPages);
  const adminStartIndex = (activeAdminPage - 1) * ADMIN_PAGE_SIZE;
  const paginatedListings = filteredListings.slice(adminStartIndex, adminStartIndex + ADMIN_PAGE_SIZE);

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
              className="unimart-admin-top-btn unimart-admin-btn-outline"
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
              className="unimart-admin-top-btn unimart-admin-btn-primary shadow-sm"
              onClick={() => navigate('/')}
              id="return-to-marketplace-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
              <span>Return to Marketplace</span>
            </button>
          </div>
        </div>

        {/* Timer-Safe Toast Alert */}
        <ToastAlert toast={toast} onClose={hideToast} />

        {/* Header Summary Banner with 5 Real Stat Cards */}
        <div className="unimart-admin-panel unimart-admin-header-panel">
          <div className="row align-items-center g-3">
            <div className="col-lg-5">
              <div className="d-inline-flex align-items-center gap-1.5 text-danger small fw-bold mb-1">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
                <span>Campus Marketplace Administration</span>
              </div>
              <h2 className="fw-bold mb-1">Admin Dashboard</h2>
              <p className="text-muted small mb-0">
                Logged in as <strong>{user?.name || 'Campus Admin'}</strong> ({user?.email || 'admin@chitkara.edu.in'}). You have full privileges to review submissions, inspect proposed edits, and manage campus listings.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="d-flex align-items-center justify-content-lg-end gap-2.5 flex-wrap">
                <div className="unimart-stat-card stat-danger flex-grow-1" style={{ minWidth: '110px' }}>
                  <div className="unimart-stat-card-label">TOTAL</div>
                  <div className="fs-5 fw-bold text-danger">{totalCount}</div>
                </div>
                <div className="unimart-stat-card stat-warning flex-grow-1" style={{ minWidth: '110px' }}>
                  <div className="unimart-stat-card-label">PENDING</div>
                  <div className="fs-5 fw-bold text-warning">{pendingCount}</div>
                </div>
                <div className="unimart-stat-card stat-success flex-grow-1" style={{ minWidth: '110px' }}>
                  <div className="unimart-stat-card-label">APPROVED</div>
                  <div className="fs-5 fw-bold text-success">{approvedCount}</div>
                </div>
                <div className="unimart-stat-card stat-info flex-grow-1" style={{ minWidth: '110px' }}>
                  <div className="unimart-stat-card-label">SOLD</div>
                  <div className="fs-5 fw-bold text-info">{soldCount}</div>
                </div>
                <div className="unimart-stat-card stat-success flex-grow-1" style={{ minWidth: '140px' }}>
                  <div className="unimart-stat-card-label">APPROVED VALUE</div>
                  <div className="fs-5 fw-bold text-success">₹{totalMarketValue.toLocaleString('en-IN')}</div>
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
                  <h5 className="fw-bold mb-0">Pending Approvals Queue</h5>
                  <span className="badge rounded-pill bg-warning text-dark fw-bold px-2.5 py-1" style={{ fontSize: '0.75rem' }}>
                    {pendingQueue.length} {pendingQueue.length === 1 ? 'Request' : 'Requests'}
                  </span>
                </div>
                <span className="text-muted small">New submissions and proposed student edits awaiting campus admin review</span>
              </div>
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="text-center py-4 px-3">
              <div className="unimart-empty-bubble unimart-empty-bubble-success mb-2">
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>task_alt</span>
              </div>
              <h6 className="fw-bold mb-1 unimart-panel-heading">All Caught Up!</h6>
              <p className="text-muted small mb-0">
                There are currently no listings or edits pending approval. New submissions and edited products will appear here.
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
                  {pendingQueue.map((item) => {
                    const isEdit = Boolean(item.hasPendingEdit);
                    const isDiffOpen = expandedDiffId === item.id;

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className="unimart-pending-row unimart-clickable-row"
                          onClick={() => handleOpenPreview(item)}
                          title="Click row to preview listing & review submission"
                        >
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
                            {isEdit ? (
                              <div className="d-inline-flex align-items-center gap-1.5 flex-wrap">
                                <span className="badge bg-warning bg-opacity-15 text-dark border border-warning rounded-pill px-2.5 py-1 small fw-semibold d-inline-flex align-items-center gap-1">
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>edit</span>
                                  <span>Edit</span>
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0.5 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: '0.72rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleViewChanges(item.id);
                                  }}
                                  title="Compare current and proposed values"
                                  id={`admin-view-changes-btn-${item.id}`}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                    {isDiffOpen ? 'expand_less' : 'compare_arrows'}
                                  </span>
                                  <span>{isDiffOpen ? 'Hide changes' : 'View changes'}</span>
                                </button>
                              </div>
                            ) : (
                              <span className="badge bg-info bg-opacity-15 text-primary border border-info rounded-pill px-2.5 py-1 small fw-semibold d-inline-flex align-items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add_circle</span>
                                <span>New listing</span>
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="unimart-seller-avatar">
                                {item.seller ? item.seller.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div className="fw-semibold seller-name" style={{ fontSize: '0.84rem' }}>{item.seller}</div>
                                <div className="text-muted seller-id" style={{ fontSize: '0.7rem' }}>ID: {item.seller_id || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </div>
                            {isEdit && item.pendingEdit?.price && Number(item.pendingEdit.price) !== Number(item.price) && (
                              <div className="small fw-semibold text-warning" style={{ fontSize: '0.75rem' }}>
                                Proposed: ₹{Number(item.pendingEdit.price).toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-inline-flex align-items-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-success rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1 shadow-sm"
                                style={{ fontSize: '0.78rem', fontWeight: 600 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestApprove(item);
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestReject(item);
                                }}
                                title={`Reject ${item.title}`}
                                id={`admin-reject-btn-${item.id}`}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* View Changes Sub-Row */}
                        {isEdit && isDiffOpen && (
                          <tr className="unimart-diff-row" id={`admin-diff-row-${item.id}`}>
                            <td colSpan="6">
                              <AdminEditDiffViewer item={item} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= ALL LISTINGS TABLE SECTION ================= */}
        <div className="unimart-admin-panel unimart-admin-table-panel">
          <div className="p-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h5 className="fw-bold mb-0">All Marketplace Listings</h5>
              <span className="text-muted small">Manage pre-owned textbooks, tech, handcrafted goods & scents</span>
            </div>

            {/* Status Filter Tabs (All / Approved / Pending / Rejected / Sold) */}
            <div className="d-flex align-items-center gap-1.5 flex-wrap" role="tablist">
              {['All', 'Approved', 'Pending', 'Rejected', 'Sold'].map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  className={`unimart-admin-filter-pill ${statusFilter === statusKey ? 'active' : ''}`}
                  onClick={() => setStatusFilter(statusKey)}
                  id={`admin-filter-${statusKey.toLowerCase()}`}
                >
                  {statusKey} ({getStatusCount(statusKey)})
                </button>
              ))}
            </div>
            
            {/* Live Search Filter */}
            <div className="d-flex align-items-center gap-2">
              <div className="input-group input-group-sm unimart-admin-search-wrap">
                <span className="input-group-text border-end-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Filter listings or sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="admin-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-clear border-start-0"
                    onClick={() => setSearchQuery('')}
                    title="Clear search filter"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-5">
              <div className="unimart-empty-bubble unimart-empty-bubble-danger mb-3">
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>inventory_2</span>
              </div>
              <h5 className="fw-bold unimart-panel-heading">No Listings Found</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? `No listings match query "${searchQuery}" in ${statusFilter} status.`
                  : `No listings currently match status "${statusFilter}".`}
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
                  {paginatedListings.map((item) => (
                    <tr key={item.id}>
                      {/* Photo */}
                      <td className="ps-4 py-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="unimart-admin-thumb"
                        />
                      </td>

                      {/* Title & Category & Badges */}
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
                          
                          {/* Status Indicators */}
                          {item.status === 'pending' ? (
                            <span className="badge bg-warning bg-opacity-15 text-dark border border-warning rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              ⏳ Pending Approval
                            </span>
                          ) : item.status === 'rejected' ? (
                            <span className="badge bg-danger bg-opacity-15 text-danger border border-danger border-opacity-25 rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              ❌ Rejected
                            </span>
                          ) : item.status === 'sold' ? (
                            <span className="badge bg-secondary text-white rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              🏷️ Sold
                            </span>
                          ) : item.hasPendingEdit ? (
                            <span className="badge bg-warning bg-opacity-15 text-dark border border-warning rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              ✏️ Edit Pending
                            </span>
                          ) : null}

                          {/* Existing Badge */}
                          {item.badge && item.status !== 'pending' && item.status !== 'rejected' && item.status !== 'sold' && (
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Seller */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="unimart-seller-avatar">
                            {item.seller ? item.seller.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="fw-semibold seller-name" style={{ fontSize: '0.84rem' }}>{item.seller}</div>
                            <div className="text-muted seller-id" style={{ fontSize: '0.7rem' }}>ID: {item.seller_id || 'N/A'}</div>
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
                          {(item.status === 'pending' || item.hasPendingEdit) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success rounded-pill px-2.5 py-1.5 d-inline-flex align-items-center gap-1 shadow-sm"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => requestApprove(item)}
                              title={`Approve ${item.title}`}
                              id={`admin-table-approve-btn-${item.id}`}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check</span>
                              <span>Approve</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => requestRemove(item)}
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

          {/* Table Pagination (25 items per page) */}
          {filteredListings.length > 0 && (
            <div className="px-4 pb-3">
              <Pagination
                currentPage={activeAdminPage}
                totalItems={filteredListings.length}
                pageSize={ADMIN_PAGE_SIZE}
                onPageChange={setAdminPage}
                itemLabel="listings"
                targetScrollId="admin-listings-table"
              />
            </div>
          )}
        </div>

        {/* Small Confirm Modal styled with UNIMART sell modal look */}
        <AdminConfirmModal
          isOpen={confirmModal.isOpen}
          type={confirmModal.type}
          item={confirmModal.item}
          onConfirm={handleModalConfirm}
          onCancel={closeConfirmModal}
        />

        {/* Full Admin Preview Popup for Pending Queue */}
        <AdminPreviewModal
          key={previewModalItem ? `${previewModalItem.id}_${previewModalItem.hasPendingEdit ? 'edit' : 'new'}` : 'none'}
          isOpen={Boolean(previewModalItem)}
          item={previewModalItem}
          onClose={handleClosePreview}
          onApprove={handleApproveFromPreview}
          onReject={handleRejectFromPreview}
        />

      </div>
    </div>
  );
}
