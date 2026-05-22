import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, Settings, Users, Home } from 'lucide-react';

const AdminFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-muted/50 to-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Secure administrator dashboard for managing PropertyRental platform. Monitor users, properties, and system performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Admin Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </Link>
              </li>
              <li>
                <Link to="/admin/properties" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Properties
                </Link>
              </li>
              <li>
                <Link to="/admin/profile" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Admin Support</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                admin@propertyrental.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +977-1-ADMIN-HELP
              </li>
            </ul>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-t border-border mt-12 pt-8 text-center text-muted-foreground"
        >
          <p>&copy; 2024 PropertyRental Admin Portal. All rights reserved.</p>
          <p className="text-sm mt-2">This is a restricted access area for authorized administrators only.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default AdminFooter;
