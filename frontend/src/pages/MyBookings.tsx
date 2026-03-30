import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Phone, MessageCircle, MapPin, Home, User, Clock } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface BookingProperty {
  id: string;
  title: string;
  propertyType: string;
  purpose: string;
  price: number;
  landSize: number;
  sizeUnit: string;
  images: { imageUrl: string; isPrimary: boolean }[];
  location: {
    address: string;
    city: string;
    state: string | null;
    country: string;
  } | null;
}

interface BookingVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Booking {
  id: string;
  type: 'RENTAL' | 'PURCHASE';
  startDate: string;
  endDate: string | null;
  totalPrice: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED_BY_VENDOR' | 'CANCELLED_BY_CUSTOMER';
  createdAt: string;
  property: BookingProperty;
  vendor: BookingVendor;
}

const MyBookings = () => {
  const { loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setFetching(true);
      const response = await api.get('/bookings/my');
      setBookings(response.data.bookings);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load bookings');
    } finally {
      setFetching(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      await api.put(`/bookings/${id}/cancel-by-customer`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleContact = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowContactModal(true);
  };

  const handleWhatsAppContact = (phone: string, booking: Booking) => {
    const message = encodeURIComponent(
      `Hello ${booking.vendor.name}, I'm interested in your property "${booking.property.title}" (Booking ID: ${booking.id}). Let's discuss further details.`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground">You have no bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {booking.property.images[0] && (
                        <img
                          src={`http://localhost:5000${booking.property.images[0].imageUrl}`}
                          alt={booking.property.title}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{booking.property.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.startDate).toLocaleDateString()} -{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          Status:{' '}
                          <span className="font-medium">
                            {booking.status.replace(/_/g, ' ')}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={
                          cancellingId === booking.id ||
                          booking.status === 'CANCELLED_BY_VENDOR' ||
                          booking.status === 'CANCELLED_BY_CUSTOMER'
                        }
                        onClick={() => handleCancel(booking.id)}
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyBookings;

