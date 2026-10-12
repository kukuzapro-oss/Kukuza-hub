import { Router } from 'express';
import type { Response } from 'express';
import crypto from 'node:crypto';
import { db, getUserWallet } from '../db.ts';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateUser,
  isAuthorizedAdminEmail
} from '../auth.ts';
import type { AuthRequest } from '../auth.ts';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res): Promise<any> => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({ error: 'Tafadhali jaza taarifa zote zinazohitajika (Jina, Barua Pepe, Simu na Nenosiri).' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (password.length < 6) {
      return res.status(400).json({ error: 'Nenosiri lazima liwe na angalau herufi 6.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Barua pepe hii tayari imesajiliwa. Tafadhali ingia kwenye akaunti yako.' });
    }

    const passwordHash = await hashPassword(password);
    const userId = 'usr_' + crypto.randomUUID();
    const now = Date.now();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean and set user as verified immediately
    const role = isAuthorizedAdminEmail(cleanEmail) ? 'admin' : 'user';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role, is_verified, verification_code, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(userId, cleanEmail, passwordHash, full_name.trim(), cleanPhone, role, verificationCode, now, now);

    // Ensure wallet exists
    const wallet = getUserWallet(userId);

    const token = generateToken({ id: userId, email: cleanEmail, role });

    res.cookie('kukuza_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: 'Hongera! Usajili umekamilika kikamilifu.',
      token,
      user: {
        id: userId,
        email: cleanEmail,
        full_name: full_name.trim(),
        phone: cleanPhone,
        role,
        is_verified: 1
      },
      wallet
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Hitilafu ya seva: ' + (err.message || 'Haikuweza kusajili akaunti.') });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Tafadhali ingiza barua pepe na nenosiri lako.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      return res.status(401).json({ error: 'Barua pepe au nenosiri si sahihi.' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Barua pepe au nenosiri si sahihi.' });
    }

    // Auto-sync admin role if authorized admin email
    if (isAuthorizedAdminEmail(cleanEmail) && user.role !== 'admin') {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
      user.role = 'admin';
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const wallet = getUserWallet(user.id);

    res.cookie('kukuza_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Umeingia kikamilifu!',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified
      },
      wallet
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Hitilafu ya seva wakati wa kuingia: ' + err.message });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateUser, (req: AuthRequest, res: Response): any => {
  const user = req.user!;
  const wallet = getUserWallet(user.id);
  return res.json({
    user,
    wallet
  });
});

// POST /api/auth/verify-email
authRouter.post('/verify-email', authenticateUser, (req: AuthRequest, res: Response): any => {
  const { code } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;

  if (!code) {
    return res.status(400).json({ error: 'Tafadhali ingiza nambari ya uthibitisho (verification code).' });
  }

  if (user.is_verified === 1) {
    return res.json({ message: 'Barua pepe yako tayari imethibitishwa.', is_verified: 1 });
  }

  if (user.verification_code !== code.trim()) {
    return res.status(400).json({ error: 'Nambari ya uthibitisho si sahihi. Jaribu tena.' });
  }

  const now = Date.now();
  db.prepare('UPDATE users SET is_verified = 1, verification_code = NULL, updated_at = ? WHERE id = ?').run(now, user.id);

  return res.json({
    message: 'Barua pepe yako imethibitishwa kikamilifu!',
    is_verified: 1
  });
});

// POST /api/auth/resend-code
authRouter.post('/resend-code', authenticateUser, (req: AuthRequest, res: Response): any => {
  const user = req.user!;
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();

  db.prepare('UPDATE users SET verification_code = ?, updated_at = ? WHERE id = ?').run(newCode, now, user.id);

  return res.json({
    message: `Nambari mpya ya uthibitisho imetumwa: ${newCode}`,
    verification_code: newCode
  });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req, res): any => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Tafadhali ingiza barua pepe yako.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(cleanEmail) as any;

  if (!user) {
    // Return friendly generic message for privacy
    return res.json({ message: 'Ikiwa barua pepe hii ipo kwenye mfumo wetu, maelekezo ya kurejesha nenosiri yametumwa.' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const expires = Date.now() + 3600 * 1000; // 1 hour

  db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(resetToken, expires, user.id);

  return res.json({
    message: 'Maelekezo na tokeni ya kurejesha nenosiri imeundwa.',
    resetToken // Returned for convenience in demonstration
  });
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', async (req, res): Promise<any> => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Tokeni na nenosiri jipya vinahitajika.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Nenosiri jipya lazima liwe na herufi 6 au zaidi.' });
  }

  const now = Date.now();
  const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?').get(token, now) as any;

  if (!user) {
    return res.status(400).json({ error: 'Tokeni ya kurejesha nenosiri si sahihi au muda wake umekwisha.' });
  }

  const passwordHash = await hashPassword(newPassword);
  db.prepare(`
    UPDATE users
    SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = ?
    WHERE id = ?
  `).run(passwordHash, now, user.id);

  return res.json({ message: 'Nenosiri jipya limewekwa kikamilifu. Sasa unaweza kuingia.' });
});

// POST /api/auth/claim-admin: Admin setup procedure
authRouter.post('/claim-admin', authenticateUser, (req: AuthRequest, res: Response): any => {
  const user = req.user!;
  if (!isAuthorizedAdminEmail(user.email)) {
    return res.status(403).json({
      error: 'Ufikiaji umekataliwa. Mamlaka haya yamehifadhiwa kwa msimamizi mkuu pekee.'
    });
  }

  db.prepare("UPDATE users SET role = 'admin', is_verified = 1 WHERE id = ?").run(user.id);
  const updatedUser = db.prepare('SELECT id, email, full_name, phone, role, is_verified FROM users WHERE id = ?').get(user.id);

  return res.json({
    message: 'Mamlaka ya Msimamizi Mkuu (Admin) yamethibitishwa na kuhifadhiwa kikamilifu!',
    user: updatedUser
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res): any => {
  res.clearCookie('kukuza_token');
  return res.json({ message: 'Umetoka kwenye akaunti.' });
});
