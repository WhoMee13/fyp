import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Ruler, DollarSign, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { alertBoxClass, statusBadgeClass } from '../lib/theme';

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
  bookings?: {
    startDate: string;
    endDate: string;
    status: string;
  }[];
}

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

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

  const handleBooking = async (start?: string, end?: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to book this property');
      navigate('/login');
      return;
    }

    if (property && user?.id === property.owner.id) {
      toast.error('You cannot book or purchase your own property');
      return;
    }

    const finalStart = start || bookingStartDate;
    const finalEnd = end || bookingEndDate;

    if (!finalStart) {
      toast.error('Please select start date');
      return;
    }

    // For rental properties, end date is required
    if (property?.purpose === 'Rent' && !finalEnd) {
      toast.error('Please select end date for rental property');
      return;
    }

    try {
      setBookingLoading(true);
      await api.post('/bookings', {
        propertyId: id,
        startDate: finalStart,
        endDate: property?.purpose === 'Sale' ? null : finalEnd,
      });
      toast.success(property?.purpose === 'Sale' ? 'Purchase request sent successfully' : 'Booking request created successfully');
      setBookingStartDate('');
      setBookingEndDate('');
      fetchProperty(); // Refresh bookings to update UI
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const isOwnProperty = user?.id === property.owner.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Properties
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Images */}
            <Card className="border-2 overflow-hidden">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {property.images.length > 0 ? (
                  <motion.img
                    key={selectedImage}
                    src={`http://localhost:5000${property.images[selectedImage].imageUrl}`}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                    <p>No images available</p>
                  </div>
                )}
              </div>
              {property.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {property.images.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={`http://localhost:5000${img.imageUrl}`}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </Card>

            {/* Details */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-4xl mb-4">{property.title}</CardTitle>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                    {property.propertyType}
                  </span>
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    {property.purpose}
                  </span>
                  {property.status === 'PENDING' && (
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusBadgeClass('warning')}`}>
                      Pending Approval
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Ruler className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Land Size</p>
                      <p className="text-2xl font-bold">
                        {property.landSize} {formatSizeUnit(property.sizeUnit)}
                      </p>
                    </div>
                  </div>
                </div>

                {property.location && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Location
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      {property.location.address}, {property.location.city}
                      {property.location.state && `, ${property.location.state}`}
                      {property.location.country && `, ${property.location.country}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 sticky top-24 self-start"
          >
            {/* Owner Contact */}
            {/* <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">{property.owner.name}</span>
                  </div>
                  {property.owner.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {property.owner.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {property.owner.email}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <textarea
                    className="w-full border-2 rounded-lg p-3 min-h-[120px] focus:border-primary focus:outline-none transition-colors"
                    placeholder="Enter your message..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleContact}
                  disabled={sending}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </CardContent>
            </Card> */}

            {/* Booking */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {property.purpose === 'Sale' ? 'Buy This Property' : 'Book This Property'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isOwnProperty && (
                  <div className={alertBoxClass('info')}>
                    This is your listing. Manage it from your dashboard.
                  </div>
                )}

                {!isOwnProperty && (
                  <>
                    {property.purpose === 'Rent' && (
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Start Date</label>
                          <Input
                            type="date"
                            value={bookingStartDate}
                            onChange={(e) => setBookingStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">End Date</label>
                          <Input
                            type="date"
                            value={bookingEndDate}
                            onChange={(e) => setBookingEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {property.purpose === 'Sale' && property.bookings?.some(b => b.status === 'PENDING' || b.status === 'CONFIRMED') ? (
                      <div className={alertBoxClass('destructive')}>
                        Currently Unavailable for Purchase
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          if (property.purpose === 'Sale') {
                            if (window.confirm('Are you sure you want to buy this property? A booking confirmation will be requested.')) {
                              const today = new Date().toISOString().split('T')[0];
                              handleBooking(today, undefined);
                            }
                          } else {
                            handleBooking(bookingStartDate, bookingEndDate);
                          }
                        }}
                        disabled={bookingLoading}
                        className="w-full h-12 text-lg font-semibold"
                        size="lg"
                      >
                        {bookingLoading 
                          ? (property.purpose === 'Sale' ? 'Processing...' : 'Booking...') 
                          : (property.purpose === 'Sale' ? 'Buy Now' : 'Book Now')}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
