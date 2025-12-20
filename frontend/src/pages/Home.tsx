import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, MapPin } from 'lucide-react';
import api from '../lib/api';
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

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Buy or rent land and properties across Nepal
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter city or location"
                value={searchData.city}
                onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
                className="w-full"
              />
            </div>
            <Select value={searchData.purpose} onValueChange={(value) => setSearchData({ ...searchData, purpose: value })}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sale/Rent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sale">For Sale</SelectItem>
                <SelectItem value="Rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Locations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {['Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar'].map((city) => (
              <Card
                key={city}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/properties?city=${city}`)}
              >
                <CardContent className="p-4 text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{city}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

