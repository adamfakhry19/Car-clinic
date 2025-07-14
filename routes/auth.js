import express from 'express';
import User from '../models/User.js';
import Car from '../models/Car.js';
import { ensureAuthenticated } from '../routes/authMiddleware.js';
import { getDiagnosis } from '../services/chatgpt.js';

const router = express.Router();

router.get('/', (req, res) => {
  return req.session.userId
    ? res.redirect('/dashboard')
    : res.redirect('/login');
});

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'This email is already in use.' });
    }

    const user = new User({ name, email, password });
    await user.save();

    req.session.userId = user._id;
    req.session.userName = user.name;

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'An error occurred during registration.' });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const isMatch = user && await user.comparePassword(password);

    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    req.session.userId = user._id;
    req.session.userName = user.name;

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'An error occurred during login.' });
  }
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const car = await Car.findOne({ userId: req.session.userId });

    res.render('dashboard', {
      user: { name: req.session.userName },
      car
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('dashboard', {
      user: { name: req.session.userName },
      car: null
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});

router.get('/diagnose', ensureAuthenticated, (req, res) => {
  res.render('diagnose', { result: null });
});

router.post('/diagnose', ensureAuthenticated, async (req, res) => {
  const { symptoms } = req.body;

  try {
    const car = await Car.findOne({ userId: req.session.userId });

    if (!car) {
      return res.render('diagnose', {
        result: {
          issue: "Car info missing",
          severity: "Unknown",
          confidence: "Low",
          solution: "Please register your car details first in the 'Manage Car' page."
        }
      });
    }

    const result = await getDiagnosis(symptoms, {
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      lastMaintenance: car.lastMaintenance?.toISOString().split("T")[0]
    });

    res.render('diagnose', { result });

  } catch (err) {
    console.error("Diagnosis error:", err.message);
    res.render('diagnose', {
      result: {
        issue: "Unknown",
        severity: "Unknown",
        confidence: "Low",
        solution: "Unable to process your diagnosis request. Please try again later."
      }
    });
  }
});

router.get('/about', (req, res) => res.render('about'));
export default router;
