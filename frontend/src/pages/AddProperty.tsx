import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
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
  latitude: z.string().min(1, 'Location is required (select on map)'),
  longitude: z.string().min(1, 'Location is required (select on map)'),
  
  // Residential specific fields
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  bhkType: z.string().optional(),
  floors: z.string().optional(),
  totalFloors: z.string().optional(),
  parkingSpaces: z.string().optional(),
  
  // Commercial specific fields
  officeSpace: z.string().optional(),
  hasParking: z.boolean().optional(),
  amenities: z.string().optional(),
  
  // Agricultural specific fields
  soilType: z.string().optional(),
  waterAccess: z.boolean().optional(),
  cropType: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const defaultCenter: LatLngExpression = useMemo(() => [27.7172, 85.3240], []); // Kathmandu

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );

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
      latitude: '',
      longitude: '',
      hasParking: false,
      waterAccess: false,
    },
  });

  const propertyType = watch('propertyType');
  const hasParking = watch('hasParking');
  const waterAccess = watch('waterAccess');

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const position: LatLngExpression | undefined =
    latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : undefined;

  const LocationMarker = () => {
    useMapEvents({
      async click(e) {
        const lat = parseFloat(e.latlng.lat).toFixed(4);
        const lng = parseFloat(e.latlng.lng).toFixed(4);
        setValue('latitude', lat.toString(), { shouldValidate: true });
        setValue('longitude', lng.toString(), { shouldValidate: true });

        try {
          const response = await api.get('/geo/reverse', {
            params: {
              lat,
              lng,
            },
          });
          const loc = response.data.location;
          if (loc) {
            if (loc.address) {
              setValue('address', loc.address, { shouldValidate: false });
            }
            if (loc.city) {
              setValue('city', loc.city, { shouldValidate: false });
            }
            if (loc.state) {
              setValue('state', loc.state, { shouldValidate: false });
            }
            if (loc.country) {
              setValue('country', loc.country, { shouldValidate: false });
            }
          }
        } catch {
          // silently ignore reverse geocode failure
        }
      },
    });

    return position ? <Marker position={position} icon={markerIcon} /> : null;
  };

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
      if (data.latitude) formData.append('latitude', String(parseFloat(data.latitude).toFixed(4)));
      if (data.longitude) formData.append('longitude', String(parseFloat(data.longitude).toFixed(4)));

      // Add type-specific fields
      if (data.propertyType === 'Residential') {
        if (data.bedrooms) formData.append('bedrooms', data.bedrooms);
        if (data.bathrooms) formData.append('bathrooms', data.bathrooms);
        if (data.bhkType) formData.append('bhkType', data.bhkType);
        if (data.floors) formData.append('floors', data.floors);
        if (data.totalFloors) formData.append('totalFloors', data.totalFloors);
        if (data.parkingSpaces) formData.append('parkingSpaces', data.parkingSpaces);
      }

      if (data.propertyType === 'Commercial') {
        if (data.officeSpace) formData.append('officeSpace', data.officeSpace);
        if (data.hasParking !== undefined) formData.append('hasParking', data.hasParking.toString());
        if (data.amenities) formData.append('amenities', data.amenities);
      }

      if (data.propertyType === 'Agricultural') {
        if (data.soilType) formData.append('soilType', data.soilType);
        if (data.waterAccess !== undefined) formData.append('waterAccess', data.waterAccess.toString());
        if (data.cropType) formData.append('cropType', data.cropType);
      }

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
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-5xl mx-auto border-2 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Add New Property</CardTitle>
          <CardDescription>Fill in the details and select location on the map</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Dynamic fields based on property type */}
            {propertyType === 'Residential' && (
              <div className="space-y-4 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900">Residential Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bhkType">BHK Type</Label>
                    <Select onValueChange={(value) => setValue('bhkType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select BHK" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1BHK">1BHK</SelectItem>
                        <SelectItem value="2BHK">2BHK</SelectItem>
                        <SelectItem value="3BHK">3BHK</SelectItem>
                        <SelectItem value="4BHK">4BHK</SelectItem>
                        <SelectItem value="5BHK+">5BHK+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input id="bedrooms" type="number" {...register('bedrooms')} placeholder="2" />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" type="number" {...register('bathrooms')} placeholder="2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="floors">Floor Number</Label>
                    <Input id="floors" type="number" {...register('floors')} placeholder="3" />
                  </div>
                  <div>
                    <Label htmlFor="totalFloors">Total Floors</Label>
                    <Input id="totalFloors" type="number" {...register('totalFloors')} placeholder="5" />
                  </div>
                  <div>
                    <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                    <Input id="parkingSpaces" type="number" {...register('parkingSpaces')} placeholder="1" />
                  </div>
                </div>
              </div>
            )}

            {propertyType === 'Commercial' && (
              <div className="space-y-4 p-6 bg-green-50 rounded-xl border-2 border-green-200">
                <h3 className="text-lg font-semibold text-green-900">Commercial Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officeSpace">Office Space (sq ft)</Label>
                    <Input id="officeSpace" type="number" {...register('officeSpace')} placeholder="1000" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasParking"
                      {...register('hasParking')}
                      className="rounded"
                    />
                    <Label htmlFor="hasParking">Has Parking Available</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="amenities">Amenities</Label>
                  <textarea
                    id="amenities"
                    {...register('amenities')}
                    className="w-full border rounded-md p-2 min-h-[80px]"
                    placeholder="Elevator, 24/7 Security, Power Backup, etc."
                  />
                </div>
              </div>
            )}

            {propertyType === 'Agricultural' && (
              <div className="space-y-4 p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900">Agricultural Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="soilType">Soil Type</Label>
                    <Select onValueChange={(value) => setValue('soilType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="black">Black Soil</SelectItem>
                        <SelectItem value="red">Red Soil</SelectItem>
                        <SelectItem value="alluvial">Alluvial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cropType">Suitable Crops</Label>
                    <Input id="cropType" {...register('cropType')} placeholder="Rice, Wheat, Vegetables" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="waterAccess"
                      {...register('waterAccess')}
                      className="rounded"
                    />
                    <Label htmlFor="waterAccess">Water Access Available</Label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input id="address" {...register('address')} placeholder="Street address" />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="space-y-3">
              <Label className="font-semibold">Location *</Label>
              <p className="text-sm text-muted-foreground">
                Click on the map to set the property location. This will store precise coordinates for better search.
              </p>
              <div className="h-[320px] rounded-xl overflow-hidden border-2">
                <MapContainer
                  center={position || defaultCenter}
                  zoom={12}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    {...register('latitude')}
                    placeholder="27.7172"
                  />
                  {errors.latitude && (
                    <p className="text-sm text-red-500 mt-1">{errors.latitude.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    {...register('longitude')}
                    placeholder="85.3240"
                  />
                  {errors.longitude && (
                    <p className="text-sm text-red-500 mt-1">{errors.longitude.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="images">Images * (At least 1, max 10)</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              {images.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 mt-2">{images.length} image(s) selected</p>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div
                        key={idx}
                        className="aspect-video rounded-lg overflow-hidden border bg-muted/50 flex items-center justify-center"
                      >
                        <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </>
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

