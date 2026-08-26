require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Attempting login...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'cp070308@gmail.com',
    password: 'Chandana1234'
  });
  
  if (error) {
    console.error('Login Failed:', error.message);
  } else {
    console.log('Login Success! User ID:', data.user.id);
  }
}

testLogin();
