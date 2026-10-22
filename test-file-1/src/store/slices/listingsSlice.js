import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listingsApi } from '../../api/listingsApi.js';

export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await listingsApi.getListings(params);
      return response.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch listings');
    }
  }
);

export const createListing = createAsyncThunk(
  'listings/createListing',
  async ({ data, currentUser }, { rejectWithValue }) => {
    try {
      const response = await listingsApi.createListing(data, currentUser);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create listing');
    }
  }
);

export const updateListing = createAsyncThunk(
  'listings/updateListing',
  async ({ id, updates, currentUser }, { rejectWithValue }) => {
    try {
      const response = await listingsApi.updateListing(id, updates, currentUser);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update listing');
    }
  }
);

export const approveListing = createAsyncThunk(
  'listings/approveListing',
  async ({ id, currentUser }, { rejectWithValue }) => {
    try {
      const response = await listingsApi.approveListing(id, currentUser);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to approve listing');
    }
  }
);

export const rejectListing = createAsyncThunk(
  'listings/rejectListing',
  async ({ id, currentUser }, { rejectWithValue }) => {
    try {
      const response = await listingsApi.rejectListing(id, currentUser);
      return { id, data: response.data, message: response.message };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reject listing');
    }
  }
);

export const deleteListing = createAsyncThunk(
  'listings/deleteListing',
  async ({ id, currentUser }, { rejectWithValue }) => {
    try {
      await listingsApi.deleteListing(id, currentUser);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete listing');
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
      // fetchListings
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
      })

      // createListing
      .addCase(createListing.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })

      // updateListing
      .addCase(updateListing.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })

      // approveListing
      .addCase(approveListing.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })

      // rejectListing
      .addCase(rejectListing.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        if (data) {
          const index = state.items.findIndex((item) => item.id === data.id);
          if (index !== -1) {
            state.items[index] = data;
          }
        } else {
          state.items = state.items.filter((item) => item.id !== id);
        }
      })

      // deleteListing
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default listingsSlice.reducer;
