import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Package, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { propertyStatusBadge, statIconColors } from '../lib/theme';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.stats);
      setRecentProperties(response.data.recentProperties);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: statIconColors.info },
    { label: 'Total Properties', value: stats.totalProperties, icon: Package, color: statIconColors.primary },
    { label: 'Pending', value: stats.pendingProperties, icon: Clock, color: statIconColors.warning },
    { label: 'Approved', value: stats.approvedProperties, icon: CheckCircle, color: statIconColors.success },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage your platform</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-2 hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/admin/properties">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Manage Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Approve, reject, or manage property listings
                  </p>
                  <div className="flex items-center text-primary font-semibold">
                    Go to Properties
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>

          <Link to="/admin/users">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Manage Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    View and manage user accounts
                  </p>
                  <div className="flex items-center text-primary font-semibold">
                    Go to Users
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>

          <Link to="/admin/vendors">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Review Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Approve or reject vendor applications and documents
                  </p>
                  <div className="flex items-center text-primary font-semibold">
                    Go to Vendors
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        </div>

        {/* Recent Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Recent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : recentProperties.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No recent properties</p>
              ) : (
                <div className="space-y-4">
                  {recentProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <Link to={`/properties/${property.id}`}>
                        <div className="flex justify-between items-center p-4 border-2 rounded-lg hover:border-primary transition-colors group">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {property.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Owner: {property.owner?.name || 'N/A'} | {property.location?.city || 'N/A'}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${propertyStatusBadge(property.status)}`}
                          >
                            {property.status}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
