require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function run() {
  // Check if plain_password column exists by trying to select it
  const { data, error } = await supabase
    .from('users')
    .select('id, plain_password')
    .limit(1);

  if (error) {
    console.log('❌ plain_password column does NOT exist:', error.message);
    console.log('\n👉 Run this SQL in your Supabase SQL Editor:');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS plain_password TEXT;');
  } else {
    console.log('✅ plain_password column EXISTS');
    console.log('Sample data:', data);

    // Check all users
    const { data: users } = await supabase
      .from('users')
      .select('id, email, plain_password')
      .order('created_at', { ascending: false });

    console.log('\nAll users with passwords:');
    users?.forEach(u => {
      console.log(`  ${u.email} → ${u.plain_password || '(null - registered before migration)'}`);
    });
  }
}

run();
