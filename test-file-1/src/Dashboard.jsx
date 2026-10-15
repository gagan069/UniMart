import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './context/ThemeContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
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
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, toggleAdminRole } = useAuth() || {};
  const [adminAlert, setAdminAlert] = useState(null);

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
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);

  
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

  const pendingCount = productList.filter((item) => item.status === 'pending').length;

  // Dynamic count calculation
  const getCategoryCount = (key) => {
    if (key === 'All') return `${productList.length} items`;
    if (key === 'Pending') return `${pendingCount} items`;
    const count = productList.filter((item) => item.category === key).length;
    return `${count} items`;
  };

  // Dynamic product filtering by category and live search query
  const filteredProducts = productList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Pending'
        ? item.status === 'pending'
        : item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.seller.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q)) ||
      (item.condition && item.condition.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q));

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
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    if (touchedFields[field]) {
      setFormData((prev) => {
        const err = validateField(field, value, prev);
        setFormErrors((ePrev) => ({ ...ePrev, [field]: err }));
        return prev;
      });
    }
  };

  const handleMeetupChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      meetupSpot: val,
      customMeetupSpot: val === 'Other' ? prev.customMeetupSpot : ''
    }));
    if (touchedFields.meetupSpot) {
      setFormErrors((prev) => ({
        ...prev,
        meetupSpot: val ? '' : 'Please select a meetup spot.',
        customMeetupSpot: val !== 'Other' ? '' : prev.customMeetupSpot
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      subcategory_id: null,
      hasNotes: catId === 'books-notes' ? prev.hasNotes : false
    }));
    if (touchedFields.category_id) {
      setFormErrors((prev) => ({
        ...prev,
        category_id: catId ? '' : 'Please select a category.'
      }));
    }
  };

  const handleSelectCondition = (val) => {
    setFormData((prev) => ({ ...prev, condition: val }));
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

  const handlePhotoFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const validImages = fileList.filter((f) => f.type.startsWith('image/'));

    if (validImages.length === 0) {
      setFormErrors((prev) => ({ ...prev, photos: 'Please select valid image files (JPG, PNG, WebP).' }));
      return;
    }

    const availableSlots = 4 - formData.photos.length;
    if (availableSlots <= 0) {
      setFormErrors((prev) => ({ ...prev, photos: 'Maximum 4 photos allowed.' }));
      return;
    }

    const filesToLoad = validImages.slice(0, availableSlots);
    let loadedCount = 0;
    const newPhotos = [];

    filesToLoad.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, photos: `File "${file.name}" exceeds 5MB limit.` }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        newPhotos.push(e.target.result);
        loadedCount++;
        if (loadedCount === filesToLoad.length) {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos]
          }));
          setFormErrors((prev) => ({ ...prev, photos: '' }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSamplePhoto = (sampleImg) => {
    if (formData.photos.length >= 4) {
      setFormErrors((prev) => ({ ...prev, photos: 'Maximum 4 photos allowed.' }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, sampleImg]
    }));
    setFormErrors((prev) => ({ ...prev, photos: '' }));
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handlePublishListing = (e) => {
    if (e) e.preventDefault();
    if (formData.photos.length === 0) {
      setFormErrors((prev) => ({
        ...prev,
        photos: 'Please upload at least 1 photo of your item (or select a campus sample photo below).'
      }));
      return;
    }

    const catObj = categories.find((c) => c.id === formData.category_id);
    const categoryName = catObj ? (catObj.id === 'books-notes' ? 'Textbooks' : catObj.name) : 'Textbooks';
    const categoryThemeMap = {
      'books-notes': 'theme-academic',
      'crafts': 'theme-crafts',
      'tech-tools': 'theme-tech',
      'fragrance': 'theme-scents'
    };
    const iconMap = {
      'books-notes': 'menu_book',
      'crafts': 'palette',
      'tech-tools': 'precision_manufacturing',
      'fragrance': 'local_florist'
    };

    const newListing = {
      id: Date.now(),
      title: formData.title.trim(),
      category: categoryName,
      price: Number(formData.price),
      origPrice: Math.round(Number(formData.price) * 1.35),
      condition: formData.condition,
      seller: formData.seller || 'Satkar (You)',
      icon: iconMap[formData.category_id] || 'sell',
      categoryTheme: categoryThemeMap[formData.category_id] || 'theme-academic',
      badge: 'Waiting for Approval',
      notes: formData.meetupSpot === 'Other' ? formData.customMeetupSpot : formData.meetupSpot,
      image: formData.photos[0] || imgCalcBook,
      description: formData.description,
      status: 'pending', // ⏳ Marked as waiting to be approved
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setProductList((prev) => [newListing, ...prev]);
    setIsPublishedSuccess(true);
    setTimeout(() => {
      setIsPublishedSuccess(false);
      setIsSellModalOpen(false);
      resetForm();
    }, 2400);
  };

  // Admin Listing Actions
  const handleAdminRemove = (productId, productTitle) => {
    if (!isAdmin) return;
    setProductList((prev) => prev.filter((p) => p.id !== productId));
    setAdminAlert({
      type: 'danger',
      text: `Listing "${productTitle || 'Item'}" removed from campus marketplace by Admin.`
    });
    setTimeout(() => setAdminAlert(null), 4000);
  };

  const handleAdminApprove = (productId, productTitle) => {
    if (!isAdmin) return;
    setProductList((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: 'approved', badge: 'Admin Approved' } : p
      )
    );
    setAdminAlert({
      type: 'success',
      text: `Listing "${productTitle || 'Item'}" has been approved by Admin and is now live!`
    });
    setTimeout(() => setAdminAlert(null), 4000);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsPublishedSuccess(false);
    setIsDragging(false);
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

            {/* Dark/Light Theme Toggle Button */}
            <button 
              type="button" 
              className="unimart-icon-action-btn unimart-theme-toggle-btn" 
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
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

            {/* Admin / Student Role Toggle Pill */}
            <button
              type="button"
              className={`unimart-role-toggle-btn ${isAdmin ? 'admin-active' : 'student-mode'}`}
              onClick={toggleAdminRole}
              title={isAdmin ? "Currently Admin Mode: Click to switch to Student View" : "Currently Student View: Click to switch to Admin Mode"}
              aria-label="Toggle user role between Admin and Student"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isAdmin ? 'admin_panel_settings' : 'school'}
              </span>
              <span className="d-none d-md-inline fw-semibold" style={{ fontSize: '0.78rem' }}>
                {isAdmin ? 'Campus Admin' : 'Student Mode'}
              </span>
              <span className={`unimart-role-pill-indicator ${isAdmin ? 'on' : 'off'}`}>
                {isAdmin ? 'ADMIN' : 'STUDENT'}
              </span>
            </button>

            {/* User Chip */}
            <div className="unimart-user-chip d-none d-sm-flex" title={isAdmin ? "Logged in as Campus Admin" : "Your student profile"}>
              <div className={`unimart-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                {isAdmin ? 'A' : 'S'}
              </div>
              <div className="d-flex flex-column text-start">
                <div className="d-flex align-items-center gap-1">
                  <span className="fw-bold" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>Satkar Singh</span>
                  {isAdmin && (
                    <span className="badge bg-danger text-white px-1.5 py-0.5 rounded" style={{ fontSize: '0.62rem' }}>ADMIN</span>
                  )}
                </div>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {isAdmin ? 'Campus Administrator' : 'Alfred A • Student'}
                </span>
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

          {pendingCount > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'Pending'}
              className={`unimart-pill-tab unimart-pill-pending ${selectedCategory === 'Pending' ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === 'Pending' ? 'All' : 'Pending')}
              title="View items waiting to be approved"
            >
              <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '18px', color: '#d97706' }}>
                schedule
              </span>
              <span>Waiting Approval</span>
              <span className="unimart-tab-count-tag count-pending">{pendingCount}</span>
            </button>
          )}
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

        {/* Admin Toast Alert */}
        {adminAlert && (
          <div className={`unimart-admin-toast ${adminAlert.type === 'danger' ? 'toast-danger' : 'toast-success'} mb-4`} role="alert">
            <div className="d-flex align-items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                {adminAlert.type === 'danger' ? 'delete_forever' : 'check_circle'}
              </span>
              <span className="fw-semibold small">{adminAlert.text}</span>
              <button
                type="button"
                className="btn-close ms-auto"
                style={{ fontSize: '0.7rem' }}
                onClick={() => setAdminAlert(null)}
                aria-label="Dismiss alert"
              ></button>
            </div>
          </div>
        )}

        {/* ================= FEATURED PRODUCTS SECTION (DYNAMIC FILTERING) ================= */}
        <div id="marketplace-catalog" className="unimart-section-header">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <h3 className="unimart-section-title mb-0">
                <span>Marketplace Catalog</span>
                <span className="badge rounded-pill bg-light text-muted border fs-6 fw-semibold">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Available
                </span>
              </h3>
              {isAdmin && (
                <span className="badge bg-danger text-white rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1 shadow-sm" style={{ fontSize: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>admin_panel_settings</span>
                  <span>Admin Mode Active: Listing Removal Enabled</span>
                </span>
              )}
            </div>

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

                      {/* Timer badge for pending approval */}
                      {item.status === 'pending' && (
                        <span className="unimart-pending-timer-badge" title="Waiting to be approved by campus admin">
                          <span className="material-symbols-outlined unimart-timer-pulse">schedule</span>
                          <span>Waiting to be approved</span>
                        </span>
                      )}
                      
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
                      {item.status === 'pending' && (
                        <div className="unimart-pending-strip mb-2">
                          <div className="d-flex align-items-center gap-1">
                            <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '15px', color: '#d97706' }}>schedule</span>
                            <span className="fw-semibold" style={{ fontSize: '0.72rem', color: '#b45309' }}>Waiting for Approval</span>
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>{item.submittedAt || 'Pending'}</span>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="unimart-card-category">{item.category}</span>
                        <span className={`unimart-badge-chip ${item.status === 'pending' ? 'chip-pending' : ''}`}>
                          {item.badge}
                        </span>
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

                      {/* Admin-only Listing Actions (Approve / Remove) */}
                      {isAdmin && (
                        <div className="unimart-admin-card-actions mt-2 pt-2 border-top">
                          {item.status === 'pending' && (
                            <button
                              type="button"
                              className="unimart-admin-btn-approve"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdminApprove(item.id, item.title);
                              }}
                              title="Admin: Approve listing to go live"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                              <span>Approve</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="unimart-admin-btn-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdminRemove(item.id, item.title);
                            }}
                            title="Admin: Remove from listing"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete_forever</span>
                            <span>Remove from Listing</span>
                          </button>
                        </div>
                      )}
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
                        {item.status === 'pending' ? (
                          <button
                            type="button"
                            className="unimart-popup-btn-pending"
                            disabled
                            title="Waiting for campus admin approval"
                          >
                            <span className="material-symbols-outlined unimart-timer-pulse">schedule</span>
                            <span>Waiting for Approval</span>
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            className="unimart-popup-btn-watch"
                            title={`Buy Now • ₹${item.price.toLocaleString('en-IN')}`}
                          >
                            <span className="material-symbols-outlined">play_arrow</span>
                            <span>Buy Now</span>
                          </button>
                        )}

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

                      {/* Admin Controls in OTT popup */}
                      {isAdmin && (
                        <div className="unimart-popup-admin-bar mt-2 pt-2 border-top border-secondary border-opacity-25">
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <span className="unimart-admin-popup-label">
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>admin_panel_settings</span>
                              <span>Admin Controls</span>
                            </span>
                            <div className="d-flex align-items-center gap-1.5">
                              {item.status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: '0.72rem' }}
                                  onClick={() => handleAdminApprove(item.id, item.title)}
                                  title="Approve listing"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                                  <span>Approve</span>
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-danger rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '0.72rem' }}
                                onClick={() => handleAdminRemove(item.id, item.title)}
                                title="Remove from listing"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                                <span>Remove from Listing</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
                    onChange={handleMeetupChange}
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
            ) : isPublishedSuccess ? (
              <div className="text-center py-4">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '72px', height: '72px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}
                >
                  <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '40px' }}>schedule</span>
                </div>
                <h4 className="fw-bold mb-2">Item Submitted for Approval!</h4>
                <div className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#b45309', fontSize: '0.82rem', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hourglass_top</span>
                  <span>⏳ Waiting to be approved (Timer Mark Active)</span>
                </div>
                <p className="text-muted small mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                  Your listing for <strong>"{formData.title}"</strong> has been queued with a timer mark. Campus administrators can review and approve or remove listings.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="unimart-sell-btn py-2 px-4"
                    onClick={() => {
                      setIsPublishedSuccess(false);
                      setIsSellModalOpen(false);
                      resetForm();
                      const catEl = document.getElementById('marketplace-catalog');
                      if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>View in Submissions / Catalog</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Step 2 Form */}
                <form onSubmit={handlePublishListing} noValidate>
                  {/* Summary Review Strip */}
                  <div className="unimart-review-summary-card d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="fw-bold text-truncate" style={{ maxWidth: '320px', fontSize: '0.92rem' }}>
                        {formData.title || 'Untitled Item'}
                      </div>
                      <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                        <span className="badge bg-light text-dark border rounded-pill px-2 py-0.5">
                          {selectedCategoryObj?.name || 'Category'}
                        </span>
                        <span>•</span>
                        <span className="fw-bold text-success">₹{Number(formData.price || 0).toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span>{formData.condition}</span>
                        <span>•</span>
                        <span>📍 {formData.meetupSpot === 'Other' ? formData.customMeetupSpot : formData.meetupSpot}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none fw-semibold p-0 text-muted"
                      onClick={() => setCurrentStep(1)}
                      title="Edit item details"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* Dropzone */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold d-flex justify-content-between align-items-center mb-1">
                      <span>Item Photos <span className="unimart-req-asterisk">*</span></span>
                      <span className="text-muted small">{formData.photos.length} / 4 photos added</span>
                    </label>

                    <input 
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoFiles(e.target.files)}
                    />

                    <div
                      className={`unimart-photo-dropzone ${isDragging ? 'dragging' : ''}`}
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handlePhotoFiles(e.dataTransfer.files);
                      }}
                    >
                      <div className="unimart-dropzone-icon-wrap mb-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                          add_photo_alternate
                        </span>
                      </div>
                      <div className="fw-semibold small mb-1">
                        Drag & drop photos here, or <span className="text-decoration-underline" style={{ color: 'var(--unimart-maroon)' }}>browse files</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Supports JPG, PNG, WebP (Max 5MB each, up to 4 photos)
                      </div>
                    </div>

                    {formErrors.photos && (
                      <div className="invalid-feedback d-block text-danger small mt-1" role="alert">
                        {formErrors.photos}
                      </div>
                    )}
                  </div>

                  {/* Quick Campus Demo Photos */}
                  <div className="mb-4">
                    <div className="text-muted small mb-2" style={{ fontSize: '0.78rem' }}>
                      Don't have photos ready? Pick a campus sample photo:
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="unimart-sample-photo-pill"
                        onClick={() => handleAddSamplePhoto(imgCalcBook)}
                        title="Add Calculus Textbook photo"
                        disabled={formData.photos.length >= 4}
                      >
                        <span>📚 Textbook</span>
                      </button>
                      <button
                        type="button"
                        className="unimart-sample-photo-pill"
                        onClick={() => handleAddSamplePhoto(imgMatchaMug)}
                        title="Add Ceramic Mug photo"
                        disabled={formData.photos.length >= 4}
                      >
                        <span>☕ Ceramic Craft</span>
                      </button>
                      <button
                        type="button"
                        className="unimart-sample-photo-pill"
                        onClick={() => handleAddSamplePhoto(imgGraphCalc)}
                        title="Add Calculator photo"
                        disabled={formData.photos.length >= 4}
                      >
                        <span>🔬 Tech Calculator</span>
                      </button>
                      <button
                        type="button"
                        className="unimart-sample-photo-pill"
                        onClick={() => handleAddSamplePhoto(imgRoomSpray)}
                        title="Add Botanical Room Spray photo"
                        disabled={formData.photos.length >= 4}
                      >
                        <span>🌿 Botanical Spray</span>
                      </button>
                    </div>
                  </div>

                  {/* Photo Previews */}
                  {formData.photos.length > 0 && (
                    <div className="mb-4">
                      <div className="small fw-semibold mb-2">Uploaded Photos ({formData.photos.length}/4)</div>
                      <div className="unimart-photo-previews-grid">
                        {formData.photos.map((photo, idx) => (
                          <div key={idx} className="unimart-photo-preview-item">
                            <img src={photo} alt={`Upload ${idx + 1}`} className="unimart-photo-preview-img" />
                            {idx === 0 && (
                              <span className="unimart-cover-badge">★ Cover</span>
                            )}
                            <button
                              type="button"
                              className="unimart-photo-remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(idx);
                              }}
                              title="Remove photo"
                              aria-label="Remove photo"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: Back & Publish */}
                  <div className="d-flex align-items-center justify-content-between gap-3 pt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4 py-2"
                      onClick={() => setCurrentStep(1)}
                    >
                      <span className="d-flex align-items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                        <span>Back to Details</span>
                      </span>
                    </button>

                    <button
                      type="submit"
                      className="unimart-sell-btn py-2 px-4 justify-content-center flex-grow-1"
                    >
                      <span>Publish Item to Campus</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>check_circle</span>
                    </button>
                  </div>
                </form>
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
