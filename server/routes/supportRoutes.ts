import { Router } from 'express';
import type { Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.ts';
import { authenticateUser } from '../auth.ts';
import type { AuthRequest } from '../auth.ts';

export const supportRouter = Router();

// GET /api/support/info - Public contact info
supportRouter.get('/info', (_req, res): any => {
  return res.json({
    phone: '0660771226',
    whatsapp: '0660771226',
    whatsapp_link: 'https://wa.me/255660771226?text=Habari%20Kukuza%20Pro,%20nahitaji%20msaada',
    email: 'kukuzapro@gmail.com',
    hours: '24/7 Msaada wa Saa Zote',
    location: 'Dar es Salaam, Tanzania'
  });
});

// GET /api/support/tickets - Authenticated user tickets
supportRouter.get('/tickets', authenticateUser, (req: AuthRequest, res: Response): any => {
  const userId = req.user!.id;
  const tickets = db.prepare(`
    SELECT * FROM support_tickets
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);

  return res.json(tickets);
});

// POST /api/support/tickets - Create new ticket
supportRouter.post('/tickets', authenticateUser, (req: AuthRequest, res: Response): any => {
  const { subject, category, message, priority } = req.body;
  const user = req.user!;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Tafadhali jaza mada (subject) na ujumbe wako.' });
  }

  const id = 'tkt_' + crypto.randomUUID();
  const now = Date.now();
  const initialReply = JSON.stringify([
    {
      sender: user.full_name,
      sender_role: user.role,
      message: message.trim(),
      created_at: now
    }
  ]);

  db.prepare(`
    INSERT INTO support_tickets (
      id, user_id, user_name, user_email, subject, category, message, status, priority, replies_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)
  `).run(
    id,
    user.id,
    user.full_name,
    user.email,
    subject.trim(),
    category || 'General',
    message.trim(),
    priority || 'medium',
    initialReply,
    now,
    now
  );

  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
  return res.status(201).json({ message: 'Tiketi yako ya msaada imefunguliwa. Tutajibu hivi punde!', ticket });
});

// POST /api/support/tickets/:id/reply - User adds reply
supportRouter.post('/tickets/:id/reply', authenticateUser, (req: AuthRequest, res: Response): any => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.user!;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Ujumbe hauwezi kuwa mtupu.' });
  }

  let ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id) as any;
  if (!ticket) {
    return res.status(404).json({ error: 'Tiketi haikupatikana.' });
  }

  if (user.role !== 'admin' && ticket.user_id !== user.id) {
    return res.status(403).json({ error: 'Huna ruhusa ya kuona au kujibu tiketi hii.' });
  }

  let replies: any[] = [];
  try {
    replies = JSON.parse(ticket.replies_json || '[]');
  } catch {
    replies = [];
  }

  const now = Date.now();
  replies.push({
    sender: user.role === 'admin' ? 'Msimamizi wa Kukuza Pro' : user.full_name,
    sender_role: user.role,
    message: message.trim(),
    created_at: now
  });

  const newStatus = user.role === 'admin' ? 'in_progress' : ticket.status;

  db.prepare(`
    UPDATE support_tickets
    SET replies_json = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(JSON.stringify(replies), newStatus, now, id);

  ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
  return res.json({ message: 'Ujumbe umetumwa kikamilifu.', ticket });
});
