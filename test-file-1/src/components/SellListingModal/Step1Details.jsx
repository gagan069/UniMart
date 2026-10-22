import React from 'react';
import { CONDITION_OPTIONS, MEETUP_OPTIONS } from '../../lib/constants.js';

export default function Step1Details({
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
  handleMeetupChange
}) {
  return (
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
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                setFormData((prev) => ({ ...prev, subcategory_id: val === '' ? null : val }));
              }}
            >
              {!selectedCategoryObj ? (
                <option value="">Choose a category first</option>
              ) : (
                <>
                  <option value="">Not sure / skip</option>
                  {selectedCategoryObj.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
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

      {/* Price & Original Price Row */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="listing-price">
            Selling Price (₹ INR) <span className="unimart-req-asterisk">*</span>
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
          <label className="form-label small fw-semibold" htmlFor="listing-orig-price">
            Original MRP / Retail Price (₹) <span className="text-muted fw-normal">(Optional)</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted fw-bold">₹</span>
            <input
              type="number"
              id="listing-orig-price"
              min="1"
              max="200000"
              placeholder="e.g. 1499 (for discount tag)"
              className="form-control rounded-end-3 py-2"
              value={formData.origPrice || ''}
              onChange={(e) => handleFieldChange('origPrice', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-3">
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
                  onMouseDown={(e) => { e.preventDefault(); handleSelectCondition(opt.value); }}
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
  );
}
