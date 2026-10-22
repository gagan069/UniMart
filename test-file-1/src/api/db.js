/**
 * LocalStorage Fake Database simulating MySQL tables with delay.
 * Tables:
 * - users (id, name, email, student_id, password_hash, role, created_at)
 * - listings (id, seller_id, title, category_id, subcategory_id, price, original_price, item_condition, meetup_spot, description, has_notes, status, pending_type, created_at, updated_at)
 * - listing_photos (id, listing_id, url, sort_order)
 * - listing_pending_edits (id, listing_id, snapshot_json, created_at)
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
const DB_VERSION = 'v3';

// In-memory fallback if localStorage throws in private / restricted browsing
const memoryStore = {};

export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export function getTable(tableName) {
  const key = `${DB_PREFIX}${tableName}_${DB_VERSION}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (_e) {
    if (memoryStore[key]) return memoryStore[key];
  }
  return null;
}

export function setTable(tableName, data) {
  const key = `${DB_PREFIX}${tableName}_${DB_VERSION}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_e) {
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
    created_at: new Date('2026-02-02').toISOString(),
    updated_at: new Date('2026-02-02').toISOString()
  },
  {
    id: 3,
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
    created_at: new Date('2026-02-03').toISOString(),
    updated_at: new Date('2026-02-03').toISOString()
  },
  {
    id: 4,
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
    created_at: new Date('2026-02-04').toISOString(),
    updated_at: new Date('2026-02-04').toISOString()
  },
  {
    id: 5,
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
    created_at: new Date('2026-02-05').toISOString(),
    updated_at: new Date('2026-02-05').toISOString()
  },
  {
    id: 6,
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
    created_at: new Date('2026-02-06').toISOString(),
    updated_at: new Date('2026-02-06').toISOString()
  },
  {
    id: 7,
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
  }
];

const SEED_LISTING_PHOTOS = [
  { id: 1, listing_id: 1, url: imgCalcBook, sort_order: 0 },
  { id: 2, listing_id: 2, url: imgMatchaMug, sort_order: 0 },
  { id: 3, listing_id: 3, url: imgGraphCalc, sort_order: 0 },
  { id: 4, listing_id: 4, url: imgRoomSpray, sort_order: 0 },
  { id: 5, listing_id: 5, url: imgOrgChem, sort_order: 0 },
  { id: 6, listing_id: 5, url: imgCalcBook, sort_order: 1 },
  { id: 7, listing_id: 6, url: imgToteBag, sort_order: 0 },
  { id: 8, listing_id: 7, url: imgArduinoKit, sort_order: 0 },
  { id: 9, listing_id: 8, url: imgSolidPerfume, sort_order: 0 }
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
