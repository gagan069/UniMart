import React, { useEffect, useRef, ReactNode } from 'react';

export type GlowColorType = 
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'red' 
  | 'orange'
  | 'amber'
  | 'cyan'
  | 'violet'
  | 'emerald'
  | 'rose'
  | 'teal'
  | 'fuchsia'
  | 'lime'
  | 'slate'
  | 'pink'
  | string;

export interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: GlowColorType;
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

// 10 Distinct category color profiles with HSL base and spread
// TECH & LAB = BLUE, PERFUMES = ROYAL PURPLE
export const categoryColorMap: Record<string, { base: number; spread: number; name: string; hex: string; bgSoft: string }> = {
  'books-notes': { base: 38, spread: 40, name: 'Amber Gold', hex: '#d97706', bgSoft: 'rgba(217, 119, 6, 0.12)' },
  'electronics-gadgets': { base: 195, spread: 50, name: 'Sky Tech Blue', hex: '#0ea5e9', bgSoft: 'rgba(14, 165, 233, 0.12)' },
  'lab-engineering-gear': { base: 215, spread: 50, name: 'Electric Blue', hex: '#0284c7', bgSoft: 'rgba(2, 132, 199, 0.12)' },
  'stationery-supplies': { base: 150, spread: 50, name: 'Emerald Green', hex: '#059669', bgSoft: 'rgba(5, 150, 105, 0.12)' },
  'hostel-room-essentials': { base: 24, spread: 40, name: 'Warm Orange', hex: '#ea580c', bgSoft: 'rgba(234, 88, 12, 0.12)' },
  'fashion-accessories': { base: 350, spread: 50, name: 'Crimson Red', hex: '#f43f5e', bgSoft: 'rgba(244, 63, 94, 0.12)' },
  'perfumes-grooming': { base: 280, spread: 60, name: 'Royal Purple', hex: '#a855f7', bgSoft: 'rgba(168, 85, 247, 0.12)' },
  'handmade-art': { base: 330, spread: 50, name: 'Rose Pink', hex: '#ec4899', bgSoft: 'rgba(236, 72, 153, 0.12)' },
  'sports-fitness-cycles': { base: 85, spread: 50, name: 'Neon Lime', hex: '#65a30d', bgSoft: 'rgba(101, 163, 13, 0.12)' },
  'other': { base: 215, spread: 30, name: 'Steel Slate', hex: '#64748b', bgSoft: 'rgba(100, 116, 139, 0.12)' },
};

const glowColorMap: Record<string, { base: number; spread: number }> = {
  blue: categoryColorMap['lab-engineering-gear'],
  cyan: categoryColorMap['electronics-gadgets'],
  purple: categoryColorMap['perfumes-grooming'],
  violet: categoryColorMap['perfumes-grooming'],
  green: categoryColorMap['stationery-supplies'],
  red: categoryColorMap['fashion-accessories'],
  orange: categoryColorMap['hostel-room-essentials'],
  amber: categoryColorMap['books-notes'],
  emerald: categoryColorMap['stationery-supplies'],
  rose: categoryColorMap['handmade-art'],
  pink: categoryColorMap['handmade-art'],
  teal: { base: 175, spread: 40 },
  fuchsia: categoryColorMap['handmade-art'],
  lime: categoryColorMap['sports-fitness-cycles'],
  slate: categoryColorMap['other'],
  ...categoryColorMap,
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

export function resolveCategoryGlow(categoryOrColor?: string): { base: number; spread: number } {
  if (!categoryOrColor) return glowColorMap.blue;
  const key = categoryOrColor.toLowerCase().trim();

  if (glowColorMap[key]) return glowColorMap[key];

  // Match category partial names or titles
  if (key.includes('book') || key.includes('note') || key.includes('textbook')) return categoryColorMap['books-notes'];
  if (key.includes('perfume') || key.includes('groom') || key.includes('scent')) return categoryColorMap['perfumes-grooming'];
  if (key.includes('electr') || key.includes('gadget') || key.includes('phone') || key.includes('laptop')) return categoryColorMap['electronics-gadgets'];
  if (key.includes('lab') || key.includes('gear') || key.includes('calc') || key.includes('machin') || key.includes('tech')) return categoryColorMap['lab-engineering-gear'];
  if (key.includes('station') || key.includes('suppl') || key.includes('pen')) return categoryColorMap['stationery-supplies'];
  if (key.includes('hostel') || key.includes('room') || key.includes('bed')) return categoryColorMap['hostel-room-essentials'];
  if (key.includes('fashion') || key.includes('cloth') || key.includes('access')) return categoryColorMap['fashion-accessories'];
  if (key.includes('art') || key.includes('craft') || key.includes('handmade')) return categoryColorMap['handmade-art'];
  if (key.includes('sport') || key.includes('fit') || key.includes('cycle')) return categoryColorMap['sports-fitness-cycles'];

  return categoryColorMap['other'];
}

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'blue',
  category,
  size = 'md',
  width,
  height,
  customSize = false,
  onClick,
  style: userStyle = {}
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = resolveCategoryGlow(category || glowColor);

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: Record<string, any> = {
      '--base': base,
      '--spread': spread,
      '--radius': customSize ? '20' : '16',
      '--border': customSize ? '0' : '1.5',
      '--backdrop': 'transparent',
      '--backup-border': 'transparent',
      '--size': '240',
      '--outer': '1',
      '--border-size': customSize ? '0px' : '1.5px',
      '--spotlight-size': 'calc(var(--size, 200) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: customSize
        ? undefined
        : `radial-gradient(
            var(--spotlight-size) var(--spotlight-size) at
            calc(var(--x, 0) * 1px)
            calc(var(--y, 0) * 1px),
            hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.12)), transparent
          )`,
      backgroundColor: 'transparent',
      border: 'none',
      position: 'relative',
      ...userStyle
    };

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow].spotlight-standalone::before,
    [data-glow].spotlight-standalone::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: 0;
      border: 1.5px solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    
    [data-glow].spotlight-standalone::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
      );
      filter: brightness(2);
    }
    
    [data-glow].spotlight-standalone::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
      );
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        onClick={onClick}
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'spotlight-standalone aspect-[3/4] p-4 rounded-2xl shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]' : ''}
          relative
          transition-transform duration-300
          ${className}
        `}
      >
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </>
  );
};

export { GlowCard };
export default GlowCard;
