require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function cleanEmail(email) {
  console.log(`Cleaning up ${email}...`);

  // 1. Delete from onboarding_requests
  const { data: reqData, error: reqError } = await supabaseAdmin
    .from('onboarding_requests')
    .delete()
    .eq('email', email);
  if (reqError) console.error('Error deleting from onboarding_requests:', reqError.message);
  else console.log('Successfully deleted from onboarding_requests.');

  // 2. Delete from employee_profiles
  const { data: profData, error: profError } = await supabaseAdmin
    .from('employee_profiles')
    .delete()
    .eq('email', email);
  if (profError) console.error('Error deleting from employee_profiles:', profError.message);
  else console.log('Successfully deleted from employee_profiles.');

  // 3. Delete from auth.users (Need to find user ID first)
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (!listError && users) {
    const user = users.find(u => u.email === email);
    if (user) {
      const { error: delAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (delAuthError) console.error('Error deleting from auth.users:', delAuthError.message);
      else console.log('Successfully deleted from auth.users.');
    }
  }

  console.log('Cleanup complete!');
}

cleanEmail('chandanap.murthy@gmail.com');
