// Mock campus marketplace listings for UniMart

export const mockListings = [
  // 1. Books & Notes (theme-academic)
  {
    id: 1,
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
    notes: 'Semester 1 & 2 Core',
    description: 'Single Variable Calculus textbook covering limits, derivatives & integrals. Verified pre-owned in like-new condition with no markings.'
  },
  {
    id: 2,
    title: 'Organic Chemistry as a Second Language (Klein)',
    category: 'Books & Notes',
    category_id: 'books-notes',
    price: 380,
    origPrice: 1100,
    condition: 'Good with notes',
    seller: 'Satkar Singh',
    icon: 'menu_book',
    categoryTheme: 'theme-academic',
    badge: 'Annotated',
    notes: 'Highlighted Key Concepts',
    description: 'Heavily annotated with colour-coded sticky notes and highlighted key mechanisms. Ideal for Pre-Med & Biochem students.'
  },

  // 2. Handmade & Art (theme-crafts)
  {
    id: 3,
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
    notes: 'Hand-thrown Glaze',
    description: 'Hand-thrown ceramic mug with earthy green glaze finish. Perfect for matcha, chai, or as a desk planter. One-of-a-kind artisan piece.'
  },
  {
    id: 4,
    title: 'Block-Printed Canvas Tote Bag (Sunflower Edition)',
    category: 'Handmade & Art',
    category_id: 'handmade-art',
    price: 280,
    origPrice: 550,
    condition: 'Brand New',
    seller: 'Simran D. (Design Club)',
    icon: 'palette',
    categoryTheme: 'theme-crafts',
    badge: 'Eco-Craft',
    notes: '100% Organic Cotton',
    description: 'Beautiful floral hand-embroidered tote bag. Made from 100% organic cotton canvas. Sustainable & unique campus accessory.'
  },

  // 3. Lab & Engineering Gear (theme-tech)
  {
    id: 5,
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
    notes: 'Battery + Cable included',
    description: 'TI-84 Plus CE color graphing calculator. Includes USB cable and fresh batteries. Approved for all engineering exams.'
  },
  {
    id: 6,
    title: 'Arduino Uno Starter Lab Kit + Sensors Box',
    category: 'Lab & Engineering Gear',
    category_id: 'lab-engineering-gear',
    price: 1150,
    origPrice: 2400,
    condition: 'Like New',
    seller: 'Satkar Singh',
    icon: 'precision_manufacturing',
    categoryTheme: 'theme-tech',
    badge: 'STEM Kit',
    notes: 'Complete Sensor Modules',
    description: 'Complete Arduino Uno starter kit with sensor shield, breadboard, jumper wires & 12 sensor modules. Perfect for robotics projects.'
  },

  // 4. Perfumes & Grooming (theme-scents)
  {
    id: 7,
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
    notes: 'Natural Essential Oils',
    description: 'Includes: Natural Essential Oils. Verified pre-owned item in freshly crafted condition. Hand-blended botanical fragrance.'
  },
  {
    id: 8,
    title: 'Artisanal Solid Perfume: Amberwood & Bergamot',
    category: 'Perfumes & Grooming',
    category_id: 'perfumes-grooming',
    price: 249,
    origPrice: 449,
    condition: 'Brand New',
    seller: 'Morgan P. (Campus Alchemist)',
    icon: 'local_florist',
    categoryTheme: 'theme-scents',
    badge: 'Pocket Scent',
    notes: 'Hostel Gate',
    description: 'Compact beeswax and organic jojoba oil solid cologne in travel tin. Warm amber notes balanced by bergamot.'
  },

  // 5. Electronics & Gadgets (theme-electronics)
  {
    id: 9,
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
    description: 'Ultra-slim, silent click dual Bluetooth & 2.4G wireless mouse in graphite grey. Long battery life, perfect for quiet campus study.'
  },
  {
    id: 10,
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
    description: '40mm dynamic drivers, padded ear cushions and 15-hour playback. Bluetooth 5.0 with AUX cable support for hostel listening.'
  },

  // 6. Stationery & Supplies (theme-stationery)
  {
    id: 11,
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
    description: 'Precision engineering drafting compass with fine-liner pens and replacement lead pack. Approved for first-year engineering drawing exams.'
  },
  {
    id: 12,
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
    description: '300-page ruled spiral registers with color dividers for each subject. High brightness paper, unwritten and shrink-wrapped.'
  },

  // 7. Hostel & Room Essentials (theme-hostel)
  {
    id: 13,
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
    description: 'Automatic shut-off, 1500W rapid boiling element with swivel base. Clean interior, indispensable for late-night hostel Maggi and tea.'
  },
  {
    id: 14,
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
    description: '3 color temperatures (warm, natural, cool white) with dimmable touch control and flexible gooseneck arm. Includes 5V USB charging cable.'
  },

  // 8. Fashion & Accessories (theme-fashion)
  {
    id: 15,
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
    description: 'Official university athletics embroidered varsity jacket in deep maroon and cream. Thick fleece lining, barely worn once during fest.'
  },
  {
    id: 16,
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
    description: 'Durable silicone strap, mineral crystal glass and water resistance up to 50m. Fresh battery installed last month.'
  },

  // 9. Sports, Fitness & Cycles (theme-sports)
  {
    id: 17,
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
    description: 'Front suspension fork, dual disc brakes and wide 2.1-inch tires for effortless commute between campus hostels and Turing block. Comes with steel cable lock.'
  },
  {
    id: 18,
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
    description: 'Isometric head frame, strung at 24 lbs tension with BG65 titanium string. High repulsion and control, includes cushioned grip.'
  },

  // 10. Other Campus Items (theme-other)
  {
    id: 19,
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
    description: 'Compact 5Gbps transfer speed hub with LED power indicator. Expands single laptop USB port to 4 slots simultaneously without drivers.'
  },
  {
    id: 20,
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
    description: 'Reinforced powder-coated steel legs with anti-slip pads, tablet slot and cup groove. Folds flat in seconds under the bed or closet.'
  }
];

export default mockListings;
