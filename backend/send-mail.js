require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const mailOptions = {
    from: `"InSpark HR" <${process.env.SMTP_EMAIL}>`,
    to: 'cp070308@gmail.com',
    subject: 'InSpark Portal - Test Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #7C3AED;">Welcome to InSpark, Chandana!</h2>
        <p>Your account has been manually reset by the Admin.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Employee ID:</strong> 344431</p>
          <p><strong>Temporary Password:</strong> Chandana1234</p>
        </div>
        <p><strong>Important:</strong> You must change your temporary password immediately upon your first login.</p>
        <p>Log in here: <a href="http://localhost:5174/portal/login">http://localhost:5174/portal/login</a></p>
        <p>Best regards,<br>InSpark HR Team</p>
      </div>
    `
  };

  try {
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully! Message ID:', info.messageId);
  } catch (error) {
    console.error('Email failed to send:', error.message);
  }
}

sendTestEmail();
