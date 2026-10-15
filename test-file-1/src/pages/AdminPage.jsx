import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isAdmin } from '../lib/permissions.js';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div className="d-inline-flex align-items-center gap-1 text-danger small fw-bold mb-1">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shield</span>
            <span>UNIMART Administration Portal</span>
          </div>
          <h2 className="fw-bold mb-0">Admin Marketplace Dashboard</h2>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1"
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          <span>Return to Marketplace</span>
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4" style={{ background: 'var(--unimart-card-bg, #ffffff)' }}>
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style={{ width: '48px', height: '48px', background: '#dc2626' }}
          >
            A
          </div>
          <div>
            <h5 className="fw-bold mb-0">{user?.name || 'Administrator'}</h5>
            <span className="text-muted small">{user?.email} • Role: {user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
