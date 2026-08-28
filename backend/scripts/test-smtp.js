require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP Connection Successful!');
  } catch (error) {
    console.error('SMTP Connection Failed:', error.message);
  }
}

testEmail();
