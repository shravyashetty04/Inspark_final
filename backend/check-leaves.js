require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkLeaves() {
  const { data, error } = await supabaseAdmin.from('leave_requests').select('*');
  console.log('Leaves found in database:', data?.length);
  console.log('Error:', error);
}

checkLeaves();
