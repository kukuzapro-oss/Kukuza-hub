import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'kukuza.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency & robustness
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_verified INTEGER DEFAULT 0,
      verification_code TEXT,
      reset_token TEXT,
      reset_token_expires INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Wallets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      balance REAL NOT NULL DEFAULT 0.0,
      currency TEXT NOT NULL DEFAULT 'TZS',
      total_deposited REAL NOT NULL DEFAULT 0.0,
      total_spent REAL NOT NULL DEFAULT 0.0,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      platform TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Default',
      rate_per_1000 REAL NOT NULL,
      min_quantity INTEGER NOT NULL,
      max_quantity INTEGER NOT NULL,
      description TEXT,
      provider_service_id TEXT,
      provider_rate REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    );
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      category TEXT NOT NULL,
      link TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      charge_tzs REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      remains INTEGER DEFAULT 0,
      provider_order_id TEXT,
      provider_status TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount_tzs REAL NOT NULL,
      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,
      reference TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Payment records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      gateway TEXT NOT NULL,
      method TEXT NOT NULL,
      amount_tzs REAL NOT NULL,
      fee_tzs REAL DEFAULT 0,
      phone_number TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      provider_reference TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Settings table for admin configurations
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      is_secret INTEGER DEFAULT 0,
      description TEXT,
      updated_at INTEGER NOT NULL
    );
  `);

  // Support tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      replies_json TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  seedInitialData();
}

// Seed default settings and realistic Tanzanian SMM services
function seedInitialData() {
  const now = Date.now();

  // Seed default platform settings
  const defaultSettings = [
    { key: 'support_phone', value: '0660771226', is_secret: 0, description: 'Nambari ya Simu na WhatsApp ya Msaada' },
    { key: 'support_email', value: 'kukuzapro@gmail.com', is_secret: 0, description: 'Barua Pepe ya Huduma kwa Wateja' },
    { key: 'support_hours', value: '24/7', is_secret: 0, description: 'Muda wa Kutoa Huduma' },
    { key: 'smm_provider_url', value: 'https://smmafrica.com/api/v2', is_secret: 0, description: 'SMM Africa API Endpoint URL' },
    { key: 'smm_provider_key', value: '', is_secret: 1, description: 'SMM Africa API Key' },
    { key: 'azampay_app_name', value: '', is_secret: 0, description: 'AzamPay App Name' },
    { key: 'azampay_client_id', value: '', is_secret: 1, description: 'AzamPay Client ID' },
    { key: 'azampay_client_secret', value: '', is_secret: 1, description: 'AzamPay Client Secret' },
    { key: 'selcom_vendor_id', value: '', is_secret: 0, description: 'Selcom Pay Vendor ID' },
    { key: 'selcom_api_key', value: '', is_secret: 1, description: 'Selcom API Key' },
    { key: 'selcom_api_secret', value: '', is_secret: 1, description: 'Selcom API Secret' },
    { key: 'mpesa_lipa_namba', value: '5566778', is_secret: 0, description: 'Vodacom M-Pesa Lipa Namba (Merchant ID)' },
    { key: 'tigopesa_lipa_namba', value: '8899001', is_secret: 0, description: 'Tigo Pesa Lipa Namba' },
    { key: 'airtel_lipa_namba', value: '3344552', is_secret: 0, description: 'Airtel Money Lipa Namba' },
    { key: 'halopesa_lipa_namba', value: '1122334', is_secret: 0, description: 'Halopesa Lipa Namba' },
    { key: 'lipa_merchant_name', value: 'KUKUZA PRO MARKETING TZ', is_secret: 0, description: 'Jina Linalotokea Kwenye Lipa Namba' },
    { key: 'min_deposit_amount_tzs', value: '1000', is_secret: 0, description: 'Kiwango cha Chini cha Kuweka Salio (TZS)' },
    { key: 'max_deposit_amount_tzs', value: '5000000', is_secret: 0, description: 'Kiwango cha Juu cha Kuweka Salio (TZS)' },
    { key: 'webhook_secret', value: crypto.randomBytes(24).toString('hex'), is_secret: 1, description: 'Siri ya Kuthibitisha Webhook (Payment Signature)' }
  ];

  const checkSetting = db.prepare('SELECT key FROM settings WHERE key = ?');
  const insertSetting = db.prepare(`
    INSERT INTO settings (key, value, is_secret, description, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const s of defaultSettings) {
    const existing = checkSetting.get(s.key);
    if (!existing) {
      insertSetting.run(s.key, s.value, s.is_secret, s.description, now);
    }
  }

  // Seed default Tanzanian SMM services if table empty
  const countServices = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (countServices.count === 0) {
    const defaultServices = [
      // Instagram
      {
        id: 'srv_ig_fol_01',
        category: 'Instagram',
        platform: 'Instagram',
        name: 'Instagram Followers (East Africa & Tanzania Active Profiles) [30 Days Refill]',
        type: 'Default',
        rate_per_1000: 7500,
        min_quantity: 50,
        max_quantity: 50000,
        description: 'Wafuasi halisi wa Afrika Mashariki na Tanzania. Ubora wa juu, kasi: 1K - 5K kwa siku. Guarantee ya refill siku 30.',
        provider_service_id: '101',
        provider_rate: 4500,
        active: 1
      },
      {
        id: 'srv_ig_fol_hq',
        category: 'Instagram',
        platform: 'Instagram',
        name: 'Instagram Followers (High Quality Real HQ - Instant Speed) [Lifetime Guarantee]',
        type: 'Default',
        rate_per_1000: 9800,
        min_quantity: 100,
        max_quantity: 100000,
        description: 'Wafuasi bora zaidi kwa brand na biashara. Hakuna kushuka (No Drop Lifetime). Kuanza ndani ya dakika 5-15.',
        provider_service_id: '102',
        provider_rate: 6000,
        active: 1
      },
      {
        id: 'srv_ig_like_01',
        category: 'Instagram',
        platform: 'Instagram',
        name: 'Instagram Post Likes (Super Fast + Organic Engagement Boost)',
        type: 'Default',
        rate_per_1000: 2200,
        min_quantity: 50,
        max_quantity: 100000,
        description: 'Likes za picha na video. Husaidia post kuingia kwenye Explore Page. Kuanza mara moja.',
        provider_service_id: '103',
        provider_rate: 1200,
        active: 1
      },
      {
        id: 'srv_ig_views_01',
        category: 'Instagram',
        platform: 'Instagram',
        name: 'Instagram Reels & Video Views (Ultra Fast Viral Speed)',
        type: 'Default',
        rate_per_1000: 1200,
        min_quantity: 100,
        max_quantity: 1000000,
        description: 'Views za Reels na Video. Kasi kubwa sana ya hadi 500K kwa siku. Ongeza reach ya video yako.',
        provider_service_id: '104',
        provider_rate: 600,
        active: 1
      },
      {
        id: 'srv_ig_comm_01',
        category: 'Instagram',
        platform: 'Instagram',
        name: 'Instagram Custom Comments (Swahili & English Natural Positive)',
        type: 'Custom Comments',
        rate_per_1000: 28000,
        min_quantity: 10,
        max_quantity: 5000,
        description: 'Maoni mazuri ya Kiswahili na Kiingereza kutoka kwa akaunti halisi zenye picha na posts.',
        provider_service_id: '105',
        provider_rate: 18000,
        active: 1
      },

      // TikTok
      {
        id: 'srv_tt_fol_01',
        category: 'TikTok',
        platform: 'TikTok',
        name: 'TikTok Followers (East Africa & Global Real) [Stable & Non-Drop]',
        type: 'Default',
        rate_per_1000: 8900,
        min_quantity: 100,
        max_quantity: 50000,
        description: 'Wafuasi halisi wa TikTok kwa ajili ya kufungua Live Stream (1K Followers requirement) na kukuza akaunti.',
        provider_service_id: '201',
        provider_rate: 5500,
        active: 1
      },
      {
        id: 'srv_tt_likes_01',
        category: 'TikTok',
        platform: 'TikTok',
        name: 'TikTok Video Likes (Instant Delivery - High Quality)',
        type: 'Default',
        rate_per_1000: 3200,
        min_quantity: 50,
        max_quantity: 200000,
        description: 'Likes za video za TikTok. Kuanza ndani ya sekunde 60, husukuma video kwenye For You Page (FYP).',
        provider_service_id: '202',
        provider_rate: 1800,
        active: 1
      },
      {
        id: 'srv_tt_views_01',
        category: 'TikTok',
        platform: 'TikTok',
        name: 'TikTok Video Views (Viral Booster FYP Optimization)',
        type: 'Default',
        rate_per_1000: 850,
        min_quantity: 500,
        max_quantity: 5000000,
        description: 'Views za TikTok zenye kasi kubwa sana. Weka link ya video pekee. Kasi: 1M kwa saa.',
        provider_service_id: '203',
        provider_rate: 400,
        active: 1
      },
      {
        id: 'srv_tt_shares_01',
        category: 'TikTok',
        platform: 'TikTok',
        name: 'TikTok Shares & Saves (Algorithmic Multiplier)',
        type: 'Default',
        rate_per_1000: 1900,
        min_quantity: 100,
        max_quantity: 100000,
        description: 'Kushare na ku-save video ili kanuni ya TikTok itambue maudhui kama yenye mvuto mkubwa.',
        provider_service_id: '204',
        provider_rate: 900,
        active: 1
      },

      // YouTube
      {
        id: 'srv_yt_sub_01',
        category: 'YouTube',
        platform: 'YouTube',
        name: 'YouTube Subscribers (Organic High Retention - Non Drop) [30 Days Refill]',
        type: 'Default',
        rate_per_1000: 36000,
        min_quantity: 50,
        max_quantity: 10000,
        description: 'Subscribers salama kwa ajili ya kufikisha vigezo vya YouTube Partner Program (Monetization 1,000 Subs).',
        provider_service_id: '301',
        provider_rate: 24000,
        active: 1
      },
      {
        id: 'srv_yt_views_01',
        category: 'YouTube',
        platform: 'YouTube',
        name: 'YouTube Views (Monetizable & High Watch Time - Non Drop)',
        type: 'Default',
        rate_per_1000: 6800,
        min_quantity: 500,
        max_quantity: 500000,
        description: 'Tazama za video zenye retention kubwa. Salama kabisa kwa akaunti zenye Adsense.',
        provider_service_id: '302',
        provider_rate: 4200,
        active: 1
      },
      {
        id: 'srv_yt_watch_01',
        category: 'YouTube',
        platform: 'YouTube',
        name: 'YouTube 4,000 Watch Hours Package (Full Channel Monetization)',
        type: 'Package',
        rate_per_1000: 48000,
        min_quantity: 500,
        max_quantity: 4000,
        description: 'Masaa ya kutazama kwa ajili ya kufanikisha 4,000 Hours za Monetization. Video inapaswa kuwa na urefu wa dakika 60+.',
        provider_service_id: '303',
        provider_rate: 32000,
        active: 1
      },

      // Facebook
      {
        id: 'srv_fb_page_01',
        category: 'Facebook',
        platform: 'Facebook',
        name: 'Facebook Page Likes & Followers (Tanzania & Africa Reach)',
        type: 'Default',
        rate_per_1000: 11500,
        min_quantity: 100,
        max_quantity: 50000,
        description: 'Kuongeza wafuasi na likes kwenye Page yako ya Facebook. Inasaidia kukuza uaminifu kwa wateja.',
        provider_service_id: '401',
        provider_rate: 7500,
        active: 1
      },
      {
        id: 'srv_fb_post_01',
        category: 'Facebook',
        platform: 'Facebook',
        name: 'Facebook Post Likes & Reactions (Love / Care / Haha / Wow)',
        type: 'Default',
        rate_per_1000: 3400,
        min_quantity: 50,
        max_quantity: 20000,
        description: 'Reactions za post za picha, video au maelezo. Kasi ya haraka na salama.',
        provider_service_id: '402',
        provider_rate: 2000,
        active: 1
      },

      // Twitter / X
      {
        id: 'srv_tw_fol_01',
        category: 'Twitter/X',
        platform: 'Twitter/X',
        name: 'Twitter / X Followers (Active & High Retention)',
        type: 'Default',
        rate_per_1000: 14500,
        min_quantity: 100,
        max_quantity: 25000,
        description: 'Wafuasi wa Twitter/X kukuza influence na hadhi ya akaunti yako.',
        provider_service_id: '501',
        provider_rate: 9500,
        active: 1
      },

      // Telegram & WhatsApp
      {
        id: 'srv_tg_mem_01',
        category: 'Telegram',
        platform: 'Telegram',
        name: 'Telegram Channel & Group Members (Non Drop)',
        type: 'Default',
        rate_per_1000: 6800,
        min_quantity: 100,
        max_quantity: 100000,
        description: 'Wanachama wa Telegram channel au group. Weka link ya umma (public link) ya channel.',
        provider_service_id: '601',
        provider_rate: 4200,
        active: 1
      },
      {
        id: 'srv_wa_chan_01',
        category: 'WhatsApp',
        platform: 'WhatsApp',
        name: 'WhatsApp Channel Followers (High Quality Real Users)',
        type: 'Default',
        rate_per_1000: 16500,
        min_quantity: 100,
        max_quantity: 20000,
        description: 'Wafuasi wa WhatsApp Channel yako mpya ili kukuza hadhi na ushawishi wa taarifa zako.',
        provider_service_id: '701',
        provider_rate: 11000,
        active: 1
      }
    ];

    const insertService = db.prepare(`
      INSERT INTO services (id, category, platform, name, type, rate_per_1000, min_quantity, max_quantity, description, provider_service_id, provider_rate, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of defaultServices) {
      insertService.run(
        s.id,
        s.category,
        s.platform,
        s.name,
        s.type,
        s.rate_per_1000,
        s.min_quantity,
        s.max_quantity,
        s.description,
        s.provider_service_id,
        s.provider_rate,
        s.active,
        now
      );
    }
  }
}

// Atomic Wallet Operations
export function getUserWallet(userId: string) {
  let wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId) as any;
  if (!wallet) {
    const id = 'wal_' + crypto.randomUUID();
    const now = Date.now();
    db.prepare(`
      INSERT INTO wallets (id, user_id, balance, currency, total_deposited, total_spent, updated_at)
      VALUES (?, ?, 0.0, 'TZS', 0.0, 0.0, ?)
    `).run(id, userId, now);
    wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
  }
  return wallet;
}

export function deductWalletBalance(userId: string, amount: number, reference: string, description: string) {
  if (amount <= 0) {
    throw new Error('Kiasi cha oda lazima kiwe zaidi ya 0 TZS.');
  }

  // Atomic transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId) as any;
    if (!wallet || wallet.balance < amount) {
      throw new Error(`Salio lako halitoshi. Una TZS ${(wallet?.balance || 0).toLocaleString()} lakini oda inahitaji TZS ${amount.toLocaleString()}. Tafadhali weka salio kwanza.`);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;
    const now = Date.now();

    db.prepare(`
      UPDATE wallets
      SET balance = ?, total_spent = total_spent + ?, updated_at = ?
      WHERE user_id = ?
    `).run(balanceAfter, amount, now, userId);

    const txId = 'tx_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount_tzs, balance_before, balance_after, reference, description, status, created_at)
      VALUES (?, ?, 'order', ?, ?, ?, ?, ?, 'completed', ?)
    `).run(txId, userId, amount, balanceBefore, balanceAfter, reference, description, now);

    db.exec('COMMIT;');
    return { success: true, balanceAfter, transactionId: txId };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function creditWalletBalance(userId: string, amount: number, reference: string, description: string) {
  if (amount <= 0) {
    throw new Error('Kiasi cha kuongeza lazima kiwe zaidi ya 0 TZS.');
  }

  // Prevent duplicate credit for the same payment reference
  db.exec('BEGIN TRANSACTION;');
  try {
    const existingTx = db.prepare("SELECT id FROM transactions WHERE reference = ? AND type = 'deposit'").get(reference);
    if (existingTx) {
      throw new Error(`Muamala huu (${reference}) tayari ulishaongezwa kwenye akaunti.`);
    }

    let wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId) as any;
    if (!wallet) {
      const walId = 'wal_' + crypto.randomUUID();
      const now = Date.now();
      db.prepare(`
        INSERT INTO wallets (id, user_id, balance, currency, total_deposited, total_spent, updated_at)
        VALUES (?, ?, 0.0, 'TZS', 0.0, 0.0, ?)
      `).run(walId, userId, now);
      wallet = { balance: 0.0 };
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;
    const now = Date.now();

    db.prepare(`
      UPDATE wallets
      SET balance = ?, total_deposited = total_deposited + ?, updated_at = ?
      WHERE user_id = ?
    `).run(balanceAfter, amount, now, userId);

    const txId = 'tx_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount_tzs, balance_before, balance_after, reference, description, status, created_at)
      VALUES (?, ?, 'deposit', ?, ?, ?, ?, ?, 'completed', ?)
    `).run(txId, userId, amount, balanceBefore, balanceAfter, reference, description, now);

    db.exec('COMMIT;');
    return { success: true, balanceAfter, transactionId: txId };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function refundWalletBalance(userId: string, amount: number, reference: string, description: string) {
  if (amount <= 0) return;

  db.exec('BEGIN TRANSACTION;');
  try {
    const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId) as any;
    const balanceBefore = wallet ? wallet.balance : 0;
    const balanceAfter = balanceBefore + amount;
    const now = Date.now();

    db.prepare(`
      UPDATE wallets
      SET balance = ?, total_spent = MAX(0, total_spent - ?), updated_at = ?
      WHERE user_id = ?
    `).run(balanceAfter, amount, now, userId);

    const txId = 'tx_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount_tzs, balance_before, balance_after, reference, description, status, created_at)
      VALUES (?, ?, 'refund', ?, ?, ?, ?, ?, 'completed', ?)
    `).run(txId, userId, amount, balanceBefore, balanceAfter, reference, description, now);

    db.exec('COMMIT;');
    return { success: true, balanceAfter, transactionId: txId };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
