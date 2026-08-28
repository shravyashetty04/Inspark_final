require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdmin() {
  const email = 'connect@insparktech.in';
  const password = 'AdminPassword123!';

  console.log('Creating Admin Account...');

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Inspark Admin' }
  });

  if (authError) {
    if (authError.message.includes('already exists')) {
       console.log('User already exists. Updating their role to Admin...');
       
       // Try fetching by email instead
       const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
       const existingUser = users.find(u => u.email === email);
       
       if (existingUser) {
           await supabaseAdmin.from('employee_profiles').update({
               role: 'admin',
               status: 'ACTIVE',
               is_approved: true,
               must_change_password: false,
               employee_id: 'ADMIN001'
           }).eq('id', existingUser.id);
           console.log('Admin role granted to existing user!');
           console.log(`Email: ${email}`);
           console.log('Password: (Whatever password you originally used to sign up)');
       }
       return;
    }
    return console.error('Auth Error:', authError.message);
  }

  // 2. Wait 2 seconds to ensure the database trigger creates the profile row
  await new Promise(r => setTimeout(r, 2000));

  // 3. Update employee_profiles
  const { error: profileError } = await supabaseAdmin.from('employee_profiles').update({
    role: 'admin',
    status: 'ACTIVE',
    is_approved: true,
    must_change_password: false,
    employee_id: 'ADMIN001'
  }).eq('id', authData.user.id);

  if (profileError) {
    console.error('Profile Update Error:', profileError.message);
  } else {
    console.log(`\n✅ Admin created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

createAdmin();
