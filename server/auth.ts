import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

const ADMIN_EMAIL = 'juniorjustus8272@gmail.com';
const ADMIN_PHONES = ['255705160226', '0705160226', '+255705160226'];
const TOKEN_SECRET = process.env.AUTH_SECRET || 'kukuza-pro-tz-secure-auth-secret-key-2026';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin';
  is_verified: number;
}

export function isAuthorizedAdmin(email: string, phone?: string): boolean {
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  if (phone) {
    const cleanPhone = phone.replace(/\s+/g, '');
    if (ADMIN_PHONES.includes(cleanPhone)) return true;
  }
  return false;
}

export function isAuthorizedAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Secure password hashing using Node.js crypto.scrypt
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      try {
        const keyBuffer = Buffer.from(key, 'hex');
        const match = crypto.timingSafeEqual(keyBuffer, derivedKey);
        resolve(match);
      } catch {
        resolve(false);
      }
    });
  });
}

// Generate signed authentication token (payload.signature)
export function generateToken(user: { id: string; email: string; role: string }): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(encodedPayload);
  const signature = hmac.digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
    hmac.update(encodedPayload);
    const expectedSignature = hmac.digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Middleware: Authenticate user from Bearer header or cookie
export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.kukuza_token) {
    token = req.cookies.kukuza_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Hujaingia kwenye mfumo (Unauthorized). Tafadhali ingia upya.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Muda wa kikao umekwisha. Tafadhali ingia upya.' });
  }

  const user = db.prepare('SELECT id, email, full_name, phone, role, is_verified FROM users WHERE id = ?').get(payload.sub) as AuthUser | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Akaunti haikupatikana.' });
  }

  // Double check admin role for authorized email or phone
  if (isAuthorizedAdmin(user.email, user.phone) && user.role !== 'admin') {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
    user.role = 'admin';
  }

  req.user = user;
  next();
}

// Middleware: Require Admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Tafadhali ingia kwenye mfumo kwanza.' });
  }

  // Check role in database
  if (req.user.role !== 'admin' && !isAuthorizedAdmin(req.user.email, req.user.phone)) {
    return res.status(403).json({
      error: 'Ufikiaji umekataliwa. Ukurasa huu unaruhusiwa kwa msimamizi mkuu (Admin) pekee.'
    });
  }

  next();
}
