import React from 'react';

export default function SpotlightCard({
  colorClass,
  categoryKey,
  icon,
  tagName,
  serifTitle,
  subtitle,
  collectionLabel,
  artIcon,
  selectedCategory,
  onSelectCategory
}) {
  const isSelected = selectedCategory === categoryKey;

  const handleClick = () => {
    onSelectCategory(isSelected ? 'All' : categoryKey);
    document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  return (
    <div
      className={`unimart-spotlight-card ${colorClass} ${isSelected ? 'active-spotlight' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      title={`Filter by ${tagName}`}
    >
      <div>
        <div className="unimart-card-tag">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{icon}</span>
          <span>{tagName}</span>
        </div>
        <div className="unimart-card-serif-title">
          {serifTitle}
        </div>
        <div className="unimart-card-subtitle">
          {subtitle}
        </div>
      </div>

      <div className="unimart-view-all-pill">
        <span>{isSelected ? 'Active Filter • Click to Reset' : collectionLabel}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {isSelected ? 'close' : 'arrow_forward'}
        </span>
      </div>

      <span className="unimart-card-art-icon">{artIcon}</span>
    </div>
  );
}
