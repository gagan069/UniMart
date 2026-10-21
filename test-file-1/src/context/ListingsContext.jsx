import React, { createContext, useContext, useState } from 'react';

// Product images
import imgCalcBook from '../assets/products/calculus.jpg';
import imgMatchaMug from '../assets/products/matcha_mug.jpg';
import imgGraphCalc from '../assets/products/graphing_calc.jpg';
import imgRoomSpray from '../assets/products/room_spray.jpg';
import imgOrgChem from '../assets/products/organic_chem.jpg';
import imgToteBag from '../assets/products/tote_bag.jpg';
import imgArduinoKit from '../assets/products/arduino_kit.jpg';
import imgSolidPerfume from '../assets/products/solid_perfume.jpg';

export const INITIAL_PRODUCTS = [
  // 1. Books & Notes (theme-academic)
  {
    id: 1,
    seller_id: 'student_b',
    title: 'Calculus',
    category: 'Books & Notes',
    category_id: 'books-notes',
    price: 450,
    origPrice: 1499,
    condition: 'Like New',
    seller: 'Priya K. (Math Dept)',
    icon: 'menu_book',
    categoryTheme: 'theme-academic',
    badge: 'Academic Pick',
    notes: 'Library Entrance',
    image: imgCalcBook,
    photos: [imgCalcBook],
    description: 'Single Variable Calculus textbook covering limits, derivatives & integrals. Verified pre-owned in like-new condition with no markings.'
  },
  {
    id: 2,
    seller_id: 'student_a',
    title: 'Organic Chemistry as a Second Language (Klein)',
    category: 'Books & Notes',
    category_id: 'books-notes',
    price: 380,
    origPrice: 1100,
    condition: 'Good',
    seller: 'Satkar Singh',
    icon: 'menu_book',
    categoryTheme: 'theme-academic',
    badge: 'Semester Bestseller',
    notes: 'Library Entrance',
    image: imgOrgChem,
    photos: [imgOrgChem, imgCalcBook],
    description: 'David Klein second edition with handwritten summary mind maps in margins. Essential for surviving organic synthesis.'
  },

  // 2. Handmade & Art (theme-crafts)
  {
    id: 3,
    seller_id: 'student_c',
    title: 'Handcrafted Matcha Mug',
    category: 'Handmade & Art',
    category_id: 'handmade-art',
    price: 350,
    origPrice: 699,
    condition: 'Handmade',
    seller: 'Nisha R. (Fine Arts)',
    icon: 'palette',
    categoryTheme: 'theme-crafts',
    badge: 'Student Artisan',
    notes: 'Square One',
    image: imgMatchaMug,
    photos: [imgMatchaMug],
    description: 'Hand-thrown ceramic mug with earthy green glaze finish. Perfect for matcha, chai, or as a desk planter. One-of-a-kind artisan piece.'
  },
  {
    id: 4,
    seller_id: 'student_f',
    title: 'Block-Printed Canvas Tote Bag (Sunflower Edition)',
    category: 'Handmade & Art',
    category_id: 'handmade-art',
    price: 280,
    origPrice: 550,
    condition: 'Brand New',
    seller: 'Simran D. (Design Club)',
    icon: 'palette',
    categoryTheme: 'theme-crafts',
    badge: 'Limited Run',
    notes: 'Gate No. 4',
    image: imgToteBag,
    photos: [imgToteBag],
    description: 'Heavy duty 320 GSM unbleached cotton tote bag with handmade sunflower woodblock print. Washable & durable.'
  },

  // 3. Lab & Engineering Gear (theme-tech)
  {
    id: 5,
    seller_id: 'student_d',
    title: 'Color Graphing Calculator',
    category: 'Lab & Engineering Gear',
    category_id: 'lab-engineering-gear',
    price: 2499,
    origPrice: 6999,
    condition: 'Excellent',
    seller: 'Madhur T. (Engineering)',
    icon: 'precision_manufacturing',
    categoryTheme: 'theme-tech',
    badge: 'Lab Ready',
    notes: 'Turing Block',
    image: imgGraphCalc,
    photos: [imgGraphCalc],
    description: 'TI-84 Plus CE color graphing calculator. Includes USB cable and fresh batteries. Approved for all engineering exams.'
  },
  {
    id: 6,
    seller_id: 'student_a',
    title: 'Arduino Uno Starter Lab Kit + Sensors Box',
    category: 'Lab & Engineering Gear',
    category_id: 'lab-engineering-gear',
    price: 1150,
    origPrice: 2400,
    condition: 'Like New',
    seller: 'Satkar Singh',
    icon: 'precision_manufacturing',
    categoryTheme: 'theme-tech',
    badge: 'Verified Working',
    notes: 'Turing Block',
    image: imgArduinoKit,
    photos: [imgArduinoKit],
    description: 'Original ATmega328P Arduino board, breadboard, OLED display, ultrasonic sensors, motors and resistors. Tested in Turing lab.'
  },

  // 4. Perfumes & Grooming (theme-scents)
  {
    id: 7,
    seller_id: 'student_e',
    title: 'Botanical Room Spray: Cedar & Wild Lavender (50ml)',
    category: 'Perfumes & Grooming',
    category_id: 'perfumes-grooming',
    price: 299,
    origPrice: 499,
    condition: 'Freshly Crafted',
    seller: 'Charlie W. (Biochem Maker)',
    icon: 'local_florist',
    categoryTheme: 'theme-scents',
    badge: 'Organic',
    notes: 'Food Court',
    image: imgRoomSpray,
    photos: [imgRoomSpray],
    description: 'Includes: Natural Essential Oils. Verified pre-owned item in freshly crafted condition. Hand-blended botanical fragrance.'
  },
  {
    id: 8,
    seller_id: 'student_g',
    title: 'Solid Amber & Sandalwood Wax Cologne (15g Pocket Tin)',
    category: 'Perfumes & Grooming',
    category_id: 'perfumes-grooming',
    price: 249,
    origPrice: 450,
    condition: 'Brand New',
    seller: 'Harsh P. (Maker Collective)',
    icon: 'local_florist',
    categoryTheme: 'theme-scents',
    badge: 'Pocket Cologne',
    notes: 'Hostel Gate',
    image: imgSolidPerfume,
    photos: [imgSolidPerfume],
    description: 'Alcohol-free travel solid cologne in a sliding matte metal tin. Warm Mysore sandalwood notes blended with amber.'
  },

  // 5. Electronics & Gadgets (theme-electronics)
  {
    id: 9,
    seller_id: 'student_b',
    title: 'Logitech Pebble M350 Wireless Bluetooth Mouse',
    category: 'Electronics & Gadgets',
    category_id: 'electronics-gadgets',
    price: 690,
    origPrice: 1495,
    condition: 'Like New',
    seller: 'Amanpreet S. (CSE)',
    icon: 'devices',
    categoryTheme: 'theme-electronics',
    badge: 'Tech Verified',
    notes: 'Turing Block',
    image: imgGraphCalc,
    photos: [imgGraphCalc],
    description: 'Ultra-slim, silent click dual Bluetooth & 2.4G wireless mouse in graphite grey. Long battery life, perfect for quiet campus study.'
  },
  {
    id: 10,
    seller_id: 'student_c',
    title: 'Boat Rockerz 450 On-Ear Wireless Headphones',
    category: 'Electronics & Gadgets',
    category_id: 'electronics-gadgets',
    price: 890,
    origPrice: 1990,
    condition: 'Good',
    seller: 'Jasleen K. (ECE Dept)',
    icon: 'devices',
    categoryTheme: 'theme-electronics',
    badge: 'Clear Audio',
    notes: 'Square One',
    image: imgArduinoKit,
    photos: [imgArduinoKit],
    description: '40mm dynamic drivers, padded ear cushions and 15-hour playback. Bluetooth 5.0 with AUX cable support for hostel listening.'
  },

  // 6. Stationery & Supplies (theme-stationery)
  {
    id: 11,
    seller_id: 'student_d',
    title: 'Staedtler Mars Technical Drafting Pen & Compass Kit',
    category: 'Stationery & Supplies',
    category_id: 'stationery-supplies',
    price: 420,
    origPrice: 950,
    condition: 'Like New',
    seller: 'Kavita M. (Architecture)',
    icon: 'edit_note',
    categoryTheme: 'theme-stationery',
    badge: 'Exam Ready',
    notes: 'Library Entrance',
    image: imgCalcBook,
    photos: [imgCalcBook],
    description: 'Precision engineering drafting compass with fine-liner pens and replacement lead pack. Approved for first-year engineering drawing exams.'
  },
  {
    id: 12,
    seller_id: 'student_e',
    title: 'Classmate Pulse Spiral Bound 6-Subject Notebooks (Pack of 3)',
    category: 'Stationery & Supplies',
    category_id: 'stationery-supplies',
    price: 240,
    origPrice: 480,
    condition: 'Brand New',
    seller: 'Rohan V. (Business School)',
    icon: 'edit_note',
    categoryTheme: 'theme-stationery',
    badge: 'Unused Pack',
    notes: 'Food Court',
    image: imgOrgChem,
    photos: [imgOrgChem],
    description: '300-page ruled spiral registers with color dividers for each subject. High brightness paper, unwritten and shrink-wrapped.'
  },

  // 7. Hostel & Room Essentials (theme-hostel)
  {
    id: 13,
    seller_id: 'student_f',
    title: 'Prestige 1.5L Stainless Steel Electric Kettle',
    category: 'Hostel & Room Essentials',
    category_id: 'hostel-room-essentials',
    price: 580,
    origPrice: 1295,
    condition: 'Good',
    seller: 'Gurpreet B. (Boys Hostel 3)',
    icon: 'bed',
    categoryTheme: 'theme-hostel',
    badge: 'Hostel Must-Have',
    notes: 'Hostel Gate',
    image: imgMatchaMug,
    photos: [imgMatchaMug],
    description: 'Automatic shut-off, 1500W rapid boiling element with swivel base. Clean interior, indispensable for late-night hostel Maggi and tea.'
  },
  {
    id: 14,
    seller_id: 'student_g',
    title: 'Wipro 12W Multi-Angle LED Desk Study Lamp',
    category: 'Hostel & Room Essentials',
    category_id: 'hostel-room-essentials',
    price: 450,
    origPrice: 1099,
    condition: 'Like New',
    seller: 'Mehak S. (Girls Hostel 2)',
    icon: 'bed',
    categoryTheme: 'theme-hostel',
    badge: 'Warm Glow',
    notes: 'Square One',
    image: imgArduinoKit,
    photos: [imgArduinoKit],
    description: '3 color temperatures (warm, natural, cool white) with dimmable touch control and flexible gooseneck arm. Includes 5V USB charging cable.'
  },

  // 8. Fashion & Accessories (theme-fashion)
  {
    id: 15,
    seller_id: 'student_b',
    title: 'Chitkara University Alpha Heavy Varsity Jacket (Size L)',
    category: 'Fashion & Accessories',
    category_id: 'fashion-accessories',
    price: 790,
    origPrice: 1799,
    condition: 'Like New',
    seller: 'Tanmay C. (Sports Council)',
    icon: 'checkroom',
    categoryTheme: 'theme-fashion',
    badge: 'Campus Merch',
    notes: 'Gate No. 4',
    image: imgToteBag,
    photos: [imgToteBag],
    description: 'Official university athletics embroidered varsity jacket in deep maroon and cream. Thick fleece lining, barely worn once during fest.'
  },
  {
    id: 16,
    seller_id: 'student_c',
    title: 'Fastrack Minimalist Campus Quartz Watch (Matte Black)',
    category: 'Fashion & Accessories',
    category_id: 'fashion-accessories',
    price: 820,
    origPrice: 1895,
    condition: 'Good',
    seller: 'Ananya D. (Media Studies)',
    icon: 'checkroom',
    categoryTheme: 'theme-fashion',
    badge: 'Water Resistant',
    notes: 'Turing Block',
    image: imgSolidPerfume,
    photos: [imgSolidPerfume],
    description: 'Durable silicone strap, mineral crystal glass and water resistance up to 50m. Fresh battery installed last month.'
  },

  // 9. Sports, Fitness & Cycles (theme-sports)
  {
    id: 17,
    seller_id: 'student_d',
    title: 'Hercules Roadeo 26T Mountain Bicycle with Wire Lock',
    category: 'Sports, Fitness & Cycles',
    category_id: 'sports-fitness-cycles',
    price: 3400,
    origPrice: 7499,
    condition: 'Good',
    seller: 'Vikramaditya S. (Mech Engg)',
    icon: 'fitness_center',
    categoryTheme: 'theme-sports',
    badge: 'Campus Commute',
    notes: 'Hostel Gate',
    image: imgGraphCalc,
    photos: [imgGraphCalc],
    description: 'Front suspension fork, dual disc brakes and wide 2.1-inch tires for effortless commute between campus hostels and Turing block. Comes with steel cable lock.'
  },
  {
    id: 18,
    seller_id: 'student_e',
    title: 'Yonex Muscle Power 29 Light Badminton Racket + Full Cover',
    category: 'Sports, Fitness & Cycles',
    category_id: 'sports-fitness-cycles',
    price: 880,
    origPrice: 1950,
    condition: 'Like New',
    seller: 'Sahil K. (Badminton Club)',
    icon: 'fitness_center',
    categoryTheme: 'theme-sports',
    badge: 'Tournament Grip',
    notes: 'Sports Complex',
    image: imgToteBag,
    photos: [imgToteBag],
    description: 'Isometric head frame, strung at 24 lbs tension with BG65 titanium string. High repulsion and control, includes cushioned grip.'
  },

  // 10. Other Campus Items (theme-other)
  {
    id: 19,
    seller_id: 'student_f',
    title: 'Portronics M-Port 4-in-1 USB 3.0 High-Speed Data Hub',
    category: 'Other',
    category_id: 'other',
    price: 320,
    origPrice: 749,
    condition: 'Like New',
    seller: 'Arjun N. (Robotics Club)',
    icon: 'more_horiz',
    categoryTheme: 'theme-other',
    badge: 'Plug & Play',
    notes: 'Turing Block',
    image: imgArduinoKit,
    photos: [imgArduinoKit],
    description: 'Compact 5Gbps transfer speed hub with LED power indicator. Expands single laptop USB port to 4 slots simultaneously without drivers.'
  },
  {
    id: 20,
    seller_id: 'student_g',
    title: 'Ergonomic Foldable Wooden Laptop Bed Desk with Cup Holder',
    category: 'Other',
    category_id: 'other',
    price: 490,
    origPrice: 1199,
    condition: 'Good',
    seller: 'Divya P. (Hostel 1)',
    icon: 'more_horiz',
    categoryTheme: 'theme-other',
    badge: 'Bed Study Pro',
    notes: 'Square One',
    image: imgCalcBook,
    photos: [imgCalcBook],
    description: 'Reinforced powder-coated steel legs with anti-slip pads, tablet slot and cup groove. Folds flat in seconds under the bed or closet.'
  }
];

const ListingsContext = createContext(null);

export function ListingsProvider({ children }) {
  const [productList, setProductList] = useState(INITIAL_PRODUCTS);

  const addListing = (newListing) => {
    setProductList((prev) => [newListing, ...prev]);
  };

  const updateListing = (id, updatedFields) => {
    setProductList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const removeListing = (id) => {
    setProductList((prev) => prev.filter((item) => item.id !== id));
  };

  const approveListing = (id) => {
    setProductList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'approved',
              badge: item.badge === 'Waiting for Approval' ? 'Admin Approved' : (item.badge || 'Verified'),
              pendingType: null,
              originalVersion: null
            }
          : item
      )
    );
  };

  const rejectListing = (id) => {
    setProductList((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.pendingType === 'edit' && target.originalVersion) {
        // Restore to original approved version instead of deleting the whole listing (Bug 3 fix)
        return prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...target.originalVersion,
                status: 'approved',
                pendingType: null,
                originalVersion: null
              }
            : item
        );
      }
      // If it was a brand new listing submission, remove it from catalog
      return prev.filter((item) => item.id !== id);
    });
  };

  return (
    <ListingsContext.Provider
      value={{
        productList,
        setProductList,
        addListing,
        updateListing,
        removeListing,
        approveListing,
        rejectListing
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
}

export default ListingsContext;
