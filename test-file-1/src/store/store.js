import { configureStore } from '@reduxjs/toolkit';
import wishlistReducer from './slices/wishlistSlice.js';
import listingsReducer, { STORAGE_KEY_LISTINGS } from './slices/listingsSlice.js';

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    listings: listingsReducer,
  },
});

// Throttled persistence backup for listings slice
let listingsSaveTimeout = null;
store.subscribe(() => {
  if (listingsSaveTimeout) clearTimeout(listingsSaveTimeout);
  listingsSaveTimeout = setTimeout(() => {
    try {
      const state = store.getState();
      if (
        state.listings &&
        state.listings.status === 'succeeded' &&
        Array.isArray(state.listings.items) &&
        state.listings.items.length > 0
      ) {
        localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(state.listings.items));
      }
    } catch (e) {
      console.warn('LocalStorage save throttled error', e);
    }
  }, 500);
});

export default store;
