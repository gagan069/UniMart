import React, { useState } from 'react';
import './Dashboard.css';

// Product images
import imgCalcBook from './assets/products/calculus.jpg';
import imgMatchaMug from './assets/products/matcha_mug.jpg';
import imgGraphCalc from './assets/products/graphing_calc.jpg';
import imgRoomSpray from './assets/products/room_spray.jpg';
import imgOrgChem from './assets/products/organic_chem.jpg';
import imgToteBag from './assets/products/tote_bag.jpg';
import imgArduinoKit from './assets/products/arduino_kit.jpg';
import imgSolidPerfume from './assets/products/solid_perfume.jpg';

export default function Dashboard({ onGoToLogin }) {
  // Dynamic state for search & category filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Listing form state (in INR)
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'Handmade Crafts',
    price: '',
    condition: 'Brand New',
    description: '',
    seller: 'Satkar (You)'
  });

  
  const staticProducts = [
    {
      id: 1,
      title: 'Calculus',
      category: 'Textbooks',
      price: 450,
      origPrice: 1499,
      condition: 'Like New',
      seller: 'Priya K. (Math Dept)',
      icon: 'menu_book',
      categoryTheme: 'theme-academic',
      badge: 'Academic Pick',
      notes: 'Semester 1 & 2 Core',
      image: imgCalcBook,
      description: 'Single Variable Calculus textbook covering limits, derivatives & integrals. Verified pre-owned in like-new condition with no markings.'
    },
    {
      id: 2,
      title: 'Handcrafted Matcha Mug ',
      category: 'Handmade Crafts',
      price: 350,
      origPrice: 699,
      condition: 'Handmade',
      seller: 'Nisha R. (Fine Arts)',
      icon: 'palette',
      categoryTheme: 'theme-crafts',
      badge: 'Student Artisan',
      notes: 'Hand-thrown Glaze',
      image: imgMatchaMug,
      description: 'Hand-thrown ceramic mug with earthy green glaze finish. Perfect for matcha, chai, or as a desk planter. One-of-a-kind artisan piece.'
    },
    {
      id: 3,
      title: 'Color Graphing Calculator',
      category: 'Machinery & Tech',
      price: 2499,
      origPrice: 6999,
      condition: 'Excellent',
      seller: 'Madhur T. (Engineering)',
      icon: 'precision_manufacturing',
      categoryTheme: 'theme-tech',
      badge: 'Lab Ready',
      notes: 'Battery + Cable included',
      image: imgGraphCalc,
      description: 'TI-84 Plus CE color graphing calculator. Includes USB cable and fresh batteries. Approved for all engineering exams.'
    },
    {
      id: 4,
      title: 'Botanical Room Spray: Cedar & Wild Lavender (50ml)',
      category: 'Perfumes & Scents',
      price: 299,
      origPrice: 499,
      condition: 'Freshly Crafted',
      seller: 'Charlie W. (Biochem Maker)',
      icon: 'local_florist',
      categoryTheme: 'theme-scents',
      badge: 'Organic',
      notes: 'Natural Essential Oils',
      image: imgRoomSpray,
      description: 'Includes: Natural Essential Oils. Verified pre-owned item in freshly crafted condition. Hand-blended botanical fragrance.'
    },
    {
      id: 5,
      title: 'Organic Chemistry as a Second Language (Klein)',
      category: 'Textbooks',
      price: 380,
      origPrice: 1100,
      condition: 'Good with notes',
      seller: 'Dashmanth S. (Pre-Med \'25)',
      icon: 'menu_book',
      categoryTheme: 'theme-academic',
      badge: 'Annotated',
      notes: 'Highlighted Key Concepts',
      image: imgOrgChem,
      description: 'Heavily annotated with colour-coded sticky notes and highlighted key mechanisms. Ideal for Pre-Med & Biochem students.'
    },
    {
      id: 6,
      title: 'Hand-Embroidered Canvas Tote Bag',
      category: 'Handmade Crafts',
      price: 320,
      origPrice: 599,
      condition: 'Handmade',
      seller: 'Aishwarya N. (Design Club)',
      icon: 'palette',
      categoryTheme: 'theme-crafts',
      badge: 'Eco-Craft',
      notes: '100% Organic Cotton',
      image: imgToteBag,
      description: 'Beautiful floral hand-embroidered tote bag. Made from 100% organic cotton canvas. Sustainable & unique campus accessory.'
    },
    {
      id: 7,
      title: 'Arduino Robotics Starter Kit + Sensor Shield',
      category: 'Machinery & Tech',
      price: 1850,
      origPrice: 3499,
      condition: 'Gently Used',
      seller: 'Daksh L. (Robotics Club)',
      icon: 'precision_manufacturing',
      categoryTheme: 'theme-tech',
      badge: 'STEM Kit',
      notes: 'Complete Sensor Modules',
      image: imgArduinoKit,
      description: 'Complete Arduino Uno starter kit with sensor shield, breadboard, jumper wires & 12 sensor modules. Perfect for robotics projects.'
    },
    {
      id: 8,
      title: 'Artisanal Solid Perfume: Amberwood & Bergamot',
      category: 'Perfumes & Scents',
      price: 249,
      origPrice: 449,
      condition: 'Handmade',
      seller: 'Morgan P. (Campus Alchemist)',
      icon: 'local_florist',
      categoryTheme: 'theme-scents',
      badge: 'Pocket Scent',
      notes: 'Beeswax & Jojoba Base',
      image: imgSolidPerfume,
      description: 'Compact solid perfume in a brass tin. Made with beeswax, jojoba oil & natural essential oils. Warm amber & citrus bergamot notes.'
    }
  ];

  // Category filter definitions
  const categoryDefs = [
    { key: 'All', name: 'All Categories', icon: 'apps' },
    { key: 'Textbooks', name: 'Textbooks & Notes', icon: 'menu_book' },
    { key: 'Handmade Crafts', name: 'Handmade Crafts', icon: 'palette' },
    { key: 'Machinery & Tech', name: 'Machinery & Tech', icon: 'precision_manufacturing' },
    { key: 'Perfumes & Scents', name: 'Perfumes & Scents', icon: 'local_florist' }
  ];

  // Dynamic count calculation
  const getCategoryCount = (key) => {
    if (key === 'All') return `${staticProducts.length} items`;
    const count = staticProducts.filter((item) => item.category === key).length;
    return `${count} items`;
  };

  // Dynamic product filtering by category and live search query
  const filteredProducts = staticProducts.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.seller.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q)) ||
      (item.condition && item.condition.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleSellSubmit = (e) => {
    e.preventDefault();
    setIsSellModalOpen(false);
  };

  return (
    <div className="unimart-dashboard-wrap">
      {/* ================= TOP NAVBAR ================= */}
      <nav className="unimart-dash-nav">
        <div className="d-flex align-items-center justify-content-between gap-3">
          
          {/* Brand Logo */}
          <div className="d-flex align-items-center gap-3">
            <div 
              className="unimart-logo-group" 
              onClick={onGoToLogin} 
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
              onClick={onGoToLogin}
              title="Return to Landing Page"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              <span style={{ fontSize: '0.8rem' }}>Landing Page</span>
            </button>
          </div>

          {/* Dynamic Search Bar (Desktop) */}
          <div className="unimart-search-bar d-none d-md-flex">
            <span className="material-symbols-outlined text-muted me-2" style={{ fontSize: '20px' }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search textbooks, handmade crafts, lab tech, perfumes..."
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

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Sell Item Button */}
            <button
              type="button"
              className="unimart-sell-btn"
              onClick={() => setIsSellModalOpen(true)}
              title="Listing form"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>add_circle</span>
              <span>Sell an Item</span>
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

            {/* User Chip */}
            <div className="unimart-user-chip d-none d-sm-flex" title="Your student profile">
              <div className="unimart-avatar">S</div>
              <div className="d-flex flex-column text-start">
                <span className="fw-bold" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>Satkar Singh</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>Alfred A</span>
              </div>
            </div>
          </div>

        </div>
      </nav>

  
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
        </div>
      </div>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <main className="container-fluid px-lg-5 py-4">
        
        {/* Welcome Banner */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <div className="d-inline-flex align-items-center gap-1 text-muted small fw-semibold mb-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--unimart-maroon)' }}>verified</span>
              <span>Chitkara Campus Student Exchange</span>
            </div>
            <h2 className="fw-bolder mb-1" style={{ letterSpacing: '-0.025em' }}>
              Hi Satkar! What are you looking for today?
            </h2>
            <p className="text-muted mb-0">
              Explore pre-owned textbooks, handmade crafts, campus tech tools, and student-crafted products.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
              Verified Campus Exchange
            </span>
          </div>
        </div>

        {/* ================= HERO SPOTLIGHT CARDS (INTERACTIVE QUICK FILTERS) ================= */}
        <div className="unimart-hero-grid">
          
          {/* Card 1: Pre-owned Books (Lime Yellow Palette) */}
          <div 
            className={`unimart-spotlight-card card-lime-yellow ${selectedCategory === 'Textbooks' ? 'active-spotlight' : ''}`}
            onClick={() => {
              setSelectedCategory(selectedCategory === 'Textbooks' ? 'All' : 'Textbooks');
              document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedCategory(selectedCategory === 'Textbooks' ? 'All' : 'Textbooks');
                document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            title="Filter by Textbooks & Notes"
          >
            <div>
              <div className="unimart-card-tag">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>menu_book</span>
                <span>Semester Notes</span>
              </div>
              <div className="unimart-card-serif-title">
                Pre-owned books
              </div>
              <div className="unimart-card-subtitle">
                Course textbooks & verified notes starting at just ₹250
              </div>
            </div>

            <div className="unimart-view-all-pill">
              <span>{selectedCategory === 'Textbooks' ? 'Active Filter • Click to Reset' : 'Academic Collection'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {selectedCategory === 'Textbooks' ? 'close' : 'arrow_forward'}
              </span>
            </div>

            <span className="unimart-card-art-icon">📚</span>
          </div>

          {/* Card 2: Student Handmade Crafts & Art (Soft Pink Palette) */}
          <div 
            className={`unimart-spotlight-card card-soft-pink ${selectedCategory === 'Handmade Crafts' ? 'active-spotlight' : ''}`}
            onClick={() => {
              setSelectedCategory(selectedCategory === 'Handmade Crafts' ? 'All' : 'Handmade Crafts');
              document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedCategory(selectedCategory === 'Handmade Crafts' ? 'All' : 'Handmade Crafts');
                document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            title="Filter by Student Handmade Crafts"
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
                Canvases, Posters, Crochet & Tote bags from ₹199
              </div>
            </div>

            <div className="unimart-view-all-pill">
              <span>{selectedCategory === 'Handmade Crafts' ? 'Active Filter • Click to Reset' : 'Art Collections'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {selectedCategory === 'Handmade Crafts' ? 'close' : 'arrow_forward'}
              </span>
            </div>

            <span className="unimart-card-art-icon">🎨</span>
          </div>

          {/* Card 3: Machinery, Tech & Perfumes (Sky Blue Palette) */}
          <div 
            className={`unimart-spotlight-card card-sky-blue ${selectedCategory === 'Machinery & Tech' ? 'active-spotlight' : ''}`}
            onClick={() => {
              setSelectedCategory(selectedCategory === 'Machinery & Tech' ? 'All' : 'Machinery & Tech');
              document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedCategory(selectedCategory === 'Machinery & Tech' ? 'All' : 'Machinery & Tech');
                document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
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
                Calculators, kits & Home-made fragrances from ₹249
              </div>
            </div>

            <div className="unimart-view-all-pill">
              <span>{selectedCategory === 'Machinery & Tech' ? 'Active Filter • Click to Reset' : 'Tech & Fragrance'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {selectedCategory === 'Machinery & Tech' ? 'close' : 'arrow_forward'}
              </span>
            </div>

            <span className="unimart-card-art-icon">⚙️</span>
          </div>

        </div>

        {/* ================= FEATURED PRODUCTS SECTION (DYNAMIC FILTERING) ================= */}
        <div id="marketplace-catalog" className="unimart-section-header">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <h3 className="unimart-section-title mb-0">
              <span>Marketplace Catalog</span>
              <span className="badge rounded-pill bg-light text-muted border fs-6 fw-semibold">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Available
              </span>
            </h3>

            {/* Active filter tags */}
            {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {selectedCategory !== 'All' && (
                  <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                    <span className="text-muted small">Category:</span>
                    <strong>{selectedCategory}</strong>
                    <button
                      type="button"
                      className="btn-close ms-1"
                      style={{ fontSize: '0.65rem' }}
                      aria-label="Remove category filter"
                      onClick={() => setSelectedCategory('All')}
                    />
                  </span>
                )}
                {searchQuery.trim() !== '' && (
                  <span className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm">
                    <span className="text-muted small">Search:</span>
                    <strong>"{searchQuery}"</strong>
                    <button
                      type="button"
                      className="btn-close ms-1"
                      style={{ fontSize: '0.65rem' }}
                      aria-label="Clear search filter"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none text-danger fw-semibold p-0 ms-1"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Cards Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="unimart-empty-state">
            <div className="unimart-empty-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--unimart-maroon)' }}>
                search_off
              </span>
            </div>
            <h4 className="fw-bold mb-1">No Listings Found</h4>
            <p className="text-muted small mb-3 text-center" style={{ maxWidth: '420px' }}>
              {searchQuery.trim()
                ? `No products match "${searchQuery}" in ${selectedCategory === 'All' ? 'any category' : selectedCategory}.`
                : `No products available currently in "${selectedCategory}".`}
            </p>
            <button
              type="button"
              className="btn btn-dark rounded-pill px-4 py-2 fw-semibold btn-sm d-inline-flex align-items-center gap-2"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="unimart-products-grid">
            {filteredProducts.map((item) => {
              const discountPct = Math.round(((item.origPrice - item.price) / item.origPrice) * 100);
              return (
                <div key={item.id} className={`unimart-product-card ${item.categoryTheme || ''}`}>
                  
                  {/* Image area with overlays */}
                  <div className="unimart-card-image-wrap">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="unimart-card-image"
                      loading="lazy"
                    />

                    {/* Purple glow top border */}
                    <div className="unimart-card-glow-border"></div>

                    {/* Condition badge - top left */}
                    <span className="unimart-condition-badge">{item.condition}</span>
                    
                    {/* Wishlist heart - top right */}
                    <button type="button" className="unimart-wishlist-btn" title="Add to wishlist">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        favorite
                      </span>
                    </button>

                    {/* Floating center icon box */}
                    <div className="unimart-floating-icon-box">
                      <span className="material-symbols-outlined unimart-floating-icon">
                        {item.icon}
                      </span>
                    </div>

                    {/* Floating notes label */}
                    <span className="unimart-floating-notes-label">
                      {item.notes || item.category}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="unimart-card-body">
                    {/* Default Resting Layer (Image 2) */}
                    <div className="unimart-card-body-default">
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

                      <div className="unimart-price-row mt-auto pt-2">
                        <div className="d-flex align-items-baseline gap-2 flex-wrap">
                          <span className="unimart-current-price">₹{item.price.toLocaleString('en-IN')}</span>
                          {item.origPrice && (
                            <span className="unimart-orig-price">₹{item.origPrice.toLocaleString('en-IN')}</span>
                          )}
                          <span className="unimart-discount-tag">{discountPct}% OFF</span>
                        </div>

                        <button 
                          type="button" 
                          className="unimart-add-cart-btn"
                          title="Add to cart"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                        </button>
                      </div>
                    </div>

                    {/* Hover Overlay Layer (Image 1) */}
                    <div className="unimart-card-body-hover">
                      <h6 className="unimart-hover-title" title={item.title}>
                        {item.title}
                      </h6>

                      <div className="unimart-hover-meta-icon">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          badge
                        </span>
                      </div>

                      <p className="unimart-hover-description">
                        {item.description}
                      </p>

                      <div className="unimart-hover-price-row mt-auto">
                        <span className="unimart-hover-price">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="unimart-hover-location">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>location_on</span>
                          <span>Chitkara Campus</span>
                        </span>
                      </div>

                      <div className="unimart-hover-actions">
                        <button type="button" className="unimart-action-pill unimart-action-chat" title="Chat with seller">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat</span>
                          <span>Chat</span>
                        </button>
                        <button type="button" className="unimart-action-pill unimart-action-cart" title="Add to cart">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shopping_cart</span>
                          <span>+ Cart</span>
                        </button>
                        <button type="button" className="unimart-action-icon-btn" title="View details">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                        </button>
                      </div>
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
                Listing an item takes under 120 seconds. Connect directly with students from Chitkara for safe on-campus meetups at the library or square 1.
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
              Sell used semester books, handmade crafts, machinery/lab parts, or fragrances on campus.
            </p>

            <form onSubmit={handleSellSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Mathematics Volume 1 / Handmade Crochet Bookmark"
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
                    <option value="Textbooks">Textbooks & Academic</option>
                    <option value="Handmade Crafts">Handmade Crafts & Art</option>
                    <option value="Machinery & Tech">Machinery & Tech Gear</option>
                    <option value="Perfumes & Scents">Perfumes & Scents</option>
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
                  placeholder="Describe your item, edition/year, notes, or preferred campus meetup spot (e.g. Square one, Gate no. 4, Turing Block)..."
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
            
          </div>
        </div>
      </footer>
    </div>
  );
}
