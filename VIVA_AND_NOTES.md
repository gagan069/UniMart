# UniMart — Complete Architecture Notes & Viva Preparation Guide

This document is divided into two distinct sections:
- **Category 1: Comprehensive Project Notes** (architecture, design decisions, file structure, state matrix, and styling mechanics)
- **Category 2: Viva Questions & Model Answers** (25+ curated, exam-ready questions with crisp explanations you can speak in your viva)

---

# CATEGORY 1: Comprehensive Project Notes

## 1. Project Overview & Architectural Principles
**UniMart** is a campus peer-to-peer marketplace built with **React 19, Vite, React Router 7, React Context API, and Redux Toolkit**.

The application enforces a **Strict Separation of Concerns**:
1. **Routing & Navigation**: Decoupled from rendering logic using declarative URL routing.
2. **App-wide Broadcast State (Context API)**: Low-frequency, global app preferences (Auth session & Theme).
3. **Domain Business State (Redux Toolkit)**: High-frequency or complex asynchronous collections (Marketplace catalog & Wishlist).
4. **Local Ephemeral State (`useState` / `useRef`)**: Component-isolated data (Form inputs, validation errors, modal toggles, dropdowns).
5. **Animation & Interaction Mechanics (CSS3 / GPU)**: High-performance micro-interactions using cubic-bezier curves, hardware acceleration, and deliberate transition delays.

---

## 2. Master State Architecture Matrix

| State Category | Technology | Data Stored | Why This Choice? | Key Files |
| :--- | :--- | :--- | :--- | :--- |
| **Routing** | `react-router-dom` (v7) | Route paths (`/`, `*`), Layout hierarchy | Keeps URL synchronized with view, enables browser back/forward history, deep linking, and layout reusability via `<Outlet />`. | `main.jsx`, `App.jsx`, `Layout.jsx`, `NotFound.jsx` |
| **Global Broadcast Context** | React Context API | • User session (`user`, `login`, `logout`)<br>• Theme (`'light'` / `'dark'`, `toggleTheme`) | Ideal for infrequently changing data that must be read across distant components. Eliminates "prop drilling" without Redux boilerplate. | `AuthContext.jsx`, `ThemeContext.jsx` |
| **Domain State (Sync & Async)** | Redux Toolkit (`@reduxjs/toolkit`) | • `listings`: Async catalog items, fetch status, error<br>• `wishlist`: User's saved items array | Manages multi-step asynchronous lifecycles (`pending`, `fulfilled`, `rejected`) via `createAsyncThunk`. Centralized, predictable, and observable. | `store.js`, `listingsSlice.js`, `wishlistSlice.js`, `mockListings.js` |
| **Local Component State** | React `useState` & `useRef` | • Listing form fields (title, price, category, condition)<br>• Form validation errors & touched flags<br>• Search text query & active category filter tab<br>• Modal & dropdown open/close states | Temporary, component-specific data. Keeping it local prevents unnecessary app-wide re-renders on every keystroke. | `Dashboard.jsx`, `LoginPage.jsx` |

---

## 3. Detailed Component & File Breakdown

### A. Routing Infrastructure (`src/layouts/` & `src/pages/`)
- **[main.jsx](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/main.jsx)**:
  - Root entry point. Wraps `<App />` with `<Provider store={store}>`, `<BrowserRouter>`, `<AuthProvider>`, and `<ThemeProvider>`.
- **[App.jsx](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/App.jsx)**:
  - Defines the declarative route tree using `<Routes>`.
  - Sets root route `<Route path="/" element={<Layout />}>`.
  - Defines `<Route index element={<MainScreen />} />` to preserve existing screen toggling seamlessly.
  - Defines wildcard route `<Route path="*" element={<NotFound />} />`.
- **[Layout.jsx](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/layouts/Layout.jsx)**:
  - Base layout component containing `<Outlet />`. Renders matched child routes with zero overhead or unnecessary wrapping markup.
- **[NotFound.jsx](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/pages/NotFound.jsx)**:
  - Fallback 404 page styled with UniMart brand identity (`#70182c`), clear messaging, and a return link to `/`.

### B. Broadcast Context API (`src/context/`)
- **[AuthContext.jsx](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/context/AuthContext.jsx)**:
  - Provides `{ user, login, logout }` via `createContext` and custom hook `useAuth()`.
  - Stores authenticated user object (name, email, student ID) in memory.
  - Wired into `LoginPage.jsx` so submitting login credentials updates the global auth session.
- **[ThemeContext.jsx](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/context/ThemeContext.jsx)**:
  - Provides `{ theme, toggleTheme, isDark }` via `useTheme()`.
  - Initializes state from `localStorage.getItem('unimart-theme') || 'light'`.
  - Uses `useEffect` to synchronize changes to `localStorage` and set `document.documentElement.setAttribute('data-theme', theme)`.

### C. Redux Toolkit Architecture (`src/store/` & `src/data/`)
- **[store.js](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/store/store.js)**:
  - Creates the centralized Redux store using `configureStore()`.
  - Combines `wishlist` and `listings` slice reducers.
- **[listingsSlice.js](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/store/slices/listingsSlice.js)**:
  - Defines async thunk `fetchListings`: simulates API latency (500ms delay) and returns `mockListings`.
  - Handles 3 lifecycle states in `extraReducers`:
    - `fetchListings.pending` $\rightarrow$ `status = 'loading'`, `error = null`
    - `fetchListings.fulfilled` $\rightarrow$ `status = 'succeeded'`, `items = action.payload`
    - `fetchListings.rejected` $\rightarrow$ `status = 'failed'`, `error = action.error.message`
- **[wishlistSlice.js](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/store/slices/wishlistSlice.js)**:
  - Synchronous slice managing saved campus items.
  - Reducers:
    - `addToWishlist`: Appends item only if not already in array (prevents duplicates).
    - `removeFromWishlist`: Filters out item by `id`.
    - `clearWishlist`: Clears `items = []`.
- **[mockListings.js](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/data/mockListings.js)**:
  - Clean mock dataset of campus products (Textbooks, Crafts, Tech tools, Fragrances) used by the async thunk.

### D. UI, Theming & Micro-Interaction Styling
- **[Dashboard.css](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/Dashboard.css)**:
  - **Hover Smoothing**:
    - Replaced abrupt `scale(0.95)` with natural resting `scale(1) translateY(0)`.
    - Tuned hover scale to `scale(1.09) translateY(-10px)` anchored at `transform-origin: center 25%`.
    - Easing curve: `0.38s cubic-bezier(0.22, 1, 0.36, 1)` on hover enter with `0.08s` delay to prevent cursor-swipe jitter.
    - Exit transition: `0.25s cubic-bezier(0.4, 0, 0.2, 1)` with `0s` delay for responsive dismiss.
    - Added GPU hardware acceleration flags (`will-change: transform, opacity, box-shadow; backface-visibility: hidden;`).
  - **Dark Theme ([data-theme="dark"])**:
    - Deep obsidian slate canvas (`#0b0e14`).
    - **Warm Off-White / Cream Product Cards (`#f4ede3`)**: Eliminates piercing glare while maintaining a tactile, campus-card aesthetic against the dark canvas. Typography rendered in deep charcoal (`#1c1917`) for optimal readability.
    - **Luminous 3D Spotlight Cards**: Deep olive/chartreuse (Lime), midnight navy/ice-blue (Tech), and blackberry/neon-rose (Crafts).
    - Glassmorphic top navigation with `backdrop-filter: blur(14px)`.
- **[index.css](file:///c:/Users/thesa/Desktop/React-js/test-file-1/src/index.css)**:
  - Added global `0.3s ease` transition across background-color, border-color, and color for smooth theme switching.

---

# CATEGORY 2: Viva Questions & Model Answers

### Question 1: What is the primary difference between Context API and Redux Toolkit? When do you choose one over the other?
**Model Answer:**
> "Context API is designed for **sharing low-frequency, broadcast data** across the component tree without prop drilling (such as current authenticated user or light/dark theme preference). It does not have built-in state management or async middleware—it simply passes data down.
> Redux Toolkit is designed for **complex domain state and high-frequency updates**. It provides a structured unidirectional data flow, built-in immutability via Immer, middleware support (`createAsyncThunk`) for asynchronous network requests, and Redux DevTools for time-travel debugging.
> In UniMart, we use **Context API for Auth and Theme**, and **Redux Toolkit for Marketplace Listings and Wishlist**."

---

### Question 2: What is "Prop Drilling" and how does Context API solve it?
**Model Answer:**
> "Prop drilling occurs when data has to be passed down through multiple layers of intermediate components that do not actually need the data themselves, just to reach a deeply nested child component.
> Context API solves this by creating a global context with `createContext()`. A `<Provider>` wraps the component tree, and any child component at any depth can directly read the data using `useContext(MyContext)` without passing props through intermediate components."

---

### Question 3: How does React Router work in a Single Page Application (SPA)? What role does `<Outlet />` play?
**Model Answer:**
> "In an SPA, navigation happens purely on the client side without requesting a new HTML file from the server. React Router intercepts URL changes in the browser address bar, prevents page reload, and conditionally mounts the corresponding component.
> `<Outlet />` is a placeholder component provided by React Router. When we have a parent layout route (like `<Route path="/" element={<Layout />}>`), `<Outlet />` inside the `<Layout />` tells React Router exactly where to render the child route components (e.g., `<MainScreen />` or `<NotFound />`)."

---

### Question 4: Why do we wrap the root component in `<BrowserRouter>`?
**Model Answer:**
> "`<BrowserRouter>` uses the HTML5 History API (`pushState`, `replaceState`, and `popstate` events) to keep the UI in sync with the browser's address bar. It acts as the top-level routing context provider that enables child components to use routing hooks like `useNavigate()`, `useLocation()`, and components like `<Routes>`, `<Route>`, and `<Link>`."

---

### Question 5: What is the wildcard `*` route in React Router, and why is it important?
**Model Answer:**
> "The wildcard path (`path="*"`) matches any URL that was not explicitly defined by any previous `<Route>`. It is used to render a 404 Not Found fallback page (`<NotFound />`). It ensures graceful error handling so users who enter an invalid URL see a styled, branded error page with a return link rather than a broken or blank screen."

---

### Question 6: What is `createAsyncThunk` in Redux Toolkit? Explain its 3 lifecycle actions.
**Model Answer:**
> "`createAsyncThunk` is an abstraction in Redux Toolkit that handles asynchronous logic like API calls. It automatically generates and dispatches three action types corresponding to the Promise lifecycle:
> 1. **`pending`**: Dispatched immediately when the async function starts. Used to set `status = 'loading'` and clear errors.
> 2. **`fulfilled`**: Dispatched when the promise resolves successfully. Used to set `status = 'succeeded'` and store the payload in state.
> 3. **`rejected`**: Dispatched when the promise fails or errors. Used to set `status = 'failed'` and record the error message."

---

### Question 7: Why should form state (like listing title, price, and validation errors) NOT be stored in Redux?
**Model Answer:**
> "Form input values and validation errors are **ephemeral, local UI state**. They are only relevant to that specific form component while the user is typing.
> If we put every keystroke into Redux, every keypress would dispatch an action, trigger Redux reducers, and potentially cause unnecessary re-renders in other components connected to the store. Keeping form state local with `useState` ensures maximum typing performance, immediate validation feedback, and clean component encapsulation."

---

### Question 8: How did you implement Dark Mode? Why did you use `data-theme` attribute instead of just a CSS class?
**Model Answer:**
> "In `ThemeContext.jsx`, we maintain the current theme in state and persist it in `localStorage`. In a `useEffect`, we set `document.documentElement.setAttribute('data-theme', theme)`.
> Using the `data-theme="dark"` attribute on the `<html>` root allows us to write standard CSS attribute selectors like `[data-theme="dark"] .unimart-card-resting`. This scopes dark theme styles globally across all components, modals, and portals without having to pass theme classes manually to individual DOM nodes."

---

### Question 9: Why did you use an off-white cream tone (`#f4ede3`) for product cards in dark mode instead of pure white or dark grey?
**Model Answer:**
> "In dark mode, stark white (`#ffffff`) surfaces produce excessive contrast and blue-light glare against an obsidian background (`#0b0e14`), causing visual fatigue.
> By using a warm off-white / cream tone (`#f4ede3`) paired with deep charcoal typography (`#1c1917`), we achieve high contrast that is gentle on the eyes. It preserves the clean, tactile feel of physical campus index cards while adhering to ergonomic dark mode principles."

---

### Question 10: How did you fix the hover popup transition to make it smooth rather than abrupt?
**Model Answer:**
> "We improved the hover transition through four key techniques:
> 1. **Anchor & Initial Transform**: Changed resting scale from shrunken `scale(0.95)` to `scale(1) translateY(0)` with `transform-origin: center 25%`, eliminating awkward jumping.
> 2. **Cubic-Bezier Easing**: Replaced steep, snappy curves with a natural deceleration curve: `cubic-bezier(0.22, 1, 0.36, 1)`.
> 3. **Synchronized Hover Delay**: Added an `0.08s` delay on hover enter. This creates an intentional feel and prevents cards from flashing when the mouse quickly sweeps across the grid. On hover leave, the delay is `0s` so the card collapses immediately.
> 4. **Hardware Acceleration**: Added `will-change: transform, opacity, box-shadow` and `backface-visibility: hidden` to move the animation onto the GPU compositor thread, eliminating subpixel jitter."

---

### Question 11: How is the Redux Store structured in your project?
**Model Answer:**
> "The store is created in `src/store/store.js` using `configureStore()`. It combines two slices:
> - `wishlist`: managed by `wishlistSlice.reducer` for synchronous item additions and removals.
> - `listings`: managed by `listingsSlice.reducer` for asynchronous marketplace catalog fetching.
> The store is supplied to the entire app using `<Provider store={store}>` at the root in `main.jsx`."

---

### Question 12: What is the purpose of `extraReducers` in a Redux slice?
**Model Answer:**
> "While standard `reducers` handle actions defined within the slice itself, `extraReducers` allows a slice to listen and respond to actions generated outside of it—most notably actions dispatched by `createAsyncThunk` (`fetchListings.pending`, `fulfilled`, and `rejected`). Using the builder callback notation (`builder.addCase()`), it provides full TypeScript and immutability safety."

---

### Question 13: What happens when a user refreshes the page? How is state preserved?
**Model Answer:**
> "In-memory state (such as Redux state or local component `useState`) resets to its initial values on a full page refresh.
> However, for user preferences like **Theme**, we read from and write to `localStorage` in `ThemeContext.jsx` (`localStorage.getItem('unimart-theme')`). This guarantees that when the page reloads, the user's preferred theme (light or dark) is restored instantly before rendering."

---

### Question 14: What is the role of `<StrictMode>` in `main.jsx`?
**Model Answer:**
> "`<StrictMode>` is a development-only tool in React that highlights potential problems in an application. It intentionally double-invokes component lifecycle effects (like `useEffect`) in development to help developers catch side-effects, memory leaks, and deprecated API usage before deployment."

---

### Question 15: If an evaluator asks: "Can you demonstrate where Redux is used vs where Context is used in the code?", what do you show?
**Model Answer:**
> "I show:
> 1. **Context API**: `src/context/AuthContext.jsx` and `src/context/ThemeContext.jsx`. In `Dashboard.jsx` and `LoginPage.jsx`, we consume them via `useTheme()` and `useAuth()`.
> 2. **Redux Toolkit**: `src/store/store.js`, `src/store/slices/listingsSlice.js`, and `src/store/slices/wishlistSlice.js`. In `main.jsx`, `<Provider store={store}>` wraps the app.
> 3. **Local State**: Inside `Dashboard.jsx`, the listing modal form inputs and category filters are managed via `useState`."

---

### Question 16: How is the "Waiting for Approval" timer status implemented for new listings?
**Model Answer:**
> "When a student submits a new product via the Sell an Item modal (`Dashboard.jsx`), instead of directly marking it active, the product object is prepended with `status: 'pending'` and a `submittedAt` timestamp. The UI renders an animated timer mark (`schedule` icon with a pulsing keyframe) on the card image and disables direct purchase actions with a 'Waiting for Approval' indicator. A dedicated 'Waiting Approval' filter pill also appears in the subnav so users and admins can track pending queue items."

---

### Question 17: How is Admin role authorization handled for removing listings?
**Model Answer:**
> "Role-based access control is managed via `AuthContext.jsx`. The context exposes an `isAdmin` boolean state and a `toggleAdminRole()` switcher. In `Dashboard.jsx`, we consume `useAuth()`. If `isAdmin` is true, the user sees Admin Mode active in the top navbar, and admin action bars are unlocked on marketplace cards, enabling admins to either 'Approve' pending listings or 'Remove from Listing'. Regular students do not see the deletion controls, preventing unauthorized listing removal."

---

### Question 18: How does the consolidated 3-line profile chip improve UX and navbar responsiveness?
**Model Answer:**
> "Instead of cluttering the top navbar with a separate bulky 'Guest Mode' or 'Role' button, the profile chip neatly encapsulates all user identity into 3 vertically stacked lines:
> - **Line 1**: Full Name (bold font)
> - **Line 2**: Student Roll Number / ID (small, muted grey)
> - **Line 3**: Access Level ('Student' / 'Admin' / 'Guest' in Chitkara Maroon `#70182c`)
> On desktop and 1440px displays, it sits cleanly on the right with the initial avatar circle. On mobile screens (`< 768px`), CSS media queries collapse the text lines to display only the initial circle, saving horizontal navbar space. Clicking the avatar on mobile opens the dropdown displaying the full 3 lines alongside account options."

---

### Question 19: How are "All Listings" and "My Listings" tabs implemented and scoped?
**Model Answer:**
> "Under the Marketplace Catalog heading, we implemented two pill-style tabs: `[ All Listings ]` and `[ My Listings (count) ]`.
> 1. `catalogTab` state toggles between `'all'` and `'my'`.
> 2. `activeScopedProducts` derives its data pool: if `'my'` is active, it filters listings where `item.seller_id === user.id`; otherwise, it returns the entire catalog.
> 3. Active category filters and search queries dynamically filter within whichever tab is active.
> 4. If a guest clicks 'My Listings', the app detects the absence of a session and immediately opens the login modal.
> 5. If a student has 0 listings, a dedicated empty state is displayed: *'You haven't listed anything yet'* with a direct *'Sell an Item'* button opening the 2-step listing modal."

---

### Question 20: How does the listing Edit flow work, and how does it reuse the 2-step form?
**Model Answer:**
> "When a student clicks the ✏️ Edit icon on their card in the 'My Listings' tab:
> 1. `handleEditListingClick(item)` sets `isEditing = true` and `editingId = item.id`.
> 2. The existing `formData` state is pre-populated with the listing's current title, category, subcategory, price, condition, meetup spot, and photos.
> 3. The modal title dynamically updates to **'Edit Listing'** (instead of 'List an Item on UNIMART').
> 4. On Step 2, the final submission button reads **'Save Changes'**.
> 5. When submitted, `updateListing(editingId, updatedData)` from `ListingsContext` mutates the listing in-place, triggers a success toast *'Listing updated'*, and closes the modal after 1.5 seconds, immediately updating the card on screen."

---

### Question 21: How does photo reordering work in Step 2 of the listing modal?
**Model Answer:**
> "In Step 2 of the listing form, each uploaded thumbnail has a dedicated reorder bar (`unimart-photo-reorder-bar`). Clicking the left arrow swaps the photo with the preceding index (`index - 1`), while clicking the right arrow swaps it with the next index (`index + 1`). This is accomplished in immutable React state by copying the photos array, performing an in-place swap, and calling `setFormData((prev) => ({ ...prev, photos: newPhotos }))`. The first photo (`index === 0`) automatically gains the '★ Cover' badge."

---

### Question 22: How is the Delete action protected and confirmed before removal?
**Model Answer:**
> "Listing deletion is protected by both client-side authorization and user confirmation:
> 1. We invoke `canManageListing(user, listing)` from `src/lib/permissions.js` to ensure students cannot delete other users' listings.
> 2. Before removing, a browser confirmation dialog prompts: `Delete '${item.title}'? This can't be undone.`.
> 3. If the seller confirms, `removeListing(item.id)` purges the item from the shared `ListingsContext`, and a success toast *'Listing deleted'* is displayed."

---

### Question 23: How is the Admin Dashboard (`/admin`) implemented and protected?
**Model Answer:**
> "The `/admin` route is secured by a `ProtectedAdminRoute` higher-order wrapper in `App.jsx`. If a student or guest attempts to navigate to `/admin`, they are immediately redirected to `/` with an access-denied toast (*'You don't have access to that page'*).
> For authenticated administrators:
> 1. The profile dropdown provides a dedicated 'Admin Dashboard' link.
> 2. `/admin` renders a management portal styled with UniMart aesthetics, featuring:
>    - Live statistics: Total active listings count and total campus marketplace value (₹).
>    - Searchable table of all campus listings with thumbnail photo, title, category, seller ID/name, and price.
>    - A 'Remove' action button that prompts for confirmation before removing any flagged or inappropriate item directly from the shared marketplace context."

