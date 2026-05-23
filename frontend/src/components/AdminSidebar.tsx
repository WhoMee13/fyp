import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserSquare2, 
  Settings, 
  Home,
  ChevronRight,
  LogOut,
  User,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { useEffect } from 'react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (favicon && settings?.logo) {
      favicon.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.logo}`;
    }
  }, [settings]);
  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { title: 'Properties', icon: Building2, path: '/admin/properties' },
    { title: 'Users', icon: Users, path: '/admin/users' },
    { title: 'Vendors', icon: UserSquare2, path: '/admin/vendors' },
    { title: 'Site Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-72 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header/Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3 group" onClick={onClose}>
            {settings?.logo ? (
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.logo}`} 
                alt="Logo" 
                className="h-8 w-8 object-contain"
              />
            ) : (
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Home className="h-6 w-6 text-primary" />
              </div>
            )}
            <span className="font-bold text-lg tracking-tight text-foreground truncate">
              {settings?.appName || 'Admin Panel'}
            </span>
          </Link>
          <button className="lg:hidden p-1 hover:bg-muted rounded-md transition-colors" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-6 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          <div>
            <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 opacity-70">
              Management
            </h2>
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 opacity-70">
              Quick Links
            </h2>
            <nav className="space-y-1.5">
              <Link
                to="/admin/profile"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
                  location.pathname === '/admin/profile' && "bg-muted text-foreground"
                )}
              >
                <User className="h-5 w-5" />
                <span className="font-medium text-sm">My Profile</span>
              </Link>
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-primary transition-all"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium text-sm">View Website</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 mt-auto border-t border-border space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-11 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="font-medium text-sm">Theme: {theme === 'light' ? 'Dark' : 'Light'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-11 rounded-xl border-red-500/10 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Logout Session</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
