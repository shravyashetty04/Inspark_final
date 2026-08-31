const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configure Multer for File Uploads (Memory Storage to forward to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
  }
});

// Configure Nodemailer Transporter for Custom Domains (Hostinger, Zoho, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com', // Default to hostinger, can be overridden
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// Helper: Generate Employee ID (Random 6 Digits)
async function generateEmployeeId() {
  // Generate a random 6 digit number between 100000 and 999999
  const randomId = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Optional: check uniqueness (though highly unlikely to collide initially)
  const { data } = await supabaseAdmin
    .from('employee_profiles')
    .select('id')
    .eq('employee_id', randomId)
    .single();
    
  if (data) {
    // If it exists by rare chance, generate again
    return generateEmployeeId();
  }
  
  return randomId;
}

// Helper: Generate Easy Password (Name + Random Digits)
function generatePassword(fullName) {
  const firstName = (fullName || 'Employee').split(' ')[0].replace(/[^a-zA-Z]/g, '');
  const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  
  // Generate 4 random digits that aren't serial (e.g. 8352, not 1234)
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  
  return `${capitalized}${randomDigits}`;
}

// 1. PUBLIC ONBOARDING SUBMISSION
router.post('/register', async (req, res) => {
  try {
    const { 
      full_name, email, dob, emergency_contact, permanent_address, current_address,
      id_proof_base64, id_proof_name, id_proof_type
    } = req.body;

    if (!id_proof_base64) return res.status(400).json({ error: 'ID Proof is required.' });
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    // Check if email already exists in pending or active
    const { data: existingPending } = await supabaseAdmin.from('onboarding_requests').select('id').eq('email', email).single();
    if (existingPending) return res.status(400).json({ error: 'An onboarding request for this email already exists.' });
    
    const { data: existingActive } = await supabaseAdmin.from('employee_profiles').select('id').eq('email', email).single();
    if (existingActive) return res.status(400).json({ error: 'This email is already an active employee.' });

    // Decode Base64 string into a Buffer
    if (!id_proof_base64.includes(',')) return res.status(400).json({ error: 'Invalid file format.' });
    const base64Data = id_proof_base64.split(',')[1];
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload File to Supabase Storage
    const sanitizedName = (id_proof_name || 'document').replace(/[^a-zA-Z0-9.\-]/g, '_');
    const fileName = `temp_${Date.now()}_${sanitizedName}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('id_proofs')
      .upload(fileName, fileBuffer, { contentType: id_proof_type || 'application/pdf' });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabaseAdmin.storage.from('id_proofs').getPublicUrl(fileName);
    const idProofUrl = publicUrlData.publicUrl;

    // Insert into onboarding_requests
    const { error: insertError } = await supabaseAdmin
      .from('onboarding_requests')
      .insert([{
        full_name,
        email,
        dob,
        emergency_contact,
        permanent_address,
        current_address,
        id_proof_url: idProofUrl,
        status: 'PENDING_ADMIN_APPROVAL'
      }]);

    if (insertError) throw new Error(`Database error: ${insertError.message}`);

    // Send Admin Notification Email
    const adminEmail = process.env.SMTP_EMAIL; 
    const mailOptions = {
      from: `"InSpark Technologies" <${process.env.SMTP_EMAIL}>`,
      to: adminEmail,
      subject: 'New Employee Onboarding Submission',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Onboarding Request Received</h2>
          <p>A new employee has submitted their onboarding details and is awaiting your approval.</p>
          <ul>
            <li><strong>Name:</strong> ${full_name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>DOB:</strong> ${dob}</li>
            <li><strong>Phone:</strong> ${emergency_contact}</li>
          </ul>
          <p><strong>ID Proof:</strong> <a href="${idProofUrl}">View Document</a></p>
          <p>Please log in to the Admin Dashboard to approve or reject this application.</p>
          <br/>
          <a href="https://inspark-final-hdjo.vercel.app/portal/admin" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
        </div>
      `
    };

    // We MUST await this on Vercel, because Vercel freezes the function immediately after res.send()
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("Email send failed:", err);
    }

    res.status(200).json({ 
      message: 'Onboarding form submitted successfully! Your application is now Pending Admin Approval.' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 2. ADMIN APPROVAL 
router.post('/approve', async (req, res) => {
  try {
    const { request_id } = req.body;
    if (!request_id) return res.status(400).json({ error: 'Request ID is required.' });

    // Fetch the pending request
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('onboarding_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) return res.status(404).json({ error: 'Onboarding request not found.' });
    if (request.status !== 'PENDING_ADMIN_APPROVAL') return res.status(400).json({ error: 'Request is already processed.' });

    // Generate ID and Password
    const employeeId = await generateEmployeeId();
    const tempPassword = generatePassword(request.full_name);

    // Create User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: request.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: request.full_name }
    });

    if (authError) throw new Error(`Auth creation failed: ${authError.message}`);
    const userId = authData.user.id;

    // The database trigger automatically creates a row in employee_profiles. We need to update it.
    const { error: profileUpdateError } = await supabaseAdmin
      .from('employee_profiles')
      .update({
        employee_id: employeeId,
        dob: request.dob,
        emergency_contact: request.emergency_contact,
        permanent_address: request.permanent_address,
        current_address: request.current_address,
        id_proof_url: request.id_proof_url,
        is_approved: true,
        status: 'ACTIVE',
        must_change_password: true,
        role: 'employee'
      })
      .eq('id', userId);

    if (profileUpdateError) throw new Error(`Profile update failed: ${profileUpdateError.message}`);

    // Update the request status
    await supabaseAdmin
      .from('onboarding_requests')
      .update({ status: 'APPROVED' })
      .eq('id', request_id);

    // Send Credential Email to Employee
    const mailOptions = {
      from: `"InSpark HR" <${process.env.SMTP_EMAIL}>`,
      to: request.email,
      subject: 'InSpark Portal - Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #7C3AED;">Welcome to InSpark, ${request.full_name}!</h2>
          <p>Your account has been successfully approved by the Admin.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Employee ID:</strong> ${employeeId}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p><strong>Important:</strong> You must change your temporary password immediately upon your first login.</p>
          <p>Log in here: <a href="https://inspark-final-hdjo.vercel.app/portal/login">https://inspark-final-hdjo.vercel.app/portal/login</a></p>
          <p>Best regards,<br>InSpark HR Team</p>
        </div>
      `
    };

    // We MUST await this on Vercel to ensure the email is actually sent before the function is frozen
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Approval email failed:', err);
    }

    // Return the credentials in the success message so the admin can manually copy them if the email fails!
    res.status(200).json({ 
      message: `Approved! Email sent. If they don't receive it, give them ID: ${employeeId}, Pwd: ${tempPassword}`,
      credentials: { employeeId, tempPassword }
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Internal server error during approval.' });
  }
});

// 3. ADMIN REJECT
router.post('/reject', async (req, res) => {
  try {
    const { request_id } = req.body;
    if (!request_id) return res.status(400).json({ error: 'Request ID is required.' });

    await supabaseAdmin
      .from('onboarding_requests')
      .update({ status: 'REJECTED' })
      .eq('id', request_id);

    res.status(200).json({ message: 'Employee request rejected.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
