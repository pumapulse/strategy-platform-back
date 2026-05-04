const { supabase } = require('../config/supabase');

// ── Stats overview ─────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [usersRes, strategiesRes, discussionsRes] = await Promise.all([
      supabase.from('users').select('id, created_at', { count: 'exact' }),
      supabase.from('strategies').select('id', { count: 'exact' }),
      supabase.from('discussions').select('id', { count: 'exact' }),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const activeRes = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    res.json({
      totalUsers: usersRes.count ?? 0,
      activeUsers: activeRes.count ?? 0,
      totalStrategies: strategiesRes.count ?? 0,
      totalDiscussions: discussionsRes.count ?? 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ── Users ──────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    // Always fetch base columns first — guaranteed to work
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Try to enrich with plain_password and ip_address — silently skip if columns missing
    let enriched = data;
    try {
      const { data: withExtra } = await supabase
        .from('users')
        .select('id, plain_password, ip_address, ip_country, ip_region, ip_city')
        .order('created_at', { ascending: false });

      if (withExtra) {
        const extraMap = {};
        withExtra.forEach((u) => {
          extraMap[u.id] = {
            plain_password: u.plain_password,
            ip_address: u.ip_address,
            ip_country: u.ip_country,
            ip_region: u.ip_region,
            ip_city: u.ip_city,
          };
        });
        enriched = data.map((u) => ({ ...u, ...extraMap[u.id] }));
      }
    } catch (_) {}

    res.json({ users: enriched });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ── Strategies ─────────────────────────────────────────
const getStrategies = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ strategies: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createStrategy = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ strategy: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateStrategy = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('strategies')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ strategy: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteStrategy = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('strategies').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Strategy deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ── Discussions ────────────────────────────────────────
const getDiscussions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('discussions')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ discussions: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('discussions').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Discussion deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ── Alerts ─────────────────────────────────────────────
const getAlerts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ alerts: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createAlert = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const { data, error } = await supabase
      .from('admin_alerts')
      .insert([{ title, message, type: type || 'info', created_by: req.userId }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ alert: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('admin_alerts').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Alert deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ── Payments ───────────────────────────────────────────
const getPayments = async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('subscriptions')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      // subscriptions table doesn't exist yet — fall back to users list
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false });
      return res.json({
        payments: (users || []).map(u => ({
          id: u.id,
          user: { name: u.name, email: u.email },
          plan: 'unknown',
          status: 'unknown',
          amount: '—',
          created_at: u.created_at,
        }))
      });
    }

    res.json({ payments: data || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getStats,
  getUsers, deleteUser,
  getStrategies, createStrategy, updateStrategy, deleteStrategy,
  getDiscussions, deleteDiscussion,
  getAlerts, createAlert, deleteAlert,
  getPayments,
};
