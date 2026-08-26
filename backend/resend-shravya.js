require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAndSend() {
  const targetEmail = 'shravyashetty415@gmail.com';
  
  // Get employee profile
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('employee_profiles')
    .select('id, employee_id, status')
    .eq('email', targetEmail)
    .single();
    
  if (profileErr || !profile) {
    console.log('Profile not found for email:', targetEmail);
    return;
  }
  
  console.log('Found profile:', profile.employee_id, 'Status:', profile.status);
  
  // Set temporary password
  const tempPassword = 'Shravya1234';
  
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    profile.id,
    { password: tempPassword }
  );
  
  if (authError) {
    console.log('Error updating auth:', authError.message);
    return;
  }
  
  console.log('Successfully set temp password to:', tempPassword);
  
  // Send Email
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
    to: targetEmail,
    subject: 'InSpark Portal - Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #7C3AED;">Welcome to InSpark!</h2>
        <p>Your account has been manually reset by the Admin.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Employee ID:</strong> ${profile.employee_id}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p><strong>Important:</strong> You must change your temporary password immediately upon your first login.</p>
        <p>Log in here: <a href="http://localhost:5174/portal/login">http://localhost:5174/portal/login</a></p>
        <p>Best regards,<br>InSpark HR Team</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully! Message ID:', info.messageId);
  } catch (error) {
    console.error('Email failed to send:', error.message);
  }
}

checkAndSend();
