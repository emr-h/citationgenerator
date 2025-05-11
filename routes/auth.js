import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../supabaseClient.js'; // ✅ replace db.js with this

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert({ username, password_hash: hash });

  if (error) {
    console.error("❌ Supabase insert error:", error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ success: true });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .limit(1)
    .single();

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = users;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // ✅ Include username in JWT
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET
  );

  res.json({ token });
});


export default router;
