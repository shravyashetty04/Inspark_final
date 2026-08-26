require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixUser() {
  const targetId = '344431';
  
  // Get employee profile
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('employee_profiles')
    .select('id, email')
    .eq('employee_id', targetId)
    .single();
    
  if (profileErr || !profile) {
    console.log('Profile not found for ID', targetId);
    return;
  }
  
  console.log('Found profile:', profile.id, profile.email);
  
  // Update Auth user
  const tempPassword = 'Chandana1234';
  const newEmail = 'cp070308@gmail.com';
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    profile.id,
    { email: newEmail, password: tempPassword }
  );
  
  if (authError) {
    console.log('Error updating auth:', authError.message);
  } else {
    console.log('Successfully updated auth user. Email:', newEmail, 'Temp Password:', tempPassword);
  }
  
  // Ensure profile has correct email
  await supabaseAdmin.from('employee_profiles').update({ email: newEmail }).eq('id', profile.id);
  
}

fixUser();
