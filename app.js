import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import feedbackRoutes from './routes/feedback.js'; 
import carRoutes from './routes/car.js';
import notificationRoutes from './routes/notifications.js';

import cron from 'node-cron';
import Car from './models/Car.js';
import User from './models/User.js';
import { generateCarNotification } from './services/gptNotifications.js';
import { sendNotificationEmail } from './services/mailer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'clinicSecretKey',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(" MongoDB Error:", err));

app.use('/', authRoutes);
app.use('/', feedbackRoutes);
app.use('/', carRoutes);
app.use('/', notificationRoutes);

cron.schedule('0 8 * * *', async () => {
  console.log("Running daily car notifications...");

  try {
    const cars = await Car.find().populate('userId');

    for (const car of cars) {
      const user = car.userId;
      if (!user?.email) continue;

      const notification = await generateCarNotification(car);

      await sendNotificationEmail(user.email, "🚘 Car Clinic Reminder", notification);

    }
  } catch (err) {
    console.error("Cron Notification Error:", err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
