import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, MapPin, Ruler, DollarSign, Filter } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  purpose: string;
  price: number;
  landSize: number;
  sizeUnit: string;
  images: Array<{ imageUrl: string; isPrimary: boolean }>;
  location: { city: string; address: string } | null;
}

const PropertyCard = ({ property, index }: { property: Property; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

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
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="h-full"
    >
      <Link to={`/properties/${property.id}`}>
        <Card className="h-full border-2 hover:border-primary transition-all duration-300 overflow-hidden group cursor-pointer">
          <div className="aspect-video bg-muted overflow-hidden relative">
            {property.images.length > 0 ? (
              <motion.img
                src={`http://localhost:5000${property.images[0].imageUrl}`}
                alt={property.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                <p>No Image</p>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                {property.propertyType}
              </span>
            </div>
          </div>
          <CardHeader className="p-6">
            <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
              {property.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4 space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {property.location?.city || 'N/A'}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Ruler className="h-4 w-4 mr-2 text-primary" />
              {property.landSize} {formatSizeUnit(property.sizeUnit)}
            </div>
            <div className="flex items-center font-bold text-primary text-xl">
              {formatPrice(property.price)}
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-6">
            <div className="flex justify-between w-full items-center">
              <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold">
                {property.purpose}
              </span>
              <motion.div
                whileHover={{ x: 5 }}
                className="text-primary font-semibold text-sm"
              >
                View Details →
              </motion.div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    purpose: searchParams.get('purpose') || '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => params.append(key, value));
      if (!params.get('page')) params.append('page', '1');
      if (!params.get('limit')) params.append('limit', '12');

      const response = await api.get(`/properties?${params.toString()}`);
      setProperties(response.data.properties);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Properties</h1>
          <p className="text-xl text-muted-foreground">
            Discover your perfect property from our curated collection
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Filter Properties</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="h-12 border-2"
                />
                <Select value={filters.propertyType} onValueChange={(value) => setFilters({ ...filters, propertyType: value })}>
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Agricultural">Agricultural</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.purpose} onValueChange={(value) => setFilters({ ...filters, purpose: value })}>
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue placeholder="Purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="h-12 border-2"
                />
                <Button onClick={handleFilter} size="lg" className="h-12">
                  <Search className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-2xl text-muted-foreground">No properties found</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {properties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center gap-2"
              >
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? 'default' : 'outline'}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', page.toString());
                      setSearchParams(params);
                    }}
                    className="h-10 w-10"
                  >
                    {page}
                  </Button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
