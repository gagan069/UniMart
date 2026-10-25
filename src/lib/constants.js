import { categories } from './categories.js';

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

export const CATEGORY_THEME_MAP = {
  'books-notes': 'theme-academic',
  'electronics-gadgets': 'theme-electronics',
  'lab-engineering-gear': 'theme-tech',
  'stationery-supplies': 'theme-stationery',
  'hostel-room-essentials': 'theme-hostel',
  'fashion-accessories': 'theme-fashion',
  'perfumes-grooming': 'theme-scents',
  'handmade-art': 'theme-crafts',
  'sports-fitness-cycles': 'theme-sports',
  'other': 'theme-other'
};

export const resolveCategoryId = (item) => {
  if (item?.category_id && categories.some((c) => c.id === item.category_id)) {
    return item.category_id;
  }
  const cat = (item?.category || '').toLowerCase().trim();
  const matched = categories.find(
    (c) =>
      c.id === item?.category_id ||
      c.name.toLowerCase() === cat ||
      (c.id === 'books-notes' && (cat.includes('book') || cat.includes('textbook') || cat.includes('note'))) ||
      (c.id === 'handmade-art' && (cat.includes('craft') || cat.includes('handmade') || cat.includes('art'))) ||
      (c.id === 'lab-engineering-gear' && (cat.includes('machinery') || cat.includes('lab') || cat.includes('gear'))) ||
      (c.id === 'electronics-gadgets' && (cat.includes('electronic') || cat.includes('gadget') || cat.includes('tech'))) ||
      (c.id === 'perfumes-grooming' && (cat.includes('perfume') || cat.includes('scent') || cat.includes('grooming'))) ||
      (c.id === 'stationery-supplies' && cat.includes('stationery')) ||
      (c.id === 'hostel-room-essentials' && (cat.includes('hostel') || cat.includes('room'))) ||
      (c.id === 'fashion-accessories' && (cat.includes('fashion') || cat.includes('accessor'))) ||
      (c.id === 'sports-fitness-cycles' && (cat.includes('sport') || cat.includes('fitness') || cat.includes('cycle')))
  );
  return matched ? matched.id : 'books-notes';
};

export const isUserListingOwner = (item, currentUser) => {
  if (!currentUser || !item) return false;
  if (item.seller_id && currentUser.id && item.seller_id === currentUser.id) return true;
  const baseName = (item.seller || '').replace(/\s*\(You\)/i, '').trim().toLowerCase();
  const userName = (currentUser.name || '').trim().toLowerCase();
  return Boolean(userName && (baseName === userName || baseName.startsWith(userName)));
};

export const getDisplaySellerName = (item, currentUser) => {
  if (!item?.seller) return 'Campus Member';
  const baseName = item.seller.replace(/\s*\(You\)/i, '').trim();
  const isOwner = isUserListingOwner(item, currentUser);
  return isOwner ? `${baseName} (You)` : baseName;
};
