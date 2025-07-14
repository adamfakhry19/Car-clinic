import nodemailer from 'nodemailer';

export async function sendNotificationEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: `"Car Clinic." <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    text
  });
}
