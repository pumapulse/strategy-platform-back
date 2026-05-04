const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

const router = Router();

// User submits a payment request
router.post('/request', authenticate, async (req, res) => {
  try {
    const { name, email, plan, chain, amount } = req.body;
    if (!name || !email || !plan || !chain || !amount) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const { data, error } = await supabase
      .from('payment_requests')
      .insert([{ user_id: req.userId, name, email, plan, chain, amount, status: 'pending' }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ message: 'Payment request submitted', request: data });
  } catch (e) {
    console.error('Payment request error:', e);
    res.status(500).json({ error: 'Failed to submit payment request' });
  }
});

// Admin: get all payment requests
router.get('/requests', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ requests: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: approve a payment request
router.post('/requests/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: pr, error: prErr } = await supabase
      .from('payment_requests')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();
    if (prErr) throw prErr;

    // Update user subscription in users table
    await supabase
      .from('users')
      .update({
        subscription_plan: pr.plan,
        subscription_status: 'active',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', pr.user_id);

    res.json({ message: 'Approved', request: pr });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: reject a payment request
router.post('/requests/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('payment_requests')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ message: 'Rejected', request: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
