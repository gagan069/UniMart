import React, { useState } from 'react';
import './Dashboard.css';

export default function Dashboard({ onGoToLogin }) {
  // Static state - no active tab switching or state mutations
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

  // Marketplace items priced in Indian Rupees (₹) with placeholder category styling (no images)
  const staticProducts = [
    {
      id: 1,
      title: 'Calculus: Early Transcendentals (8th Ed)',
      category: 'Textbooks',
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
      seller: 'Elena R. (Fine Arts \'26)',
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
      seller: 'Marcus T. (Engineering \'24)',
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
      category: 'Textbooks',
      price: 380,
      origPrice: 1100,
      condition: 'Good with notes',
      seller: 'David S. (Pre-Med \'25)',
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
  ];

  // Static display categories (static tabs)
  const categories = [
    { name: 'All Categories', icon: 'apps', count: '8 items' },
    { name: 'Textbooks & Notes', icon: 'menu_book', count: '2 items' },
    { name: 'Handmade Crafts', icon: 'palette', count: '2 items' },
    { name: 'Machinery & Tech', icon: 'precision_manufacturing', count: '2 items' },
    { name: 'Perfumes & Scents', icon: 'local_florist', count: '2 items' }
  ];

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
            <div className="unimart-logo-group">
              <div className="unimart-logo-badge">
                <span className="material-symbols-outlined">local_mall</span>
              </div>
              <span>UNIMART</span>
            </div>

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

          {/* Static Search Bar */}
          <div className="unimart-search-bar d-none d-md-flex">
            <span className="material-symbols-outlined text-muted me-2" style={{ fontSize: '20px' }}>
              search
            </span>
            <input
              type="text"
              readOnly
              placeholder="Search textbooks, handmade crafts, lab tech, perfumes..."
              className="unimart-search-input"
            />
            <span className="unimart-search-cat-static">
              All Categories
            </span>
            <button type="button" className="unimart-search-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
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
              <span className="unimart-badge-count">3</span>
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
                <span className="fw-bold" style={{ fontSize: '0.825rem', lineHeight: '1.2' }}>Satkar</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>Central Campus</span>
              </div>
            </div>
          </div>

        </div>
      </nav>

      {/* ================= STATIC CATEGORY SUB-NAV (NON-WORKING TABS) ================= */}
      <div className="unimart-subnav">
        <div className="unimart-cat-pills">
          {categories.map((cat, idx) => (
            <div
              key={cat.name}
              className={`unimart-pill-tab static-tab ${idx === 0 ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
              <span className="unimart-tab-count-tag">{cat.count}</span>
            </div>
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

        {/* ================= HERO SPOTLIGHT CARDS (STATIC CARDS) ================= */}
        <div className="unimart-hero-grid">
          
          {/* Card 1: Pre-owned Books (Lime Yellow Palette) */}
          <div className="unimart-spotlight-card card-lime-yellow static-spotlight">
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

            <div className="unimart-view-all-pill static-pill">
              <span>Academic Collection</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>

            <span className="unimart-card-art-icon">📚</span>
          </div>

          {/* Card 2: Student Handmade Crafts & Art (Soft Pink Palette) */}
          <div className="unimart-spotlight-card card-soft-pink static-spotlight">
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

            <div className="unimart-view-all-pill static-pill">
              <span>Artisan Collection</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>

            <span className="unimart-card-art-icon">🎨</span>
          </div>

          {/* Card 3: Machinery, Tech & Perfumes (Sky Blue Palette) */}
          <div className="unimart-spotlight-card card-sky-blue static-spotlight">
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

            <div className="unimart-view-all-pill static-pill">
              <span>Tech & Fragrance</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>

            <span className="unimart-card-art-icon">⚙️</span>
          </div>

        </div>

        {/* ================= FEATURED PRODUCTS SECTION (STATIC, NO IMAGES, INR VALUES) ================= */}
        <div className="unimart-section-header">
          <h3 className="unimart-section-title">
            <span>Marketplace Catalog</span>
            <span className="badge rounded-pill bg-light text-muted border fs-6 fw-semibold">
              {staticProducts.length} Items Available
            </span>
          </h3>
        </div>

        {/* Product Cards Grid: Static Graphic Placeholder, Clean Typography, INR Pricing */}
        <div className="unimart-products-grid">
          {staticProducts.map((item) => {
            const discountPct = Math.round(((item.origPrice - item.price) / item.origPrice) * 100);
            return (
              <div key={item.id} className="unimart-product-card">
                
                {/* No-image graphic placeholder banner with category theme */}
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
                  
                  {/* Static Wishlist Icon */}
                  <div 
                    className="unimart-wishlist-btn static-wishlist"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      favorite_border
                    </span>
                  </div>
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
