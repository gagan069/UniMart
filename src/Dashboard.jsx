import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

export default function Dashboard({ onGoToLogin }) {
  // Modal & Popup visibility states
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Active Category & Search Filters
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Wishlist state (IDs of items favorited)
  const [wishlist, setWishlist] = useState([2]);

  // Ref for marketplace catalog scroll target
  const catalogRef = useRef(null);
  const navActionsRef = useRef(null);

  // Listing form state (in INR)
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'Handmade Crafts',
    price: '',
    condition: 'Brand New',
    description: '',
    seller: 'Satkar (You)'
  });

  // Campus Notifications (initial count 3 to match design badge)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Swap Offer Accepted',
      desc: 'Priya K. accepted your Calculus notes exchange. Meet at Central Library 2F.',
      time: '12m ago',
      read: false,
      icon: 'verified'
    },
    {
      id: 2,
      title: 'Price Drop Alert',
      desc: 'TI-84 Plus Color Graphing Calculator dropped to ₹2,499 in Engineering Club.',
      time: '1h ago',
      read: false,
      icon: 'trending_down'
    },
    {
      id: 3,
      title: 'New Student Artisan Listing',
      desc: 'Aishwarya N. listed a Hand-Embroidered Canvas Botanical Tote Bag.',
      time: '3h ago',
      read: false,
      icon: 'palette'
    }
  ]);

  // Initial products catalogue (priced in INR ₹)
  const [products, setProducts] = useState([
    {
      id: 1,
      title: 'Calculus: Early Transcendentals (8th Ed)',
      category: 'Textbooks & Notes',
      price: 450,
      origPrice: 1499,
      condition: 'Like New',
      seller: 'Priya K. (Math Dept)',
      icon: 'menu_book',
      categoryTheme: 'theme-academic',
      badge: 'Academic Pick',
      notes: 'Semester 1 & 2 Core'
    },
    {
      id: 2,
      title: 'Handcrafted Ceramic Matcha Mug & Saucer',
      category: 'Handmade Crafts',
      price: 350,
      origPrice: 699,
      condition: 'Handmade',
      seller: "Elena R. (Fine Arts '26)",
      icon: 'palette',
      categoryTheme: 'theme-crafts',
      badge: 'Student Artisan',
      notes: 'Hand-thrown Glaze'
    },
    {
      id: 3,
      title: 'TI-84 Plus CE Color Graphing Calculator',
      category: 'Machinery & Tech',
      price: 2499,
      origPrice: 6999,
      condition: 'Excellent',
      seller: "Marcus T. (Engineering '24)",
      icon: 'precision_manufacturing',
      categoryTheme: 'theme-tech',
      badge: 'Lab Ready',
      notes: 'Battery + Cable included'
    },
    {
      id: 4,
      title: 'Botanical Dorm Mist: Cedar & Wild Lavender (50ml)',
      category: 'Perfumes & Scents',
      price: 299,
      origPrice: 499,
      condition: 'Freshly Crafted',
      seller: 'Chloe W. (Biochem Maker)',
      icon: 'local_florist',
      categoryTheme: 'theme-scents',
      badge: 'Organic',
      notes: 'Natural Essential Oils'
    },
    {
      id: 5,
      title: 'Organic Chemistry as a Second Language (Klein)',
      category: 'Textbooks & Notes',
      price: 380,
      origPrice: 1100,
      condition: 'Good with notes',
      seller: "David S. (Pre-Med '25)",
      icon: 'menu_book',
      categoryTheme: 'theme-academic',
      badge: 'Annotated',
      notes: 'Highlighted Key Concepts'
    },
    {
      id: 6,
      title: 'Hand-Embroidered Canvas Botanical Tote Bag',
      category: 'Handmade Crafts',
      price: 320,
      origPrice: 599,
      condition: 'Handmade',
      seller: 'Aishwarya N. (Design Club)',
      icon: 'palette',
      categoryTheme: 'theme-crafts',
      badge: 'Eco-Craft',
      notes: '100% Organic Cotton'
    },
    {
      id: 7,
      title: 'Arduino Robotics Starter Kit + Sensor Shield',
      category: 'Machinery & Tech',
      price: 1850,
      origPrice: 3499,
      condition: 'Gently Used',
      seller: 'Devin L. (Robotics Club)',
      icon: 'precision_manufacturing',
      categoryTheme: 'theme-tech',
      badge: 'STEM Kit',
      notes: 'Complete Sensor Modules'
    },
    {
      id: 8,
      title: 'Artisanal Solid Perfume: Amberwood & Bergamot',
      category: 'Perfumes & Scents',
      price: 249,
      origPrice: 449,
      condition: 'Handmade',
      seller: 'Mira P. (Campus Alchemist)',
      icon: 'local_florist',
      categoryTheme: 'theme-scents',
      badge: 'Pocket Scent',
      notes: 'Beeswax & Jojoba Base'
    }
  ]);

  // Cart state initialized with 2 items (matches badge "2" in the reference design)
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: 'Calculus: Early Transcendentals (8th Ed)',
      category: 'Textbooks & Notes',
      price: 450,
      qty: 1,
      icon: 'menu_book',
      categoryTheme: 'theme-academic'
    },
    {
      id: 4,
      title: 'Botanical Dorm Mist: Cedar & Wild Lavender (50ml)',
      category: 'Perfumes & Scents',
      price: 299,
      qty: 1,
      icon: 'local_florist',
      categoryTheme: 'theme-scents'
    }
  ]);

  // Category definitions for navigation tabs
  const categoryMeta = [
    { name: 'All Categories', icon: 'apps' },
    { name: 'Textbooks & Notes', icon: 'menu_book' },
    { name: 'Handmade Crafts', icon: 'palette' },
    { name: 'Machinery & Tech', icon: 'precision_manufacturing' },
    { name: 'Perfumes & Scents', icon: 'local_florist' }
  ];

  // Dynamically calculate category counts based on current products
  const categories = categoryMeta.map((cat) => {
    let count = 0;
    if (cat.name === 'All Categories') {
      count = products.length;
    } else {
      count = products.filter((p) => p.category === cat.name).length;
    }
    return {
      ...cat,
      count: `${count} item${count === 1 ? '' : 's'}`
    };
  });

  // Calculate unread notifications & total cart items
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Show floating toast notification with automatic dismissal
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Close open dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navActionsRef.current && !navActionsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
        setIsCartOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter products by active category and search input
  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      activeCategory === 'All Categories' || item.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.seller.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Scroll to catalog section helper
  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Category tab click handler
  const handleSelectCategory = (catName) => {
    setActiveCategory(catName);
    scrollToCatalog();
  };

  // Search submission / enter handler
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    scrollToCatalog();
  };

  // Add item to cart
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === product.id);
      if (existing) {
        return prevItems.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prevItems,
        {
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          qty: 1,
          icon: product.icon,
          categoryTheme: product.categoryTheme
        }
      ];
    });
    triggerToast(`Added "${product.title}" to campus cart!`);
  };

  // Adjust cart item quantity
  const handleUpdateCartQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove single item from cart
  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    triggerToast('Item removed from cart.');
  };

  // Checkout order
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    setIsCartOpen(false);
    triggerToast('Campus meetup order confirmed! Meetup details sent to sellers.');
  };

  // Toggle wishlist
  const handleToggleWishlist = (id, title) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((wId) => wId !== id));
      triggerToast(`Removed "${title}" from wishlist.`);
    } else {
      setWishlist([...wishlist, id]);
      triggerToast(`Saved "${title}" to your wishlist!`);
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast('All notifications marked as read.');
  };

  // Handle new item publication from modal
  const handleSellSubmit = (e) => {
    e.preventDefault();
    const itemCat = newItem.category;

    let theme = 'theme-crafts';
    let icon = 'palette';
    let badge = 'Student Listing';

    if (itemCat === 'Textbooks & Notes') {
      theme = 'theme-academic';
      icon = 'menu_book';
      badge = 'Academic Pick';
    } else if (itemCat === 'Machinery & Tech') {
      theme = 'theme-tech';
      icon = 'precision_manufacturing';
      badge = 'Lab Ready';
    } else if (itemCat === 'Perfumes & Scents') {
      theme = 'theme-scents';
      icon = 'local_florist';
      badge = 'Artisanal';
    }

    const priceNum = Number(newItem.price) || 0;
    const createdProduct = {
      id: Date.now(),
      title: newItem.title,
      category: newItem.category,
      price: priceNum,
      origPrice: Math.round(priceNum * 1.35),
      condition: newItem.condition,
      seller: 'Satkar (You)',
      icon: icon,
      categoryTheme: theme,
      badge: badge,
      notes: newItem.description ? newItem.description.slice(0, 32) : 'Central Campus Meetup'
    };

    setProducts([createdProduct, ...products]);
    setIsSellModalOpen(false);
    setActiveCategory('All Categories');
    triggerToast(`"${newItem.title}" published to UNIMART campus marketplace!`);

    // Reset form
    setNewItem({
      title: '',
      category: 'Handmade Crafts',
      price: '',
      condition: 'Brand New',
      description: '',
      seller: 'Satkar (You)'
    });

    scrollToCatalog();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveCategory('All Categories');
    setSearchQuery('');
  };

  return (
    <div className="unimart-dashboard-wrap">
      {/* ================= TOP NAVBAR ================= */}
      <nav className="unimart-dash-nav">
        <div className="d-flex align-items-center justify-content-between gap-3">
          
          {/* Brand Logo & Onboarding link */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="unimart-logo-group"
              onClick={handleResetFilters}
              title="UNIMART Campus Marketplace - Reset to All"
            >
              <div className="unimart-logo-badge">
                <span className="material-symbols-outlined">local_mall</span>
              </div>
              <span>UNIMART</span>
            </button>

            <button 
              type="button" 
              className="btn btn-sm btn-light border rounded-pill d-none d-lg-inline-flex align-items-center gap-1 text-muted"
              onClick={onGoToLogin}
              title="Preview onboarding login screen"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              <span style={{ fontSize: '0.8rem' }}>Onboarding Screen</span>
            </button>
          </div>

          {/* Interactive Search Bar */}
          <form className="unimart-search-bar d-none d-md-flex" onSubmit={handleSearchSubmit}>
            <span className="material-symbols-outlined text-muted me-2" style={{ fontSize: '20px' }}>
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search textbooks, handmade crafts, lab tech, perfumes..."
              className="unimart-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="unimart-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search text"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            )}
            <select
              className="unimart-search-cat-select"
              value={activeCategory}
              onChange={(e) => handleSelectCategory(e.target.value)}
              title="Filter by category"
            >
              {categoryMeta.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="unimart-search-btn" title="Search items">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </form>

          {/* Right Actions: Sell Item, Notifications, Cart, Profile */}
          <div className="d-flex align-items-center gap-3 position-relative" ref={navActionsRef}>
            
            {/* Sell Item Button */}
            <button
              type="button"
              className="unimart-sell-btn"
              onClick={() => setIsSellModalOpen(true)}
              title="List an item for sale"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>add_circle</span>
              <span>Sell an Item</span>
            </button>

            {/* Notification Bell */}
            <div className="position-relative">
              <button 
                type="button" 
                className={`unimart-icon-action-btn ${isNotificationsOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsCartOpen(false);
                  setIsProfileOpen(false);
                }}
                title="Campus alerts & notifications"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>notifications</span>
                {unreadCount > 0 && (
                  <span className="unimart-badge-count">{unreadCount}</span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="unimart-popover-menu unimart-notifications-popover">
                  <div className="unimart-popover-header">
                    <div className="fw-bold fs-6">Campus Alerts</div>
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-decoration-none small text-danger fw-semibold"
                        onClick={handleMarkAllNotificationsRead}
                      >
                        Mark all read
                      </button>
                    ) : (
                      <span className="small text-muted">All caught up</span>
                    )}
                  </div>
                  <div>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`unimart-notif-item ${notif.read ? '' : 'unread'}`}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                          );
                        }}
                      >
                        <div className="unimart-notif-icon-wrap">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {notif.icon}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold small text-dark">{notif.title}</span>
                            <span className="text-muted" style={{ fontSize: '0.68rem' }}>{notif.time}</span>
                          </div>
                          <p className="mb-0 text-muted small mt-1" style={{ fontSize: '0.78rem', lineHeight: '1.3' }}>
                            {notif.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <div className="position-relative">
              <button 
                type="button" 
                className={`unimart-icon-action-btn ${isCartOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsCartOpen(!isCartOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                title="Your Campus Cart"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '21px' }}>shopping_cart</span>
                {totalCartCount > 0 && (
                  <span className="unimart-badge-count">{totalCartCount}</span>
                )}
              </button>

              {/* Cart Popover Drawer */}
              {isCartOpen && (
                <div className="unimart-popover-menu unimart-cart-popover">
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
                          scrollToCatalog();
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
                                {item.icon}
                              </span>
                            </div>
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="fw-semibold small text-truncate" title={item.title}>
                                {item.title}
                              </div>
                              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                ₹{item.price.toLocaleString('en-IN')} each
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                type="button"
                                className="unimart-cart-qty-btn"
                                onClick={() => handleUpdateCartQty(item.id, -1)}
                              >
                                -
                              </button>
                              <span className="px-1 small fw-bold">{item.qty}</span>
                              <button
                                type="button"
                                className="unimart-cart-qty-btn"
                                onClick={() => handleUpdateCartQty(item.id, 1)}
                              >
                                +
                              </button>
                              <button
                                type="button"
                                className="btn btn-link text-danger p-0 ms-1"
                                onClick={() => handleRemoveFromCart(item.id)}
                                title="Remove item"
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
                          onClick={handleCheckout}
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

            {/* User Chip */}
            <div className="position-relative">
              <div 
                className={`unimart-user-chip d-none d-sm-flex ${isProfileOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                  setIsCartOpen(false);
                }}
                title="Your student profile & options"
              >
                <div className="unimart-avatar">S</div>
                <div className="d-flex flex-column text-start">
                  <span className="fw-bold" style={{ fontSize: '0.825rem', lineHeight: '1.2' }}>Satkar</span>
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>Central Campus</span>
                </div>
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="unimart-popover-menu unimart-profile-popover">
                  <div className="d-flex align-items-center gap-3 pb-3 border-bottom">
                    <div className="unimart-avatar" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                      S
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Satkar Sharma</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>CS-2025-014</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>Hostel Block B</div>
                    </div>
                  </div>
                  <div className="py-2">
                    <div className="d-flex justify-content-between align-items-center py-2 px-1 text-muted small">
                      <span>Campus Wallet Balance</span>
                      <span className="fw-bold text-dark">₹1,250</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-2 px-1 text-muted small">
                      <span>Your Active Listings</span>
                      <span className="fw-bold text-dark">
                        {products.filter((p) => p.seller.includes('You')).length}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-top d-flex flex-column gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 text-muted"
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsSellModalOpen(true);
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                      <span>List another item</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger w-100 text-start d-flex align-items-center gap-2 mt-1"
                      onClick={onGoToLogin}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                      <span>Sign Out / Onboarding</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </nav>

      {/* ================= CATEGORY SUB-NAV (FULLY WORKING TABS) ================= */}
      <div className="unimart-subnav">
        <div className="unimart-cat-pills">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              className={`unimart-pill-tab ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => handleSelectCategory(cat.name)}
              title={`View ${cat.name}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
              <span className="unimart-tab-count-tag">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <main className="container-fluid px-lg-5 py-4">
        
        {/* Welcome Banner */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <div className="d-inline-flex align-items-center gap-1 text-muted small fw-semibold mb-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--unimart-maroon)' }}>verified</span>
              <span>Central Campus Student Exchange</span>
            </div>
            <h2 className="fw-bolder mb-1" style={{ letterSpacing: '-0.025em' }}>
              Hi Satkar! What are you looking for today?
            </h2>
            <p className="text-muted mb-0">
              Explore pre-owned textbooks, handmade dorm crafts, campus tech tools, and student-crafted perfumes.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
              Verified Campus Exchange
            </span>
          </div>
        </div>

        {/* ================= HERO SPOTLIGHT CARDS (INTERACTIVE FILTER CARDS) ================= */}
        <div className="unimart-hero-grid">
          
          {/* Card 1: Pre-owned Books (Lime Yellow Palette) */}
          <div 
            className="unimart-spotlight-card card-lime-yellow"
            onClick={() => handleSelectCategory('Textbooks & Notes')}
            title="Filter by Textbooks & Notes"
          >
            <div>
              <div className="unimart-card-tag">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>menu_book</span>
                <span>Pre-owned & Semester Notes</span>
              </div>
              <div className="unimart-card-serif-title">
                Pre-owned books
              </div>
              <div className="unimart-card-subtitle">
                Course textbooks & verified notes starting at just ₹250
              </div>
            </div>

            <div className="unimart-view-all-pill">
              <span>Academic Collection</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>

            <span className="unimart-card-art-icon">📚</span>
          </div>

          {/* Card 2: Student Handmade Crafts & Art (Soft Pink Palette) */}
          <div 
            className="unimart-spotlight-card card-soft-pink"
            onClick={() => handleSelectCategory('Handmade Crafts')}
            title="Filter by Handmade Crafts"
          >
            <div>
              <div className="unimart-card-tag">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>palette</span>
                <span>Campus Makers & Creators</span>
              </div>
              <div className="unimart-card-serif-title">
                Best of student art
              </div>
              <div className="unimart-card-subtitle">
                Ceramics, dorm prints, crochet & tote bags from ₹199
              </div>
            </div>

            <div className="unimart-view-all-pill">
              <span>Artisan Collection</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>

            <span className="unimart-card-art-icon">🎨</span>
          </div>

          {/* Card 3: Machinery, Tech & Perfumes (Sky Blue Palette) */}
          <div 
            className="unimart-spotlight-card card-sky-blue"
            onClick={() => handleSelectCategory('Machinery & Tech')}
            title="Filter by Machinery & Tech"
          >
            <div>
              <div className="unimart-card-tag">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>precision_manufacturing</span>
                <span>Tech, Tools & Aromatics</span>
              </div>
              <div className="unimart-card-serif-title">
                Tech & Perfumes
              </div>
              <div className="unimart-card-subtitle">
                Graphing calculators, kits & botanical fragrances from ₹249
              </div>
            </div>

            <div className="unimart-view-all-pill">
              <span>Tech & Fragrance</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>

            <span className="unimart-card-art-icon">⚙️</span>
          </div>

        </div>

        {/* ================= FEATURED PRODUCTS SECTION ================= */}
        <div className="unimart-section-header" ref={catalogRef}>
          <h3 className="unimart-section-title">
            <span>Marketplace Catalog</span>
            <span className="badge rounded-pill bg-light text-muted border fs-6 fw-semibold">
              {filteredProducts.length} Items Available
            </span>
          </h3>

          {/* Active Filter Badges */}
          {(activeCategory !== 'All Categories' || searchQuery) && (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {activeCategory !== 'All Categories' && (
                <span className="badge bg-light text-dark border px-2 py-1 rounded-pill small d-inline-flex align-items-center gap-1">
                  Category: <strong>{activeCategory}</strong>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-dark ms-1 text-decoration-none"
                    onClick={() => setActiveCategory('All Categories')}
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="badge bg-light text-dark border px-2 py-1 rounded-pill small d-inline-flex align-items-center gap-1">
                  Search: "<strong>{searchQuery}</strong>"
                  <button
                    type="button"
                    className="btn btn-link p-0 text-dark ms-1 text-decoration-none"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                className="btn btn-sm btn-link p-0 text-danger text-decoration-none small fw-semibold"
                onClick={handleResetFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Product Cards Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border p-4 mb-5">
            <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>
              search_off
            </span>
            <h4 className="fw-bold mb-1">No items found matching your filters</h4>
            <p className="text-muted small mb-3">
              Try adjusting your search query or selecting a different category from the top navigation.
            </p>
            <button
              type="button"
              className="btn btn-sm btn-dark rounded-pill px-4 py-2"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="unimart-products-grid">
            {filteredProducts.map((item) => {
              const discountPct = Math.round(((item.origPrice - item.price) / item.origPrice) * 100);
              const isWishlisted = wishlist.includes(item.id);

              return (
                <div key={item.id} className="unimart-product-card">
                  
                  {/* Graphic placeholder banner with category theme */}
                  <div className={`unimart-card-placeholder-wrap ${item.categoryTheme}`}>
                    <div className="unimart-placeholder-icon-box">
                      <span className="material-symbols-outlined unimart-placeholder-icon">
                        {item.icon}
                      </span>
                    </div>
                    <span className="unimart-placeholder-label">
                      {item.notes || item.category}
                    </span>
                    
                    {/* Condition Badge */}
                    <span className="unimart-condition-badge">{item.condition}</span>
                    
                    {/* Interactive Wishlist Button */}
                    <button 
                      type="button"
                      className={`unimart-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={() => handleToggleWishlist(item.id, item.title)}
                      title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {isWishlisted ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="unimart-card-body">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="unimart-card-category">{item.category}</span>
                      <span className="unimart-badge-chip">{item.badge}</span>
                    </div>

                    <h6 className="unimart-card-title" title={item.title}>
                      {item.title}
                    </h6>

                    <div className="unimart-seller-info">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>person</span>
                      <span>{item.seller}</span>
                    </div>

                    {/* Pricing in Indian Rupees (₹) */}
                    <div className="unimart-price-row mt-auto pt-2">
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="unimart-current-price">₹{item.price.toLocaleString('en-IN')}</span>
                        {item.origPrice && (
                          <span className="unimart-orig-price">₹{item.origPrice.toLocaleString('en-IN')}</span>
                        )}
                        <span className="unimart-discount-tag">{discountPct}% OFF</span>
                      </div>

                      <button 
                        type="button" 
                        className="unimart-add-cart-btn"
                        onClick={() => handleAddToCart(item)}
                        title="Add to cart"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ================= SELL CTA BANNER ================= */}
        <div className="rounded-4 p-4 p-lg-5 mb-5 text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--unimart-maroon) 0%, var(--unimart-maroon-dark) 100%)' }}>
          <div className="row align-items-center">
            <div className="col-12 col-lg-8">
              <span className="badge bg-white text-dark mb-2 px-3 py-1 fw-bold rounded-pill">
                Earn Extra Cash on Campus • Direct UPI / Cash 💸
              </span>
              <h2 className="fw-bold mb-2">Have Finished Textbooks or Create Handmade Crafts?</h2>
              <p className="mb-4 text-white-50" style={{ maxWidth: '640px' }}>
                Listing an item takes under 60 seconds. Connect directly with students from your college for safe on-campus meetups at the library or cafeteria.
              </p>
              <button 
                type="button" 
                className="btn btn-light rounded-pill px-4 py-2 fw-bold text-dark d-inline-flex align-items-center gap-2"
                onClick={() => setIsSellModalOpen(true)}
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span>Sell on Campus</span>
              </button>
            </div>
            <div className="col-12 col-lg-4 text-center mt-4 mt-lg-0">
              <span style={{ fontSize: '6.5rem', opacity: '0.9' }}>✨🎓</span>
            </div>
          </div>
        </div>

      </main>

      {/* ================= SELL ITEM MODAL (IN RUPEES) ================= */}
      {isSellModalOpen && (
        <div 
          className="unimart-sell-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSellModalOpen(false);
          }}
        >
          <div className="unimart-sell-modal-box">
            <button 
              type="button" 
              className="unimart-close-btn" 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
              onClick={() => setIsSellModalOpen(false)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>

            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="unimart-logo-badge" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sell</span>
              </div>
              <h4 className="fw-bold mb-0">List an Item on UNIMART</h4>
            </div>

            <p className="text-muted small mb-4">
              Sell used semester books, handmade dorm crafts, machinery/lab parts, or artisanal fragrances on campus.
            </p>

            <form onSubmit={handleSellSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Mathematics Volume 1 / Handmade Ceramic Mug"
                  className="form-control rounded-3 py-2"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <select 
                    className="form-select rounded-3 py-2"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="Textbooks & Notes">Textbooks & Notes</option>
                    <option value="Handmade Crafts">Handmade Crafts & Art</option>
                    <option value="Machinery & Tech">Machinery & Tech Gear</option>
                    <option value="Perfumes & Scents">Artisanal Perfumes & Scents</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Price (₹ INR)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted fw-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 450"
                      className="form-control rounded-end-3 py-2"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Condition</label>
                <select 
                  className="form-select rounded-3 py-2"
                  value={newItem.condition}
                  onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                >
                  <option value="Brand New">Brand New / Unused</option>
                  <option value="Handmade">Handmade Craft</option>
                  <option value="Like New">Pre-Owned: Like New</option>
                  <option value="Gently Used">Pre-Owned: Gently Used</option>
                  <option value="Good with notes">Pre-Owned: Highlighted / Notes</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Item Description & Campus Pickup Spot</label>
                <textarea
                  rows="3"
                  placeholder="Describe your item, edition/year, notes, or preferred campus meetup spot (e.g. Central Library Gate 2, Student Center)..."
                  className="form-control rounded-3"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="unimart-sell-btn w-100 justify-content-center py-2 fs-6">
                <span>Publish Item to Campus</span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= FLOATING TOAST FEEDBACK ================= */}
      {toastMessage && (
        <div className="unimart-toast-wrap">
          <span className="material-symbols-outlined text-success" style={{ fontSize: '20px' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="unimart-dash-footer">
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <span className="fw-bold">UNIMART</span> — The Peer-to-Peer College E-Commerce Platform.
          </div>
          <div className="d-flex gap-4">
            <button type="button" className="btn btn-link p-0 text-muted small text-decoration-none" onClick={onGoToLogin}>
              View Onboarding / Login
            </button>
            <span className="text-muted small">Campus Meetup Safety</span>
            <span className="text-muted small">Student Maker Guidelines</span>
            <span className="text-muted small">INR (₹) Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
