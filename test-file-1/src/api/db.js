// src/api/db.js
/**
 * UNIMART Local Database & Storage Helper
 * 
 * Simulates a MySQL-backed relational database in localStorage with ~300ms network delay.
 * Tables represented:
 * - users (id, name, email, student_id, password_hash, role, created_at)
 * - listings (id, seller_id, title, category_id, subcategory_id, price, original_price, item_condition, meetup_spot, description, has_notes, status, pending_type, created_at, updated_at)
 * - listing_photos (id, listing_id, url, sort_order)
 * - listing_pending_edits (listing_id, ...proposed fields)
 * - wishlist (user_id, listing_id, created_at)
 * - conversations (id, listing_id, buyer_id, seller_id, created_at)
 * - messages (id, conversation_id, sender_id, body, created_at)
 */

import imgCalcBook from '../assets/products/calculus.jpg';
import imgMatchaMug from '../assets/products/matcha_mug.jpg';
import imgGraphCalc from '../assets/products/graphing_calc.jpg';
import imgRoomSpray from '../assets/products/room_spray.jpg';
import imgOrgChem from '../assets/products/organic_chem.jpg';
import imgToteBag from '../assets/products/tote_bag.jpg';
import imgArduinoKit from '../assets/products/arduino_kit.jpg';
import imgSolidPerfume from '../assets/products/solid_perfume.jpg';

const DB_PREFIX = 'unimart_db_';
const DB_VERSION = 'v2';

// In-memory fallback if localStorage throws in private / restricted browsing
const memoryStore = {};

export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export function getTable(tableName) {
  const key = `${DB_PREFIX}${tableName}_${DB_VERSION}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    if (memoryStore[key]) return memoryStore[key];
  }
  return null;
}

export function setTable(tableName, data) {
  const key = `${DB_PREFIX}${tableName}_${DB_VERSION}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Fallback for private browsing
    memoryStore[key] = data;
  }
}

// Initial Seed Data
const SEED_USERS = [
  {
    id: 'admin_1',
    name: 'Campus Admin',
    email: 'admin@chitkara.edu.in',
    student_id: 'ADMIN-001',
    password_hash: 'Unimart@123',
    role: 'admin',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'student_a',
    name: 'Satkar Singh',
    email: 'satkar0696.becse25@chitkara.edu.in',
    student_id: '2110990696',
    password_hash: 'student123',
    role: 'student',
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'student_b',
    name: 'Priya K.',
    email: 'priya.k@chitkara.edu.in',
    student_id: '2110990697',
    password_hash: 'student123',
    role: 'student',
    created_at: new Date('2026-01-20').toISOString()
  }
];

const SEED_LISTINGS = [
  // 1. Books & Notes (theme-academic)
  {
    id: 1,
    seller_id: 'student_b',
    title: 'Calculus',
    category_id: 'books-notes',
    subcategory_id: 'engineering-textbooks',
    price: 450,
    original_price: 1499,
    item_condition: 'Like New',
    meetup_spot: 'Library Entrance',
    description: 'Single Variable Calculus textbook covering limits, derivatives & integrals. Verified pre-owned in like-new condition with no markings.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date('2026-02-01').toISOString()
  },
  {
    id: 2,
    seller_id: 'student_a',
    title: 'Organic Chemistry as a Second Language (Klein)',
    category_id: 'books-notes',
    subcategory_id: 'engineering-textbooks',
    price: 380,
    original_price: 1100,
    item_condition: 'Good',
    meetup_spot: 'Library Entrance',
    description: 'David Klein second edition with handwritten summary mind maps in margins. Essential for surviving organic synthesis.',
    has_notes: true,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-02').toISOString(),
    updated_at: new Date('2026-02-02').toISOString()
  },

  // 2. Handmade & Art (theme-crafts)
  {
    id: 3,
    seller_id: 'student_b',
    title: 'Handcrafted Matcha Mug',
    category_id: 'handmade-art',
    subcategory_id: 'decor',
    price: 350,
    original_price: 699,
    item_condition: 'Handmade',
    meetup_spot: 'Square One',
    description: 'Hand-thrown ceramic mug with earthy green glaze finish. Perfect for matcha, chai, or as a desk planter. One-of-a-kind artisan piece.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-03').toISOString(),
    updated_at: new Date('2026-02-03').toISOString()
  },
  {
    id: 4,
    seller_id: 'student_b',
    title: 'Block-Printed Canvas Tote Bag (Sunflower Edition)',
    category_id: 'handmade-art',
    subcategory_id: 'custom-gifts',
    price: 280,
    original_price: 550,
    item_condition: 'Brand New',
    meetup_spot: 'Gate No. 4',
    description: 'Heavy duty 320 GSM unbleached cotton tote bag with handmade sunflower woodblock print. Washable & durable.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-04').toISOString(),
    updated_at: new Date('2026-02-04').toISOString()
  },

  // 3. Lab & Engineering Gear (theme-tech)
  {
    id: 5,
    seller_id: 'student_b',
    title: 'Color Graphing Calculator',
    category_id: 'lab-engineering-gear',
    subcategory_id: 'scientific-calculators',
    price: 2499,
    original_price: 6999,
    item_condition: 'Excellent',
    meetup_spot: 'Turing Block',
    description: 'TI-84 Plus CE color graphing calculator. Includes USB cable and fresh batteries. Approved for all engineering exams.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-05').toISOString(),
    updated_at: new Date('2026-02-05').toISOString()
  },
  {
    id: 6,
    seller_id: 'student_a',
    title: 'Arduino Uno Starter Lab Kit + Sensors Box',
    category_id: 'lab-engineering-gear',
    subcategory_id: 'arduino-robotics-kits',
    price: 1150,
    original_price: 2400,
    item_condition: 'Like New',
    meetup_spot: 'Turing Block',
    description: 'Original ATmega328P Arduino board, breadboard, OLED display, ultrasonic sensors, motors and resistors. Tested in Turing lab.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-06').toISOString(),
    updated_at: new Date('2026-02-06').toISOString()
  },

  // 4. Perfumes & Grooming (theme-scents)
  {
    id: 7,
    seller_id: 'student_b',
    title: 'Botanical Room Spray: Cedar & Wild Lavender (50ml)',
    category_id: 'perfumes-grooming',
    subcategory_id: 'perfumes-deos',
    price: 299,
    original_price: 499,
    item_condition: 'Freshly Crafted',
    meetup_spot: 'Food Court',
    description: 'Includes: Natural Essential Oils. Verified pre-owned item in freshly crafted condition. Hand-blended botanical fragrance.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-07').toISOString(),
    updated_at: new Date('2026-02-07').toISOString()
  },
  {
    id: 8,
    seller_id: 'student_b',
    title: 'Solid Amber & Sandalwood Wax Cologne (15g Pocket Tin)',
    category_id: 'perfumes-grooming',
    subcategory_id: 'attars',
    price: 249,
    original_price: 450,
    item_condition: 'Brand New',
    meetup_spot: 'Hostel Gate',
    description: 'Alcohol-free travel solid cologne in a sliding matte metal tin. Warm Mysore sandalwood notes blended with amber.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-08').toISOString(),
    updated_at: new Date('2026-02-08').toISOString()
  },

  // 5. Electronics & Gadgets (theme-electronics)
  {
    id: 9,
    seller_id: 'student_b',
    title: 'Logitech Pebble M350 Wireless Bluetooth Mouse',
    category_id: 'electronics-gadgets',
    subcategory_id: 'keyboards-mice',
    price: 690,
    original_price: 1495,
    item_condition: 'Like New',
    meetup_spot: 'Turing Block',
    description: 'Ultra-slim, silent click dual Bluetooth & 2.4G wireless mouse in graphite grey. Long battery life, perfect for quiet campus study.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-09').toISOString(),
    updated_at: new Date('2026-02-09').toISOString()
  },
  {
    id: 10,
    seller_id: 'student_b',
    title: 'Boat Rockerz 450 On-Ear Wireless Headphones',
    category_id: 'electronics-gadgets',
    subcategory_id: 'audio-earphones-speakers',
    price: 890,
    original_price: 1990,
    item_condition: 'Good',
    meetup_spot: 'Square One',
    description: '40mm dynamic drivers, padded ear cushions and 15-hour playback. Bluetooth 5.0 with AUX cable support for hostel listening.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-10').toISOString(),
    updated_at: new Date('2026-02-10').toISOString()
  },

  // 6. Stationery & Supplies (theme-stationery)
  {
    id: 11,
    seller_id: 'student_b',
    title: 'Staedtler Mars Technical Drafting Pen & Compass Kit',
    category_id: 'stationery-supplies',
    subcategory_id: 'art-supplies',
    price: 420,
    original_price: 950,
    item_condition: 'Like New',
    meetup_spot: 'Library Entrance',
    description: 'Precision engineering drafting compass with fine-liner pens and replacement lead pack. Approved for first-year engineering drawing exams.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-11').toISOString(),
    updated_at: new Date('2026-02-11').toISOString()
  },
  {
    id: 12,
    seller_id: 'student_b',
    title: 'Classmate Pulse Spiral Bound 6-Subject Notebooks (Pack of 3)',
    category_id: 'stationery-supplies',
    subcategory_id: 'notebooks-registers',
    price: 240,
    original_price: 480,
    item_condition: 'Brand New',
    meetup_spot: 'Food Court',
    description: '300-page ruled spiral registers with color dividers for each subject. High brightness paper, unwritten and shrink-wrapped.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-12').toISOString(),
    updated_at: new Date('2026-02-12').toISOString()
  },

  // 7. Hostel & Room Essentials (theme-hostel)
  {
    id: 13,
    seller_id: 'student_b',
    title: 'Prestige 1.5L Stainless Steel Electric Kettle',
    category_id: 'hostel-room-essentials',
    subcategory_id: 'kitchen-kettle-induction',
    price: 580,
    original_price: 1295,
    item_condition: 'Good',
    meetup_spot: 'Hostel Gate',
    description: 'Automatic shut-off, 1500W rapid boiling element with swivel base. Clean interior, indispensable for late-night hostel Maggi and tea.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-13').toISOString(),
    updated_at: new Date('2026-02-13').toISOString()
  },
  {
    id: 14,
    seller_id: 'student_b',
    title: 'Wipro 12W Multi-Angle LED Desk Study Lamp',
    category_id: 'hostel-room-essentials',
    subcategory_id: 'study-lamp-electricals',
    price: 450,
    original_price: 1099,
    item_condition: 'Like New',
    meetup_spot: 'Square One',
    description: '3 color temperatures (warm, natural, cool white) with dimmable touch control and flexible gooseneck arm. Includes 5V USB charging cable.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-14').toISOString(),
    updated_at: new Date('2026-02-14').toISOString()
  },

  // 8. Fashion & Accessories (theme-fashion)
  {
    id: 15,
    seller_id: 'student_b',
    title: 'Chitkara University Alpha Heavy Varsity Jacket (Size L)',
    category_id: 'fashion-accessories',
    subcategory_id: 'college-merch-hoodies',
    price: 790,
    original_price: 1799,
    item_condition: 'Like New',
    meetup_spot: 'Gate No. 4',
    description: 'Official university athletics embroidered varsity jacket in deep maroon and cream. Thick fleece lining, barely worn once during fest.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-15').toISOString(),
    updated_at: new Date('2026-02-15').toISOString()
  },
  {
    id: 16,
    seller_id: 'student_b',
    title: 'Fastrack Minimalist Campus Quartz Watch (Matte Black)',
    category_id: 'fashion-accessories',
    subcategory_id: 'watches-jewellery',
    price: 820,
    original_price: 1895,
    item_condition: 'Good',
    meetup_spot: 'Turing Block',
    description: 'Durable silicone strap, mineral crystal glass and water resistance up to 50m. Fresh battery installed last month.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-16').toISOString(),
    updated_at: new Date('2026-02-16').toISOString()
  },

  // 9. Sports, Fitness & Cycles (theme-sports)
  {
    id: 17,
    seller_id: 'student_b',
    title: 'Hercules Roadeo 26T Mountain Bicycle with Wire Lock',
    category_id: 'sports-fitness-cycles',
    subcategory_id: 'bicycles-accessories',
    price: 3400,
    original_price: 7499,
    item_condition: 'Good',
    meetup_spot: 'Hostel Gate',
    description: 'Front suspension fork, dual disc brakes and wide 2.1-inch tires for effortless commute between campus hostels and Turing block. Comes with steel cable lock.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-17').toISOString(),
    updated_at: new Date('2026-02-17').toISOString()
  },
  {
    id: 18,
    seller_id: 'student_b',
    title: 'Yonex Muscle Power 29 Light Badminton Racket + Full Cover',
    category_id: 'sports-fitness-cycles',
    subcategory_id: 'racket-sports',
    price: 880,
    original_price: 1950,
    item_condition: 'Like New',
    meetup_spot: 'Sports Complex',
    description: 'Isometric head frame, strung at 24 lbs tension with BG65 titanium string. High repulsion and control, includes cushioned grip.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-18').toISOString(),
    updated_at: new Date('2026-02-18').toISOString()
  },

  // 10. Other Campus Items (theme-other)
  {
    id: 19,
    seller_id: 'student_b',
    title: 'Portronics M-Port 4-in-1 USB 3.0 High-Speed Data Hub',
    category_id: 'other',
    subcategory_id: null,
    price: 320,
    original_price: 749,
    item_condition: 'Like New',
    meetup_spot: 'Turing Block',
    description: 'Compact 5Gbps transfer speed hub with LED power indicator. Expands single laptop USB port to 4 slots simultaneously without drivers.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-19').toISOString(),
    updated_at: new Date('2026-02-19').toISOString()
  },
  {
    id: 20,
    seller_id: 'student_b',
    title: 'Ergonomic Foldable Wooden Laptop Bed Desk with Cup Holder',
    category_id: 'other',
    subcategory_id: null,
    price: 490,
    original_price: 1199,
    item_condition: 'Good',
    meetup_spot: 'Square One',
    description: 'Reinforced powder-coated steel legs with anti-slip pads, tablet slot and cup groove. Folds flat in seconds under the bed or closet.',
    has_notes: false,
    status: 'approved',
    pending_type: null,
    created_at: new Date('2026-02-20').toISOString(),
    updated_at: new Date('2026-02-20').toISOString()
  }
];

const SEED_LISTING_PHOTOS = [
  { id: 1, listing_id: 1, url: imgCalcBook, sort_order: 0 },
  { id: 2, listing_id: 2, url: imgOrgChem, sort_order: 0 },
  { id: 3, listing_id: 2, url: imgCalcBook, sort_order: 1 },
  { id: 4, listing_id: 3, url: imgMatchaMug, sort_order: 0 },
  { id: 5, listing_id: 4, url: imgToteBag, sort_order: 0 },
  { id: 6, listing_id: 5, url: imgGraphCalc, sort_order: 0 },
  { id: 7, listing_id: 6, url: imgArduinoKit, sort_order: 0 },
  { id: 8, listing_id: 7, url: imgRoomSpray, sort_order: 0 },
  { id: 9, listing_id: 8, url: imgSolidPerfume, sort_order: 0 },
  { id: 10, listing_id: 9, url: imgGraphCalc, sort_order: 0 },
  { id: 11, listing_id: 10, url: imgArduinoKit, sort_order: 0 },
  { id: 12, listing_id: 11, url: imgCalcBook, sort_order: 0 },
  { id: 13, listing_id: 12, url: imgOrgChem, sort_order: 0 },
  { id: 14, listing_id: 13, url: imgMatchaMug, sort_order: 0 },
  { id: 15, listing_id: 14, url: imgArduinoKit, sort_order: 0 },
  { id: 16, listing_id: 15, url: imgToteBag, sort_order: 0 },
  { id: 17, listing_id: 16, url: imgSolidPerfume, sort_order: 0 },
  { id: 18, listing_id: 17, url: imgGraphCalc, sort_order: 0 },
  { id: 19, listing_id: 18, url: imgToteBag, sort_order: 0 },
  { id: 20, listing_id: 19, url: imgArduinoKit, sort_order: 0 },
  { id: 21, listing_id: 20, url: imgCalcBook, sort_order: 0 }
];

export function initDatabase() {
  if (!getTable('users')) setTable('users', SEED_USERS);
  if (!getTable('listings')) setTable('listings', SEED_LISTINGS);
  if (!getTable('listing_photos')) setTable('listing_photos', SEED_LISTING_PHOTOS);
  if (!getTable('listing_pending_edits')) setTable('listing_pending_edits', []);
  if (!getTable('wishlist')) setTable('wishlist', []);
  if (!getTable('conversations')) setTable('conversations', []);
  if (!getTable('messages')) setTable('messages', []);
}

// Automatically ensure tables exist on module load
initDatabase();
