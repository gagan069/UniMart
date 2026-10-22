import React, { useState, useRef, useEffect } from 'react';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';

export default function Navbar({
  handleGoToLogin,
  searchQuery,
  setSearchQuery,
  handleSellClick,
  onSearchSubmit,
  theme,
  toggleTheme,
  user,
  logout,
  closeChat,
  navigate
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="unimart-dash-nav">
      <div className="d-flex align-items-center justify-content-between gap-3">
        {/* Brand Logo */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="unimart-logo-group"
            onClick={handleGoToLogin}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            title="Return to UNIMART Landing Page"
          >
            <div className="unimart-logo-badge">
              <span className="material-symbols-outlined">local_mall</span>
            </div>
            <span>UNIMART</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light border rounded-pill d-none d-lg-inline-flex align-items-center gap-1 text-muted"
            onClick={handleGoToLogin}
            title="Return to Landing Page"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
            <span style={{ fontSize: '0.8rem' }}>Landing Page</span>
          </button>
        </div>

        {/* Dynamic Search Bar (Desktop) */}
        <form
          className="unimart-search-bar d-none d-md-flex"
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearchSubmit) onSearchSubmit(searchQuery);
          }}
        >
          <span
            className="material-symbols-outlined text-muted me-2"
            style={{ fontSize: '20px', cursor: onSearchSubmit ? 'pointer' : 'default' }}
            onClick={() => {
              if (onSearchSubmit) onSearchSubmit(searchQuery);
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search textbooks, handmade crafts, lab tech, perfumes..."
            className="unimart-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (onSearchSubmit) onSearchSubmit(searchQuery);
              }
            }}
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
        </form>

        {/* Right Actions */}
        <div className="d-flex align-items-center gap-3">
          {/* Sell Item Button */}
          <button
            type="button"
            className="unimart-sell-btn"
            onClick={handleSellClick}
            title="Listing form"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>add_circle</span>
            <span>Sell an Item</span>
          </button>

          {/* Dark/Light Theme Toggle Button */}
          <button
            type="button"
            className="unimart-icon-action-btn unimart-theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark/light theme"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="unimart-icon-action-btn"
            title="Campus alerts"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>notifications</span>
            <span className="unimart-badge-count">1</span>
          </button>

          {/* Cart Button */}
          <button
            type="button"
            className="unimart-icon-action-btn"
            title="Cart items"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>shopping_cart</span>
            <span className="unimart-badge-count">2</span>
          </button>

          {/* Consolidated Profile Chip with 3 Lines + Dropdown */}
          <div className="position-relative" ref={userMenuRef}>
            <div
              className={`unimart-user-chip ${!user ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (!user) {
                  handleGoToLogin();
                } else {
                  setIsUserMenuOpen((prev) => !prev);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (!user) {
                    handleGoToLogin();
                  } else {
                    setIsUserMenuOpen((prev) => !prev);
                  }
                }
              }}
              title={
                !user
                  ? 'Guest Mode (Click to Sign In)'
                  : `${user.name} • ${user.student_id || user.studentId || (checkIsAdmin(user) ? 'ADMIN-001' : '')} • ${checkIsAdmin(user) ? 'Admin' : 'Student'}`
              }
              id="unimart-navbar-profile-chip"
            >
              {/* Avatar circle with initial */}
              <div className={`unimart-avatar ${checkIsAdmin(user) ? 'admin-avatar' : ''}`}>
                {!user ? 'G' : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
              </div>

              {/* 3 Lines: Line 1 name (bold), Line 2 roll number (small, grey), Line 3 access level (small, maroon) */}
              <div className="unimart-chip-lines">
                <span className="unimart-chip-name">
                  {!user ? 'Guest' : user.name}
                </span>
                <span className="unimart-chip-roll">
                  {!user ? 'Not signed in' : (user.student_id || user.studentId || (checkIsAdmin(user) ? 'ADMIN-001' : 'Student Account'))}
                </span>
                <span className="unimart-chip-role">
                  {!user ? 'Guest' : checkIsAdmin(user) ? 'Admin' : 'Student'}
                </span>
              </div>
            </div>

            {/* Profile Dropdown Menu for Logged In User */}
            {isUserMenuOpen && user && (
              <div className="unimart-profile-dropdown shadow-lg">
                <div className="unimart-dropdown-user-header p-3 border-bottom">
                  <div className="d-flex align-items-center gap-2.5 mb-1.5">
                    <div className={`unimart-avatar ${checkIsAdmin(user) ? 'admin-avatar' : ''}`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="d-flex flex-column text-start">
                      <span className="fw-bold" style={{ fontSize: '0.88rem', color: 'var(--unimart-text-dark)' }}>
                        {user.name}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                        {user.student_id || user.studentId || (checkIsAdmin(user) ? 'ADMIN-001' : 'Student Account')}
                      </span>
                      <span className="fw-semibold" style={{ fontSize: '0.74rem', color: '#70182c' }}>
                        {checkIsAdmin(user) ? 'Admin' : 'Student'}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {user.email}
                  </div>
                </div>

                {/* Admin route link if admin */}
                {checkIsAdmin(user) && (
                  <div className="py-1 border-bottom">
                    <button
                      type="button"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger fw-semibold"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/admin');
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                      <span>Admin Dashboard</span>
                    </button>
                  </div>
                )}

                {/* Sign Out */}
                <div className="p-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger w-100 rounded-pill d-flex align-items-center justify-content-center gap-1 py-1"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => {
                      if (closeChat) closeChat();
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
