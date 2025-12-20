import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  title: string;
  status: string;
  owner: { name: string; email: string };
  location: { city: string } | null;
  images: Array<{ imageUrl: string }>;
}

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [statusFilter]);

  const fetchProperties = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get(`/admin/properties${params}`);
      setProperties(response.data.properties);
    } catch (error: any) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/properties/${id}/approve`);
      toast.success('Property approved');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve property');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/admin/properties/${id}/reject`);
      toast.success('Property rejected');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject property');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await api.delete(`/admin/properties/${id}`);
      toast.success('Property deleted');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete property');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Properties</h1>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('APPROVED')}
          >
            Approved
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No properties found</p>
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
                    <Link to={`/properties/${property.id}`} className="font-semibold text-lg hover:text-primary">
                      {property.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Owner: {property.owner.name} ({property.owner.email})
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {property.location?.city || 'N/A'}
                    </p>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                        property.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : property.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {property.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(property.id)}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(property.id)}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600"
                    >
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

export default AdminProperties;

