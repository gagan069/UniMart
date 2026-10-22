import React from 'react';
import Step1Details from './Step1Details.jsx';
import Step2Photos from './Step2Photos.jsx';

export default function SellListingModal({
  isOpen,
  onClose,
  isEditing,
  currentStep,
  setCurrentStep,
  isPublishedSuccess,
  setIsPublishedSuccess,
  editResultType,
  formData,
  setFormData,
  formErrors,
  categories,
  selectedCategoryObj,
  isBooksCategory,
  handleFieldChange,
  handleCategoryChange,
  handleBlur,
  handleNextStep,
  conditionDropdownRef,
  isConditionOpen,
  setIsConditionOpen,
  handleSelectCondition,
  handleMeetupChange,
  resetForm,
  fileInputRef,
  handlePhotoFiles,
  isDragging,
  setIsDragging,
  handleAddSamplePhoto,
  handleMovePhoto,
  handleRemovePhoto,
  handlePublishListing
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="unimart-sell-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="unimart-sell-modal-box">
        <button 
          type="button" 
          className="unimart-close-btn" 
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
          onClick={onClose}
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
          <Step1Details
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
          />
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
                    onClose();
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
                    onClose();
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
          <Step2Photos
            formData={formData}
            formErrors={formErrors}
            selectedCategoryObj={selectedCategoryObj}
            isEditing={isEditing}
            setCurrentStep={setCurrentStep}
            fileInputRef={fileInputRef}
            handlePhotoFiles={handlePhotoFiles}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            handleAddSamplePhoto={handleAddSamplePhoto}
            handleMovePhoto={handleMovePhoto}
            handleRemovePhoto={handleRemovePhoto}
            handlePublishListing={handlePublishListing}
          />
        )}
      </div>
    </div>
  );
}
