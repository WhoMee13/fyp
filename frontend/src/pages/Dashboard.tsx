import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Package, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Property {
  id: string;
  title: string;
  status: string;
  isActive: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/properties/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Active Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-yellow-600" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My Properties</CardTitle>
            <Link to="/properties/manage">
              <Button variant="outline">Manage All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No properties yet</p>
              <Link to="/properties/add">
                <Button>Add Your First Property</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.slice(0, 5).map((property) => (
                <div
                  key={property.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <Link to={`/properties/${property.id}`} className="font-semibold hover:text-primary">
                      {property.title}
                    </Link>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          property.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {property.status}
                      </span>
                      {property.isActive ? (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;