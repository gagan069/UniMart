import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockListings } from '../../data/mockListings.js';

export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate network latency (500ms delay)
      await new Promise((resolve) => setTimeout(resolve, 500));
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
  reducers: {},
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

export default listingsSlice.reducer;
