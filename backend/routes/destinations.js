import express from 'express';
import Destination from '../models/Destination.js';
import axios from 'axios';

const router = express.Router();

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single destination
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });
    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get live weather for a destination using OpenWeatherMap API
router.get('/:id/weather', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });

    const { lat, lon } = destination.coordinates;
    const apiKey = process.env.WEATHER_API_KEY;

    console.log(`Fetching weather for ${destination.name} using key: ${apiKey?.substring(0, 4)}...`);

    // if (!apiKey || apiKey === '31151650bcc4c8565e1f4f529c573085') {
    //   return res.json({
    //     main: { temp: 22, humidity: 55 },
    //     weather: [{ description: 'mock clear sky', icon: '01d' }],
    //     mock: true
    //   });
    // }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    res.json(response.data);
  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to fetch weather',
      error: error.response?.data?.message || error.message
    });
  }
});

// Search and create/get destination
router.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: 'Search query is required' });

  try {
    const apiKey = process.env.WEATHER_API_KEY;

    // 1. Geocoding - Using OpenStreetMap's Nominatim (Free, no key required)
    let lat, lon, country, cityName;

    try {
      console.log(`Searching for city: ${query}`);
      const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
        headers: { 'User-Agent': 'VR-Tourism-App' }
      });

      if (geoRes.data && geoRes.data.length > 0) {
        const cityData = geoRes.data[0];
        lat = parseFloat(cityData.lat);
        lon = parseFloat(cityData.lon);
        cityName = cityData.display_name.split(',')[0];
        country = cityData.display_name.split(',').pop().trim();
      } else {
        throw new Error('City not found');
      }
    } catch (e) {
      console.error('Geocoding failed:', e.message);
      // Last resort fallback
      cityName = query.charAt(0).toUpperCase() + query.slice(1);
      lat = 40.7128;
      lon = -74.0060;
      country = 'Unknown';
    }

    // 2. Check if already exists
    let destination = await Destination.findOne({ name: cityName });

    // 3. Get Images (Dynamic via Unsplash or Hardcoded Fallback)
    let image360Url = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop'; // Default fallback
    let thumbnailUrl = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop';

    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (unsplashKey) {
      try {
        console.log(`Fetching dynamic images from Unsplash for: ${cityName}`);
        // Search for a high-quality panoramic/wide landscape image
        const unsplashRes = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: { 
            query: `${cityName} city skyline panoramic landscape`, 
            orientation: 'landscape', 
            per_page: 1,
            content_filter: 'high'
          },
          headers: { Authorization: `Client-ID ${unsplashKey}` }
        });

        if (unsplashRes.data.results && unsplashRes.data.results.length > 0) {
          const photo = unsplashRes.data.results[0];
          // Use a higher width for the 360 experience to prevent blurriness
          image360Url = photo.urls.full + '&q=90&w=4000&auto=format&fit=crop';
          thumbnailUrl = photo.urls.regular + '&q=80&w=1000&auto=format&fit=crop';
          console.log('Successfully fetched dynamic image from Unsplash.');
        }
      } catch (unsplashErr) {
        console.error('Unsplash API failed:', unsplashErr.message);
      }
    }

    // Check hardcoded for curated experiences
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('london')) {
      image360Url = 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2000&auto=format&fit=crop';
      thumbnailUrl = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop';
    } else if (lowerQuery.includes('dubai')) {
      image360Url = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000&auto=format&fit=crop';
      thumbnailUrl = 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1000&auto=format&fit=crop';
    } else if (lowerQuery.includes('rome')) {
      image360Url = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2000&auto=format&fit=crop';
      thumbnailUrl = 'https://images.unsplash.com/photo-1529260839382-3eff352c0e27?q=80&w=1000&auto=format&fit=crop';
    } else if (lowerQuery.includes('mumbai') || lowerQuery.includes('bombay')) {
      image360Url = 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=2000&auto=format&fit=crop';
      thumbnailUrl = 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=1000&auto=format&fit=crop';
    } else if (lowerQuery.includes('sydney')) {
      image360Url = 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2000&auto=format&fit=crop';
      thumbnailUrl = 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000&auto=format&fit=crop';
    }

    if (!destination) {
      destination = new Destination({
        name: cityName,
        country: country,
        description: `Experience the breathtaking atmosphere of ${cityName}. Immerse yourself in the local culture, architecture, and stunning views of this world-class destination.`,
        image360Url,
        thumbnailUrl,
        coordinates: { lat, lon }
      });
      await destination.save();
    } else {
      // Update existing record with working images if they are different
      destination.image360Url = image360Url;
      destination.thumbnailUrl = thumbnailUrl;
      await destination.save();
    }

    res.json(destination);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Failed to search destination' });
  }
});

export default router;
