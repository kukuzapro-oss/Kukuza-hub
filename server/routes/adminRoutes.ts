import { Router } from 'express';
import type { Response } from 'express';
import crypto from 'node:crypto';
import { db, creditWalletBalance, refundWalletBalance, getUserWallet } from '../db.ts';
import { authenticateUser, requireAdmin } from '../auth.ts';
import type { AuthRequest } from '../auth.ts';
import { testProviderConnection, fetchProviderServices, submitOrderToProvider } from '../smmProvider.ts';

export const adminRouter = Router();

// Secure all admin routes with authentication and requireAdmin check
adminRouter.use(authenticateUser);
adminRouter.use(requireAdmin);

// Mask secret string helper
function maskSecret(val: string): string {
  if (!val || val.length === 0) return '';
  if (val.length <= 4) return '••••';
  return '••••••••' + val.slice(-4);
}

// GET /api/admin/overview: Summary statistics
adminRouter.get('/overview', (_req: AuthRequest, res: Response): any => {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as { count: number };
  const inProgressOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'in_progress'").get() as { count: number };
  const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'").get() as { count: number };
  const canceledOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'canceled'").get() as { count: number };

  const totalRevenue = db.prepare("SELECT SUM(charge_tzs) as total FROM orders WHERE status != 'canceled'").get() as { total: number | null };
  const totalDeposits = db.prepare("SELECT SUM(amount_tzs) as total FROM payment_records WHERE status = 'completed'").get() as { total: number | null };
  const totalUserBalances = db.prepare('SELECT SUM(balance) as total FROM wallets').get() as { total: number | null };
  const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM payment_records WHERE status = 'pending'").get() as { count: number };

  const recentOrders = db.prepare(`
    SELECT o.*, u.full_name as user_name, u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all();

  const openTickets = db.prepare("SELECT COUNT(*) as count FROM support_tickets WHERE status = 'open'").get() as { count: number };

  return res.json({
    usersCount: usersCount.count,
    ordersCount: ordersCount.count,
    pendingOrders: pendingOrders.count,
    inProgressOrders: inProgressOrders.count,
    completedOrders: completedOrders.count,
    canceledOrders: canceledOrders.count,
    totalRevenueTzs: totalRevenue.total || 0,
    totalDepositsTzs: totalDeposits.total || 0,
    totalUserBalancesTzs: totalUserBalances.total || 0,
    pendingPaymentsCount: pendingPayments.count,
    openTicketsCount: openTickets.count,
    recentOrders
  });
});

// ==================== SERVICE MANAGEMENT ====================

// GET /api/admin/services
adminRouter.get('/services', (_req: AuthRequest, res: Response): any => {
  const services = db.prepare('SELECT * FROM services ORDER BY category ASC, rate_per_1000 ASC').all();
  return res.json(services);
});

// POST /api/admin/services: Create service
adminRouter.post('/services', (req: AuthRequest, res: Response): any => {
  const { category, platform, name, type, rate_per_1000, min_quantity, max_quantity, description, provider_service_id, provider_rate, active } = req.body;

  if (!category || !name || !rate_per_1000 || !min_quantity || !max_quantity) {
    return res.status(400).json({ error: 'Tafadhali jaza taarifa zote muhimu za huduma.' });
  }

  const id = 'srv_' + crypto.randomUUID().slice(0, 8);
  const now = Date.now();

  db.prepare(`
    INSERT INTO services (
      id, category, platform, name, type, rate_per_1000, min_quantity, max_quantity,
      description, provider_service_id, provider_rate, active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    category.trim(),
    platform ? platform.trim() : category.trim(),
    name.trim(),
    type || 'Default',
    Number(rate_per_1000),
    Number(min_quantity),
    Number(max_quantity),
    description || '',
    provider_service_id || null,
    provider_rate ? Number(provider_rate) : 0,
    active !== undefined ? (active ? 1 : 0) : 1,
    now
  );

  const created = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  return res.status(201).json({ message: 'Huduma mpya imeongezwa kikamilifu!', service: created });
});

// PUT /api/admin/services/:id: Update service
adminRouter.put('/services/:id', (req: AuthRequest, res: Response): any => {
  const { id } = req.params;
  const { category, platform, name, type, rate_per_1000, min_quantity, max_quantity, description, provider_service_id, provider_rate, active } = req.body;

  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Huduma haikupatikana.' });
  }

  db.prepare(`
    UPDATE services
    SET category = ?, platform = ?, name = ?, type = ?, rate_per_1000 = ?, min_quantity = ?, max_quantity = ?,
        description = ?, provider_service_id = ?, provider_rate = ?, active = ?
    WHERE id = ?
  `).run(
    category,
    platform,
    name,
    type,
    Number(rate_per_1000),
    Number(min_quantity),
    Number(max_quantity),
    description,
    provider_service_id || null,
    provider_rate ? Number(provider_rate) : 0,
    active ? 1 : 0,
    id
  );

  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  return res.json({ message: 'Huduma imesasishwa kikamilifu!', service: updated });
});

// PATCH /api/admin/services/:id/toggle: Quick active toggle
adminRouter.patch('/services/:id/toggle', (req: AuthRequest, res: Response): any => {
  const { id } = req.params;
  const service = db.prepare('SELECT active FROM services WHERE id = ?').get(id) as { active: number } | undefined;
  if (!service) {
    return res.status(404).json({ error: 'Huduma haikupatikana.' });
  }

  const newStatus = service.active === 1 ? 0 : 1;
  db.prepare('UPDATE services SET active = ? WHERE id = ?').run(newStatus, id);
  return res.json({ message: `Huduma sasa ni ${newStatus === 1 ? 'HAI (Active)' : 'IMEZIMWA (Disabled)'}`, active: newStatus });
});

// DELETE /api/admin/services/:id: Delete service
adminRouter.delete('/services/:id', (req: AuthRequest, res: Response): any => {
  const { id } = req.params;
  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  return res.json({ message: 'Huduma imefutwa kikamilifu.' });
});

// POST /api/admin/services/bulk-markup: Bulk price adjustment / profit margin
adminRouter.post('/services/bulk-markup', (req: AuthRequest, res: Response): any => {
  const { percentage, category } = req.body;
  const percent = Number(percentage);

  if (isNaN(percent) || percent === 0) {
    return res.status(400).json({ error: 'Tafadhali weka asilimia halisi ya kubadilisha (mfano: 15 kwa ongezeko la 15%).' });
  }

  const multiplier = 1 + (percent / 100);

  if (category && category !== 'all') {
    db.prepare('UPDATE services SET rate_per_1000 = ROUND(rate_per_1000 * ?, 0) WHERE category = ?').run(multiplier, category);
  } else {
    db.prepare('UPDATE services SET rate_per_1000 = ROUND(rate_per_1000 * ?, 0)').run(multiplier);
  }

  return res.json({ message: `Bei za huduma zimebadilishwa kwa asilimia ${percent}% kikamilifu.` });
});

// ==================== ORDERS MANAGEMENT ====================

// GET /api/admin/orders
adminRouter.get('/orders', (req: AuthRequest, res: Response): any => {
  const { status, search, limit = 100, offset = 0 } = req.query;

  let query = `
    SELECT o.*, u.full_name as user_name, u.email as user_email, u.phone as user_phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && typeof status === 'string' && status !== 'all') {
    query += ' AND o.status = ?';
    params.push(status);
  }

  if (search && typeof search === 'string') {
    query += ' AND (o.id LIKE ? OR o.link LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const orders = db.prepare(query).all(...params);
  return res.json(orders);
});

// PATCH /api/admin/orders/:id/status: Update order status with optional refund
adminRouter.patch('/orders/:id/status', (req: AuthRequest, res: Response): any => {
  const { id } = req.params;
  const { status, refund_user, reason } = req.body;

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    return res.status(404).json({ error: 'Oda haikupatikana.' });
  }

  const validStatuses = ['pending', 'in_progress', 'completed', 'partial', 'canceled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Hali ya oda si sahihi.' });
  }

  const now = Date.now();
  let notes = order.notes || '';
  if (reason) {
    notes += ` [Msimamizi: ${reason}]`;
  }

  // Handle refund if canceled or partial and requested
  if ((status === 'canceled' || status === 'partial') && refund_user && order.status !== 'canceled') {
    let refundAmount = order.charge_tzs;
    if (status === 'partial' && req.body.refund_amount) {
      refundAmount = Math.min(order.charge_tzs, Number(req.body.refund_amount));
    }
    if (refundAmount > 0) {
      refundWalletBalance(
        order.user_id,
        refundAmount,
        `REFUND-${order.id}`,
        `Kurejeshewa salio kwa oda iliyositishwa (${order.service_name})`
      );
      notes += ` [Salio la TZS ${refundAmount.toLocaleString()} limerejeshwa kwa mteja]`;
    }
  }

  db.prepare(`
    UPDATE orders
    SET status = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(status, notes, now, id);

  const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return res.json({ message: `Hali ya oda imesasishwa kuwa: ${status}`, order: updatedOrder });
});

// POST /api/admin/orders/:id/dispatch-provider: Manually trigger provider dispatch
adminRouter.post('/orders/:id/dispatch-provider', async (req: AuthRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    return res.status(404).json({ error: 'Oda haikupatikana.' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(order.service_id) as any;
  if (!service || !service.provider_service_id) {
    return res.status(400).json({ error: 'Huduma hii haina Provider Service ID ya SMM Africa.' });
  }

  try {
    const result = await submitOrderToProvider(service.provider_service_id, order.link, order.quantity);
    if (result.success && result.orderId) {
      const now = Date.now();
      db.prepare(`
        UPDATE orders
        SET provider_order_id = ?, provider_status = 'Dispatched to SMM Africa', status = 'in_progress', updated_at = ?
        WHERE id = ?
      `).run(result.orderId.toString(), now, order.id);

      return res.json({
        message: `Oda imetumwa kikamilifu kwa SMM Africa! Provider Order ID: ${result.orderId}`,
        provider_order_id: result.orderId
      });
    } else {
      return res.status(400).json({ error: `Provider amekataa: ${result.error}` });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Hitilafu ya kuwasiliana na Provider: ' + err.message });
  }
});

// ==================== USERS MANAGEMENT ====================

// GET /api/admin/users
adminRouter.get('/users', (_req: AuthRequest, res: Response): any => {
  const users = db.prepare(`
    SELECT
      u.id, u.email, u.full_name, u.phone, u.role, u.is_verified, u.created_at,
      w.balance as wallet_balance, w.total_deposited, w.total_spent,
      (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders
    FROM users u
    LEFT JOIN wallets w ON u.id = w.user_id
    ORDER BY u.created_at DESC
  `).all();

  return res.json(users);
});

// POST /api/admin/users/:id/adjust-balance: Adjust user's wallet
adminRouter.post('/users/:id/adjust-balance', (req: AuthRequest, res: Response): any => {
  const { id } = req.params;
  const { amount_tzs, action_type, reason } = req.body;

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!targetUser) {
    return res.status(404).json({ error: 'Mtumiaji haukupatikana.' });
  }

  const amt = Number(amount_tzs);
  if (!amt || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Kiasi lazima kiwe zaidi ya 0 TZS.' });
  }

  const ref = `ADJ-${Date.now().toString().slice(-6)}`;
  const desc = reason ? `Marekebisho ya Msimamizi: ${reason}` : `Marekebisho ya Salio (Msimamizi)`;

  if (action_type === 'credit') {
    creditWalletBalance(targetUser.id, amt, ref, desc);
  } else if (action_type === 'debit') {
    const currentWallet = getUserWallet(targetUser.id);
    if (currentWallet.balance < amt) {
      return res.status(400).json({ error: 'Mtumiaji hana salio la kutosha kukatwa kiasi hiki.' });
    }
    const balanceBefore = currentWallet.balance;
    const balanceAfter = balanceBefore - amt;
    const now = Date.now();

    db.prepare('UPDATE wallets SET balance = ?, updated_at = ? WHERE user_id = ?').run(balanceAfter, now, targetUser.id);
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount_tzs, balance_before, balance_after, reference, description, status, created_at)
      VALUES (?, ?, 'adjustment', ?, ?, ?, ?, ?, 'completed', ?)
    `).run('tx_' + crypto.randomUUID(), targetUser.id, amt, balanceBefore, balanceAfter, ref, desc, now);
  } else {
    return res.status(400).json({ error: 'Aina ya kitendo lazima iwe "credit" au "debit".' });
  }

  const updatedWallet = getUserWallet(targetUser.id);
  return res.json({
    message: `Salio la ${targetUser.full_name} limerekebishwa kikamilifu. Salio jipya: TZS ${updatedWallet.balance.toLocaleString()}`,
    wallet: updatedWallet
  });
});

// ==================== PAYMENTS VERIFICATION ====================

// GET /api/admin/payments
adminRouter.get('/payments', (_req: AuthRequest, res: Response): any => {
  const payments = db.prepare(`
    SELECT p.*, u.full_name as user_name, u.email as user_email
    FROM payment_records p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 100
  `).all();

  return res.json(payments);
});

// POST /api/admin/payments/:id/verify: Verify & credit customer wallet
adminRouter.post('/payments/:id/verify', (req: AuthRequest, res: Response): any => {
  const { id } = req.params;
  const payment = db.prepare('SELECT * FROM payment_records WHERE id = ?').get(id) as any;

  if (!payment) {
    return res.status(404).json({ error: 'Rekodi ya malipo haikupatikana.' });
  }

  if (payment.status === 'completed') {
    return res.status(400).json({ error: 'Muamala huu tayari ulishathibitishwa na kukamilika.' });
  }

  // Atomically credit wallet
  creditWalletBalance(
    payment.user_id,
    payment.amount_tzs,
    payment.reference,
    `Malipo ya ${payment.method.toUpperCase()} yamethibitishwa na Msimamizi (Ref: ${payment.reference})`
  );

  const now = Date.now();
  db.prepare(`
    UPDATE payment_records
    SET status = 'completed', notes = 'Yamethibitishwa na Msimamizi Mkuu', updated_at = ?
    WHERE id = ?
  `).run(now, payment.id);

  const updatedPayment = db.prepare('SELECT * FROM payment_records WHERE id = ?').get(id);
  return res.json({ message: 'Malipo yamethibitishwa na salio limeongezwa kwa mteja!', payment: updatedPayment });
});

// ==================== SECRETS & SETTINGS MANAGEMENT ====================

// GET /api/admin/settings: Securely returns settings with masked secrets
adminRouter.get('/settings', (_req: AuthRequest, res: Response): any => {
  const settings = db.prepare('SELECT * FROM settings ORDER BY is_secret DESC, key ASC').all() as any[];

  // Mask secrets before sending to client
  const sanitized = settings.map(s => ({
    key: s.key,
    value: s.is_secret === 1 ? maskSecret(s.value) : s.value,
    is_secret: Boolean(s.is_secret),
    has_value: Boolean(s.value && s.value.trim().length > 0),
    description: s.description,
    updated_at: s.updated_at
  }));

  return res.json(sanitized);
});

// POST /api/admin/settings: Save single setting / secret
adminRouter.post('/settings', (req: AuthRequest, res: Response): any => {
  const { key, value, is_secret, description } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Jina la mpangilio (Key) linahitajika.' });
  }

  const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get(key) as any;
  const now = Date.now();

  let finalValue = value;
  // If value is sent as masked (e.g. •••••••), keep old value
  if (value && value.includes('••••') && existing) {
    finalValue = existing.value;
  }

  const isSec = is_secret ? 1 : (existing ? existing.is_secret : 0);
  const desc = description !== undefined ? description : (existing ? existing.description : '');

  if (existing) {
    db.prepare(`
      UPDATE settings
      SET value = ?, is_secret = ?, description = ?, updated_at = ?
      WHERE key = ?
    `).run(finalValue, isSec, desc, now, key);
  } else {
    db.prepare(`
      INSERT INTO settings (key, value, is_secret, description, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(key, finalValue, isSec, desc, now);
  }

  return res.json({ message: `Mpangilio wa '${key}' umehifadhiwa kikamilifu!` });
});

// POST /api/admin/settings/batch: Save multiple settings at once
adminRouter.post('/settings/batch', (req: AuthRequest, res: Response): any => {
  const { settings } = req.body;
  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'Data ya mipangilio haikupatikana.' });
  }

  const now = Date.now();
  for (const item of settings) {
    if (!item.key) continue;
    const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get(item.key) as any;
    let finalValue = item.value;
    if (finalValue && finalValue.includes('••••') && existing) {
      finalValue = existing.value;
    }

    const isSec = item.is_secret !== undefined ? (item.is_secret ? 1 : 0) : (existing ? existing.is_secret : 0);
    const desc = item.description || (existing ? existing.description : '');

    if (existing) {
      db.prepare(`
        UPDATE settings
        SET value = ?, is_secret = ?, description = ?, updated_at = ?
        WHERE key = ?
      `).run(finalValue, isSec, desc, now, item.key);
    } else {
      db.prepare(`
        INSERT INTO settings (key, value, is_secret, description, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(item.key, finalValue, isSec, desc, now);
    }
  }

  return res.json({ message: 'Mipangilio yote imehifadhiwa kikamilifu!' });
});

// DELETE /api/admin/settings/:key
adminRouter.delete('/settings/:key', (req: AuthRequest, res: Response): any => {
  const { key } = req.params;
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
  return res.json({ message: `Mpangilio '${key}' umefutwa.` });
});

// ==================== SMM PROVIDER ACTIONS ====================

// POST /api/admin/provider/test: Test live connection to SMM Africa
adminRouter.post('/provider/test', async (_req: AuthRequest, res: Response): Promise<any> => {
  const result = await testProviderConnection();
  return res.json(result);
});

// POST /api/admin/provider/sync: Fetch services from SMM Africa
adminRouter.post('/provider/sync', async (_req: AuthRequest, res: Response): Promise<any> => {
  const result = await fetchProviderServices();
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Haikuweza kupata huduma kutoka kwa SMM Africa.' });
  }
  return res.json({ message: `Huduma ${result.services?.length || 0} zimepatikana kutoka SMM Africa.`, services: result.services });
});

// ==================== SUPPORT TICKETS ====================

// GET /api/admin/tickets
adminRouter.get('/tickets', (_req: AuthRequest, res: Response): any => {
  const tickets = db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC').all();
  return res.json(tickets);
});
