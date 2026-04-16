const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { supabase } = require('../config/supabase');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ── Email helper ──────────────────────────────────────────────────────────────
const sendVerificationEmail = async (email, code, name) => {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email send');
    return;
  }
  await resend.emails.send({
    from: 'CrowdPnl <noreply@crowdpnl.com>',
    to: email,
    subject: 'Your verification code — CrowdPnl',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0e1a;color:#fff;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 32px 24px">
          <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px">CrowdPnl</h1>
          <p style="margin:6px 0 0;opacity:0.7;font-size:13px">Email Verification</p>
        </div>
        <div style="padding:32px">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:14px">Hi ${name},</p>
          <p style="margin:0 0 28px;color:rgba(255,255,255,0.6);font-size:14px">Use the code below to verify your email address. It expires in <strong style="color:#fff">10 minutes</strong>.</p>
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
            <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#a78bfa">${code}</span>
          </div>
          <p style="margin:0;color:rgba(255,255,255,0.3);font-size:12px">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
};

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

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || null;

    // Delete any previous unused codes for this email
    await supabase.from('email_verifications').delete().eq('email', email).eq('used', false);

    // Store verification code + pending user data
    await supabase.from('email_verifications').insert([{
      email,
      code,
      expires_at: expiresAt,
      used: false,
      pending_name: name,
      pending_password: hashedPassword,
      pending_plain: password,
      pending_ip: ip,
    }]);

    // Send verification email
    try {
      await sendVerificationEmail(email, code, name);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(200).json({
      message: 'Verification code sent',
      requiresVerification: true,
      email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

    const { data: record, error } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code.trim())
      .eq('used', false)
      .single();

    if (error || !record) return res.status(400).json({ error: 'Invalid or expired code' });
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: 'Code expired. Please sign up again.' });

    // Mark code as used
    await supabase.from('email_verifications').update({ used: true }).eq('id', record.id);

    // Create the user now
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{ email, password: record.pending_password, name: record.pending_name }])
      .select('id, email, name, created_at')
      .single();

    if (userErr) throw userErr;

    // Save extra fields
    const ip = record.pending_ip;
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
    try {
      await supabase.from('users').update({
        plain_password: record.pending_plain,
        ip_address: ip,
        ip_country: ipCountry,
        ip_region: ipRegion,
        ip_city: ipCity,
      }).eq('id', user.id);
    } catch (_) {}

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Email verified', token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Verification failed' });
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

module.exports = { signup, login, verifyEmail, getProfile, updateProfile, uploadAvatar, adminLogin };
