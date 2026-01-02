import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminFooter from './AdminFooter';

const AdminLayout = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {isAdmin ? <AdminFooter /> : <Footer />}
    </div>
  );
};

export default AdminLayout;
