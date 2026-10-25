import React, { useState, useRef, useEffect } from 'react';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';

export default function Navbar({
  handleGoToLogin,
  searchQuery,
  setSearchQuery,
  categories = [],
  selectedCategory = 'All',
  setSelectedCategory,
  cartItems = [],
  onUpdateCartQty,
  onRemoveFromCart,
  onCheckout,
  notifications = [],
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navActionsRef = useRef(null);

  // Close all open popovers when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (navActionsRef.current && !navActionsRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsCartOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsCartOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
    setIsNotificationsOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    if (!user) {
      handleGoToLogin();
    } else {
      setIsUserMenuOpen((prev) => !prev);
      setIsNotificationsOpen(false);
      setIsCartOpen(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0);

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

        {/* Dynamic & Interactive Search Bar (Desktop) */}
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
              className="unimart-search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                if (onSearchSubmit) onSearchSubmit('');
              }}
              title="Clear search text"
              aria-label="Clear search text"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          )}

          {/* Category Dropdown inside Search Bar */}
          <select
            className="unimart-search-cat-select"
            value={selectedCategory}
            onChange={(e) => {
              if (setSelectedCategory) setSelectedCategory(e.target.value);
              if (onSearchSubmit) onSearchSubmit(searchQuery);
            }}
            title="Filter by category"
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.key || c.name} value={c.id || c.key || c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="unimart-search-btn"
            title="Search items"
            aria-label="Search items"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </button>
        </form>

        {/* Right Actions: Sell Item, Theme, Notifications, Cart, Profile */}
        <div className="d-flex align-items-center gap-3 position-relative" ref={navActionsRef}>
          {/* Sell Item Button */}
          <button
            type="button"
            className="unimart-sell-btn"
            onClick={handleSellClick}
            title="List an item for sale"
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

          {/* Notification Bell with Campus Alerts Popover */}
          <div className="position-relative">
            <button
              type="button"
              className={`unimart-icon-action-btn ${isNotificationsOpen ? 'active' : ''}`}
              onClick={toggleNotifications}
              title="Campus alerts & notifications"
              aria-label="Campus alerts"
              aria-expanded={isNotificationsOpen}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>notifications</span>
              {unreadCount > 0 && (
                <span className="unimart-badge-count">{unreadCount}</span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {isNotificationsOpen && (
              <div
                className="unimart-popover-menu unimart-notifications-popover shadow-lg"
                role="dialog"
                aria-label="Campus Alerts"
              >
                <div className="unimart-popover-header">
                  <div className="fw-bold fs-6">Campus Alerts</div>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-decoration-none small text-danger fw-semibold"
                      onClick={onMarkAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  ) : (
                    <span className="small text-muted">All caught up</span>
                  )}
                </div>

                <div className="unimart-notif-list">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`unimart-notif-item ${notif.read ? '' : 'unread'}`}
                        onClick={() => onMarkNotificationRead && onMarkNotificationRead(notif.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            if (onMarkNotificationRead) onMarkNotificationRead(notif.id);
                          }
                        }}
                      >
                        <div className="unimart-notif-icon-wrap">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {notif.icon || 'notifications'}
                          </span>
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold small text-dark text-truncate">{notif.title}</span>
                            <span className="text-muted ms-2 flex-shrink-0" style={{ fontSize: '0.68rem' }}>
                              {notif.time}
                            </span>
                          </div>
                          <p className="mb-0 text-muted small mt-1" style={{ fontSize: '0.78rem', lineHeight: '1.3' }}>
                            {notif.desc}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted small">No notifications yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Button with Interactive Meetup Cart Drawer */}
          <div className="position-relative">
            <button
              type="button"
              className={`unimart-icon-action-btn ${isCartOpen ? 'active' : ''}`}
              onClick={toggleCart}
              title="Your Campus Cart"
              aria-label="Shopping Cart"
              aria-expanded={isCartOpen}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>shopping_cart</span>
              {totalCartCount > 0 && (
                <span className="unimart-badge-count">{totalCartCount}</span>
              )}
            </button>

            {/* Cart Popover Drawer */}
            {isCartOpen && (
              <div
                className="unimart-popover-menu unimart-cart-popover shadow-lg"
                role="dialog"
                aria-label="Campus Meetup Cart"
              >
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                  <div>
                    <span className="fw-bold fs-6">Campus Meetup Cart</span>
                    <span className="badge rounded-pill bg-light text-dark border ms-2 small">
                      {totalCartCount} item{totalCartCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setIsCartOpen(false)}
                    aria-label="Close cart"
                  ></button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '32px' }}>
                      remove_shopping_cart
                    </span>
                    <p className="small mb-2">Your cart is currently empty.</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() => {
                        setIsCartOpen(false);
                        if (onSearchSubmit) onSearchSubmit('');
                      }}
                    >
                      Explore Marketplace
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="unimart-cart-list">
                      {cartItems.map((item) => (
                        <div key={item.id} className="unimart-cart-row">
                          <div className="unimart-notif-icon-wrap" style={{ width: '38px', height: '38px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                              {item.icon || 'shopping_bag'}
                            </span>
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="fw-semibold small text-truncate" title={item.title}>
                              {item.title}
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                              ₹{Number(item.price || 0).toLocaleString('en-IN')} each
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              className="unimart-cart-qty-btn"
                              onClick={() => onUpdateCartQty && onUpdateCartQty(item.id, -1)}
                              title="Decrease quantity"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-1 small fw-bold">{item.qty || 1}</span>
                            <button
                              type="button"
                              className="unimart-cart-qty-btn"
                              onClick={() => onUpdateCartQty && onUpdateCartQty(item.id, 1)}
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0 ms-1"
                              onClick={() => onRemoveFromCart && onRemoveFromCart(item.id)}
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted small">Total Meetup Amount:</span>
                        <span className="fw-bolder fs-5" style={{ color: 'var(--unimart-maroon)' }}>
                          ₹{cartSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="unimart-sell-btn w-100 justify-content-center py-2"
                        onClick={onCheckout}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                        <span>Arrange Campus Meetup</span>
                      </button>
                      <div className="text-center mt-2">
                        <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                          Pay in-person at Central Library via UPI or Cash
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Consolidated Profile Chip with 3 Lines + Dropdown */}
          <div className="position-relative">
            <div
              className={`unimart-user-chip ${!user ? 'cursor-pointer' : ''} ${isUserMenuOpen ? 'active' : ''}`}
              onClick={toggleUserMenu}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleUserMenu();
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
