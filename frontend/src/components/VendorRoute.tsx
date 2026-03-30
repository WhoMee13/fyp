import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface VendorRouteProps {
  children: React.ReactNode;
}

const VendorRoute: React.FC<VendorRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isVendor, vendorStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isVendor) {
    if (vendorStatus === 'PENDING') {
      return <Navigate to="/become-vendor" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default VendorRoute;

