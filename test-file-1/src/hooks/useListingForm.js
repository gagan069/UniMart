import { useState, useRef, useEffect, useCallback } from 'react';
import { compressImage } from '../lib/imageCompressor.js';
import { categories } from '../lib/categories.js';
import { canManageListing } from '../lib/permissions.js';
import {
  CATEGORY_THEME_MAP,
  MEETUP_OPTIONS,
  resolveCategoryId
} from '../lib/constants.js';
import {
  createListing,
  updateListing as updateListingAction
} from '../store/slices/listingsSlice.js';
import imgCalcBook from '../assets/products/calculus.jpg';

const INITIAL_FORM_DATA = {
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
  photos: []
};

export function useListingForm({ user, productList = [], dispatch, setAdminAlert }) {
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);
  const [editResultType, setEditResultType] = useState('price_only');
  const [isDragging, setIsDragging] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);

  const fileInputRef = useRef(null);
  const conditionDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    seller: user?.name || 'Campus Student'
  });
  const [formErrors, setFormErrors] = useState({});
  const [, setTouchedFields] = useState({});

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setIsEditing(false);
    setEditingId(null);
    setIsPublishedSuccess(false);
    setIsDragging(false);
    setIsConditionOpen(false);
    setFormData({
      ...INITIAL_FORM_DATA,
      seller: user?.name || 'Campus Student'
    });
    setFormErrors({});
    setTouchedFields({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [user]);

  // Full reset whenever modal closes
  const closeSellModal = useCallback(() => {
    setIsSellModalOpen(false);
    resetForm();
  }, [resetForm]);

  // Open modal with login check
  const openSellModal = useCallback(() => {
    if (!user) {
      if (setAdminAlert) {
        setAdminAlert({
          type: 'danger',
          text: 'Please sign in with your college account to sell an item.'
        });
      }
      return false;
    }
    resetForm();
    setIsSellModalOpen(true);
    return true;
  }, [user, resetForm, setAdminAlert]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSellModalOpen) {
        closeSellModal();
      }
    };
    if (isSellModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSellModalOpen, closeSellModal]);

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
        if (!value) error = 'Please select a category.';
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
        if (!value) error = 'Please select item condition.';
        break;
      }
      case 'meetupSpot': {
        if (!value) error = 'Please choose a meetup spot.';
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
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      setFormErrors((prev) => ({ ...prev, photos: errors.join(' ') }));
    } else {
      setFormErrors((prev) => ({ ...prev, photos: '' }));
    }

    // Reset file input so re-adding the same photo triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const handleMovePhoto = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.photos.length) return;
    const newPhotos = [...formData.photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    setFormData((prev) => ({ ...prev, photos: newPhotos }));
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
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
      subcategory_id: item.subcategory_id || null,
      price: String(item.price),
      origPrice: item.origPrice ? String(item.origPrice) : '',
      condition: item.condition || 'Like New',
      hasNotes: Boolean(item.hasNotes ?? item.has_notes),
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
    const subcatObj = catObj?.subcategories?.find((s) => s.id === formData.subcategory_id);
    const subcategoryName = subcatObj ? subcatObj.name : null;
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
      const isSubcategoryChanged = (formData.subcategory_id || null) !== (existingItem?.subcategory_id || null);
      const isConditionChanged = formData.condition !== (existingItem?.condition || '');
      const isDescChanged = (formData.description || '').trim() !== (existingItem?.description || '').trim();
      const isMeetupChanged = finalMeetup !== (existingItem?.notes || '');
      const isNotesChanged = Boolean(formData.hasNotes) !== Boolean(existingItem?.hasNotes ?? existingItem?.has_notes);

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
        isNotesChanged ||
        isPhotosChanged;

      // Rule 2e: Saving an edit with NO changes just closes the modal with no approval request
      if (!isContentChanged && !isPriceChanged) {
        closeSellModal();
        return;
      }

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
        if (setAdminAlert) {
          setAdminAlert({
            type: 'success',
            text: `Price for "${existingItem?.title || 'Listing'}" updated to ₹${newPrice.toLocaleString('en-IN')}`
          });
        }
        setTimeout(() => {
          closeSellModal();
          if (setAdminAlert) setAdminAlert(null);
        }, 1800);
        return;
      }

      const parsedOrig = formData.origPrice ? Number(formData.origPrice) : (existingItem?.origPrice || null);

      dispatch(
        updateListingAction({
          id: editingId,
          updates: {
            title: formData.title.trim(),
            category: categoryName,
            category_id: formData.category_id,
            subcategory: subcategoryName,
            subcategory_id: formData.subcategory_id || null,
            price: newPrice,
            origPrice: parsedOrig && parsedOrig > newPrice ? parsedOrig : null,
            condition: formData.condition,
            icon: categoryIcon,
            categoryTheme: categoryTheme,
            notes: finalMeetup,
            hasNotes: Boolean(formData.hasNotes),
            image: formData.photos[0] || imgCalcBook,
            photos: formData.photos,
            description: formData.description,
            seller: user?.name || (existingItem?.seller ? existingItem.seller.replace(/\s*\(You\)/i, '').trim() : 'Campus Student'),
            editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          currentUser: user
        })
      );

      const alertText =
        existingItem?.status === 'rejected'
          ? `Listing "${formData.title}" resubmitted to Admin for approval ⏳`
          : existingItem?.status === 'approved'
          ? `Listing edits for "${formData.title}" submitted to Admin for approval ⏳`
          : `Listing updates for "${formData.title}" saved ⏳`;

      setEditResultType('pending_approval');
      setIsPublishedSuccess(true);
      if (setAdminAlert) {
        setAdminAlert({
          type: 'warning',
          text: alertText
        });
      }
      setTimeout(() => {
        closeSellModal();
        if (setAdminAlert) setAdminAlert(null);
      }, 2500);
      return;
    }

    // New Listing
    const newListing = {
      seller_id: user?.id || 'student_a',
      title: formData.title.trim(),
      category: categoryName,
      category_id: formData.category_id,
      subcategory: subcategoryName,
      subcategory_id: formData.subcategory_id || null,
      price: Number(formData.price),
      origPrice: formData.origPrice && Number(formData.origPrice) > Number(formData.price) ? Number(formData.origPrice) : null,
      condition: formData.condition,
      seller: user?.name || 'Campus Student',
      icon: categoryIcon,
      categoryTheme: categoryTheme,
      badge: 'Waiting for Approval',
      notes: finalMeetup,
      hasNotes: Boolean(formData.hasNotes),
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
      closeSellModal();
    }, 2400);
  };

  return {
    isSellModalOpen,
    openSellModal,
    closeSellModal,
    currentStep,
    setCurrentStep,
    isEditing,
    isPublishedSuccess,
    setIsPublishedSuccess,
    editResultType,
    isDragging,
    setIsDragging,
    isConditionOpen,
    setIsConditionOpen,
    fileInputRef,
    conditionDropdownRef,
    formData,
    setFormData,
    formErrors,
    resetForm,
    handleFieldChange,
    handleBlur,
    handleCategoryChange,
    handleSelectCondition,
    handleMeetupChange,
    handleNextStep,
    handlePhotoFiles,
    handleAddSamplePhoto,
    handleMovePhoto,
    handleRemovePhoto,
    handleEditListingClick,
    handlePublishListing
  };
}
