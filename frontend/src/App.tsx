import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import ManageProperties from './pages/ManageProperties';
import Profile from './pages/Profile';
import BecomeVendor from './pages/BecomeVendor';
import MyBookings from './pages/MyBookings';
import VendorBookings from './pages/VendorBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminProperties from './pages/AdminProperties';
import AdminUsers from './pages/AdminUsers';
import AdminProfile from './pages/AdminProfile';
import AdminVendors from './pages/AdminVendors';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import VendorRoute from './components/VendorRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import FindOnMap from './pages/FindOnMap';
import AdminSettings from './pages/AdminSettings';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <ThemeProvider>
      <Toaster position="bottom-right" reverseOrder={false} />
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <SettingsProvider>
            <LocationProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="properties" element={<Properties />} />
                    <Route path="properties/:id" element={<PropertyDetail />} />
                    <Route path="find" element={<FindOnMap />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />

                    {/* Protected user routes */}
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="become-vendor"
                      element={
                        <ProtectedRoute>
                          <BecomeVendor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="properties/add"
                      element={
                        <VendorRoute>
                          <AddProperty />
                        </VendorRoute>
                      }
                    />
                    <Route
                      path="properties/manage"
                      element={
                        <VendorRoute>
                          <ManageProperties />
                        </VendorRoute>
                      }
                    />
                    <Route
                      path="vendor-bookings"
                      element={
                        <VendorRoute>
                          <VendorBookings />
                        </VendorRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="my-bookings"
                      element={
                        <ProtectedRoute>
                          <MyBookings />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Admin routes with separate layout */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="properties"
                      element={
                        <AdminRoute>
                          <AdminProperties />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <AdminRoute>
                          <AdminUsers />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="vendors"
                      element={
                        <AdminRoute>
                          <AdminVendors />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <AdminRoute>
                          <AdminProfile />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <AdminRoute>
                          <AdminSettings />
                        </AdminRoute>
                      }
                    />
                  </Route>
                </Routes>
              </Router>
            </LocationProvider>
          </SettingsProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;

