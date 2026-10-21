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
  {
    id: 1,
    seller_id: 'student_b',
    title: 'Calculus',
    category: 'Textbooks',
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
    seller_id: 'student_c',
    title: 'Handcrafted Matcha Mug',
    category: 'Handmade Crafts',
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
    id: 3,
    seller_id: 'student_d',
    title: 'Color Graphing Calculator',
    category: 'Machinery & Tech',
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
    id: 4,
    seller_id: 'student_e',
    title: 'Botanical Room Spray: Cedar & Wild Lavender (50ml)',
    category: 'Perfumes & Scents',
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
    id: 5,
    seller_id: 'student_a',
    title: 'Organic Chemistry as a Second Language (Klein)',
    category: 'Textbooks',
    category_id: 'books-notes',
    price: 380,
    origPrice: 1100,
    condition: 'Good',
    seller: 'Satkar Singh (You)',
    icon: 'menu_book',
    categoryTheme: 'theme-academic',
    badge: 'Semester Bestseller',
    notes: 'Library Entrance',
    image: imgOrgChem,
    photos: [imgOrgChem, imgCalcBook],
    description: 'David Klein second edition with handwritten summary mind maps in margins. Essential for surviving organic synthesis.'
  },
  {
    id: 6,
    seller_id: 'student_f',
    title: 'Block-Printed Canvas Tote Bag (Sunflower Edition)',
    category: 'Handmade Crafts',
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
  {
    id: 7,
    seller_id: 'student_a',
    title: 'Arduino Uno Starter Lab Kit + Sensors Box',
    category: 'Machinery & Tech',
    category_id: 'lab-engineering-gear',
    price: 1150,
    origPrice: 2400,
    condition: 'Like New',
    seller: 'Satkar Singh (You)',
    icon: 'precision_manufacturing',
    categoryTheme: 'theme-tech',
    badge: 'Verified Working',
    notes: 'Turing Block',
    image: imgArduinoKit,
    photos: [imgArduinoKit],
    description: 'Original ATmega328P Arduino board, breadboard, OLED display, ultrasonic sensors, motors and resistors. Tested in Turing lab.'
  },
  {
    id: 8,
    seller_id: 'student_g',
    title: 'Solid Amber & Sandalwood Wax Cologne (15g Pocket Tin)',
    category: 'Perfumes & Scents',
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
