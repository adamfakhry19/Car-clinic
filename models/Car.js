import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: String,
  model: String,
  year: Number,
  mileage: Number,
  lastMaintenance: Date
});

const Car = mongoose.model('Car', carSchema);
export default Car;
