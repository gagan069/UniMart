import React from 'react';
import imgCalcBook from '../../assets/products/calculus.jpg';
import imgMatchaMug from '../../assets/products/matcha_mug.jpg';
import imgGraphCalc from '../../assets/products/graphing_calc.jpg';
import imgRoomSpray from '../../assets/products/room_spray.jpg';

export default function Step2Photos({
  formData,
  formErrors,
  selectedCategoryObj,
  isEditing,
  setCurrentStep,
  fileInputRef,
  handlePhotoFiles,
  isDragging,
  setIsDragging,
  handleAddSamplePhoto,
  handleMovePhoto,
  handleRemovePhoto,
  handlePublishListing
}) {
  return (
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
              Supports JPG, PNG, WebP (Max 15MB each, auto-compressed, up to 4 photos)
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
  );
}
