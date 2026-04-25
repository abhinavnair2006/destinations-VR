import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  image360Url: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  thumbnailUrl: { type: String, required: true },
});

export default mongoose.model('Destination', destinationSchema);
