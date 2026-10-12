export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin';
  is_verified: number;
  verification_code?: string;
  created_at?: number;
}

export interface Wallet {
  id?: string;
  user_id?: string;
  balance: number;
  currency: string;
  total_deposited: number;
  total_spent: number;
  updated_at?: number;
}

export interface Service {
  id: string;
  category: string;
  platform: string;
  name: string;
  type: string;
  rate_per_1000: number; // in TZS
  min_quantity: number;
  max_quantity: number;
  description: string;
  provider_service_id?: string;
  provider_rate?: number;
  active: number;
  created_at?: number;
}

export interface Order {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  category: string;
  link: string;
  quantity: number;
  charge_tzs: number;
  status: 'pending' | 'processing' | 'in_progress' | 'completed' | 'partial' | 'canceled';
  remains: number;
  provider_order_id?: string | null;
  provider_status?: string | null;
  notes?: string;
  created_at: number;
  updated_at: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'order' | 'refund' | 'adjustment';
  amount_tzs: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: number;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  reference: string;
  gateway: string;
  method: string;
  amount_tzs: number;
  fee_tzs: number;
  phone_number?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  provider_reference?: string;
  notes?: string;
  created_at: number;
  updated_at: number;
  user_name?: string;
  user_email?: string;
}

export interface SupportTicketReply {
  sender: string;
  sender_role: string;
  message: string;
  created_at: number;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  replies_json: string;
  created_at: number;
  updated_at: number;
}

export interface SettingItem {
  key: string;
  value: string;
  is_secret: boolean;
  has_value: boolean;
  description?: string;
  updated_at: number;
}
