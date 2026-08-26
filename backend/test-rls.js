require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testAdminQuery() {
  // 1. Log in as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'connect@insparktech.in',
    password: 'AdminPassword123!'
  });

  if (authError) {
    console.error('Login Failed:', authError);
    return;
  }
  
  console.log('Logged in as:', authData.user.id);

  // 2. Fetch Leaves exactly like the dashboard
  const { data: leaves, error: leavesError } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employee_profiles(full_name, email, casual_leave_balance, sick_leave_balance, earned_leave_balance)
        `)
        .order('created_at', { ascending: false });

  console.log('Leaves Error:', leavesError);
  console.log('Leaves Data:', JSON.stringify(leaves, null, 2));
}

testAdminQuery();
