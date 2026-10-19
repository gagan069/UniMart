import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockListings } from '../../data/mockListings.js';

export const STORAGE_KEY_LISTINGS = 'unimart_listings';

export function saveListingsToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(items));
    return { success: true };
  } catch (err) {
    console.error('Failed to save listings to localStorage', err);
    return { success: false, error: 'storage_full' };
  }
}

export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Try reading from localStorage first
      if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY_LISTINGS);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const existingIds = new Set(parsed.map((item) => String(item.id)));
              const missingSeed = mockListings.filter((seed) => !existingIds.has(String(seed.id)));
              if (missingSeed.length > 0) {
                const merged = [...parsed, ...missingSeed];
                saveListingsToStorage(merged);
                return merged;
              }
              return parsed;
            }
          } catch (e) {
            console.warn('Corrupted unimart_listings in localStorage, reseeding', e);
          }
        }
      }

      // 2. Fall back to mockListings seed and persist
      saveListingsToStorage(mockListings);
      return mockListings;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch listings');
    }
  }
);

export function getInitialListings() {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_LISTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item) => String(item.id)));
          const missingSeed = mockListings.filter((seed) => !existingIds.has(String(seed.id)));
          if (missingSeed.length > 0) {
            const merged = [...parsed, ...missingSeed];
            saveListingsToStorage(merged);
            return merged;
          }
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse initial listings from localStorage', e);
  }
  return mockListings;
}

const initialState = {
  items: getInitialListings(),
  status: 'succeeded', // Ready immediately on startup
  error: null,
};

export const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    addListing: (state, action) => {
      state.items.unshift(action.payload);
      saveListingsToStorage(state.items);
    },
    updateListing: (state, action) => {
      const { id, updatedFields, ...rest } = action.payload;
      const changes = updatedFields || rest;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...changes,
          updatedAt: new Date().toISOString(),
        };
        saveListingsToStorage(state.items);
      }
    },
    removeListing: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      saveListingsToStorage(state.items);
    },
    approveListing: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index].status = 'approved';
        state.items[index].badge = 'Admin Approved';
        state.items[index].updatedAt = new Date().toISOString();
        saveListingsToStorage(state.items);
      }
    },
    rejectListing: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload;
      const reason = typeof action.payload === 'object' ? action.payload.rejectionReason : null;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        if (reason) {
          state.items[index].status = 'rejected';
          state.items[index].rejectionReason = reason;
          state.items[index].updatedAt = new Date().toISOString();
        } else {
          state.items.splice(index, 1);
        }
        saveListingsToStorage(state.items);
      }
    },
    resetDemoListings: (state) => {
      try {
        localStorage.removeItem(STORAGE_KEY_LISTINGS);
      } catch (e) {
        console.error('Error removing unimart_listings', e);
      }
      state.items = mockListings;
      state.status = 'succeeded';
      saveListingsToStorage(mockListings);
    },
    setListings: (state, action) => {
      state.items = action.payload;
      state.status = 'succeeded';
      saveListingsToStorage(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to load listings';
      });
  },
});

export const {
  addListing,
  updateListing,
  removeListing,
  approveListing,
  rejectListing,
  resetDemoListings,
  setListings,
} = listingsSlice.actions;

export default listingsSlice.reducer;
