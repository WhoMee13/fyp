import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Package, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { propertyStatusBadge, statIconColors } from '../lib/theme';

interface Property {
  id: string;
  title: string;
  status: string;
  isActive: boolean;
}

const Dashboard = () => {
  const { user, isVendor, vendorStatus } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVendor) {
      fetchProperties();
    } else {
      setLoading(false);
    }
  }, [isVendor]);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties/user/my-properties');
      const props = response.data.properties;
      setProperties(props);
      setStats({
        total: props.length,
        active: props.filter((p: Property) => p.isActive && p.status === 'APPROVED').length,
        pending: props.filter((p: Property) => p.status === 'PENDING').length,
      });
    } catch (error: any) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Properties', value: stats.total, icon: Package, color: statIconColors.info },
    { label: 'Active Properties', value: stats.active, icon: CheckCircle, color: statIconColors.success },
    { label: 'Pending Approval', value: stats.pending, icon: XCircle, color: statIconColors.warning },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-5xl font-bold mb-2">Dashboard</h1>
            <p className="text-xl text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          {isVendor ? (
            <Link to="/properties/add">
              <Button size="lg" className="h-12 px-6">
                <Plus className="h-5 w-5 mr-2" />
                Add Property
              </Button>
            </Link>
          ) : (
            <Link to="/become-vendor">
              <Button size="lg" variant="outline" className="h-12 px-6">
                Become Vendor
              </Button>
            </Link>
          )}
        </motion.div>

        {isVendor ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

            {/* Recent Properties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl">My Properties</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/properties">
                      <Button variant="outline">Browse Properties</Button>
                    </Link>
                    <Link to="/my-bookings">
                      <Button variant="outline">My Bookings</Button>
                    </Link>
                    <Link to="/vendor-bookings">
                      <Button variant="outline">
                        Incoming Bookings
                      </Button>
                    </Link>
                    <Link to="/properties/manage">
                      <Button variant="outline" className="group">
                        Manage All
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
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
                  ) : properties.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg mb-4">No properties yet</p>
                      <Link to="/properties/add">
                        <Button size="lg">Add Your First Property</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.slice(0, 5).map((property, index) => (
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
                                <div className="flex gap-2 mt-2">
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full font-semibold ${propertyStatusBadge(property.status)}`}
                                  >
                                    {property.status}
                                  </span>
                                  {property.isActive ? (
                                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-semibold">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Customer Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You are currently using the platform as a customer. You can browse properties, contact owners, and
                manage your bookings.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/my-bookings">
                  <Button variant="outline">View My Bookings</Button>
                </Link>
                {vendorStatus !== 'APPROVED' && (
                  <Link to="/become-vendor">
                    <Button>Apply to Become Vendor</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
