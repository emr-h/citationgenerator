import express from 'express';
import auth from '../authMiddleware.js';
import supabase from '../supabaseClient.js'; // ✅ Supabase client instead of db.js

const router = express.Router();

router.post('/saveCitation', auth, async (req, res) => {
  const { url, style, method, inText, fullReference } = req.body;
  const userId = req.user.userId;

  const { error } = await supabase
    .from('citations')
    .insert({
      user_id: userId,
      url,
      style,
      method,
      in_text: inText,
      full_reference: fullReference
    });

  if (error) {
    console.error('❌ Supabase insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

router.get('/history', auth, async (req, res) => {
  const userId = req.user.userId;

  const { data, error } = await supabase
    .from('citations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;
