import { Request, Response } from 'express';
import axios from 'axios';

export const reverseGeocode = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ error: 'lat and lng must be valid numbers' });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'jsonv2',
        lat: latitude,
        lon: longitude,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'property-rental-app/1.0 (academic-use)',
      },
    });

    const data = response.data;
    const address = data.address || {};

    const result = {
      address: data.display_name || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      country: address.country || '',
    };

    res.json({ location: result });
  } catch (error: any) {
    console.error('Reverse geocode error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to reverse geocode location' });
  }
};


