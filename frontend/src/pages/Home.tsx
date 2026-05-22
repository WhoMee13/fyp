import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import {
  Search,
  MapPin,
  ArrowRight,
  Building2,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Trees,
  Store,
  Home as HomeIcon,
  Map,
  UserPlus,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface NearbyProperty {
  id: string;
  title: string;
  price: number;
  purpose: string;
  images: Array<{ imageUrl: string }>;
  location: { city: string } | null;
  distanceKm?: number | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const cities = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar'];

const steps = [
  {
    icon: Search,
    title: 'Search & discover',
    description: 'Filter by city, type, and purpose to find land and properties across Nepal.',
  },
  {
    icon: MapPin,
    title: 'Explore on the map',
    description: 'Use interactive maps to compare locations and spot listings near you.',
  },
  {
    icon: BookOpen,
    title: 'Book or list',
    description: 'Rent or buy as a customer, or become a vendor and manage your own listings.',
  },
];

const features = [
  {
    icon: HomeIcon,
    title: 'Residential',
    description: 'Houses, apartments, and BHK options for families and individuals.',
    tone: 'bg-primary/10 text-primary',
  },
  {
    icon: Trees,
    title: 'Agricultural',
    description: 'Farmland and plots with soil, water, and crop details for investors.',
    tone: 'bg-success/15 text-success',
  },
  {
    icon: Store,
    title: 'Commercial',
    description: 'Office and retail spaces with amenities for growing businesses.',
    tone: 'bg-info/15 text-info',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isVendor, isAdmin, user } = useAuth();
  const { settings } = useSettings();
  const { coords, locationEnabled, requesting, requestLocation } = useLocationContext();
  const [searchData, setSearchData] = useState({ city: '', purpose: '' });
  const [recommended, setRecommended] = useState<NearbyProperty[]>([]);

  const appName = settings?.appName || 'PropertyRental';

  useEffect(() => {
    const loadRecommended = async () => {
      if (!coords) return;
      try {
        const response = await api.get('/properties/nearby', {
          params: { lat: coords.lat, lng: coords.lng, radiusKm: 15, limit: 6 },
        });
        setRecommended(response.data.properties || []);
      } catch {
        // optional section
      }
    };
    loadRecommended();
  }, [coords]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.city) params.append('city', searchData.city);
    if (searchData.purpose) params.append('purpose', searchData.purpose);
    navigate(`/properties?${params.toString()}`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center pt-8 pb-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-primary/15" />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Nepal&apos;s property marketplace
              </motion.div>

              <motion.h1 custom={1} variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Find land &amp; property you can{' '}
                <span className="text-primary">trust</span>
              </motion.h1>

              <motion.p custom={2} variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                {appName} connects buyers, renters, and verified vendors — browse listings, explore on a map, and complete bookings in one place.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-3">
                <Button size="lg" className="h-12 px-6" onClick={() => navigate('/properties')}>
                  Browse properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => navigate('/find')}>
                  <Map className="mr-2 h-4 w-4" />
                  Open map
                </Button>
                {!isAuthenticated && (
                  <Button size="lg" variant="secondary" className="h-12 px-6" asChild>
                    <Link to="/register">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Get started
                    </Link>
                  </Button>
                )}
                {isAuthenticated && !isAdmin && (
                  <Button size="lg" variant="secondary" className="h-12 px-6" asChild>
                    <Link to={isVendor ? '/dashboard' : '/my-bookings'}>
                      {isVendor ? 'Vendor dashboard' : 'My bookings'}
                    </Link>
                  </Button>
                )}
              </motion.div>

              <motion.div custom={4} variants={fadeUp} className="flex flex-wrap gap-8 pt-2">
                {[
                  { label: 'Property types', value: '3+' },
                  { label: 'Sale & rent', value: '2 modes' },
                  { label: 'Verified vendors', value: 'KYC' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Search card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
            >
              <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/5 bg-card/90 backdrop-blur-md">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Start your search</h2>
                    <p className="text-sm text-muted-foreground">
                      No account required to browse listings.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">City or area</label>
                      <Input
                        placeholder="e.g. Kathmandu"
                        value={searchData.city}
                        onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
                        className="h-12"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Purpose</label>
                      <Select
                        value={searchData.purpose}
                        onValueChange={(value) => setSearchData({ ...searchData, purpose: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Sale or rent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sale">For sale</SelectItem>
                          <SelectItem value="Rent">For rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full h-12 text-base" onClick={handleSearch}>
                      <Search className="mr-2 h-5 w-5" />
                      Search properties
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Popular: {cities.slice(0, 3).join(' · ')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">
              A simple flow whether you are looking for property or listing your own land.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                custom={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 hover:border-primary/40 transition-colors text-center">
                  <CardContent className="p-8">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Step {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Property types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Built for every property type</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Residential homes, commercial spaces, and agricultural land — all in one platform.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/properties">
                View all listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Card className="h-full border-2 overflow-hidden group">
                  <CardContent className="p-8">
                    <div className={`inline-flex p-3 rounded-xl mb-5 ${feature.tone}`}>
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / platform */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: 'Admin-reviewed listings' },
              { icon: Building2, label: 'Vendor verification (KYC)' },
              { icon: BookOpen, label: 'Booking & purchase requests' },
              { icon: Map, label: 'Location-based discovery' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card/80 p-5 backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm sm:text-base">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border-2 bg-muted/40"
          >
            <div>
              <h3 className="text-2xl font-semibold mb-2">Properties near you</h3>
              <p className="text-muted-foreground">
                Enable location for personalized recommendations — works for guests and signed-in users.
              </p>
            </div>
            <Button size="lg" onClick={requestLocation} disabled={requesting} className="min-w-[200px] shrink-0">
              {requesting ? 'Requesting…' : locationEnabled ? 'Refresh nearby' : 'Enable location'}
            </Button>
          </motion.div>

          {locationEnabled && recommended.length > 0 && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="h-full border-2 hover:border-primary transition-colors overflow-hidden">
                    <div className="aspect-video bg-muted">
                      {property.images?.[0] ? (
                        <img
                          src={`${API_BASE}${property.images[0].imageUrl}`}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-1">
                      <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-primary font-semibold">{formatPrice(property.price)}</p>
                      <p className="text-xs text-muted-foreground">
                        {property.location?.city || 'Nepal'} · {property.purpose}
                        {property.distanceKm != null && ` · ~${property.distanceKm.toFixed(1)} km`}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular cities */}
      {/* <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Popular locations</h2>
            <p className="text-muted-foreground text-lg">Explore listings in Nepal&apos;s major cities</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {cities.map((city, index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className="cursor-pointer border-2 hover:border-primary transition-all group"
                  onClick={() => navigate(`/properties?city=${encodeURIComponent(city)}`)}
                >
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                    <p className="font-semibold group-hover:text-primary transition-colors">{city}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-accent px-8 py-14 sm:px-14 text-center text-primary-foreground"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                {isAuthenticated
                  ? `Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`
                  : 'Ready to get started?'}
              </h2>
              <p className="text-primary-foreground/90 text-lg">
                {isAuthenticated
                  ? 'Continue browsing or manage your account from the dashboard.'
                  : 'Create a free account to book properties, track requests, or apply as a verified vendor.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={() => navigate('/properties')}
                >
                  Explore listings
                </Button>
                {!isAuthenticated ? (
                  <>
                    <Button size="lg" variant="outline" className="h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
                      <Link to="/register">Create account</Link>
                    </Button>
                    <Button size="lg" variant="ghost" className="h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
                      <Link to="/login">Sign in</Link>
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    asChild
                  >
                    <Link to={isVendor ? '/dashboard' : '/profile'}>
                      {isVendor ? 'Go to dashboard' : 'My profile'}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
