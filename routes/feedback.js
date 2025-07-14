import express from 'express';
import Feedback from '../models/Feedback.js';
import { ensureAuthenticated } from '../routes/authMiddleware.js';
const router = express.Router();

router.get('/feedback',ensureAuthenticated, (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('feedback');
});

router.post('/feedback', async (req, res) => {
  const { rating, helpful, comment } = req.body;

  try {
    await Feedback.create({
      userId: req.session.userId,
      rating,
      helpful: helpful === 'yes',
      comment
    });
    res.redirect('/dashboard');
  } catch (err) {
    res.send("Error saving feedback.");
  }
});

router.get('/feedback/all', async (req, res) => {
  const feedbacks = await Feedback.find().populate('userId');
  res.render('allFeedback', { feedbacks });
});

export default router;
