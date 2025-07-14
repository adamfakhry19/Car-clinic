import express from 'express';
import Car from '../models/Car.js';
import { ensureAuthenticated } from '../routes/authMiddleware.js';
const router = express.Router();

const carBrands = {
  Honda: ['Accord', 'Civic', 'CR-V', 'Fit', 'Pilot', 'HR-V'],
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Land Cruiser', 'Hilux'],
  Ford: ['Focus', 'Fusion', 'Escape', 'Mustang', 'Explorer', 'F-150'],
  BMW: ['3 Series', '5 Series', 'X5', 'X3', 'X1', '7 Series'],
  Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
  Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent'],
  Kia: ['Rio', 'Cerato', 'Sportage', 'Sorento', 'Picanto'],
  Nissan: ['Altima', 'Sentra', 'Maxima', 'X-Trail', 'Patrol'],
  Chevrolet: ['Malibu', 'Cruze', 'Tahoe', 'Silverado', 'Captiva'],
  Tesla: ['Model S', 'Model 3', 'Model X', 'Model Y'],
  Volkswagen: ['Golf', 'Passat', 'Jetta', 'Tiguan', 'Polo'],
  Peugeot: ['208', '308', '508', '2008', '3008'],
  Renault: ['Clio', 'Megane', 'Duster', 'Captur'],
  Skoda: ['Octavia', 'Superb', 'Fabia', 'Kodiaq'],
  Mitsubishi: ['Lancer', 'Outlander', 'Pajero', 'ASX'],
  Mazda: ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-9'],
  Other: []
};

router.get('/car',ensureAuthenticated, async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const car = await Car.findOne({ userId: req.session.userId });

  res.render('car', {
    car,
    brands: Object.keys(carBrands),
    modelsByBrand: carBrands
  });
});

router.post('/car', async (req, res) => {
  const { brand, model, year, mileage, lastMaintenance } = req.body;
  const userId = req.session.userId;

  try {
    await Car.findOneAndUpdate(
      { userId },
      { brand, model, year, mileage, lastMaintenance },
      { upsert: true, new: true }
    );

    res.redirect('/dashboard');
  } catch (err) {
    res.send('Error saving car info.');
  }
});

export default router;
