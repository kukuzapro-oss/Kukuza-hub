import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  Settings,
  Key,
  PlusCircle,
  Edit2,
  Trash2,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Lock,
  Eye,
  EyeOff,
  Percent,
  MessageSquare,
  Bot,
  Zap
} from 'lucide-react';
import { Service, Order, SettingItem, SupportTicket } from '../types/index.ts';
import { api } from '../lib/api.ts';

export const AdminView: React.FC = () => {
  const { user, isAdmin, claimAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'orders' | 'users' | 'payments' | 'secrets' | 'tickets'>('overview');

  const [overview, setOverview] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settingsList, setSettingsList] = useState<SettingItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Service Edit / Create Modal State
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [bulkMarkupPercent, setBulkMarkupPercent] = useState<number | string>(10);

  // User Balance Adjustment Modal
  const [adjustingUser, setAdjustingUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number | string>('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Add Secret Modal
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [newSecretDesc, setNewSecretDesc] = useState('');
  const [showAddSecretModal, setShowAddSecretModal] = useState(false);

  // SMM Provider Test
  const [testingProvider, setTestingProvider] = useState(false);
  const [providerTestResult, setProviderTestResult] = useState<any | null>(null);
  const [syncingServices, setSyncingServices] = useState(false);

  // Ticket reply modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  const fetchOverview = async () => {
    try {
      const data = await api.get('/api/admin/overview');
      setOverview(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await api.get<Service[]>('/api/admin/services');
      setServices(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await api.get('/api/admin/orders');
      setOrders(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get('/api/admin/users');
      setUsersList(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await api.get('/api/admin/payments');
      setPayments(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await api.get<SettingItem[]>('/api/admin/settings');
      setSettingsList(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await api.get<SupportTicket[]>('/api/admin/tickets');
      setTickets(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      Promise.all([
        fetchOverview(),
        fetchServices(),
        fetchOrders(),
        fetchUsers(),
        fetchPayments(),
        fetchSettings(),
        fetchTickets(),
      ]).finally(() => setLoading(false));
    }
  }, [isAdmin, activeTab]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Ukurasa Haupatikani (404)</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Samahani, ukurasa unaojaribu kuufungua haupatikani au hauna ruhusa ya kuutazama.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Rudi Nyumbani (Home)
          </a>
        </div>
      </div>
    );
  }

  // Handle Service Save
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      if (editingService.id) {
        await api.put(`/api/admin/services/${editingService.id}`, editingService);
        setStatusMessage({ type: 'success', text: 'Huduma imesasishwa kikamilifu!' });
      } else {
        await api.post('/api/admin/services', editingService);
        setStatusMessage({ type: 'success', text: 'Huduma mpya imeongezwa kikamilifu!' });
      }
      setEditingService(null);
      fetchServices();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Hitilafu ya kuhifadhi huduma.' });
    }
  };

  // Toggle service active
  const handleToggleService = async (id: string) => {
    try {
      const res = await api.patch(`/api/admin/services/${id}/toggle`);
      setStatusMessage({ type: 'success', text: res.message });
      fetchServices();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Delete service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Je, una uhakika unataka kufuta huduma hii?')) return;
    try {
      await api.delete(`/api/admin/services/${id}`);
      setStatusMessage({ type: 'success', text: 'Huduma imefutwa.' });
      fetchServices();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Bulk price markup
  const handleBulkMarkup = async () => {
    const p = Number(bulkMarkupPercent);
    if (isNaN(p) || p === 0) return;
    if (!confirm(`Je, una uhakika unataka kubadilisha bei zote kwa ${p}%?`)) return;

    try {
      const res = await api.post('/api/admin/services/bulk-markup', { percentage: p });
      setStatusMessage({ type: 'success', text: res.message });
      fetchServices();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Update order status with optional refund
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, refund: boolean = false) => {
    try {
      const res = await api.patch(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
        refund_user: refund,
        reason: 'Marekebisho ya Msimamizi Mkuu',
      });
      setStatusMessage({ type: 'success', text: res.message });
      fetchOrders();
      fetchOverview();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Dispatch order to SMM provider manually
  const handleDispatchProvider = async (orderId: string) => {
    try {
      const res = await api.post(`/api/admin/orders/${orderId}/dispatch-provider`);
      setStatusMessage({ type: 'success', text: res.message });
      fetchOrders();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Verify Payment
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await api.post(`/api/admin/payments/${paymentId}/verify`);
      setStatusMessage({ type: 'success', text: res.message });
      fetchPayments();
      fetchOverview();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Adjust User Balance
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || !adjustAmount) return;

    try {
      const res = await api.post(`/api/admin/users/${adjustingUser.id}/adjust-balance`, {
        amount_tzs: Number(adjustAmount),
        action_type: adjustType,
        reason: adjustReason,
      });

      setStatusMessage({ type: 'success', text: res.message });
      setAdjustingUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
      fetchOverview();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Save Setting / Secret
  const handleSaveSetting = async (key: string, value: string, isSecret: boolean, desc?: string) => {
    try {
      const res = await api.post('/api/admin/settings', {
        key,
        value,
        is_secret: isSecret,
        description: desc,
      });
      setStatusMessage({ type: 'success', text: res.message });
      fetchSettings();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Add custom secret
  const handleAddCustomSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretKey.trim()) return;

    try {
      await api.post('/api/admin/settings', {
        key: newSecretKey.trim().toLowerCase().replace(/\s+/g, '_'),
        value: newSecretValue,
        is_secret: 1,
        description: newSecretDesc || 'Siri ya mfumo',
      });

      setStatusMessage({ type: 'success', text: `Siri ya '${newSecretKey}' imehifadhiwa salama!` });
      setNewSecretKey('');
      setNewSecretValue('');
      setNewSecretDesc('');
      setShowAddSecretModal(false);
      fetchSettings();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Delete secret
  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Je, una uhakika unataka kufuta mpangilio wa '${key}'?`)) return;
    try {
      await api.delete(`/api/admin/settings/${key}`);
      setStatusMessage({ type: 'success', text: `Mpangilio '${key}' umefutwa.` });
      fetchSettings();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  // Test SMM Africa Provider Connection
  const handleTestProvider = async () => {
    setTestingProvider(true);
    setProviderTestResult(null);
    try {
      const res = await api.post('/api/admin/provider/test');
      setProviderTestResult(res);
    } catch (err: any) {
      setProviderTestResult({ success: false, message: err.message });
    } finally {
      setTestingProvider(false);
    }
  };

  // Sync SMM Africa Services
  const handleSyncServices = async () => {
    setSyncingServices(true);
    try {
      const res = await api.post('/api/admin/provider/sync');
      setStatusMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSyncingServices(false);
    }
  };

  // Reply to ticket
  const handleTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !adminReplyText.trim()) return;

    try {
      const res = await api.post(`/api/support/tickets/${activeTicket.id}/reply`, {
        message: adminReplyText.trim(),
      });
      setStatusMessage({ type: 'success', text: 'Jibu la msimamizi limetumwa kwa mteja!' });
      setActiveTicket(null);
      setAdminReplyText('');
      fetchTickets();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider bg-slate-950/40 text-amber-200 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>MSIMAMIZI MKUU WA KUKUZA PRO (ADMIN)</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashibodi ya Usimamizi Mkuu
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Simamia huduma, bei, miamala ya Watanzania, siri za API, na maagizo ya wateja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingService({
                category: 'Instagram',
                platform: 'Instagram',
                name: '',
                type: 'Default',
                rate_per_1000: 8000,
                min_quantity: 100,
                max_quantity: 10000,
                description: '',
                active: 1,
              });
            }}
            className="px-4 py-2.5 bg-white text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>+ Ongeza Huduma Mpya</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Admin Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex overflow-x-auto gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Muhtasari & Takwimu
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
            activeTab === 'services'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Huduma & Bei ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Oda za Wateja ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Uthibitisho wa Malipo ({payments.filter(p => p.status === 'pending').length} Inasubiri)
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Watumiaji & Salio ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('secrets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'secrets'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Siri na Mipangilio (Secrets & Keys)</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
            activeTab === 'tickets'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Tiketi za Msaada ({tickets.filter(t => t.status === 'open').length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-500">Jumla ya Malipo ya Wateja</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
                TZS {(overview?.totalDepositsTzs || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400 mt-2 block">Kutoka M-Pesa & Tigo Pesa</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-500">Mapato ya Oda (Revenue)</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                TZS {(overview?.totalRevenueTzs || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400 mt-2 block">Jumla ya oda zilizowekwa</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-500">Oda Zinazosubiri Utekelezaji</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
                {overview?.pendingOrders || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Zinazoendelea: {overview?.inProgressOrders || 0}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-500">Wateja Waliosajiliwa</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {overview?.usersCount || 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Salio la Wateja: TZS {(overview?.totalUserBalancesTzs || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Uthibitisho wa Malipo</h3>
              <p className="text-xs text-slate-500">
                Kuna maombi {overview?.pendingPaymentsCount || 0} ya malipo yanayosubiri ukaguzi wa SMS reference.
              </p>
              <button
                onClick={() => setActiveTab('payments')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Kagua Malipo Sasa
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Muunganisho wa SMM Africa</h3>
              <p className="text-xs text-slate-500">
                Jaribu muunganisho wa API key na uhakiki salio la provider.
              </p>
              <button
                onClick={() => setActiveTab('secrets')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Mipangilio ya Provider API
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Tiketi za Wateja</h3>
              <p className="text-xs text-slate-500">
                Kuna tiketi {overview?.openTicketsCount || 0} wazi zinazosubiri jibu la msimamizi.
              </p>
              <button
                onClick={() => setActiveTab('tickets')}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl"
              >
                Jibu Tiketi za Wateja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Usimamizi wa Huduma & Bei (TZS)</h2>
              <p className="text-xs text-slate-500">
                Badilisha bei, wezesha au zima huduma, au rekebisha faida kwa asilimia.
              </p>
            </div>

            {/* Bulk Markup */}
            <div className="flex items-center gap-2">
              <div className="relative w-28">
                <input
                  type="number"
                  value={bulkMarkupPercent}
                  onChange={(e) => setBulkMarkupPercent(e.target.value)}
                  placeholder="10"
                  className="w-full pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
                <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
              <button
                onClick={handleBulkMarkup}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl whitespace-nowrap"
              >
                Ongeza Bei Zote (%)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Mtandao</th>
                    <th className="py-3 px-4">Jina la Huduma</th>
                    <th className="py-3 px-4">Bei / 1,000 (TZS)</th>
                    <th className="py-3 px-4">Kiwango (Min - Max)</th>
                    <th className="py-3 px-4">Provider ID</th>
                    <th className="py-3 px-4">Hali</th>
                    <th className="py-3 px-4 text-right">Vitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <span className="font-extrabold uppercase text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {srv.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-[240px]">
                        {srv.name}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700">
                        TZS {srv.rate_per_1000.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {srv.min_quantity.toLocaleString()} - {srv.max_quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {srv.provider_service_id || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleService(srv.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            srv.active === 1
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {srv.active === 1 ? 'HAI (Active)' : 'IMEZIMWA'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingService(srv)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Hariri Huduma"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Futa Huduma"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Oda Zote za Wateja</h2>
              <p className="text-xs text-slate-500">
                Thibitisha, badilisha hali, au rejesha salio kwa mteja endapo oda imesitishwa.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Oda ID</th>
                    <th className="py-3 px-4">Mteja</th>
                    <th className="py-3 px-4">Huduma</th>
                    <th className="py-3 px-4">Idadi</th>
                    <th className="py-3 px-4">Gharama</th>
                    <th className="py-3 px-4">Hali</th>
                    <th className="py-3 px-4 text-right">Badilisha Hali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {ord.id.replace('ord_', '')}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{ord.user_name || 'Mteja'}</p>
                        <p className="text-[10px] text-slate-400">{ord.user_email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 max-w-[200px] truncate">{ord.service_name}</p>
                        <a
                          href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-600 hover:underline max-w-[160px] truncate block"
                        >
                          {ord.link}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {ord.quantity.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        TZS {ord.charge_tzs.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            ord.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'in_progress'
                              ? 'bg-sky-100 text-sky-800'
                              : ord.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold"
                          title="Weka Imekamilika"
                        >
                          Imekamilika
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'in_progress')}
                          className="px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded text-[10px] font-bold"
                          title="Weka Inafanyika"
                        >
                          Inafanyika
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'canceled', true)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-bold"
                          title="Sitisha na Rudisha Salio"
                        >
                          Sitisha & Refund
                        </button>
                        {ord.provider_service_id && !ord.provider_order_id && (
                          <button
                            onClick={() => handleDispatchProvider(ord.id)}
                            className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-bold"
                            title="Tuma kwa SMM Africa"
                          >
                            Tuma Provider
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS VERIFICATION */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900">Uthibitisho wa Malipo ya Simu (Mobile Money)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kagua miamala ya M-Pesa na Tigo Pesa iliyowasilishwa na wateja. Thibitisha kuongeza salio kwa usahihi.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Kumbukumbu (Ref)</th>
                    <th className="py-3 px-4">Mteja</th>
                    <th className="py-3 px-4">Mtandao</th>
                    <th className="py-3 px-4">Kiasi (TZS)</th>
                    <th className="py-3 px-4">SMS Transaction ID</th>
                    <th className="py-3 px-4">Hali</th>
                    <th className="py-3 px-4 text-right">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {p.reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{p.user_name || 'Mteja'}</p>
                        <p className="text-[10px] text-slate-400">{p.phone_number}</p>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-extrabold text-slate-700">
                        {p.method}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                        TZS {p.amount_tzs.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700 bg-amber-50/50 rounded">
                        {p.provider_reference || 'Bado Hajawasilisha'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            p.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status === 'completed' ? 'Imethibitishwa' : 'Inasubiri'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleVerifyPayment(p.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs"
                          >
                            Thibitisha & Ongeza Salio
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900">Watumiaji & Salio</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tazama akaunti za wateja, kiasi cha salio, na fanya marekebisho ya kibinadamu ya fedha.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Jina</th>
                    <th className="py-3 px-4">Barua Pepe</th>
                    <th className="py-3 px-4">Simu</th>
                    <th className="py-3 px-4">Wajibu (Role)</th>
                    <th className="py-3 px-4">Salio la Sasa</th>
                    <th className="py-3 px-4">Jumla ya Oda</th>
                    <th className="py-3 px-4 text-right">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {u.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4 text-slate-600">{u.phone}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        TZS {(u.wallet_balance || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {u.total_orders || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setAdjustingUser(u)}
                          className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-[11px] font-bold"
                        >
                          Rekebisha Salio
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECRETS & SETTINGS MANAGEMENT */}
      {activeTab === 'secrets' && (
        <div className="space-y-8">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-700" />
                <h2 className="text-xl font-black text-amber-950">
                  Usimamizi wa Siri & API Keys (Protected Secrets Manager)
                </h2>
              </div>
              <p className="text-xs text-amber-900 max-w-2xl leading-relaxed">
                Hapa msimamizi anaweza kuongeza na kusasisha API keys za SMM Africa, AzamPay, Selcom, Webhook Secrets, na Lipa Namba. Siri zote zimefichwa (masked) na hazitawahi kuonekana kwenye msimbo wa frontend au browser responses.
              </p>
            </div>

            <button
              onClick={() => setShowAddSecretModal(true)}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Ongeza Siri Mpya (Add Secret)</span>
            </button>
          </div>

          {/* SMM Africa Provider Connection Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700">Muunganisho wa Moja kwa Moja</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">SMM Africa API Integration</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestProvider}
                  disabled={testingProvider}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {testingProvider ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>Pima Muunganisho (Test Connection)</span>
                </button>

                <button
                  onClick={handleSyncServices}
                  disabled={syncingServices}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {syncingServices ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Pakua Huduma (Sync)</span>
                </button>
              </div>
            </div>

            {providerTestResult && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 ${
                  providerTestResult.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {providerTestResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-extrabold text-sm mb-1">{providerTestResult.message}</p>
                  <p className="text-[11px] opacity-80 font-mono">URL: {providerTestResult.providerUrl}</p>
                  {providerTestResult.balance && (
                    <p className="text-xs font-bold text-emerald-800 mt-1">
                      Salio la SMM Africa: {providerTestResult.currency || '$'}{' '}
                      {providerTestResult.balance}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings & Secrets Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              Orodha ya Mipangilio & Siri Zilizopo (Settings Ledger)
            </h3>

            <div className="space-y-4">
              {settingsList.map((setting) => (
                <div
                  key={setting.key}
                  className="p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900">
                        {setting.key}
                      </span>
                      {setting.is_secret && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Secret (Masked)</span>
                        </span>
                      )}
                      {setting.has_value ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Imewekwa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          Haijawekwa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{setting.description || 'Mpangilio wa mfumo'}</p>
                    <p className="text-xs font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded w-fit">
                      {setting.value || '(Haijawekwa)'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const newVal = prompt(`Weka thamani mpya ya ${setting.key}:`);
                        if (newVal !== null) {
                          handleSaveSetting(setting.key, newVal, setting.is_secret, setting.description);
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                    >
                      Sasisha Thamani
                    </button>

                    <button
                      onClick={() => handleDeleteSetting(setting.key)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Futa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900">Tiketi za Wateja (Customer Inquiries)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jibu maswali na matatizo ya wateja moja kwa moja.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Mteja</th>
                    <th className="py-3 px-4">Mada (Subject)</th>
                    <th className="py-3 px-4">Kipengele</th>
                    <th className="py-3 px-4">Ujumbe</th>
                    <th className="py-3 px-4">Hali</th>
                    <th className="py-3 px-4 text-right">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{t.user_name}</p>
                        <p className="text-[10px] text-slate-400">{t.user_email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {t.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{t.category}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                        {t.message}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            t.status === 'open'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'in_progress'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveTicket(t)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs"
                        >
                          Jibu Tiketi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE EDIT MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-lg text-slate-900">
              {editingService.id ? 'Hariri Huduma' : 'Ongeza Huduma Mpya'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jina la Huduma</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategoria</label>
                  <input
                    type="text"
                    required
                    value={editingService.category || ''}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bei / 1,000 (TZS)</label>
                  <input
                    type="number"
                    required
                    value={editingService.rate_per_1000 || ''}
                    onChange={(e) => setEditingService({ ...editingService, rate_per_1000: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    required
                    value={editingService.min_quantity || ''}
                    onChange={(e) => setEditingService({ ...editingService, min_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Quantity</label>
                  <input
                    type="number"
                    required
                    value={editingService.max_quantity || ''}
                    onChange={(e) => setEditingService({ ...editingService, max_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Provider Service ID (SMM Africa)</label>
                <input
                  type="text"
                  placeholder="mfano: 101"
                  value={editingService.provider_service_id || ''}
                  onChange={(e) => setEditingService({ ...editingService, provider_service_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maelezo (Description)</label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Hifadhi Huduma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST USER BALANCE MODAL */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              Rekebisha Salio: {adjustingUser.full_name}
            </h3>
            <p className="text-xs text-slate-500">
              Salio la sasa: <strong className="text-emerald-700">TZS {(adjustingUser.wallet_balance || 0).toLocaleString()}</strong>
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`flex-1 py-2 font-bold rounded-xl border ${
                    adjustType === 'credit'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  + Ongeza Salio (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`flex-1 py-2 font-bold rounded-xl border ${
                    adjustType === 'debit'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  - Punguza Salio (Debit)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kiasi (TZS)</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sababu / Maelezo ya Audit</label>
                <input
                  type="text"
                  required
                  placeholder="mfano: Muamala wa benki umethibitishwa"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Funga
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  Tekeleza Marekebisho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SECRET MODAL */}
      {showAddSecretModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              <span>Ongeza Siri Mpya (Add Secret Key)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Siri itahifadhiwa kwenye database na kufichwa kwa usalama ili kuzuia kuvuja.
            </p>

            <form onSubmit={handleAddCustomSecret} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jina la Siri (Key Identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="mfano: flutterwave_secret_key"
                  value={newSecretKey}
                  onChange={(e) => setNewSecretKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thamani ya Siri (Secret Value)</label>
                <input
                  type="password"
                  required
                  placeholder="Weka API Key au Secret hapa..."
                  value={newSecretValue}
                  onChange={(e) => setNewSecretValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maelezo (Description)</label>
                <input
                  type="text"
                  placeholder="mfano: API Key ya malipo ya mteja"
                  value={newSecretDesc}
                  onChange={(e) => setNewSecretDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSecretModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black rounded-xl shadow-xs"
                >
                  Hifadhi Siri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN TICKET REPLY MODAL */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              Jibu Tiketi: {activeTicket.subject}
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p><strong>Mteja:</strong> {activeTicket.user_name} ({activeTicket.user_email})</p>
              <p><strong>Ujumbe:</strong> {activeTicket.message}</p>
            </div>

            <form onSubmit={handleTicketReply} className="space-y-4 text-xs">
              <textarea
                rows={4}
                required
                placeholder="Andika jibu rasmi la msimamizi hapa..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Funga
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Tuma Jibu kwa Mteja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
