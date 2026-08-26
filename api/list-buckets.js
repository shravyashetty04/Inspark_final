require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function listBuckets() {
  console.log('Listing buckets...');
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('BUCKETS:', data);
  }
}

listBuckets();
