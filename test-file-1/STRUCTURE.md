# UniMart — State & Architecture Guide (Viva Cheat Sheet)

This document explains the architecture of UniMart in simple, clear English. Use this guide to explain how data flows through the application during your viva.

---

## 1. Quick Summary Matrix

| Tool | What Lives Here? | Why This Tool? (The Viva Justification) |
| :--- | :--- | :--- |
| **React Router** | URL Routes (`/`, `*`), Layout wrapper (`<Outlet />`), 404 page | Keeps page navigation tied to browser URLs, browser history (back/forward buttons), and deep linking without full page reloads. |
| **Context API** | `AuthContext` (user session), `ThemeContext` (light/dark mode) | Best for **app-wide, broadcast data that changes infrequently**. Avoids "prop drilling" without the boilerplate of Redux. |
| **Redux Toolkit** | `listingsSlice` (async items catalog), `wishlistSlice` (saved items) | Best for **complex, shared domain state & async API flows** (`createAsyncThunk`). Offers predictable action dispatching and easy debugging. |
| **Local State (`useState`)** | Form fields, active category tabs, search input, modal open/close toggles | Keeps **ephemeral, component-specific UI state** isolated. Prevents unnecessary app-wide re-renders on every keystroke or click. |

---

## 2. Deep Dive: What is Where & Why

### A. React Router (`react-router-dom`)
- **What is inside?**
  - `<BrowserRouter>` at the root level (`main.jsx`).
  - `<Routes>` and nested `<Route>` structure in `App.jsx`.
  - `<Layout />` with an `<Outlet />` to render current screens cleanly.
  - A fallback wildcard route `<Route path="*" element={<NotFound />} />` to catch unknown URLs.
- **Why use Router?**
  - In a Single Page Application (SPA), we do not refresh the whole browser page when navigating.
  - React Router syncs what the user sees with the URL in the browser bar. This enables bookmarking, sharing links, and natural browser back/forward buttons.

---

### B. Context API (`React.createContext`)
- **What is inside?**
  - **`AuthContext`**: Holds `user`, `login(userData)`, and `logout()`. Stores the student's authenticated session.
  - **`ThemeContext`**: Holds `theme` (`'light'` or `'dark'`), `toggleTheme()`, and persists the user's choice in `localStorage`.
- **Why use Context here instead of Redux?**
  - Authentication status and theme preferences change **rarely** (once per login, or when toggling a button).
  - Many deeply nested components across the entire tree need to know: *"Who is logged in?"* or *"Is dark mode on?"*.
  - Using Context is lightweight, requires zero boilerplate/reducers, and eliminates passing props through intermediary components (**no prop drilling**).

---

### C. Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
- **What is inside?**
  - **`wishlistSlice`**: Synchronous state managing saved products with actions `addToWishlist`, `removeFromWishlist`, and `clearWishlist`.
  - **`listingsSlice`**: Asynchronous state managing campus marketplace items. Uses `createAsyncThunk` (`fetchListings`) with standardized status flags (`idle` | `loading` | `succeeded` | `failed`) and an `error` state.
  - **`store.js`**: Centralized store that combines both reducers and is provided to the app via `<Provider store={store}>`.
- **Why use Redux Toolkit here?**
  - Marketplace items and wishlist items represent **core business domain data**.
  - Async data fetching requires handling loading spinners, success data, and network error messages. `createAsyncThunk` handles all three lifecycle states cleanly.
  - Redux DevTools allows inspecting state transitions and action payloads time-travel style.

---

### D. Local State (`useState` & `useRef`)
- **What is inside?**
  - **Sell Item Form**: `title`, `price`, `condition`, `meetupSpot`, validation error objects (`formErrors`), and field touch history.
  - **Interactive UI Toggles**: Active category pill filter (`'All'`, `'Textbooks'`, etc.), search bar text (`searchQuery`), condition dropdown open/close state, and sell modal visibility.
- **Why keep this local?**
  - This data is **ephemeral** (temporary) and only matters to that specific component while in use.
  - If we put every single keystroke in Redux or Context, every keypress would cause unrelated components to re-evaluate and re-render, degrading UI performance.
  - Keeping it local ensures fast, snappy input feedback and clean component encapsulation.
