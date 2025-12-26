import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    city: '',
    purpose: '',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.city) params.append('city', searchData.city);
    if (searchData.purpose) params.append('purpose', searchData.purpose);
    navigate(`/properties?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const cities = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar'];

  return (
    <div className="min-h-screen">
      {/* Video Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
          >
            <source src="https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            {/* Fallback image */}
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973"
              alt="Property background"
              className="w-full h-full object-cover"
            />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 container mx-auto px-4 text-center text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
          >
            Find Your Perfect
            <span className="block text-primary mt-2">Property</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto font-light"
          >
            Discover premium land and properties across Nepal. Your dream property awaits.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter city or location"
                  value={searchData.city}
                  onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
                  className="w-full h-14 text-lg border-2 focus:border-primary"
                />
              </div>
              <Select value={searchData.purpose} onValueChange={(value) => setSearchData({ ...searchData, purpose: value })}>
                <SelectTrigger className="w-full lg:w-48 h-14 text-lg border-2">
                  <SelectValue placeholder="Sale/Rent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale">For Sale</SelectItem>
                  <SelectItem value="Rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                size="lg"
                className="w-full lg:w-auto h-14 text-lg px-8 group"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Popular Locations */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">Popular Locations</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore properties in Nepal's most sought-after destinations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {cities.map((city, index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer border-2 hover:border-primary transition-all duration-300 overflow-hidden group"
                  onClick={() => navigate(`/properties?city=${city}`)}
                >
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <MapPin className="h-10 w-10 mx-auto mb-4 text-primary" />
                    </motion.div>
                    <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {city}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
