import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginPage from './LoginPage.jsx';
import Dashboard from './Dashboard.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Layout from './layouts/Layout.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { isAdmin } from './lib/permissions.js';
import { fetchListings } from './store/slices/listingsSlice.js';
import { selectListingsStatus } from './store/selectors.js';

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();
  if (!isAdmin(user)) {
    return (
      <Navigate
        to="/"
        replace
        state={{ accessDeniedToast: "You don't have access to that page" }}
      />
    );
  }
  return children;
}

function App() {
  const dispatch = useDispatch();
  const listingsStatus = useSelector(selectListingsStatus);

  // Dispatch fetchListings on app start to ensure store is synced with storage
  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Marketplace Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Dedicated Auth URLs */}
        <Route path="login" element={<LoginPage initialMode="login" />} />
        <Route path="register" element={<LoginPage initialMode="register" />} />

        {/* Catalog & Filter Routes */}
        <Route path="item/:id" element={<Dashboard />} />
        <Route path="saved" element={<Dashboard initialTab="saved" />} />
        <Route path="my-listings" element={<Dashboard initialTab="my" />} />
        <Route path="requests" element={<Dashboard initialTab="requests" />} />

        {/* Protected Admin Portal */}
        <Route
          path="admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
