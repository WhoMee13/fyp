import { useState, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const BecomeVendor = () => {
  const { vendorStatus, refreshUser } = useAuth();
  const [citizenshipId, setCitizenshipId] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleFileChange =
    (setter: (file: File | null) => void) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setter(e.target.files[0]);
      }
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!citizenshipId.trim()) {
      toast.error('Citizenship ID is required');
      return;
    }

    if (!frontImage || !backImage) {
      toast.error('Both front and back images are required');
      return;
    }

    const formData = new FormData();
    formData.append('citizenshipId', citizenshipId);
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);

    try {
      setSubmitting(true);
      const response = await api.post('/vendor/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message || 'Vendor application submitted');
      await refreshUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const response = await api.post('/vendor/cancel');
      toast.success(response.data.message || 'Vendor application cancelled');
      await refreshUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel application');
    } finally {
      setCancelling(false);
    }
  };

  const renderStatus = () => {
    if (!vendorStatus) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
          Not applied
        </span>
      );
    }

    if (vendorStatus === 'PENDING') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
          Pending review
        </span>
      );
    }

    if (vendorStatus === 'APPROVED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          Approved vendor
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
        Rejected
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Become a Vendor</CardTitle>
            <div className="mt-2">Current status: {renderStatus()}</div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="citizenshipId">Citizenship ID</Label>
                <Input
                  id="citizenshipId"
                  value={citizenshipId}
                  onChange={(e) => setCitizenshipId(e.target.value)}
                  placeholder="Enter your citizenship ID"
                  disabled={vendorStatus === 'PENDING' || vendorStatus === 'APPROVED'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frontImage">Front Image</Label>
                  <Input
                    id="frontImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange(setFrontImage)}
                    disabled={vendorStatus === 'PENDING' || vendorStatus === 'APPROVED'}
                  />
                </div>
                <div>
                  <Label htmlFor="backImage">Back Image</Label>
                  <Input
                    id="backImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange(setBackImage)}
                    disabled={vendorStatus === 'PENDING' || vendorStatus === 'APPROVED'}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || vendorStatus === 'PENDING' || vendorStatus === 'APPROVED'}
                className="w-full"
              >
                {submitting ? 'Submitting...' : vendorStatus ? 'Resubmit Application' : 'Submit Application'}
              </Button>
              {vendorStatus === 'PENDING' && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="w-full"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Application'}
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                After submitting, an admin will review your documents. Until approval, you can continue using your
                account as a customer.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BecomeVendor;

