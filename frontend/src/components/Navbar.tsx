import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Home, LogOut, User, Shield, Menu, X, Moon, Sun, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isVendor } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(()=>{
    const favicon = document.querySelector("link[rel~='icon']");;
    if(favicon && settings?.logo){
      favicon.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.logo}`;
    }
  },[settings])
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {settings?.logo ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.logo}`} 
                  alt="Logo" 
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Home className="h-7 w-7 text-primary" />
              )}
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {settings?.appName || 'PropertyRental'}
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {/* Links for authenticated users */}
            {isAuthenticated ? (
              <>
                {/* Browse properties — customers and vendors */}
                {!isAdmin && (
                  <>
                    <Link
                      to="/properties"
                      className="text-foreground/80 hover:text-primary transition-colors font-medium relative group"
                    >
                      Properties
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link
                      to="/find"
                      className="text-foreground/80 hover:text-primary transition-colors font-medium relative group flex items-center gap-1"
                    >
                      <MapPin className="h-4 w-4" />
                      Map
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </Link>
                  </>
                )}

                {/* Dashboard link for vendors only */}
                {isVendor && (
                  <Link
                    to="/dashboard"
                    className="text-foreground/80 hover:text-primary transition-colors font-medium relative group"
                  >
                    Dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                )}

                {/* Vendor tools */}
                {isVendor && (
                  <>
                    <Link
                      to="/my-bookings"
                      className="text-foreground/80 hover:text-primary transition-colors font-medium relative group"
                    >
                      My Bookings
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </Link>
                    <Link to="/properties/add">
                      <Button size="sm" className="font-semibold">
                        Add Property
                      </Button>
                    </Link>
                  </>
                )}

                {/* Admin link for admin users */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}

                {/* Vendor dashboard link for vendors */}
                {/* {isVendor && (
                  <Link
                    to="/dashboard"
                    className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    Vendor
                  </Link>
                )} */}

                {/* Profile and Logout for all authenticated users */}
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleTheme}
                    className="rounded-full w-10 h-10"
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                  <Link
                    to={isAdmin ? "/admin/profile" : "/profile"}
                    className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    {user?.name}
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              /* Links for non-authenticated users */
              <>
                <Link
                  to="/properties"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium relative group"
                >
                  Properties
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
                <Link
                  to="/find"
                  className="text-foreground/80 hover:text-primary transition-colors font-medium relative group flex items-center gap-1"
                >
                  <MapPin className="h-4 w-4" />
                  Map
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme}
                  className="rounded-full w-10 h-10"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="font-semibold">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 space-y-4 border-t border-border"
          >
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <>
                    <Link
                      to="/properties"
                      className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Properties
                    </Link>
                    <Link
                      to="/find"
                      className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Map
                    </Link>
                  </>
                )}

                {isVendor && (
                  <>
                    <Link
                      to="/dashboard"
                      className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/properties/add"
                      className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Add Property
                    </Link>
                    <Link
                      to="/properties/manage"
                      className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage Properties
                    </Link>
                    <Link
                      to="/vendor-bookings"
                      className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Incoming Bookings
                    </Link>
                  </>
                )}

                {/* Admin link for admin users */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}

                <Link
                  to={isAdmin ? "/admin/profile" : "/profile"}
                  className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Dark Mode</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleTheme}
                    className="rounded-full"
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </div>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  Logout
                </Button>
              </>
            ) : (
              /* Non-authenticated users */
              <>
                <Link
                  to="/properties"
                  className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Properties
                </Link>
                <Link
                  to="/find"
                  className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Map
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
