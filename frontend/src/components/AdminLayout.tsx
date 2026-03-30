import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Breadcrumbs from './Breadcrumbs';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Fixed on desktop, drawer on mobile */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Mobile Header (Only visible on small screens) */}
        <header className="lg:hidden h-16 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-30 flex items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="ml-4 font-bold text-lg tracking-tight">Admin Portal</span>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Breadcrumbs />
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
