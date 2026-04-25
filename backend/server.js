import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import destinationRoutes from './routes/destinations.js';
import Destination from './models/Destination.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/destinations', destinationRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase(); // Seed initial data
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));


// Seed Function
async function seedDatabase() {
  const count = await Destination.countDocuments();
  if (count === 0) {
    console.log('Seeding initial destinations...');
    const sampleDestinations = [
      {
        name: 'Paris',
        country: 'France',
        description: 'The City of Light, famous for the Eiffel Tower, Louvre, and rich culture. A global center for art, fashion, gastronomy, and culture.',
        image360Url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop', // Temporary placeholder, will need real 360 images for A-Frame
        thumbnailUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop',
        coordinates: { lat: 48.8566, lon: 2.3522 }
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        description: 'Japan\'s busy capital mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.',
        image360Url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=2000&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop',
        coordinates: { lat: 35.6762, lon: 139.6503 }
      },
      {
        name: 'Grand Canyon',
        country: 'USA',
        description: 'A spectacular gorge carved by the Colorado River, offering vast, breathtaking views of layered red rock bands.',
        image360Url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=2000&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?q=80&w=1000&auto=format&fit=crop',
        coordinates: { lat: 36.1069, lon: -112.1129 }
      }
    ];
    await Destination.insertMany(sampleDestinations);
    console.log('Database seeded successfully.');
  }
}
