import React, { useState, useRef, useEffect } from 'react';
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

import { categories } from './lib/categories.js';

export const CONDITION_OPTIONS = [
  { value: 'Brand New', label: 'Brand New', hint: 'Unused, sealed or with tags' },
  { value: 'Like New', label: 'Like New', hint: 'Used a few times, no visible marks' },
  { value: 'Good', label: 'Good', hint: 'Normal use, minor scratches or wear' },
  { value: 'Fair', label: 'Fair', hint: 'Clear signs of use, still works fine' },
  { value: 'For Parts / Not Working', label: 'For Parts / Not Working', hint: 'Damaged or faulty; useful for repair or parts' }
];

export const MEETUP_OPTIONS = [
  'Square One',
  'Gate No. 4',
  'Turing Block',
  'Library Entrance',
  'Food Court',
  'Hostel Gate',
  'Other'
];

export default function Dashboard({ onGoToLogin }) {
  // Dynamic state for search & category filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Listing flow state (Stage 1 & Stage 2)
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    subcategory_id: null,
    price: '',
    condition: '',
    hasNotes: false,
    meetupSpot: '',
    customMeetupSpot: '',
    description: '',
    seller: 'Satkar (You)',
    photos: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const conditionDropdownRef = useRef(null);

  
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

  const [productList, setProductList] = useState(staticProducts);

  // Dynamic count calculation
  const getCategoryCount = (key) => {
    if (key === 'All') return `${productList.length} items`;
    const count = productList.filter((item) => item.category === key).length;
    return `${count} items`;
  };

  // Dynamic product filtering by category and live search query
  const filteredProducts = productList.filter((item) => {
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

  const selectedCategoryObj = categories.find((c) => c.id === formData.category_id);
  const isBooksCategory = selectedCategoryObj?.name === 'Books & Notes' || selectedCategoryObj?.id === 'books-notes';

  // Close condition dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (conditionDropdownRef.current && !conditionDropdownRef.current.contains(e.target)) {
        setIsConditionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation function per field
  const validateField = (field, value, allData = formData) => {
    let error = '';
    switch (field) {
      case 'title': {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          error = 'Item title is required.';
        } else if (trimmed.length < 5) {
          error = 'Title must be at least 5 characters.';
        } else if (trimmed.length > 80) {
          error = 'Title cannot exceed 80 characters.';
        }
        break;
      }
      case 'category_id': {
        if (!value) {
          error = 'Please select a category.';
        }
        break;
      }
      case 'price': {
        const valStr = String(value || '').trim();
        if (!valStr) {
          error = 'Price is required.';
        } else {
          const num = Number(valStr);
          if (!/^\d+$/.test(valStr) || isNaN(num) || num < 1 || num > 100000) {
            error = 'Price must be a whole number between ₹1 and ₹1,00,000.';
          }
        }
        break;
      }
      case 'condition': {
        if (!value) {
          error = 'Please select a condition.';
        }
        break;
      }
      case 'meetupSpot': {
        if (!value) {
          error = 'Please select a meetup spot.';
        }
        break;
      }
      case 'customMeetupSpot': {
        if (allData.meetupSpot === 'Other') {
          const trimmed = (value || '').trim();
          if (!trimmed) {
            error = 'Please specify your meetup spot.';
          }
        }
        break;
      }
      case 'description': {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          error = 'Description is required.';
        } else if (trimmed.length < 20) {
          error = `Description must be at least 20 characters (currently ${trimmed.length}).`;
        } else if (trimmed.length > 1000) {
          error = 'Description cannot exceed 1000 characters.';
        }
        break;
      }
      default:
        break;
    }
    return error;
  };

  const validateAll = (data = formData) => {
    const errors = {};
    const fields = ['title', 'category_id', 'price', 'condition', 'meetupSpot', 'description'];
    if (data.meetupSpot === 'Other') {
      fields.push('customMeetupSpot');
    }
    fields.forEach((f) => {
      const err = validateField(f, data[f], data);
      if (err) errors[f] = err;
    });
    return errors;
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field], formData);
    setFormErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (touchedFields[field]) {
      const err = validateField(field, value, updated);
      setFormErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const updated = {
      ...formData,
      category_id: catId,
      subcategory_id: null,
      hasNotes: catId === 'books-notes' ? formData.hasNotes : false
    };
    setFormData(updated);
    if (touchedFields.category_id) {
      setFormErrors((prev) => ({
        ...prev,
        category_id: catId ? '' : 'Please select a category.'
      }));
    }
  };

  const handleSelectCondition = (val) => {
    const updated = { ...formData, condition: val };
    setFormData(updated);
    setIsConditionOpen(false);
    setTouchedFields((prev) => ({ ...prev, condition: true }));
    setFormErrors((prev) => ({ ...prev, condition: '' }));
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    const allTouched = {
      title: true,
      category_id: true,
      price: true,
      condition: true,
      meetupSpot: true,
      customMeetupSpot: true,
      description: true
    };
    setTouchedFields(allTouched);

    const allErrors = validateAll(formData);
    setFormErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      // Don't move; show red messages and scroll/focus to first error
      const errorOrder = [
        { field: 'title', id: 'listing-title' },
        { field: 'category_id', id: 'listing-category' },
        { field: 'price', id: 'listing-price' },
        { field: 'condition', id: 'listing-condition-trigger' },
        { field: 'meetupSpot', id: 'listing-meetup' },
        { field: 'customMeetupSpot', id: 'listing-custom-meetup' },
        { field: 'description', id: 'listing-description' }
      ];
      const firstInvalid = errorOrder.find((item) => allErrors[item.field]);
      if (firstInvalid) {
        setTimeout(() => {
          const el = document.getElementById(firstInvalid.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }, 50);
      }
      return;
    }

    // Valid: Advance to Step 2
    setCurrentStep(2);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      category_id: '',
      subcategory_id: null,
      price: '',
      condition: '',
      hasNotes: false,
      meetupSpot: '',
      customMeetupSpot: '',
      description: '',
      seller: 'Satkar (You)',
      photos: []
    });
    setFormErrors({});
    setTouchedFields({});
    setIsConditionOpen(false);
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
                  
                  {/* ================= 1. RESTING CARD VIEW ================= */}
                  <div className="unimart-card-resting">
                    {/* Image area with category tint translucency */}
                    <div className="unimart-card-image-wrap">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="unimart-card-image"
                        loading="lazy"
                      />

                      {/* Translucent tint wash into the category's unique color */}
                      <div className="unimart-category-translucent-tint"></div>

                      {/* Purple/Category glow top border */}
                      <div className="unimart-card-glow-border"></div>

                      {/* Condition badge - top left */}
                      <span className="unimart-condition-badge">{item.condition}</span>
                      
                      {/* Wishlist heart - top right */}
                      <button type="button" className="unimart-wishlist-btn" title="Add to wishlist">
                        <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                          favorite_border
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

                    {/* Resting Card Body */}
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
                  </div>

                  {/* ================= 2. OTT HOVER POPUP (Styled after Hotstar reference) ================= */}
                  <div className="unimart-hover-popup">
                    {/* Top Preview Image Container with smooth dark fade */}
                    <div className="unimart-popup-image-container">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="unimart-popup-image" 
                      />
                      {/* Smooth dark gradient fading bottom into dark card body */}
                      <div className="unimart-popup-image-fade"></div>

                      {/* Category tag pill top-right */}
                      <div className="unimart-popup-top-tag">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{item.icon}</span>
                        <span>{item.category}</span>
                      </div>

                      {/* Stylized Logo / Title overlay bottom-left */}
                      <div className="unimart-popup-title-badge">
                        <div className="unimart-popup-badge-pill">{item.badge}</div>
                        <h5 className="unimart-popup-hero-title">{item.title}</h5>
                      </div>
                    </div>

                    {/* Lower Card Details */}
                    <div className="unimart-popup-content">
                      {/* Action buttons row: [ ▶ Watch Now ]  [ + ]  [ 💬 ] */}
                      <div className="unimart-popup-actions-row">
                        <button 
                          type="button" 
                          className="unimart-popup-btn-watch"
                          title={`Buy Now • ₹${item.price.toLocaleString('en-IN')}`}
                        >
                          <span className="material-symbols-outlined">play_arrow</span>
                          <span>Buy Now</span>
                        </button>

                        <button 
                          type="button" 
                          className="unimart-popup-btn-icon"
                          title="Add to wishlist / cart"
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>

                        <button 
                          type="button" 
                          className="unimart-popup-btn-icon"
                          title="Chat with seller"
                        >
                          <span className="material-symbols-outlined">chat</span>
                        </button>
                      </div>

                      {/* Metadata Row with bullet dots */}
                      <div className="unimart-popup-meta-row">
                        <span className="unimart-popup-meta-price">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="unimart-popup-meta-dot">•</span>
                        <span className="unimart-popup-meta-item">{item.condition}</span>
                        <span className="unimart-popup-meta-dot">•</span>
                        <span className="unimart-popup-meta-item">{item.notes || 'Semester 1 & 2'}</span>
                        <span className="unimart-popup-meta-dot">•</span>
                        <span className="unimart-popup-meta-item">Chitkara</span>
                        <span className="unimart-popup-meta-dot">•</span>
                        <span className="unimart-popup-meta-item">{item.category}</span>
                      </div>

                      {/* Synopsis / Description */}
                      <p className="unimart-popup-synopsis">
                        {item.description}
                      </p>

                      {/* Seller Footer */}
                      <div className="unimart-popup-footer">
                        <div className="d-flex align-items-center gap-1 text-muted">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>person</span>
                          <span>{item.seller}</span>
                        </div>
                        <span className="unimart-popup-verified-tag">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>verified</span>
                          <span>Chitkara Verified</span>
                        </span>
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

            {/* Step Progress Indicator */}
            <div className="unimart-step-indicator-wrapper">
              <div className="unimart-step-indicator">
                <span className={`unimart-step-pill ${currentStep === 1 ? 'active' : 'inactive'}`}>
                  <span className="unimart-step-num">1</span>
                  <span>Details</span>
                </span>
                <span className="unimart-step-divider">—</span>
                <span className={`unimart-step-pill ${currentStep === 2 ? 'active' : 'inactive'}`}>
                  <span className="unimart-step-num">2</span>
                  <span>Photos</span>
                </span>
              </div>
            </div>

            {currentStep === 1 ? (
              <form onSubmit={handleNextStep} noValidate>
                {/* Item Title */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold" htmlFor="listing-title">
                    Item Title <span className="unimart-req-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    id="listing-title"
                    placeholder="e.g. Engineering Mathematics Volume 1 / Handmade Crochet Bookmark"
                    className={`form-control rounded-3 py-2 ${formErrors.title ? 'is-invalid border-danger' : ''}`}
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    onBlur={() => handleBlur('title')}
                  />
                  {formErrors.title && (
                    <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                      {formErrors.title}
                    </div>
                  )}
                </div>

                {/* Category & Subcategory Row */}
                <div className="row g-3 mb-3">
                  <div className={selectedCategoryObj && selectedCategoryObj.subcategories.length === 0 ? "col-12" : "col-md-6"}>
                    <label className="form-label small fw-semibold" htmlFor="listing-category">
                      Category <span className="unimart-req-asterisk">*</span>
                    </label>
                    <select 
                      id="listing-category"
                      className={`form-select rounded-3 py-2 ${formErrors.category_id ? 'is-invalid border-danger' : ''}`}
                      value={formData.category_id}
                      onChange={handleCategoryChange}
                      onBlur={() => handleBlur('category_id')}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category_id && (
                      <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                        {formErrors.category_id}
                      </div>
                    )}
                  </div>

                  {/* Subcategory (optional): Hidden when category has no subcategories */}
                  {(!selectedCategoryObj || selectedCategoryObj.subcategories.length > 0) && (
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold" htmlFor="listing-subcategory">
                        Subcategory (optional)
                      </label>
                      <select
                        id="listing-subcategory"
                        className="form-select rounded-3 py-2"
                        disabled={!selectedCategoryObj}
                        value={formData.subcategory_id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            subcategory_id: val === '' ? null : val
                          }));
                        }}
                      >
                        {!selectedCategoryObj ? (
                          <option value="">Choose a category first</option>
                        ) : (
                          <>
                            <option value="">Not sure / skip</option>
                            {selectedCategoryObj.subcategories.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  )}
                </div>

                {/* Optional Checkbox for Books & Notes */}
                {isBooksCategory && (
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="listing-has-notes"
                      checked={formData.hasNotes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hasNotes: e.target.checked }))}
                      style={{ accentColor: 'var(--unimart-maroon)' }}
                    />
                    <label className="form-check-label small text-muted" htmlFor="listing-has-notes">
                      Has highlighting / handwritten notes
                    </label>
                  </div>
                )}

                {/* Price & Condition Row */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="listing-price">
                      Price (₹ INR) <span className="unimart-req-asterisk">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted fw-bold">₹</span>
                      <input
                        type="number"
                        id="listing-price"
                        min="1"
                        max="100000"
                        placeholder="e.g. 450"
                        className={`form-control rounded-end-3 py-2 ${formErrors.price ? 'is-invalid border-danger' : ''}`}
                        value={formData.price}
                        onChange={(e) => handleFieldChange('price', e.target.value)}
                        onBlur={() => handleBlur('price')}
                      />
                    </div>
                    {formErrors.price && (
                      <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                        {formErrors.price}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="listing-condition-trigger">
                      Condition <span className="unimart-req-asterisk">*</span>
                    </label>
                    <div className="position-relative" ref={conditionDropdownRef}>
                      <button
                        type="button"
                        id="listing-condition-trigger"
                        className={`form-select text-start rounded-3 py-2 d-flex justify-content-between align-items-center ${
                          formErrors.condition ? 'is-invalid border-danger' : ''
                        }`}
                        onClick={() => setIsConditionOpen(!isConditionOpen)}
                        onBlur={() => handleBlur('condition')}
                        aria-expanded={isConditionOpen}
                        style={{
                          cursor: 'pointer',
                          background: '#fff',
                          borderColor: formErrors.condition ? '#dc3545' : isConditionOpen ? 'var(--unimart-maroon)' : '#dee2e6'
                        }}
                      >
                        <span className={formData.condition ? 'text-dark text-truncate' : 'text-muted'}>
                          {formData.condition ? (
                            <strong className="fw-semibold">{formData.condition}</strong>
                          ) : (
                            <span className="text-muted">Select condition...</span>
                          )}
                        </span>
                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>
                          {isConditionOpen ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>

                      {isConditionOpen && (
                        <div className="unimart-condition-dropdown">
                          {CONDITION_OPTIONS.map((opt) => (
                            <div
                              key={opt.value}
                              className={`unimart-condition-item ${formData.condition === opt.value ? 'selected' : ''}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectCondition(opt.value);
                              }}
                            >
                              <div className="unimart-condition-name">{opt.label}</div>
                              <div className="unimart-condition-hint">{opt.hint}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {formErrors.condition && (
                      <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                        {formErrors.condition}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meetup Spot */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold" htmlFor="listing-meetup">
                    Meetup Spot <span className="unimart-req-asterisk">*</span>
                  </label>
                  <select
                    id="listing-meetup"
                    className={`form-select rounded-3 py-2 ${formErrors.meetupSpot ? 'is-invalid border-danger' : ''}`}
                    value={formData.meetupSpot}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleFieldChange('meetupSpot', val);
                      if (val !== 'Other') {
                        handleFieldChange('customMeetupSpot', '');
                      }
                    }}
                    onBlur={() => handleBlur('meetupSpot')}
                  >
                    <option value="">Select campus meetup spot</option>
                    {MEETUP_OPTIONS.map((spot) => (
                      <option key={spot} value={spot}>{spot}</option>
                    ))}
                  </select>
                  {formErrors.meetupSpot && (
                    <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                      {formErrors.meetupSpot}
                    </div>
                  )}

                  {formData.meetupSpot === 'Other' && (
                    <div className="mt-2">
                      <label className="form-label small fw-semibold" htmlFor="listing-custom-meetup">
                        Specify spot <span className="unimart-req-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        id="listing-custom-meetup"
                        className={`form-control rounded-3 py-2 ${formErrors.customMeetupSpot ? 'is-invalid border-danger' : ''}`}
                        placeholder="e.g. Block C Common Room / Tennis Court"
                        value={formData.customMeetupSpot}
                        onChange={(e) => handleFieldChange('customMeetupSpot', e.target.value)}
                        onBlur={() => handleBlur('customMeetupSpot')}
                      />
                      {formErrors.customMeetupSpot && (
                        <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                          {formErrors.customMeetupSpot}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold mb-0" htmlFor="listing-description">
                      Description <span className="unimart-req-asterisk">*</span>
                    </label>
                    <span className={`unimart-char-counter small ${formData.description.length > 1000 ? 'text-danger' : 'text-muted'}`}>
                      {formData.description.length} / 1000
                    </span>
                  </div>
                  <textarea
                    id="listing-description"
                    rows="3"
                    placeholder="Provide key details about item condition, edition, features, or reasons for selling (min 20 characters)..."
                    className={`form-control rounded-3 ${formErrors.description ? 'is-invalid border-danger' : ''}`}
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                  ></textarea>
                  {formErrors.description && (
                    <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                      {formErrors.description}
                    </div>
                  )}
                </div>

                {/* Bottom of Step 1: Next Button */}
                <button 
                  type="submit" 
                  className="unimart-sell-btn w-100 justify-content-center py-2 fs-6"
                >
                  <span>Next: Add Photos</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </button>
              </form>
            ) : (
              /* Step 2 Placeholder for Stage 2 */
              <div>
                <p className="text-muted small">Photos step will be enabled in Stage 2.</p>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-3 py-1 btn-sm"
                  onClick={() => setCurrentStep(1)}
                >
                  ← Back to Details
                </button>
              </div>
            )}
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
