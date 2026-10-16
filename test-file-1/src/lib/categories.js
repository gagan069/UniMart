export const categories = [
  {
    id: "books-notes",
    slug: "books-notes",
    name: "Books & Notes",
    icon: "menu_book",
    color: "#d97706",
    colorName: "Amber Gold",
    glowKey: "amber",
    bgSoft: "rgba(217, 119, 6, 0.12)",
    subcategories: [
      { id: "engineering-textbooks", slug: "engineering-textbooks", name: "Engineering textbooks" },
      { id: "other-course-textbooks", slug: "other-course-textbooks", name: "Other course textbooks" },
      { id: "handwritten-notes", slug: "handwritten-notes", name: "Handwritten notes" },
      { id: "previous-year-papers", slug: "previous-year-papers", name: "Previous-year papers" },
      { id: "competitive-exam-prep", slug: "competitive-exam-prep", name: "Competitive exam prep" },
      { id: "novels-general-reading", slug: "novels-general-reading", name: "Novels & general reading" }
    ]
  },
  {
    id: "electronics-gadgets",
    slug: "electronics-gadgets",
    name: "Electronics & Gadgets",
    icon: "devices",
    color: "#0ea5e9",
    colorName: "Sky Tech Blue",
    glowKey: "cyan",
    bgSoft: "rgba(14, 165, 233, 0.12)",
    subcategories: [
      { id: "laptops", slug: "laptops", name: "Laptops" },
      { id: "phones-tablets", slug: "phones-tablets", name: "Phones & tablets" },
      { id: "audio-earphones-speakers", slug: "audio-earphones-speakers", name: "Audio (earphones, speakers)" },
      { id: "chargers-cables", slug: "chargers-cables", name: "Chargers & cables" },
      { id: "keyboards-mice", slug: "keyboards-mice", name: "Keyboards & mice" },
      { id: "storage-pendrives-hdds", slug: "storage-pendrives-hdds", name: "Storage (pendrives, HDDs)" }
    ]
  },
  {
    id: "lab-engineering-gear",
    slug: "lab-engineering-gear",
    name: "Lab & Engineering Gear",
    icon: "precision_manufacturing",
    color: "#0284c7",
    colorName: "Electric Blue",
    glowKey: "blue",
    bgSoft: "rgba(2, 132, 199, 0.12)",
    subcategories: [
      { id: "scientific-calculators", slug: "scientific-calculators", name: "Scientific calculators" },
      { id: "drafters-drawing-kits", slug: "drafters-drawing-kits", name: "Drafters & drawing kits" },
      { id: "lab-coats-safety-gear", slug: "lab-coats-safety-gear", name: "Lab coats & safety gear" },
      { id: "arduino-robotics-kits", slug: "arduino-robotics-kits", name: "Arduino / robotics kits" },
      { id: "tools-instruments", slug: "tools-instruments", name: "Tools & instruments" },
      { id: "machine-lab-parts", slug: "machine-lab-parts", name: "Machine & lab parts" }
    ]
  },
  {
    id: "stationery-supplies",
    slug: "stationery-supplies",
    name: "Stationery & Supplies",
    icon: "edit_note",
    color: "#059669",
    colorName: "Emerald Green",
    glowKey: "emerald",
    bgSoft: "rgba(5, 150, 105, 0.12)",
    subcategories: [
      { id: "notebooks-registers", slug: "notebooks-registers", name: "Notebooks & registers" },
      { id: "art-supplies", slug: "art-supplies", name: "Art supplies" },
      { id: "project-model-material", slug: "project-model-material", name: "Project & model material" },
      { id: "files-folders", slug: "files-folders", name: "Files & folders" },
      { id: "pens-writing", slug: "pens-writing", name: "Pens & writing" }
    ]
  },
  {
    id: "hostel-room-essentials",
    slug: "hostel-room-essentials",
    name: "Hostel & Room Essentials",
    icon: "bed",
    color: "#ea580c",
    colorName: "Warm Orange",
    glowKey: "orange",
    bgSoft: "rgba(234, 88, 12, 0.12)",
    subcategories: [
      { id: "kitchen-kettle-induction", slug: "kitchen-kettle-induction", name: "Kitchen (kettle, induction)" },
      { id: "cooling-heating", slug: "cooling-heating", name: "Cooling & heating" },
      { id: "bedding-mattress", slug: "bedding-mattress", name: "Bedding & mattress" },
      { id: "study-lamp-electricals", slug: "study-lamp-electricals", name: "Study lamp & electricals" },
      { id: "storage-organisers", slug: "storage-organisers", name: "Storage & organisers" },
      { id: "bathroom-laundry", slug: "bathroom-laundry", name: "Bathroom & laundry" }
    ]
  },
  {
    id: "fashion-accessories",
    slug: "fashion-accessories",
    name: "Fashion & Accessories",
    icon: "checkroom",
    color: "#e11d48",
    colorName: "Vibrant Rose",
    glowKey: "rose",
    bgSoft: "rgba(225, 29, 72, 0.12)",
    subcategories: [
      { id: "mens-clothing", slug: "mens-clothing", name: "Men’s clothing" },
      { id: "womens-clothing", slug: "womens-clothing", name: "Women’s clothing" },
      { id: "shoes", slug: "shoes", name: "Shoes" },
      { id: "bags-backpacks", slug: "bags-backpacks", name: "Bags & backpacks" },
      { id: "watches-jewellery", slug: "watches-jewellery", name: "Watches & jewellery" },
      { id: "college-merch-hoodies", slug: "college-merch-hoodies", name: "College merch & hoodies" }
    ]
  },
  {
    id: "perfumes-grooming",
    slug: "perfumes-grooming",
    name: "Perfumes & Grooming",
    icon: "local_florist",
    color: "#a855f7",
    colorName: "Royal Purple",
    glowKey: "purple",
    bgSoft: "rgba(168, 85, 247, 0.12)",
    subcategories: [
      { id: "perfumes-deos", slug: "perfumes-deos", name: "Perfumes & deos" },
      { id: "attars", slug: "attars", name: "Attars" },
      { id: "grooming-kits", slug: "grooming-kits", name: "Grooming kits" },
      { id: "skincare", slug: "skincare", name: "Skincare" }
    ]
  },
  {
    id: "handmade-art",
    slug: "handmade-art",
    name: "Handmade & Art",
    icon: "palette",
    color: "#ec4899",
    colorName: "Rose Pink",
    glowKey: "pink",
    bgSoft: "rgba(236, 72, 153, 0.12)",
    subcategories: [
      { id: "crochet-knitting", slug: "crochet-knitting", name: "Crochet & knitting" },
      { id: "paintings-sketches", slug: "paintings-sketches", name: "Paintings & sketches" },
      { id: "custom-gifts", slug: "custom-gifts", name: "Custom gifts" },
      { id: "handmade-jewellery", slug: "handmade-jewellery", name: "Handmade jewellery" },
      { id: "decor", slug: "decor", name: "Decor" }
    ]
  },
  {
    id: "sports-fitness-cycles",
    slug: "sports-fitness-cycles",
    name: "Sports, Fitness & Cycles",
    icon: "fitness_center",
    color: "#65a30d",
    colorName: "Neon Lime",
    glowKey: "lime",
    bgSoft: "rgba(101, 163, 13, 0.12)",
    subcategories: [
      { id: "cricket", slug: "cricket", name: "Cricket" },
      { id: "racket-sports", slug: "racket-sports", name: "Racket sports" },
      { id: "football-basketball", slug: "football-basketball", name: "Football & basketball" },
      { id: "gym-fitness", slug: "gym-fitness", name: "Gym & fitness" },
      { id: "yoga", slug: "yoga", name: "Yoga" },
      { id: "bicycles-accessories", slug: "bicycles-accessories", name: "Bicycles & accessories" }
    ]
  },
  {
    id: "other",
    slug: "other",
    name: "Other",
    icon: "more_horiz",
    color: "#64748b",
    colorName: "Steel Slate",
    glowKey: "slate",
    bgSoft: "rgba(100, 116, 139, 0.12)",
    subcategories: []
  }
];

export function getCategoryMeta(categoryIdOrName) {
  if (!categoryIdOrName) return categories[9]; // Other
  const query = categoryIdOrName.toLowerCase().trim();
  
  const found = categories.find(
    (c) => c.id === query || c.slug === query || c.name.toLowerCase() === query
  );
  if (found) return found;

  if (query.includes('book') || query.includes('note') || query.includes('textbook')) return categories[0];
  if (query.includes('electr') || query.includes('gadget') || query.includes('phone') || query.includes('laptop')) return categories[1];
  if (query.includes('lab') || query.includes('gear') || query.includes('calc') || query.includes('machin')) return categories[2];
  if (query.includes('station') || query.includes('suppl') || query.includes('pen')) return categories[3];
  if (query.includes('hostel') || query.includes('room') || query.includes('bed')) return categories[4];
  if (query.includes('fashion') || query.includes('cloth') || query.includes('access')) return categories[5];
  if (query.includes('perfume') || query.includes('groom') || query.includes('scent')) return categories[6];
  if (query.includes('art') || query.includes('craft') || query.includes('handmade')) return categories[7];
  if (query.includes('sport') || query.includes('fit') || query.includes('cycle')) return categories[8];

  return categories[9];
}

export default categories;
