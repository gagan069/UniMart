import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from './context/ThemeContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useChat } from './context/ChatContext.jsx';
import { canManageListing } from './lib/permissions.js';
import { categories } from './lib/categories.js';
import { compressImage } from './lib/imageCompressor.js';
import {
  fetchListings,
  createListing,
  updateListing as updateListingAction,
  deleteListing as deleteListingAction
} from './store/slices/listingsSlice.js';

import {
  CONDITION_OPTIONS,
  MEETUP_OPTIONS,
  CATEGORY_THEME_MAP,
  resolveCategoryId,
  getDisplaySellerName,
  isUserListingOwner
} from './lib/constants.js';

import Navbar from './components/Navbar.jsx';
import CategoryBar from './components/CategoryBar.jsx';
import SpotlightCard from './components/SpotlightCard.jsx';
import ListingGrid from './components/ListingGrid.jsx';
import SellListingModal from './components/SellListingModal/SellListingModal.jsx';
import FloatingChatButton from './components/chat/FloatingChatButton.jsx';
import ChatModal from './components/chat/ChatModal.jsx';

import imgCalcBook from './assets/products/calculus.jpg';
import './Dashboard.css';

// Re-export constants and helpers for backward compatibility
export {
  CONDITION_OPTIONS,
  MEETUP_OPTIONS,
  CATEGORY_THEME_MAP,
  resolveCategoryId,
  getDisplaySellerName,
  isUserListingOwner
};

export default function Dashboard({ onGoToLogin }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth() || {};
  const dispatch = useDispatch();

  // Redux listings state
  const productList = useSelector((state) => state.listings.items) || [];

  const { openChatWithItem, closeChat } = useChat();
  const [adminAlert, setAdminAlert] = useState(null);

  const handleGoToLogin = () => {
    if (closeChat) closeChat();
    if (onGoToLogin) onGoToLogin();
  };
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch listings on mount and user change
  useEffect(() => {
    dispatch(fetchListings({ currentUser: user }));
  }, [dispatch, user]);

  // Listen for access denied redirect from /admin route
  useEffect(() => {
    if (location.state?.accessDeniedToast) {
      setAdminAlert({
        type: 'danger',
        text: location.state.accessDeniedToast
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Search & category filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Step modal state
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const conditionDropdownRef = useRef(null);
  const [isConditionOpen, setIsConditionOpen] = useState(false);

  // Listing Form State
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    subcategory_id: null,
    price: '',
    origPrice: '',
    condition: '',
    hasNotes: false,
    meetupSpot: '',
    customMeetupSpot: '',
    description: '',
    seller: user?.name || 'Campus Student',
    photos: []
  });

  const [formErrors, setFormErrors] = useState({});
  const [, setTouchedFields] = useState({});
  const [editResultType, setEditResultType] = useState('price_only');
  const [cardPhotoIndex, setCardPhotoIndex] = useState({});

  // Handlers for navigating through multi-photo cards
  const handlePrevPhoto = (e, itemId, totalPhotos) => {
    if (e) e.stopPropagation();
    setCardPhotoIndex((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + totalPhotos) % totalPhotos
    }));
  };

  const handleNextPhoto = (e, itemId, totalPhotos) => {
    if (e) e.stopPropagation();
    setCardPhotoIndex((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % totalPhotos
    }));
  };

  // Category filter definitions derived from categories.js
  const categoryDefs = [
    { key: 'All', name: 'All Categories', icon: 'apps' },
    ...categories.map((c) => ({
      key: c.id,
      name: c.name,
      icon: c.icon
    }))
  ];

  const [catalogTab, setCatalogTab] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const t = new URLSearchParams(window.location.search).get('tab');
        if (t === 'my' || t === 'all') return t;
      }
    } catch {
      // ignore
    }
    return 'all';
  });

  // Revert to 'all' if user logs out while on 'my' tab
  useEffect(() => {
    if (!user && catalogTab === 'my') {
      setCatalogTab('all');
    }
  }, [user, catalogTab]);

  // Total count of listings owned by current user
  const myListingsCount = user
    ? productList.filter((item) => item.seller_id === user.id).length
    : 0;

  // Active pool of products scoped by catalog tab ('all' vs 'my')
  const activeScopedProducts = catalogTab === 'my' && user
    ? productList.filter((item) => item.seller_id === user.id)
    : productList;

  const pendingCount = activeScopedProducts.filter((item) => item.status === 'pending').length;

  // Dynamic count calculation within the active catalog scope
  const getCategoryCount = (key) => {
    if (key === 'All') return `${activeScopedProducts.length} items`;
    if (key === 'Pending') return `${pendingCount} items`;
    const count = activeScopedProducts.filter((item) => {
      const itemCatId = resolveCategoryId(item);
      const catObj = categories.find((c) => c.id === key);
      return itemCatId === key || item.category === key || (catObj && item.category === catObj.name);
    }).length;
    return `${count} items`;
  };

  // Dynamic product filtering by category and live search query within active scope
  const filteredProducts = activeScopedProducts.filter((item) => {
    const itemCatId = resolveCategoryId(item);
    const catObj = categories.find((c) => c.id === selectedCategory);
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Pending'
        ? item.status === 'pending'
        : itemCatId === selectedCategory ||
          item.category === selectedCategory ||
          (catObj && item.category === catObj.name);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesSearch =
      (item.title || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.seller || '').toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q)) ||
      (item.condition && item.condition.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
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
        const num = Number(value);
        if (value === '' || value === null || value === undefined) {
          error = 'Price is required.';
        } else if (isNaN(num) || num <= 0) {
          error = 'Price must be greater than 0.';
        } else if (num > 100000) {
          error = 'Price cannot exceed ₹1,00,000.';
        }
        break;
      }
      case 'condition': {
        if (!value) {
          error = 'Please select item condition.';
        }
        break;
      }
      case 'meetupSpot': {
        if (!value) {
          error = 'Please choose a meetup spot.';
        }
        break;
      }
      case 'customMeetupSpot': {
        if (allData.meetupSpot === 'Other') {
          const trimmed = (value || '').trim();
          if (!trimmed) {
            error = 'Please specify your custom meetup spot.';
          } else if (trimmed.length < 3) {
            error = 'Spot must be at least 3 characters.';
          } else if (trimmed.length > 50) {
            error = 'Spot cannot exceed 50 characters.';
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

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const err = validateField(field, value, updated);
      setFormErrors((prevErr) => ({ ...prevErr, [field]: err }));
      return updated;
    });
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setFormErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category_id: val,
      subcategory_id: null
    }));
    const err = validateField('category_id', val);
    setFormErrors((prev) => ({ ...prev, category_id: err }));
  };

  const handleSelectCondition = (val) => {
    setFormData((prev) => ({ ...prev, condition: val }));
    setIsConditionOpen(false);
    const err = validateField('condition', val);
    setFormErrors((prev) => ({ ...prev, condition: err }));
  };

  const handleMeetupChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      meetupSpot: val,
      customMeetupSpot: val === 'Other' ? prev.customMeetupSpot : ''
    }));
    const err = validateField('meetupSpot', val);
    setFormErrors((prev) => ({ ...prev, meetupSpot: err }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    const fieldsToValidate = ['title', 'category_id', 'price', 'condition', 'meetupSpot', 'description'];
    if (formData.meetupSpot === 'Other') {
      fieldsToValidate.push('customMeetupSpot');
    }

    const errors = {};
    let hasError = false;
    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) {
        errors[f] = err;
        hasError = true;
      }
    });

    setFormErrors(errors);
    if (!hasError) {
      setCurrentStep(2);
    }
  };

  const handlePhotoFiles = async (files) => {
    if (!files || files.length === 0) return;
    const currentCount = formData.photos.length;
    const remainingSlots = 4 - currentCount;

    if (remainingSlots <= 0) {
      setFormErrors((prev) => ({
        ...prev,
        photos: 'Maximum 4 photos allowed per listing.'
      }));
      return;
    }

    const filesToLoad = Array.from(files).slice(0, remainingSlots);
    const compressionPromises = filesToLoad.map((file) => compressImage(file));
    const results = await Promise.allSettled(compressionPromises);

    const newPhotos = [];
    const errors = [];

    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        newPhotos.push(res.value);
      } else {
        const errorMsg = res.reason?.message || `Failed to process "${filesToLoad[idx].name}".`;
        errors.push(errorMsg);
      }
    });

    if (newPhotos.length > 0) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }

    if (errors.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        photos: errors.join(' ')
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, photos: '' }));
    }
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
    const categoryName = catObj ? catObj.name : 'Books & Notes';
    const categoryTheme = CATEGORY_THEME_MAP[formData.category_id] || 'theme-academic';
    const categoryIcon = catObj?.icon || 'sell';
    const finalMeetup = formData.meetupSpot === 'Other' ? formData.customMeetupSpot : formData.meetupSpot;

    if (isEditing && editingId) {
      const existingItem = productList.find((p) => p.id === editingId);
      const newPrice = Number(formData.price);
      const oldPrice = Number(existingItem?.price);
      const isPriceChanged = newPrice !== oldPrice;

      const existingCatId = existingItem?.category_id || resolveCategoryId(existingItem);
      const isTitleChanged = formData.title.trim() !== (existingItem?.title || '').trim();
      const isCategoryChanged = formData.category_id !== existingCatId;
      const isSubcategoryChanged = (formData.subcategory_id || '') !== (existingItem?.subcategory_id || '');
      const isConditionChanged = formData.condition !== (existingItem?.condition || '');
      const isDescChanged = (formData.description || '').trim() !== (existingItem?.description || '').trim();
      const isMeetupChanged = finalMeetup !== (existingItem?.notes || '');

      const oldPhotos = existingItem?.photos || (existingItem?.image ? [existingItem.image] : []);
      const newPhotos = formData.photos || [];
      const isPhotosChanged =
        oldPhotos.length !== newPhotos.length ||
        oldPhotos.some((p, i) => p !== newPhotos[i]);

      const isContentChanged =
        isTitleChanged ||
        isCategoryChanged ||
        isSubcategoryChanged ||
        isConditionChanged ||
        isDescChanged ||
        isMeetupChanged ||
        isPhotosChanged;

      // Rule: If ONLY the price was updated, auto-accept immediately and keep listing active
      if (!isContentChanged && isPriceChanged) {
        const parsedOrig = formData.origPrice ? Number(formData.origPrice) : (existingItem?.origPrice || null);
        dispatch(
          updateListingAction({
            id: editingId,
            updates: {
              price: newPrice,
              origPrice: parsedOrig && parsedOrig > newPrice ? parsedOrig : (existingItem?.origPrice && existingItem.origPrice > newPrice ? existingItem.origPrice : null),
              category_id: existingCatId
            },
            currentUser: user
          })
        );

        setEditResultType('price_only');
        setIsPublishedSuccess(true);
        setAdminAlert({
          type: 'success',
          text: `Price for "${existingItem?.title || 'Listing'}" updated to ₹${newPrice.toLocaleString('en-IN')}`
        });
        setTimeout(() => {
          setIsPublishedSuccess(false);
          setIsSellModalOpen(false);
          resetForm();
          setAdminAlert(null);
        }, 1800);
        return;
      }

      // Save backup of original approved version before applying pending edit
      const originalVersion = existingItem.originalVersion || {
        title: existingItem.title,
        category: existingItem.category,
        category_id: existingItem.category_id || existingCatId,
        subcategory_id: existingItem.subcategory_id || null,
        price: existingItem.price,
        origPrice: existingItem.origPrice,
        condition: existingItem.condition,
        icon: existingItem.icon,
        categoryTheme: existingItem.categoryTheme,
        notes: existingItem.notes,
        image: existingItem.image,
        photos: existingItem.photos,
        description: existingItem.description,
        status: existingItem.status === 'pending' ? 'approved' : (existingItem.status || 'approved'),
        badge: existingItem.badge === 'Waiting for Approval' ? 'Verified' : (existingItem.badge || 'Verified')
      };

      const parsedOrig = formData.origPrice ? Number(formData.origPrice) : (existingItem?.origPrice || null);

      dispatch(
        updateListingAction({
          id: editingId,
          updates: {
            title: formData.title.trim(),
            category: categoryName,
            category_id: formData.category_id,
            subcategory_id: formData.subcategory_id || null,
            price: newPrice,
            origPrice: parsedOrig && parsedOrig > newPrice ? parsedOrig : null,
            condition: formData.condition,
            icon: categoryIcon,
            categoryTheme: categoryTheme,
            notes: finalMeetup,
            image: formData.photos[0] || imgCalcBook,
            photos: formData.photos,
            description: formData.description,
            seller: user?.name || (existingItem?.seller ? existingItem.seller.replace(/\s*\(You\)/i, '').trim() : 'Campus Student'),
            status: 'pending',
            badge: 'Waiting for Approval',
            pendingType: 'edit',
            originalVersion,
            editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          currentUser: user
        })
      );

      setEditResultType('pending_approval');
      setIsPublishedSuccess(true);
      setAdminAlert({
        type: 'warning',
        text: `Listing edits for "${formData.title}" submitted to Admin for approval ⏳`
      });
      setTimeout(() => {
        setIsPublishedSuccess(false);
        setIsSellModalOpen(false);
        resetForm();
        setAdminAlert(null);
      }, 2500);
      return;
    }

    const newListing = {
      seller_id: user?.id || 'student_a',
      title: formData.title.trim(),
      category: categoryName,
      category_id: formData.category_id,
      subcategory_id: formData.subcategory_id || null,
      price: Number(formData.price),
      origPrice: formData.origPrice && Number(formData.origPrice) > Number(formData.price) ? Number(formData.origPrice) : null,
      condition: formData.condition,
      seller: user?.name || 'Campus Student',
      icon: categoryIcon,
      categoryTheme: categoryTheme,
      badge: 'Waiting for Approval',
      notes: finalMeetup,
      image: formData.photos[0] || imgCalcBook,
      photos: formData.photos,
      description: formData.description,
      status: 'pending',
      pendingType: 'new',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    dispatch(createListing({ data: newListing, currentUser: user }));
    setEditResultType('pending_approval');
    setIsPublishedSuccess(true);
    setTimeout(() => {
      setIsPublishedSuccess(false);
      setIsSellModalOpen(false);
      resetForm();
    }, 2400);
  };

  const handleMovePhoto = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.photos.length) return;
    const newPhotos = [...formData.photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    setFormData((prev) => ({ ...prev, photos: newPhotos }));
  };

  const handleEditListingClick = (e, item) => {
    if (e) e.stopPropagation();
    if (!canManageListing(user, item)) return;

    setIsEditing(true);
    setEditingId(item.id);

    const categoryId = resolveCategoryId(item);
    const isKnownSpot = MEETUP_OPTIONS.includes(item.notes);
    const photosList =
      item.photos && item.photos.length > 0
        ? item.photos
        : item.image
        ? [item.image]
        : [];

    setFormData({
      title: item.title,
      category_id: categoryId,
      subcategory_id: item.subcategory_id || '',
      price: String(item.price),
      origPrice: item.origPrice ? String(item.origPrice) : '',
      condition: item.condition || 'Like New',
      hasNotes: Boolean(item.notes),
      meetupSpot: isKnownSpot ? item.notes : item.notes ? 'Other' : 'Library Entrance',
      customMeetupSpot: isKnownSpot ? '' : item.notes || '',
      description: item.description || '',
      seller: item.seller ? item.seller.replace(/\s*\(You\)/i, '').trim() : (user?.name || 'Campus Student'),
      photos: photosList
    });

    setFormErrors({});
    setTouchedFields({});
    setCurrentStep(1);
    setIsSellModalOpen(true);
  };

  const handleDeleteListingClick = (e, item) => {
    if (e) e.stopPropagation();
    if (!canManageListing(user, item)) return;

    const confirmed = window.confirm(
      `Delete '${item.title}'? This can't be undone.`
    );
    if (!confirmed) return;

    dispatch(deleteListingAction({ id: item.id, currentUser: user }));
    setAdminAlert({
      type: 'success',
      text: 'Listing deleted'
    });
    setTimeout(() => setAdminAlert(null), 3500);
  };

  const handleSellClick = () => {
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in with your college account to sell an item.'
      });
      if (onGoToLogin) setTimeout(() => handleGoToLogin(), 1000);
      return;
    }
    setIsEditing(false);
    setEditingId(null);
    setIsSellModalOpen(true);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to add items to your wishlist.'
      });
    }
  };

  const handleChatClick = (e, item) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to chat with campus sellers.'
      });
      return;
    }
    if (isUserListingOwner(item, user)) {
      setAdminAlert({
        type: 'info',
        text: 'This is your own listing! You can manage it under "My Listings".'
      });
      return;
    }
    openChatWithItem(item);
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to buy items on UNIMART.'
      });
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsEditing(false);
    setEditingId(null);
    setIsPublishedSuccess(false);
    setIsDragging(false);
    setFormData({
      title: '',
      category_id: '',
      subcategory_id: null,
      price: '',
      origPrice: '',
      condition: '',
      hasNotes: false,
      meetupSpot: '',
      customMeetupSpot: '',
      description: '',
      seller: user?.name || 'Campus Student',
      photos: []
    });
    setFormErrors({});
    setTouchedFields({});
    setIsConditionOpen(false);
  };

  return (
    <div className="unimart-dashboard-wrap">
      {/* Top Navbar */}
      <Navbar
        handleGoToLogin={handleGoToLogin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSellClick={handleSellClick}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        logout={logout}
        closeChat={closeChat}
        navigate={navigate}
      />

      {/* Subnav & Mobile Search */}
      <CategoryBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryDefs={categoryDefs}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        getCategoryCount={getCategoryCount}
        pendingCount={pendingCount}
      />

      {/* Main Dashboard Body */}
      <main className="container-fluid px-lg-5 py-4">
        {/* Welcome Banner */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <div className="d-inline-flex align-items-center gap-1 text-muted small fw-semibold mb-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--unimart-maroon)' }}>verified</span>
              <span>Chitkara Campus Student Exchange</span>
            </div>
            <h2 className="fw-bolder mb-1" style={{ letterSpacing: '-0.025em' }}>
              {user ? `Hi ${user.name ? user.name.split(' ')[0] : 'there'}!` : 'Hi Guest!'} What are you looking for today?
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

        {/* Hero Spotlight Cards */}
        <div className="unimart-hero-grid">
          <SpotlightCard
            colorClass="card-lime-yellow"
            categoryKey="books-notes"
            icon="menu_book"
            tagName="Books & Notes"
            serifTitle="Pre-owned books"
            subtitle="Course textbooks & verified notes starting at just ₹250"
            collectionLabel="Academic Collection"
            artIcon="📚"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <SpotlightCard
            colorClass="card-soft-pink"
            categoryKey="handmade-art"
            icon="palette"
            tagName="Handmade & Art"
            serifTitle="Best of student art"
            subtitle="Canvases, Posters, Crochet & Tote bags from ₹199"
            collectionLabel="Art Collections"
            artIcon="🎨"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <SpotlightCard
            colorClass="card-sky-blue"
            categoryKey="lab-engineering-gear"
            icon="precision_manufacturing"
            tagName="Lab & Engineering"
            serifTitle="Tech & Engineering tools"
            subtitle="Calculators, robotics kits & lab equipment from ₹450"
            collectionLabel="Lab & Tech Collection"
            artIcon="⚙️"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
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

        {/* Catalog & Product Grid */}
        <ListingGrid
          filteredProducts={filteredProducts}
          catalogTab={catalogTab}
          setCatalogTab={setCatalogTab}
          myListingsCount={myListingsCount}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          user={user}
          handleGoToLogin={handleGoToLogin}
          handleSellClick={handleSellClick}
          cardPhotoIndex={cardPhotoIndex}
          handlePrevPhoto={handlePrevPhoto}
          handleNextPhoto={handleNextPhoto}
          setCardPhotoIndex={setCardPhotoIndex}
          handleWishlistClick={handleWishlistClick}
          handleChatClick={handleChatClick}
          handleBuyClick={handleBuyClick}
          handleEditListingClick={handleEditListingClick}
          handleDeleteListingClick={handleDeleteListingClick}
        />

        {/* Sell CTA Banner */}
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

      {/* Sell Item Modal */}
      <SellListingModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        isEditing={isEditing}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        isPublishedSuccess={isPublishedSuccess}
        setIsPublishedSuccess={setIsPublishedSuccess}
        editResultType={editResultType}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        categories={categories}
        selectedCategoryObj={selectedCategoryObj}
        isBooksCategory={isBooksCategory}
        handleFieldChange={handleFieldChange}
        handleCategoryChange={handleCategoryChange}
        handleBlur={handleBlur}
        handleNextStep={handleNextStep}
        conditionDropdownRef={conditionDropdownRef}
        isConditionOpen={isConditionOpen}
        setIsConditionOpen={setIsConditionOpen}
        handleSelectCondition={handleSelectCondition}
        handleMeetupChange={handleMeetupChange}
        resetForm={resetForm}
        fileInputRef={fileInputRef}
        handlePhotoFiles={handlePhotoFiles}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        handleAddSamplePhoto={handleAddSamplePhoto}
        handleMovePhoto={handleMovePhoto}
        handleRemovePhoto={handleRemovePhoto}
        handlePublishListing={handlePublishListing}
      />

      {/* Footer */}
      <footer className="unimart-dash-footer">
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <span className="fw-bold">UNIMART</span> — The Peer-to-Peer College E-Commerce Platform.
          </div>
          <div className="d-flex gap-4">
            <button type="button" className="btn btn-link p-0 text-muted small text-decoration-none" onClick={handleGoToLogin}>
              View Onboarding / Login
            </button>
            <span className="text-muted small">Campus Meetup Safety</span>
            <span className="text-muted small">Student Maker Guidelines</span>
          </div>
        </div>
      </footer>

      {/* Real-time Campus Marketplace Chat */}
      <ChatModal />
      <FloatingChatButton />
    </div>
  );
}
