import express from 'express';
import { ensureAuthenticated } from './authMiddleware.js';
import Car from '../models/Car.js';
import { generateCarNotification } from '../services/gptNotifications.js';

const router = express.Router();

router.get('/notifications', ensureAuthenticated, async (req, res) => {
  try {
    const car = await Car.findOne({ userId: req.session.userId });
    if (!car) {
      return res.render('notifications', { notification: "Add your car to receive notifications." });
    }

    const notification = await generateCarNotification(car);
    res.render('notifications', { notification });

  } catch (err) {
    console.error("Notification Error:", err.message);
    res.render('notifications', { notification: "An error occurred." });
  }
});

export default router;
