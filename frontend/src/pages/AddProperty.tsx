import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../lib/api';
import toast from 'react-hot-toast';

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum(['Residential', 'Agricultural', 'Commercial']),
  purpose: z.enum(['Sale', 'Rent']),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number',
  }),
  landSize: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Land size must be a positive number',
  }),
  sizeUnit: z.enum(['sq_ft', 'sq_m', 'ropani', 'acre']),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  country: z.string().default('Nepal'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      country: 'Nepal',
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('propertyType', data.propertyType);
      formData.append('purpose', data.purpose);
      formData.append('price', data.price);
      formData.append('landSize', data.landSize);
      formData.append('sizeUnit', data.sizeUnit);
      formData.append('address', data.address);
      formData.append('city', data.city);
      if (data.state) formData.append('state', data.state);
      formData.append('country', data.country || 'Nepal');
      if (data.latitude) formData.append('latitude', data.latitude);
      if (data.longitude) formData.append('longitude', data.longitude);

      images.forEach((image) => {
        formData.append('images', image);
      });

      await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Property added successfully! Waiting for admin approval.');
      navigate('/properties/manage');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
          <CardDescription>Fill in the details to list your property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register('title')} placeholder="Beautiful land for sale" />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select onValueChange={(value) => setValue('propertyType', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Agricultural">Agricultural</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyType && <p className="text-sm text-red-500 mt-1">{errors.propertyType.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full border rounded-md p-2 min-h-[120px]"
                placeholder="Describe your property in detail..."
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <Select onValueChange={(value) => setValue('purpose', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose.message}</p>}
              </div>

              <div>
                <Label htmlFor="price">Price (NPR) *</Label>
                <Input id="price" type="number" {...register('price')} placeholder="5000000" />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="landSize">Land Size *</Label>
                <Input id="landSize" type="number" step="0.01" {...register('landSize')} placeholder="1000" />
                {errors.landSize && <p className="text-sm text-red-500 mt-1">{errors.landSize.message}</p>}
              </div>

              <div>
                <Label htmlFor="sizeUnit">Size Unit *</Label>
                <Select onValueChange={(value) => setValue('sizeUnit', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sq_ft">Square Feet</SelectItem>
                    <SelectItem value="sq_m">Square Meter</SelectItem>
                    <SelectItem value="ropani">Ropani</SelectItem>
                    <SelectItem value="acre">Acre</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sizeUnit && <p className="text-sm text-red-500 mt-1">{errors.sizeUnit.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input id="address" {...register('address')} placeholder="Street address" />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...register('city')} placeholder="Kathmandu" />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <Label htmlFor="state">State (Optional)</Label>
                <Input id="state" {...register('state')} placeholder="Bagmati" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude (Optional)</Label>
                <Input id="latitude" type="number" step="0.000001" {...register('latitude')} placeholder="27.7172" />
              </div>

              <div>
                <Label htmlFor="longitude">Longitude (Optional)</Label>
                <Input id="longitude" type="number" step="0.000001" {...register('longitude')} placeholder="85.3240" />
              </div>
            </div>

            <div>
              <Label htmlFor="images">Images * (At least 1, max 10)</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              {images.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">{images.length} image(s) selected</p>
              )}
              {images.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Please select at least one image</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Property'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/properties/manage')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProperty;

