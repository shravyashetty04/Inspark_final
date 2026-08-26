require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testUpload() {
  console.log('Testing Supabase Storage upload...');
  const testBuffer = Buffer.from('Hello world');
  const fileName = `test_${Date.now()}.txt`;
  
  const { data, error } = await supabaseAdmin
    .storage
    .from('id_proofs')
    .upload(fileName, testBuffer, { contentType: 'text/plain' });

  if (error) {
    console.error('UPLOAD ERROR:', error);
  } else {
    console.log('UPLOAD SUCCESS:', data);
  }
}

testUpload();
