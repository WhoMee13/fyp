import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  title: string;
  status: string;
  isActive: boolean;
  price: number;
  images: Array<{ imageUrl: string; isPrimary: boolean }>;
  location: { city: string } | null;
}

const ManageProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties/user/my-properties');
      setProperties(response.data.properties);
    } catch (error: any) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property deleted successfully');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete property');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Properties</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No properties found</p>
            <Link to="/properties/add">
              <Button>Add Property</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-32 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {property.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000${property.images[0].imageUrl}`}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-sm text-gray-600">
                        {property.location?.city || 'N/A'}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(property.price)}
                      </span>
                    </div>
                    <div className="flex gap-2">
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

                  <div className="flex gap-2">
                    <Link to={`/properties/${property.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(property.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProperties;

