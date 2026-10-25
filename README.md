# UNIMART — Campus Marketplace

A peer-to-peer campus marketplace designed specifically for **Chitkara University** students and faculty. UniMart facilitates transparent buying, selling, and campus handoffs of textbooks, lab equipment, handmade items, hostel essentials, and personal student crafts.

---

## 🏛️ Campus Architecture & Viva Compliance

- **Framework**: React 19 + Vite (Fast HMR)
- **Routing**: React Router v7
- **Global State Management**:
  - **Context API**: Authenticated user session (`AuthContext`) and Theme (`ThemeContext`).
  - **Redux Toolkit**: Marketplace listings (`listingsSlice`), Wishlist (`wishlistSlice`), and Conversations/Chat (`chatSlice`).
  - **Local State (`useState`)**: Forms, modals, filtering, and search inputs.
- **Styling**: Vanilla CSS & Custom Design System (Chitkara Maroon `#70182c`, Glassmorphism, Spotlight hover effects, Dark & Light mode).
- **Backend Simulation**: Simulated REST API (`src/api/`) mimicking MySQL relational tables with network latency (~300ms) and `localStorage` persistence with in-memory fallbacks.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run build verification
npm run build

# Run linting check
npm run lint
```

---

## 🔐 Credentials & Roles

- **Admin**: `admin@chitkara.edu.in` / `Unimart@123`
- **Student**: `satkar0696.becse25@chitkara.edu.in` / `student123`
- **Guest**: Default unauthenticated mode for first-time visitors
