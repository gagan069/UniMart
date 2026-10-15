import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useListings } from './context/ListingsContext.jsx';
import { canManageListing, isAdmin as checkIsAdmin, isGuest, isStudent } from './lib/permissions.js';
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
  const { user, login, logout, switchAccount, seededUsers } = useAuth() || {};
  const { productList, setProductList, addListing, updateListing, removeListing } = useListings();
  const [adminAlert, setAdminAlert] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Dynamic state for search & category filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Listing flow state (Stage 1 & Stage 2)
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
  const [editResultType, setEditResultType] = useState('price_only'); // 'price_only' | 'pending_approval'
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

  // Category filter definitions
  const categoryDefs = [
    { key: 'All', name: 'All Categories', icon: 'apps' },
    { key: 'Textbooks', name: 'Textbooks & Notes', icon: 'menu_book' },
    { key: 'Handmade Crafts', name: 'Handmade Crafts', icon: 'palette' },
    { key: 'Machinery & Tech', name: 'Machinery & Tech', icon: 'precision_manufacturing' },
    { key: 'Perfumes & Scents', name: 'Perfumes & Scents', icon: 'local_florist' }
  ];

  const [catalogTab, setCatalogTab] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const t = new URLSearchParams(window.location.search).get('tab');
        if (t === 'my' || t === 'all') return t;
      }
    } catch (e) {}
    return 'all';
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleMenuClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleMenuClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleMenuClickOutside);
    };
  }, [isUserMenuOpen]);

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
    const count = activeScopedProducts.filter((item) => item.category === key).length;
    return `${count} items`;
  };

  // Dynamic product filtering by category and live search query within active scope
  const filteredProducts = activeScopedProducts.filter((item) => {
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

    const finalMeetup = formData.meetupSpot === 'Other' ? formData.customMeetupSpot : formData.meetupSpot;

    if (isEditing && editingId) {
      const existingItem = productList.find((p) => p.id === editingId);
      const newPrice = Number(formData.price);
      const oldPrice = Number(existingItem?.price);
      const isPriceChanged = newPrice !== oldPrice;

      // Check if any fields other than price changed
      const isTitleChanged = formData.title.trim() !== (existingItem?.title || '').trim();
      const isCategoryChanged = formData.category_id !== (existingItem?.category_id || '');
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
        updateListing(editingId, {
          price: newPrice,
          origPrice: Math.round(newPrice * 1.35)
        });

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

      // Rule: Except for price, whenever we edit the product send a request to the admin panel under "Pending Approvals"
      updateListing(editingId, {
        title: formData.title.trim(),
        category: categoryName,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || null,
        price: newPrice,
        origPrice: Math.round(newPrice * 1.35),
        condition: formData.condition,
        icon: iconMap[formData.category_id] || 'sell',
        categoryTheme: categoryThemeMap[formData.category_id] || 'theme-academic',
        notes: finalMeetup,
        image: formData.photos[0] || imgCalcBook,
        photos: formData.photos,
        description: formData.description,
        status: 'pending', // ⏳ Sent to admin panel under Pending Approvals!
        badge: 'Waiting for Approval',
        pendingType: 'edit',
        editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

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
      id: Date.now(),
      seller_id: user?.id || 'student_a',
      title: formData.title.trim(),
      category: categoryName,
      category_id: formData.category_id,
      subcategory_id: formData.subcategory_id || null,
      price: Number(formData.price),
      origPrice: Math.round(Number(formData.price) * 1.35),
      condition: formData.condition,
      seller: user?.name ? `${user.name} (You)` : 'Satkar (You)',
      icon: iconMap[formData.category_id] || 'sell',
      categoryTheme: categoryThemeMap[formData.category_id] || 'theme-academic',
      badge: 'Waiting for Approval',
      notes: finalMeetup,
      image: formData.photos[0] || imgCalcBook,
      photos: formData.photos,
      description: formData.description,
      status: 'pending', // ⏳ Marked as waiting to be approved
      pendingType: 'new',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addListing(newListing);
    setEditResultType('pending_approval');
    setIsPublishedSuccess(true);
    setTimeout(() => {
      setIsPublishedSuccess(false);
      setIsSellModalOpen(false);
      resetForm();
    }, 2400);
  };

  // Reorder photos in Step 2
  const handleMovePhoto = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.photos.length) return;
    const newPhotos = [...formData.photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    setFormData((prev) => ({ ...prev, photos: newPhotos }));
  };

  // Edit listing action: opens SAME 2-step form pre-filled with data
  const handleEditListingClick = (e, item) => {
    if (e) e.stopPropagation();
    if (!canManageListing(user, item)) return;

    setIsEditing(true);
    setEditingId(item.id);

    // Map item.category to category_id
    const matchedCat = categories.find(
      (c) =>
        c.name.toLowerCase() === (item.category || '').toLowerCase() ||
        (c.id === 'books-notes' && (item.category === 'Textbooks' || item.category === 'Books & Notes')) ||
        (c.id === 'crafts' && item.category === 'Handmade Crafts') ||
        (c.id === 'tech-tools' && item.category === 'Machinery & Tech') ||
        (c.id === 'fragrance' && item.category === 'Perfumes & Scents')
    );
    const categoryId = matchedCat ? matchedCat.id : 'books-notes';

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
      condition: item.condition || 'Like New',
      hasNotes: Boolean(item.notes),
      meetupSpot: isKnownSpot ? item.notes : item.notes ? 'Other' : 'Library Entrance',
      customMeetupSpot: isKnownSpot ? '' : item.notes || '',
      description: item.description || '',
      seller: item.seller || (user?.name ? `${user.name} (You)` : 'Satkar (You)'),
      photos: photosList
    });

    setFormErrors({});
    setTouchedFields({});
    setCurrentStep(1);
    setIsSellModalOpen(true);
  };

  // Delete listing action: asks confirmation ("Delete 'title'? This can't be undone.") then toast "Listing deleted"
  const handleDeleteListingClick = (e, item) => {
    if (e) e.stopPropagation();
    if (!canManageListing(user, item)) return;

    const confirmed = window.confirm(
      `Delete '${item.title}'? This can't be undone.`
    );
    if (!confirmed) return;

    removeListing(item.id);
    setAdminAlert({
      type: 'success',
      text: 'Listing deleted'
    });
    setTimeout(() => setAdminAlert(null), 3500);
  };

  // Guest interaction handlers (Rules: Guest view only; chat/wishlist/sell prompt login)
  const handleSellClick = () => {
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in with your college account to sell an item.'
      });
      if (onGoToLogin) setTimeout(() => onGoToLogin(), 1000);
      return;
    }
    setIsEditing(false);
    setEditingId(null);
    setIsSellModalOpen(true);
  };

  const handleWishlistClick = (e, item) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to add items to your wishlist.'
      });
      return;
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
  };

  const handleBuyClick = (e, item) => {
    e.stopPropagation();
    if (!user) {
      setAdminAlert({
        type: 'danger',
        text: 'Please sign in to buy items on UNIMART.'
      });
      return;
    }
  };

  // Legacy fallback removal
  const handleRemoveProduct = (productId, productTitle) => {
    const listing = productList.find((p) => p.id === productId);
    if (!listing) return;

    if (!canManageListing(user, listing)) {
      setAdminAlert({
        type: 'danger',
        text: 'Permission denied: Students can only delete their own listings.'
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete '${productTitle || 'this listing'}'? This can't be undone.`
    );
    if (!confirmed) return;

    removeListing(productId);
    setAdminAlert({
      type: 'success',
      text: 'Listing deleted'
    });
    setTimeout(() => setAdminAlert(null), 3500);
  };

  const handleAdminApprove = (productId, productTitle) => {
    if (!checkIsAdmin(user)) return;
    updateListing(productId, { status: 'approved', badge: 'Admin Approved' });
    setAdminAlert({
      type: 'success',
      text: `Listing "${productTitle || 'Item'}" has been approved and is now live!`
    });
    setTimeout(() => setAdminAlert(null), 4000);
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
      condition: '',
      hasNotes: false,
      meetupSpot: '',
      customMeetupSpot: '',
      description: '',
      seller: user?.name ? `${user.name} (You)` : 'Satkar (You)',
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

            {/* Consolidated Profile Chip with 3 Lines + Dropdown */}
            <div className="position-relative" ref={userMenuRef}>
              <div
                className={`unimart-user-chip ${!user ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (!user) {
                    if (onGoToLogin) onGoToLogin();
                  } else {
                    setIsUserMenuOpen((prev) => !prev);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (!user) {
                      if (onGoToLogin) onGoToLogin();
                    } else {
                      setIsUserMenuOpen((prev) => !prev);
                    }
                  }
                }}
                title={
                  !user
                    ? 'Guest Mode (Click to Sign In)'
                    : `${user.name} • ${user.studentId || (checkIsAdmin(user) ? 'ADMIN-001' : '2110990697')} • ${checkIsAdmin(user) ? 'Admin' : 'Student'}`
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
                    {!user ? 'Not signed in' : (user.studentId || (checkIsAdmin(user) ? 'ADMIN-001' : '2110990697'))}
                  </span>
                  <span className="unimart-chip-role">
                    {!user ? 'Guest' : checkIsAdmin(user) ? 'Admin' : 'Student'}
                  </span>
                </div>
              </div>

              {/* Profile Dropdown Menu for Logged In User */}
              {isUserMenuOpen && user && (
                <div className="unimart-profile-dropdown shadow-lg">
                  {/* 3 lines displayed inside dropdown (visible especially on mobile where navbar hides text) */}
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
                          {user.studentId || (checkIsAdmin(user) ? 'ADMIN-001' : '2110990697')}
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

                  {/* Switch Testing Accounts */}
                  <div className="py-2 border-bottom">
                    <div className="dropdown-header text-uppercase text-muted px-3 py-1" style={{ fontSize: '0.66rem', letterSpacing: '0.5px' }}>
                      Switch Testing Account
                    </div>
                    <button
                      type="button"
                      className={`dropdown-item d-flex align-items-center justify-content-between px-3 py-1.5 ${user?.id === 'student_b' ? 'active' : ''}`}
                      onClick={() => {
                        switchAccount('student_b');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.8rem' }}>🎓 Priya K. (Student B)</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>2110990697 • Student</div>
                      </div>
                      {user?.id === 'student_b' && (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`dropdown-item d-flex align-items-center justify-content-between px-3 py-1.5 ${user?.id === 'student_a' ? 'active' : ''}`}
                      onClick={() => {
                        switchAccount('student_a');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.8rem' }}>🎓 Satkar Singh (Student A)</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>2110990696 • Student</div>
                      </div>
                      {user?.id === 'student_a' && (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`dropdown-item d-flex align-items-center justify-content-between px-3 py-1.5 ${checkIsAdmin(user) ? 'active' : ''}`}
                      onClick={() => {
                        switchAccount('admin_1');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.8rem' }}>🛡️ Campus Admin</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>ADMIN-001 • Admin</div>
                      </div>
                      {checkIsAdmin(user) && (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="dropdown-item d-flex align-items-center justify-content-between px-3 py-1.5"
                      onClick={() => {
                        switchAccount('guest');
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.8rem' }}>👤 Guest Mode</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Not signed in • Guest</div>
                      </div>
                    </button>
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
            <div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <h3 className="unimart-section-title mb-0">
                  <span>Marketplace Catalog</span>
                  <span className="badge rounded-pill bg-light text-muted border fs-6 fw-semibold">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Available
                  </span>
                </h3>
              </div>

              {/* Catalog Scope Tabs: [ All Listings ] [ My Listings (count) ] */}
              <div className="d-flex align-items-center gap-2 mt-3" role="tablist" aria-label="Catalog Scope">
                <button
                  type="button"
                  role="tab"
                  aria-selected={catalogTab === 'all'}
                  className={`unimart-pill-tab ${catalogTab === 'all' ? 'active' : ''}`}
                  onClick={() => setCatalogTab('all')}
                  id="tab-all-listings"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>apps</span>
                  <span>All Listings</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={catalogTab === 'my'}
                  className={`unimart-pill-tab ${catalogTab === 'my' ? 'active' : ''}`}
                  onClick={() => {
                    if (!user) {
                      if (onGoToLogin) onGoToLogin();
                      return;
                    }
                    setCatalogTab('my');
                  }}
                  id="tab-my-listings"
                  title={!user ? "Sign in to view your listings" : "View your active listings"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                  <span>My Listings</span>
                  <span className="unimart-tab-count-tag">{myListingsCount}</span>
                </button>
              </div>
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
          catalogTab === 'my' && myListingsCount === 0 ? (
            <div className="unimart-empty-state">
              <div className="unimart-empty-icon-box">
                <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--unimart-maroon)' }}>
                  storefront
                </span>
              </div>
              <h4 className="fw-bold mb-1">You haven't listed anything yet</h4>
              <p className="text-muted small mb-3 text-center" style={{ maxWidth: '420px' }}>
                Share textbooks, handmade crafts, lab tools, or dorm essentials with fellow Chitkara students.
              </p>
              <button
                type="button"
                className="btn btn-dark rounded-pill px-4 py-2 fw-semibold btn-sm d-inline-flex align-items-center gap-2"
                onClick={handleSellClick}
                id="empty-state-sell-btn"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                <span>Sell an Item</span>
              </button>
            </div>
          ) : (
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
          )
        ) : (
          <div className="unimart-products-grid">
            {filteredProducts.map((item) => {
              const discountPct = Math.round(((item.origPrice - item.price) / item.origPrice) * 100);
              const photosList = item.photos && item.photos.length > 0 ? item.photos : (item.image ? [item.image] : []);
              const activePhotoIdx = cardPhotoIndex[item.id] || 0;
              const currentImg = photosList[activePhotoIdx] || item.image;
              const hasMultiplePhotos = photosList.length > 1;

              return (
                <div key={item.id} className={`unimart-product-card ${item.categoryTheme || 'theme-academic'}`}>
                  <div className="unimart-card-inner">
                    <div className="unimart-card-top-content">
                      {/* Image and placeholder banner with category theme */}
                      <div className={`unimart-card-placeholder-wrap ${item.categoryTheme || 'theme-academic'}`}>
                        <img 
                          src={currentImg} 
                          className="unimart-card-image" 
                          alt={item.title} 
                          loading="lazy"
                        />
                        {/* Preserved background translucent category tint */}
                        <div className="unimart-category-translucent-tint"></div>

                        {/* Category top glow border */}
                        <div className="unimart-card-glow-border"></div>

                        {/* Multi-Photo Carousel Arrows & Indicator */}
                        {hasMultiplePhotos && (
                          <>
                            <button
                              type="button"
                              className="unimart-card-nav-arrow unimart-card-nav-prev"
                              onClick={(e) => handlePrevPhoto(e, item.id, photosList.length)}
                              title="Previous photo"
                              aria-label="Previous photo"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <button
                              type="button"
                              className="unimart-card-nav-arrow unimart-card-nav-next"
                              onClick={(e) => handleNextPhoto(e, item.id, photosList.length)}
                              title="Next photo"
                              aria-label="Next photo"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                            <div className="unimart-card-photo-counter" title={`${photosList.length} photos available`}>
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>photo_library</span>
                              <span>{activePhotoIdx + 1}/{photosList.length}</span>
                            </div>
                            <div className="unimart-card-photo-dots">
                              {photosList.map((_, pIdx) => (
                                <span
                                  key={pIdx}
                                  className={`unimart-card-photo-dot ${pIdx === activePhotoIdx ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardPhotoIndex((prev) => ({ ...prev, [item.id]: pIdx }));
                                  }}
                                  title={`Photo ${pIdx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        <div className="unimart-placeholder-icon-box">
                          <span className="material-symbols-outlined unimart-placeholder-icon">
                            {item.icon || 'sell'}
                          </span>
                        </div>
                        <span className="unimart-placeholder-label">
                          {item.notes || item.meetupSpot || item.pickupSpot || item.category} 
                        </span>
                        
                        {/* Condition Badge */}
                        <span className="unimart-condition-badge">{item.condition}</span>

                        {/* Timer badge for pending approval */}
                        {item.status === 'pending' && (
                          <span className="unimart-pending-timer-badge" title="Waiting to be approved by campus admin">
                            <span className="material-symbols-outlined unimart-timer-pulse">schedule</span>
                            <span>Waiting to be approved</span>
                          </span>
                        )}
                        
                        {/* Wishlist Icon */}
                        <button 
                          type="button" 
                          className="unimart-wishlist-btn" 
                          title="Add to wishlist"
                          onClick={(e) => handleWishlistClick(e, item)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            favorite_border
                          </span>
                        </button>
                      </div>

                      {/* Card Body */}
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
                          <span className="unimart-card-category">
                            {item.category}{item.subcategory ? ` • ${item.subcategory}` : ''}
                          </span>
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

                        {/* Pricing in Indian Rupees (₹) */}
                        <div className="unimart-price-row mt-auto pt-2">
                          <div className="d-flex align-items-baseline gap-2 flex-wrap">
                            <span className="unimart-current-price">
                              {item.price === 0 ? 'Free' : `₹${item.price.toLocaleString('en-IN')}`}
                            </span>
                            {item.origPrice && (
                              <span className="unimart-orig-price">₹{item.origPrice.toLocaleString('en-IN')}</span>
                            )}
                            {discountPct > 0 && (
                              <span className="unimart-discount-tag">{discountPct}% OFF</span>
                            )}
                            {item.isNegotiable && (
                              <span className="badge bg-light text-dark border ms-1" style={{ fontSize: '0.65rem' }}>
                                Negotiable
                              </span>
                            )}
                          </div>

                          {/* Only inside "My Listings" tab, show ✏️ Edit and 🗑️ Delete where cart button is */}
                          {catalogTab === 'my' && canManageListing(user, item) && !checkIsAdmin(user) ? (
                            <div className="d-flex align-items-center gap-1.5 unimart-my-card-actions">
                              <button
                                type="button"
                                className="unimart-card-icon-btn unimart-btn-edit"
                                title="Edit"
                                onClick={(e) => handleEditListingClick(e, item)}
                                aria-label={`Edit ${item.title}`}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>edit</span>
                              </button>
                              <button
                                type="button"
                                className="unimart-card-icon-btn unimart-btn-delete"
                                title="Delete"
                                onClick={(e) => handleDeleteListingClick(e, item)}
                                aria-label={`Delete ${item.title}`}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>delete</span>
                              </button>
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              className="unimart-add-cart-btn"
                              title="Add to cart"
                              onClick={(e) => handleBuyClick(e, item)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Section (Visible on Hover with Ambient Light Bleed synced to active photo) */}
                    <div className="unimart-expanded-details" style={{ '--card-img': `url(${currentImg})` }}>
                      <h6 className="unimart-expanded-title" title={item.title}>
                        {item.title}
                      </h6>
                      <div className="unimart-expanded-meta">
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>badge</span>
                        <span style={{ fontSize: '0.78rem', marginLeft: '6px' }}>{item.seller}</span>
                      </div>
                      <p className="unimart-expanded-desc">
                        {item.description || (item.notes ? `Includes: ${item.notes}. ` : '') + `Verified pre-owned item in ${(item.condition || '').toLowerCase()} condition.`}
                      </p>
                      <div className="unimart-expanded-price-row">
                        <span className="unimart-expanded-price">
                          {item.price === 0 ? 'Free' : `₹${item.price.toLocaleString('en-IN')}`}
                        </span>
                        <span className="unimart-expanded-location">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                          {item.meetupSpot || item.notes || item.pickupSpot || 'Chitkara Campus'}
                        </span>
                      </div>
                      <div className="unimart-expanded-actions">
                        {catalogTab === 'my' && canManageListing(user, item) && !checkIsAdmin(user) ? (
                          <>
                            <button
                              type="button"
                              className="unimart-btn-secondary"
                              onClick={(e) => handleEditListingClick(e, item)}
                              title="Edit listing"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="unimart-btn-primary bg-danger border-danger"
                              onClick={(e) => handleDeleteListingClick(e, item)}
                              title="Delete listing"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="unimart-btn-secondary"
                              onClick={(e) => handleChatClick(e, item)}
                              title="Chat with seller"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                              Chat
                            </button>
                            <button
                              type="button"
                              className="unimart-btn-primary"
                              onClick={(e) => handleBuyClick(e, item)}
                              title="Add to cart"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                              + Cart
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="unimart-btn-icon"
                          title="Quick preview"
                          onClick={(e) => handleBuyClick(e, item)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
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
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {isEditing ? 'edit_note' : 'sell'}
                </span>
              </div>
              <h4 className="fw-bold mb-0">{isEditing ? 'Edit Listing' : 'List an Item on UNIMART'}</h4>
            </div>

            <p className="text-muted small mb-4">
              {isEditing
                ? 'Update price, title, description, condition, meetup spot, or photos for your listing.'
                : 'Sell used semester books, handmade crafts, machinery/lab parts, or fragrances on campus.'}
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
              editResultType === 'price_only' ? (
                <div className="text-center py-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '72px', height: '72px', background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>check_circle</span>
                  </div>
                  <h4 className="fw-bold mb-2">Price Updated Successfully!</h4>
                  <div className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#047857', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                    <span>Auto-Accepted • Live in Marketplace</span>
                  </div>
                  <p className="text-muted small mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    The price for <strong>"{formData.title}"</strong> has been updated to <strong>₹{Number(formData.price).toLocaleString('en-IN')}</strong> and remains live for campus buyers.
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      type="button"
                      className="unimart-sell-btn py-2 px-4"
                      onClick={() => {
                        setIsPublishedSuccess(false);
                        setIsSellModalOpen(false);
                        resetForm();
                      }}
                    >
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '72px', height: '72px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}
                  >
                    <span className="material-symbols-outlined unimart-timer-pulse" style={{ fontSize: '40px' }}>schedule</span>
                  </div>
                  <h4 className="fw-bold mb-2">{isEditing ? 'Edits Submitted for Approval!' : 'Item Submitted for Approval!'}</h4>
                  <div className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#b45309', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hourglass_top</span>
                    <span>⏳ Waiting for Approval (Sent to Admin Panel)</span>
                  </div>
                  <p className="text-muted small mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    Your updated details for <strong>"{formData.title}"</strong> have been sent to the Admin Panel under <em>Pending Approvals</em>. A campus admin will review and approve the changes.
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
                      <span>View in Catalog</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </button>
                  </div>
                </div>
              )
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
                      <div className="small fw-semibold mb-2">Uploaded Photos ({formData.photos.length}/4) — click arrows to reorder</div>
                      <div className="unimart-photo-previews-grid">
                        {formData.photos.map((photo, idx) => (
                          <div key={idx} className="unimart-photo-preview-item">
                            <img src={photo} alt={`Upload ${idx + 1}`} className="unimart-photo-preview-img" />
                            {idx === 0 && (
                              <span className="unimart-cover-badge">★ Cover</span>
                            )}

                            {/* Reorder buttons: move left / move right */}
                            <div className="unimart-photo-reorder-bar">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  className="unimart-photo-move-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, -1);
                                  }}
                                  title="Move photo left"
                                  aria-label="Move photo left"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_back</span>
                                </button>
                              )}
                              {idx < formData.photos.length - 1 && (
                                <button
                                  type="button"
                                  className="unimart-photo-move-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovePhoto(idx, 1);
                                  }}
                                  title="Move photo right"
                                  aria-label="Move photo right"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_forward</span>
                                </button>
                              )}
                            </div>

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

                  {/* Action Buttons: Back & Publish / Save Changes */}
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
                      id="save-changes-btn"
                    >
                      <span>{isEditing ? 'Save Changes' : 'Publish Item to Campus'}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                        {isEditing ? 'save' : 'check_circle'}
                      </span>
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
