import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockListings } from '../../data/mockListings.js';

export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate realistic campus network latency (400ms)
      await new Promise((resolve) => setTimeout(resolve, 400));
      return mockListings;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch listings');
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    addListing: (state, action) => {
      state.items.unshift(action.payload);
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
      }
    },
    removeListing: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
    approveListing: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index].status = 'approved';
        state.items[index].badge = 'Admin Approved';
        state.items[index].updatedAt = new Date().toISOString();
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
          // Hard delete fallback
          state.items.splice(index, 1);
        }
      }
    },
    setListings: (state, action) => {
      state.items = action.payload;
      state.status = 'succeeded';
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
  setListings,
} = listingsSlice.actions;

export default listingsSlice.reducer;
