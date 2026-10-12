import { Router } from 'express';
import type { Response } from 'express';
import crypto from 'node:crypto';
import { db, deductWalletBalance, getUserWallet } from '../db.ts';
import { authenticateUser } from '../auth.ts';
import type { AuthRequest } from '../auth.ts';
import { submitOrderToProvider, fetchProviderOrderStatus } from '../smmProvider.ts';

export const orderRouter = Router();

// Apply auth to all order routes
orderRouter.use(authenticateUser);

// POST /api/orders: Place a new order
orderRouter.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { service_id, link, quantity } = req.body;
    const userId = req.user!.id;

    if (!service_id || !link || !quantity) {
      return res.status(400).json({ error: 'Tafadhali jaza huduma, link na idadi (quantity).' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Idadi (Quantity) lazima iwe nambari halisi zaidi ya 0.' });
    }

    // URL validation
    const trimmedLink = link.trim();
    if (!trimmedLink.startsWith('http://') && !trimmedLink.startsWith('https://') && !trimmedLink.startsWith('@')) {
      return res.status(400).json({ error: 'Tafadhali weka link sahihi ya akaunti au post (mfano: https://instagram.com/jina au https://tiktok.com/@jina/video/...).' });
    }

    // Fetch service
    const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(service_id) as any;
    if (!service) {
      return res.status(404).json({ error: 'Huduma uliyochagua haipatikani au imezimwa.' });
    }

    if (qty < service.min_quantity) {
      return res.status(400).json({
        error: `Kiwango cha chini cha huduma hii ni ${service.min_quantity.toLocaleString()}. Umeingiza ${qty.toLocaleString()}.`
      });
    }

    if (qty > service.max_quantity) {
      return res.status(400).json({
        error: `Kiwango cha juu cha huduma hii ni ${service.max_quantity.toLocaleString()}. Umeingiza ${qty.toLocaleString()}.`
      });
    }

    // Calculate TZS charge
    const chargeTzs = Math.round((qty / 1000) * service.rate_per_1000);

    const orderId = 'ord_' + crypto.randomUUID();
    const now = Date.now();
    const orderRef = `KP-ORD-${Date.now().toString().slice(-6)}`;

    // 1. Atomically deduct wallet balance
    const deduction = deductWalletBalance(
      userId,
      chargeTzs,
      orderRef,
      `Oda ya ${service.name} (Idadi: ${qty.toLocaleString()})`
    );

    let initialStatus = 'pending';
    let providerOrderId: string | null = null;
    let providerStatusText = 'Waiting fulfillment';
    let notes = `Oda imepokelewa na kusubiri kutekelezwa. Gharama: TZS ${chargeTzs.toLocaleString()}.`;

    // 2. Dispatch to SMM Provider if configured
    if (service.provider_service_id) {
      try {
        const providerResult = await submitOrderToProvider(service.provider_service_id, trimmedLink, qty);
        if (providerResult.success && providerResult.orderId) {
          providerOrderId = providerResult.orderId.toString();
          initialStatus = 'in_progress';
          providerStatusText = 'Dispatched to SMM Africa Provider';
          notes += ` Imetumwa kwa Provider (SMM Africa ID: ${providerOrderId}).`;
        } else if (providerResult.error) {
          notes += ` Taarifa ya Provider: ${providerResult.error}`;
        }
      } catch (err: any) {
        notes += ` Seva haikuweza kuwasiliana na Provider mara moja (${err.message}). Msimamizi atathibitisha.`;
      }
    }

    // 3. Insert order record
    db.prepare(`
      INSERT INTO orders (
        id, user_id, service_id, service_name, category, link, quantity, charge_tzs,
        status, remains, provider_order_id, provider_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      userId,
      service.id,
      service.name,
      service.category,
      trimmedLink,
      qty,
      chargeTzs,
      initialStatus,
      qty,
      providerOrderId,
      providerStatusText,
      notes,
      now,
      now
    );

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const updatedWallet = getUserWallet(userId);

    return res.status(201).json({
      message: 'Oda yako imepokewa kikamilifu na inafanyiwa kazi!',
      order: createdOrder,
      wallet: updatedWallet
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Haikuweza kutengeneza oda.' });
  }
});

// GET /api/orders: Get authenticated user's orders
orderRouter.get('/', (req: AuthRequest, res: Response): any => {
  const userId = req.user!.id;
  const { status, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT * FROM orders WHERE user_id = ?';
  const params: any[] = [userId];

  if (status && typeof status === 'string' && status !== 'all') {
    if (status === 'active') {
      query += " AND status IN ('pending', 'processing', 'in_progress', 'partial')";
    } else {
      query += ' AND status = ?';
      params.push(status);
    }
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const orders = db.prepare(query).all(...params);

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_orders,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
      SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled_orders,
      SUM(charge_tzs) as total_spent
    FROM orders
    WHERE user_id = ?
  `).get(userId);

  return res.json({ orders, stats });
});

// GET /api/orders/:id: Get single order with optional provider status check
orderRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user!.id;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, userId) as any;

  if (!order) {
    return res.status(404).json({ error: 'Oda haikupatikana.' });
  }

  // Check live status if order has provider_order_id and is not yet completed/canceled
  if (order.provider_order_id && ['pending', 'in_progress'].includes(order.status)) {
    try {
      const providerData = await fetchProviderOrderStatus(order.provider_order_id);
      if (providerData && providerData.status) {
        const rawStatus = providerData.status.toLowerCase();
        let newStatus = order.status;

        if (rawStatus === 'completed') newStatus = 'completed';
        else if (rawStatus === 'processing' || rawStatus === 'in progress') newStatus = 'in_progress';
        else if (rawStatus === 'canceled' || rawStatus === 'cancelled') newStatus = 'canceled';
        else if (rawStatus === 'partial') newStatus = 'partial';

        const remains = providerData.remains !== undefined ? Number(providerData.remains) : order.remains;
        const now = Date.now();

        db.prepare(`
          UPDATE orders
          SET status = ?, remains = ?, provider_status = ?, updated_at = ?
          WHERE id = ?
        `).run(newStatus, remains, providerData.status, now, order.id);

        order.status = newStatus;
        order.remains = remains;
        order.provider_status = providerData.status;
      }
    } catch {
      // Ignore provider fetch errors during read
    }
  }

  return res.json(order);
});
