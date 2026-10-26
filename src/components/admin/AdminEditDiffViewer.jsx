import React from 'react';
import { categories } from '../../lib/categories.js';

export default function AdminEditDiffViewer({ item }) {
  if (!item || !item.pendingEdit) return null;

  const prop = item.pendingEdit;

  // Resolve proposed category
  const propCat = categories.find((c) => c.id === prop.category_id);
  const propSubcat = propCat?.subcategories?.find((s) => s.id === prop.subcategory_id);
  const propCategoryStr = propCat
    ? `${propCat.name}${propSubcat ? ` • ${propSubcat.name}` : ''}`
    : item.category;

  const currCategoryStr = `${item.category}${item.subcategory ? ` • ${item.subcategory}` : ''}`;

  const currentPhotos = (item.photos && item.photos.length > 0)
    ? item.photos
    : (item.image ? [item.image] : []);
  const proposedPhotos = Array.isArray(prop.photos) && prop.photos.length > 0
    ? prop.photos
    : currentPhotos;

  const isPhotosChanged =
    currentPhotos.length !== proposedPhotos.length ||
    currentPhotos.some((url, idx) => url !== proposedPhotos[idx]);

  const diffFields = [
    {
      label: 'Title',
      current: item.title,
      proposed: prop.title || item.title,
      isChanged: (prop.title || '').trim() !== (item.title || '').trim()
    },
    {
      label: 'Category',
      current: currCategoryStr,
      proposed: propCategoryStr,
      isChanged: currCategoryStr !== propCategoryStr
    },
    {
      label: 'Selling Price',
      current: `₹${Number(item.price).toLocaleString('en-IN')}`,
      proposed: `₹${Number(prop.price).toLocaleString('en-IN')}`,
      isChanged: Number(item.price) !== Number(prop.price)
    },
    {
      label: 'Original Price',
      current: item.origPrice ? `₹${Number(item.origPrice).toLocaleString('en-IN')}` : 'None',
      proposed: prop.original_price ? `₹${Number(prop.original_price).toLocaleString('en-IN')}` : 'None',
      isChanged: String(item.origPrice || '') !== String(prop.original_price || '')
    },
    {
      label: 'Condition',
      current: item.condition || 'Good',
      proposed: prop.item_condition || item.condition || 'Good',
      isChanged: (prop.item_condition || '').trim() !== (item.condition || '').trim()
    },
    {
      label: 'Meetup Spot',
      current: item.notes || 'Library Entrance',
      proposed: prop.meetup_spot || item.notes || 'Library Entrance',
      isChanged: (prop.meetup_spot || '').trim() !== (item.notes || '').trim()
    },
    {
      label: 'Description',
      current: item.description || '(empty)',
      proposed: prop.description || item.description || '(empty)',
      isChanged: (prop.description || '').trim() !== (item.description || '').trim()
    }
  ];

  return (
    <div
      className="p-3 my-2 rounded-3 border unimart-diff-viewer-card"
      style={{
        background: 'var(--unimart-diff-bg, rgba(245, 158, 11, 0.04))',
        borderColor: 'rgba(245, 158, 11, 0.25)'
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-1.5 fw-bold unimart-diff-title" style={{ fontSize: '0.84rem' }}>
          <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>
            compare_arrows
          </span>
          <span>Proposed Changes Comparison (Current vs Proposed)</span>
        </div>
        <span className="badge bg-warning bg-opacity-20 text-dark border border-warning rounded-pill px-2.5 py-0.5" style={{ fontSize: '0.7rem' }}>
          {diffFields.filter((f) => f.isChanged).length + (isPhotosChanged ? 1 : 0)} Field(s) Modified
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0 unimart-diff-table" style={{ fontSize: '0.8rem' }}>
          <thead className="unimart-diff-thead text-muted" style={{ fontSize: '0.7rem' }}>
            <tr>
              <th scope="col" style={{ width: '130px' }}>Field</th>
              <th scope="col" style={{ width: '38%' }}>Current (Live)</th>
              <th scope="col" style={{ width: '38%' }}>Proposed (Pending Review)</th>
              <th scope="col" className="text-end" style={{ width: '100px' }}>Diff Status</th>
            </tr>
          </thead>
          <tbody>
            {diffFields.map((field) => (
              <tr
                key={field.label}
                style={{
                  backgroundColor: field.isChanged ? 'rgba(245, 158, 11, 0.08)' : 'transparent'
                }}
              >
                <td className="fw-semibold unimart-diff-label">{field.label}</td>
                <td className={field.isChanged ? 'text-decoration-line-through text-muted' : ''}>
                  {field.current}
                </td>
                <td className={field.isChanged ? 'fw-bold text-success' : 'text-muted'}>
                  {field.proposed}
                </td>
                <td className="text-end">
                  {field.isChanged ? (
                    <span className="badge bg-warning text-dark border border-warning px-2 py-0.5 rounded-pill" style={{ fontSize: '0.66rem' }}>
                      Changed
                    </span>
                  ) : (
                    <span className="badge bg-light text-muted border px-2 py-0.5 rounded-pill" style={{ fontSize: '0.66rem' }}>
                      Same
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {/* Photos Comparison Row */}
            <tr
              style={{
                backgroundColor: isPhotosChanged ? 'rgba(245, 158, 11, 0.08)' : 'transparent'
              }}
            >
              <td className="fw-semibold text-muted">Photos</td>
              <td>
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  {currentPhotos.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Current ${idx + 1}`}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  ))}
                  <span className="text-muted small">({currentPhotos.length})</span>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  {proposedPhotos.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Proposed ${idx + 1}`}
                      style={{
                        width: '42px',
                        height: '42px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: isPhotosChanged ? '2px solid #16a34a' : '1px solid #cbd5e1'
                      }}
                    />
                  ))}
                  <span className={isPhotosChanged ? 'fw-bold text-success small' : 'text-muted small'}>
                    ({proposedPhotos.length})
                  </span>
                </div>
              </td>
              <td className="text-end">
                {isPhotosChanged ? (
                  <span className="badge bg-warning text-dark border border-warning px-2 py-0.5 rounded-pill" style={{ fontSize: '0.66rem' }}>
                    Changed
                  </span>
                ) : (
                  <span className="badge bg-light text-muted border px-2 py-0.5 rounded-pill" style={{ fontSize: '0.66rem' }}>
                    Same
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
