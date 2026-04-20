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
    from: 'CrowdPnL <noreply@crowdpnl.com>',
    to: email,
    subject: 'Your CrowdPnL verification code',
    text: `Hi ${name},\n\nYour verification code is: ${code}\n\nExpires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\n— CrowdPnL`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:20px;font-weight:900;color:#0a0e1a;letter-spacing:-0.5px;">Crowd<span style="color:#7c3aed;">PnL</span></span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#1a1a2e;font-size:15px;font-weight:400;line-height:1.6;">Hi ${name},</p>
            <p style="margin:0 0 24px;color:#1a1a2e;font-size:15px;line-height:1.6;">Your verification code is:</p>

            <!-- Code -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center" style="background:#f8f7ff;border:1px solid #e5e0ff;border-radius:8px;padding:24px 20px;">
                  <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#7c3aed;font-family:'Courier New',monospace;">${code}</span>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;color:#1a1a2e;font-size:15px;line-height:1.6;">Expires in 10 minutes.</p>
            <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">If you didn't request this, ignore this email.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;color:#aaa;font-size:11px;">
              © 2025 CrowdPnL · <a href="https://crowdpnl.com" style="color:#7c3aed;text-decoration:none;">crowdpnl.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
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

// ── Password reset email ──────────────────────────────────────────────────────
const sendPasswordResetEmail = async (email, code, name) => {
  if (!resend) { console.warn('RESEND_API_KEY not set'); return; }

  const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
  const expiryStr = expiryTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC'
  }) + ' UTC';

  await resend.emails.send({
    from: 'CrowdPnL <noreply@crowdpnl.com>',
    to: email,
    subject: `${code} — Reset your CrowdPnL password`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0d1120;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.3);">
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626 0%,#7c3aed 100%);padding:32px 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Crowd<span style="color:#fca5a5;">PnL</span></span></td>
                <td align="right"><span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.15em;text-transform:uppercase;">Password Reset</span></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 12px;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.9);font-size:16px;font-weight:600;">Hi ${name || 'there'},</p>
            <p style="margin:0 0 28px;color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;">
              We received a request to reset your CrowdPnL password. Enter the code below to continue.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center" style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);border-radius:14px;padding:28px 20px;">
                  <span style="font-size:48px;font-weight:900;letter-spacing:14px;color:#fca5a5;font-family:'Courier New',monospace;">${code}</span>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:12px 16px;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="padding-right:10px;font-size:16px;">⏱</td>
                    <td>
                      <span style="color:#fbbf24;font-size:13px;font-weight:700;">Expires at ${expiryStr}</span>
                      <span style="color:rgba(255,255,255,0.4);font-size:12px;display:block;margin-top:2px;">Valid for 10 minutes only</span>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.35);font-size:12px;line-height:1.6;">
              If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;text-align:center;">
              © 2025 CrowdPnL · <a href="https://crowdpnl.com" style="color:rgba(167,139,250,0.6);text-decoration:none;">crowdpnl.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
};

// ── Forgot password — send reset code ─────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Check user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset code has been sent.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete previous unused reset codes
    await supabase.from('email_verifications')
      .delete()
      .eq('email', email)
      .eq('used', false)
      .eq('type', 'reset');

    // Store reset code
    await supabase.from('email_verifications').insert([{
      email,
      code,
      expires_at: expiresAt,
      used: false,
      type: 'reset',
      pending_name: user.name,
    }]);

    try {
      await sendPasswordResetEmail(email, code, user.name);
    } catch (emailErr) {
      console.error('Reset email failed:', emailErr.message);
    }

    res.json({ message: 'If that email exists, a reset code has been sent.', sent: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// ── Reset password — verify code + set new password ───────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'All fields required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { data: records } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code.trim())
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    const record = records?.[0];
    if (!record) return res.status(400).json({ error: 'Invalid or expired code' });
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: 'Code expired. Please request a new one.' });

    // Mark code as used
    await supabase.from('email_verifications').update({ used: true }).eq('id', record.id);

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: hashedPassword, plain_password: newPassword })
      .eq('email', email);

    if (updateErr) throw updateErr;

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ── Verify reset code (without consuming it) ──────────────────────────────────
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

    // Find any valid unused code for this email (don't filter by type in case column missing)
    const { data: records } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code.trim())
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    const record = records?.[0];
    if (!record) return res.status(400).json({ error: 'Invalid code. Please check and try again.' });
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: 'Code expired. Please request a new one.' });

    res.json({ valid: true });
  } catch (error) {
    console.error('Verify reset code error:', error);
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

module.exports = { signup, login, verifyEmail, forgotPassword, resetPassword, verifyResetCode, getProfile, updateProfile, uploadAvatar, adminLogin };
