import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Ruler, DollarSign, User, Mail, Phone } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  purpose: string;
  price: number;
  landSize: number;
  sizeUnit: string;
  status: string;
  images: Array<{ imageUrl: string; isPrimary: boolean }>;
  location: {
    address: string;
    city: string;
    state: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data.property);
    } catch (error: any) {
      toast.error('Property not found');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact owner');
      navigate('/login');
      return;
    }

    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await api.post(`/properties/${id}/contact`, { message: contactMessage });
      toast.success('Contact request sent successfully');
      setContactMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatSizeUnit = (unit: string) => {
    const units: Record<string, string> = {
      sq_ft: 'sq.ft',
      sq_m: 'sq.m',
      ropani: 'ropani',
      acre: 'acre',
    };
    return units[unit] || unit;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-2">
                {property.images.length > 0 ? (
                  property.images.map((img, index) => (
                    <div key={index} className={index === 0 ? 'col-span-2' : ''}>
                      <img
                        src={`http://localhost:5000${img.imageUrl}`}
                        alt={property.title}
                        className="w-full h-full object-cover aspect-video"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 aspect-video bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400">No images available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{property.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                  {property.propertyType}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                  {property.purpose}
                </span>
                {property.status === 'PENDING' && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                    Pending Approval
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-bold text-lg">{formatPrice(property.price)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Land Size</p>
                    <p className="font-bold text-lg">
                      {property.landSize} {formatSizeUnit(property.sizeUnit)}
                    </p>
                  </div>
                </div>
              </div>

              {property.location && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </h3>
                  <p className="text-gray-700">
                    {property.location.address}, {property.location.city}
                    {property.location.state && `, ${property.location.state}`}
                    {property.location.country && `, ${property.location.country}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-semibold">{property.owner.name}</span>
                </div>
                {property.owner.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {property.owner.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {property.owner.email}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea
                  className="w-full border rounded-md p-2 min-h-[100px]"
                  placeholder="Enter your message..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>

              <Button onClick={handleContact} disabled={sending} className="w-full">
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;

