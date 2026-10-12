import { Router } from 'express';
import type { Response } from 'express';
import crypto from 'node:crypto';
import { db, creditWalletBalance, getUserWallet } from '../db.ts';
import { authenticateUser } from '../auth.ts';
import type { AuthRequest } from '../auth.ts';

export const paymentRouter = Router();

// POST /api/payments/initiate
paymentRouter.post('/initiate', authenticateUser, (req: AuthRequest, res: Response): any => {
  try {
    const { amount, method, phone_number } = req.body;
    const userId = req.user!.id;

    const amountTzs = Number(amount);
    if (!amountTzs || isNaN(amountTzs) || amountTzs < 1000) {
      return res.status(400).json({ error: 'Kiwango cha chini cha kuweka salio ni TZS 1,000.' });
    }

    if (amountTzs > 5000000) {
      return res.status(400).json({ error: 'Kiwango cha juu cha muamala mmoja ni TZS 5,000,000.' });
    }

    const cleanMethod = (method || 'mpesa').toLowerCase();
    const cleanPhone = (phone_number || req.user!.phone || '').trim();

    // Check payment gateway settings
    const selcomKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('selcom_api_key') as { value: string } | undefined;
    const azamSecret = db.prepare('SELECT value FROM settings WHERE key = ?').get('azampay_client_secret') as { value: string } | undefined;
    const mpesaLipa = db.prepare('SELECT value FROM settings WHERE key = ?').get('mpesa_lipa_namba') as { value: string } | undefined;
    const tigoLipa = db.prepare('SELECT value FROM settings WHERE key = ?').get('tigopesa_lipa_namba') as { value: string } | undefined;
    const airtelLipa = db.prepare('SELECT value FROM settings WHERE key = ?').get('airtel_lipa_namba') as { value: string } | undefined;
    const merchantName = db.prepare('SELECT value FROM settings WHERE key = ?').get('lipa_merchant_name') as { value: string } | undefined;

    const hasAutomatedGateway = Boolean((selcomKey && selcomKey.value.length > 5) || (azamSecret && azamSecret.value.length > 5));

    // Unique reference for tracking
    const reference = `KP-TZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = 'pay_' + crypto.randomUUID();
    const now = Date.now();

    let lipaNumber = mpesaLipa?.value || '5566778';
    if (cleanMethod === 'tigopesa') lipaNumber = tigoLipa?.value || '8899001';
    else if (cleanMethod === 'airtel') lipaNumber = airtelLipa?.value || '3344552';

    db.prepare(`
      INSERT INTO payment_records (
        id, user_id, reference, gateway, method, amount_tzs, fee_tzs, phone_number,
        status, provider_reference, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?, ?, ?)
    `).run(
      paymentId,
      userId,
      reference,
      hasAutomatedGateway ? 'automated_gateway' : 'mobile_money_direct',
      cleanMethod,
      amountTzs,
      0,
      cleanPhone,
      `Maombi ya kuweka salio TZS ${amountTzs.toLocaleString()} kupitia ${cleanMethod.toUpperCase()}`,
      now,
      now
    );

    const paymentRecord = db.prepare('SELECT * FROM payment_records WHERE id = ?').get(paymentId);

    return res.status(201).json({
      message: 'Ombi la malipo limeundwa.',
      payment: paymentRecord,
      reference,
      is_automated_gateway_configured: hasAutomatedGateway,
      manual_instructions: {
        method: cleanMethod,
        phone_number: cleanPhone,
        amount_tzs: amountTzs,
        merchant_name: merchantName?.value || 'KUKUZA PRO MARKETING TZ',
        lipa_number: lipaNumber,
        reference_code: reference,
        steps: [
          `Fungua menyu ya mtandao wako (${cleanMethod.toUpperCase()}) kwenye simu.`,
          `Chagua 'Lipa kwa Simu' au 'Lipa Hapa'.`,
          `Ingiza Nambari ya Lipa: ${lipaNumber} (Jina: ${merchantName?.value || 'KUKUZA PRO MARKETING TZ'}).`,
          `Ingiza Kiasi: TZS ${amountTzs.toLocaleString()}.`,
          `Kwenye Kumbukumbu / Reference weka: ${reference}`,
          `Ingiza PIN yako kuthibitisha. Baada ya kupokea ujumbe wa SMS, ingiza nambari ya muamala chini kuthibitisha.`
        ]
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Hitilafu ya kuanzisha malipo: ' + err.message });
  }
});

// POST /api/payments/submit-sms-ref: User enters the transaction ID from their SMS receipt
paymentRouter.post('/submit-sms-ref', authenticateUser, (req: AuthRequest, res: Response): any => {
  const { reference, sms_transaction_id } = req.body;
  const userId = req.user!.id;

  if (!reference || !sms_transaction_id) {
    return res.status(400).json({ error: 'Tafadhali weka reference ya oda na nambari ya muamala ya SMS (Transaction ID).' });
  }

  const cleanTxId = sms_transaction_id.trim().toUpperCase();
  const payment = db.prepare('SELECT * FROM payment_records WHERE reference = ? AND user_id = ?').get(reference, userId) as any;

  if (!payment) {
    return res.status(404).json({ error: 'Kumbukumbu ya malipo haikupatikana.' });
  }

  if (payment.status === 'completed') {
    return res.status(400).json({ error: 'Muamala huu tayari umekamilika na salio limeshaongezwa.' });
  }

  // Check if this SMS transaction ID has already been used on any other payment
  const duplicate = db.prepare('SELECT id FROM payment_records WHERE provider_reference = ? AND id != ?').get(cleanTxId, payment.id);
  if (duplicate) {
    return res.status(400).json({ error: 'Nambari hii ya muamala (Transaction ID) tayari imeshatumika kwenye mfumo.' });
  }

  const now = Date.now();
  db.prepare(`
    UPDATE payment_records
    SET provider_reference = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(
    cleanTxId,
    `Mteja amewasilisha nambari ya muamala: ${cleanTxId}. Inasubiri uthibitisho wa mtandao/msimamizi.`,
    now,
    payment.id
  );

  return res.json({
    message: `Taarifa ya muamala (${cleanTxId}) imepokewa. Salio litathibitishwa mara moja ukaguzi utakapokamilika.`,
    payment: db.prepare('SELECT * FROM payment_records WHERE id = ?').get(payment.id)
  });
});

// GET /api/payments/verify/:reference: Check payment status
paymentRouter.get('/verify/:reference', authenticateUser, (req: AuthRequest, res: Response): any => {
  const { reference } = req.params;
  const userId = req.user!.id;

  const payment = db.prepare('SELECT * FROM payment_records WHERE reference = ? AND user_id = ?').get(reference, userId);
  if (!payment) {
    return res.status(404).json({ error: 'Muamala haukupatikana.' });
  }

  const wallet = getUserWallet(userId);
  return res.json({ payment, wallet });
});

// GET /api/payments/history: Get user's payment records and transactions
paymentRouter.get('/history', authenticateUser, (req: AuthRequest, res: Response): any => {
  const userId = req.user!.id;

  const payments = db.prepare(`
    SELECT * FROM payment_records
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(userId);

  const transactions = db.prepare(`
    SELECT * FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(userId);

  return res.json({ payments, transactions });
});

// POST /api/payments/webhook: Authenticated server-side webhook for automated payment gateways
paymentRouter.post('/webhook', (req, res): any => {
  try {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-selcom-signature'] || req.headers['authorization'];
    const secretSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('webhook_secret') as { value: string } | undefined;
    const webhookSecret = secretSetting?.value;

    // Verify webhook signature/token if configured
    if (webhookSecret && webhookSecret.length > 5) {
      if (!signature || (typeof signature === 'string' && !signature.includes(webhookSecret))) {
        return res.status(401).json({ error: 'Sahihi ya webhook si sahihi (Unauthorized webhook).' });
      }
    }

    const { reference, provider_reference, status, amount } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference ya malipo inahitajika.' });
    }

    const payment = db.prepare('SELECT * FROM payment_records WHERE reference = ?').get(reference) as any;
    if (!payment) {
      return res.status(404).json({ error: 'Rekodi ya malipo haikupatikana.' });
    }

    if (payment.status === 'completed') {
      return res.json({ message: 'Muamala huu ulikwishathibitishwa tayari.' });
    }

    if (status === 'SUCCESS' || status === 'completed' || status === 'COMPLETED') {
      const now = Date.now();
      // Atomically credit wallet
      creditWalletBalance(
        payment.user_id,
        payment.amount_tzs,
        payment.reference,
        `Kuweka Salio kupitia ${payment.method.toUpperCase()} (Ref: ${payment.reference})`
      );

      db.prepare(`
        UPDATE payment_records
        SET status = 'completed', provider_reference = ?, notes = 'Malipo yamethibitishwa na kukamilishwa kupitia Webhook', updated_at = ?
        WHERE id = ?
      `).run(provider_reference || payment.reference, now, payment.id);

      return res.json({ success: true, message: 'Malipo yamethibitishwa na salio limeongezwa!' });
    } else if (status === 'FAILED' || status === 'failed') {
      const now = Date.now();
      db.prepare(`
        UPDATE payment_records
        SET status = 'failed', notes = 'Malipo yameshindikana kupitia mtandao wa simu.', updated_at = ?
        WHERE id = ?
      `).run(now, payment.id);
      return res.json({ success: true, message: 'Hali ya muamala imebadilishwa kuwa failed.' });
    }

    return res.json({ received: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Hitilafu ya webhook: ' + err.message });
  }
});
