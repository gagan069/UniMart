import { configureStore } from '@reduxjs/toolkit';
import wishlistReducer from './slices/wishlistSlice.js';
import listingsReducer from './slices/listingsSlice.js';

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    listings: listingsReducer,
  },
});

export default store;
