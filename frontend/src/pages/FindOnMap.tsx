import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useLocationContext } from '../context/LocationContext';
import api from '../lib/api';
import { MapPin, Ruler, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NearbyProperty {
  id: string;
  title: string;
  price: number;
  landSize: number;
  sizeUnit: string;
  purpose: string;
  images: Array<{ imageUrl: string }>;
  location: { city: string } | null;
  distanceKm?: number | null;
}

const FindOnMap = () => {
  const navigate = useNavigate();
  const { coords, requestLocation, locationEnabled } = useLocationContext();
  const [center, setCenter] = useState<LatLngExpression | null>(null);
  const [properties, setProperties] = useState<NearbyProperty[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultCenter: LatLngExpression = useMemo(() => [27.7172, 85.324], []);

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );

  useEffect(() => {
    if (coords) {
      setCenter([coords.lat, coords.lng]);
    } else {
      setCenter(defaultCenter);
    }
  }, [coords, defaultCenter]);

  const fetchNearby = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await api.get('/properties/nearby', {
        params: {
          lat,
          lng,
          radiusKm: 15,
          limit: 20,
        },
      });
      setProperties(response.data.properties || []);
    } catch (e) {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setCenter([e.latlng.lat, e.latlng.lng]);
        fetchNearby(e.latlng.lat, e.latlng.lng);
      },
    });

    return center ? <Marker position={center} icon={markerIcon} /> : null;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Find Properties on Map</h1>
            <p className="text-muted-foreground text-lg">
              Click anywhere on the map to find the nearest properties to that point.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={requestLocation}
          >
            {locationEnabled ? 'Use My Location Again' : 'Use My Current Location'}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="border-2 overflow-hidden h-[420px]">
            <CardHeader>
              <CardTitle>Select Location on Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {center && (
                <MapContainer
                  center={center}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="w-full h-[340px]"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 h-[420px] flex flex-col">
            <CardHeader>
              <CardTitle>Nearest Properties</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : properties.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Click on the map to search for properties near that location.
                </p>
              ) : (
                properties.map((property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ x: 4 }}
                    className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <div className="flex gap-3">
                      <div className="w-24 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${property.images[0].imageUrl}`}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.location?.city || 'N/A'}
                        </p>
                        <p className="text-sm text-primary font-semibold flex items-center gap-1 mt-1">
                          <DollarSign className="h-3 w-3" />
                          {formatPrice(property.price)}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Ruler className="h-3 w-3" />
                          {property.landSize} {formatSizeUnit(property.sizeUnit)}
                          {property.distanceKm != null && (
                            <span className="ml-2">• ~{property.distanceKm.toFixed(1)} km away</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FindOnMap;


