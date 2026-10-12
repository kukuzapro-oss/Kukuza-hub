import { db } from './db.ts';

export interface ProviderBalanceResponse {
  balance?: string | number;
  currency?: string;
  error?: string;
}

export interface ProviderServiceItem {
  service: string | number;
  name: string;
  type: string;
  category: string;
  rate: string | number;
  min: string | number;
  max: string | number;
}

export interface ProviderOrderResponse {
  order?: number | string;
  error?: string;
}

export interface ProviderStatusResponse {
  charge?: string | number;
  start_count?: string | number;
  status?: string;
  remains?: string | number;
  currency?: string;
  error?: string;
}

export function getProviderConfig() {
  const urlSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('smm_provider_url') as { value: string } | undefined;
  const keySetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('smm_provider_key') as { value: string } | undefined;

  const url = process.env.SMM_PROVIDER_URL || urlSetting?.value || 'https://smmafrica.com/api/v2';
  const key = process.env.SMM_PROVIDER_KEY || keySetting?.value || '';

  return { url, key, isConfigured: Boolean(key && key.trim().length > 5) };
}

export async function testProviderConnection(): Promise<{
  success: boolean;
  message: string;
  balance?: string | number;
  currency?: string;
  providerUrl: string;
  isConfigured: boolean;
}> {
  const { url, key, isConfigured } = getProviderConfig();

  if (!isConfigured) {
    return {
      success: false,
      message: 'SMM Africa API Key bado haijawekwa kwenye Mipangilio ya Msimamizi (Admin Settings). Tafadhali weka API Key ya SMM Africa ili kuunganisha mfumo.',
      providerUrl: url,
      isConfigured: false
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('key', key.trim());
    params.append('action', 'balance');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'KukuzaPro-Tanzania/1.0'
      },
      body: params.toString(),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        success: false,
        message: `Provider alirejesha hitilafu ya HTTP ${res.status}: ${res.statusText}`,
        providerUrl: url,
        isConfigured: true
      };
    }

    const data: any = await res.json();
    if (data.error) {
      return {
        success: false,
        message: `Hitilafu kutoka SMM Africa: ${data.error}`,
        providerUrl: url,
        isConfigured: true
      };
    }

    return {
      success: true,
      message: `Muunganisho umefanikiwa! Salio la Provider: ${data.currency || '$'} ${data.balance}`,
      balance: data.balance,
      currency: data.currency || 'USD',
      providerUrl: url,
      isConfigured: true
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Muda wa kuunganisha na SMM Africa umezidi (Request Timeout). Angalia mtandao au Provider URL.',
        providerUrl: url,
        isConfigured: true
      };
    }
    return {
      success: false,
      message: `Hitilafu ya kuunganisha: ${err.message || 'Haikuweza kuunganisha na seva ya SMM Africa.'}`,
      providerUrl: url,
      isConfigured: true
    };
  }
}

export async function fetchProviderServices(): Promise<{
  success: boolean;
  services?: ProviderServiceItem[];
  error?: string;
}> {
  const { url, key, isConfigured } = getProviderConfig();
  if (!isConfigured) {
    return { success: false, error: 'SMM Africa API Key haijawekwa kwenye Mipangilio.' };
  }

  try {
    const params = new URLSearchParams();
    params.append('key', key.trim());
    params.append('action', 'services');

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data: any = await res.json();
    if (Array.isArray(data)) {
      return { success: true, services: data };
    } else if (data.error) {
      return { success: false, error: data.error };
    }
    return { success: false, error: 'Mfumo wa data uliopokelewa haukutegemewa kutoka kwa Provider.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Hitilafu ya kupakua huduma kutoka kwa Provider.' };
  }
}

export async function submitOrderToProvider(serviceId: string, link: string, quantity: number): Promise<{
  success: boolean;
  orderId?: string | number;
  error?: string;
}> {
  const { url, key, isConfigured } = getProviderConfig();
  if (!isConfigured) {
    // Return explicit unconfigured state
    return {
      success: false,
      error: 'SMM Africa Provider haijaunganishwa au API Key haipo. Oda itashughulikiwa na foleni ya mfumo (Manual Fulfillment).'
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('key', key.trim());
    params.append('action', 'add');
    params.append('service', serviceId);
    params.append('link', link);
    params.append('quantity', quantity.toString());

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data: any = await res.json();
    if (data.order) {
      return { success: true, orderId: data.order };
    } else if (data.error) {
      return { success: false, error: data.error };
    }
    return { success: false, error: 'Jibu lisilotarajiwa kutoka kwa SMM Africa.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Hitilafu ya mtandao wakati wa kutuma oda kwa Provider.' };
  }
}

export async function fetchProviderOrderStatus(providerOrderId: string): Promise<ProviderStatusResponse | null> {
  const { url, key, isConfigured } = getProviderConfig();
  if (!isConfigured) return null;

  try {
    const params = new URLSearchParams();
    params.append('key', key.trim());
    params.append('action', 'status');
    params.append('order', providerOrderId);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    return await res.json();
  } catch {
    return null;
  }
}
