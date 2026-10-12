import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Wallet as WalletIcon,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { OrderProgressTracker } from '../components/OrderProgressTracker.tsx';

interface CustomerDashboardProps {
  onNavigate: (tab: string) => void;
  openTopupModal: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  openTopupModal,
}) => {
  const { user, wallet, refreshUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await refreshUser();
      const data = await api.get<{ orders: Order[]; stats: any }>('/api/orders?limit=5');
      setOrders(data.orders);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Imekamilika
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
            <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
            Inafanyika
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Inasubiri
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Imesitishwa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-700/60 text-emerald-200 px-3 py-1 rounded-full border border-emerald-500/30">
                Akaunti Yako ya Kukuza Pro
              </span>
              {user?.role === 'admin' && (
                <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  Msimamizi Mkuu (Admin)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Habari, {user?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Simamia kampeni zako za mitandao ya kijamii, weka oda mpya, na fuatilia miamala yako kwa urahisi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openTopupModal}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Weka Salio (Top Up)</span>
            </button>

            <button
              onClick={() => onNavigate('new-order')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <span>Agiza Huduma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Wallet Balance Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Salio la Sasa (TZS)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">
            TZS {(wallet?.balance || 0).toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>Jumla Iliyowekwa:</span>
            <span className="font-bold text-slate-700">TZS {(wallet?.total_deposited || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumla ya Oda
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats?.total_orders || orders.length || 0}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>Gharama ya Oda:</span>
            <span className="font-bold text-slate-700">TZS {(wallet?.total_spent || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* In Progress / Pending Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Oda Zinazoendelea
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">
            {(stats?.pending_orders || 0) + (stats?.in_progress_orders || 0)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>Inasubiri: {stats?.pending_orders || 0}</span>
            <span>Kazi: {stats?.in_progress_orders || 0}</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Oda Zilizokamilika
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-700">
            {stats?.completed_orders || 0}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span>Asilimia ya Ufanisi:</span>
            <span className="font-bold text-emerald-600">100% Salama</span>
          </div>
        </div>
      </div>

      {/* Quick Action & Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Oda Zako za Hivi Karibuni
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fuatilia maendeleo ya huduma ulizoagiza
              </p>
            </div>
            <button
              onClick={() => onNavigate('my-orders')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Tazama Zote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Inapakia oda...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Bado hujaweka oda yoyote</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Anza kukuza wafuasi, likes, au views kwa kuchagua huduma na kuweka link yako.
              </p>
              <button
                onClick={() => onNavigate('new-order')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Agiza Oda ya Kwanza Sasa
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Huduma</th>
                    <th className="pb-3">Idadi</th>
                    <th className="pb-3">Gharama</th>
                    <th className="pb-3">Hali (Status)</th>
                    <th className="pb-3 text-right">Tarehe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-3">
                        <p className="font-bold text-slate-800 truncate max-w-[200px]">
                          {ord.service_name}
                        </p>
                        <a
                          href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[180px]"
                        >
                          <span className="truncate">{ord.link}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 font-bold text-slate-700">
                        {ord.quantity.toLocaleString()}
                      </td>
                      <td className="py-3.5 font-bold text-emerald-700">
                        TZS {ord.charge_tzs.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <OrderProgressTracker order={ord} variant="compact" />
                      </td>
                      <td className="py-3.5 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(ord.created_at).toLocaleDateString('sw-TZ', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Quick Tips & Tanzania Support */}
        <div className="space-y-6">
          {/* Quick Deposit Prompt */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">
              Weka Salio kwa Simu
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Lipia kwa M-Pesa au Tigo Pesa papo hapo kuanzia TZS 1,000 bila ada ya ziada.
            </p>
            <button
              onClick={openTopupModal}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <WalletIcon className="w-3.5 h-3.5" />
              <span>Weka Salio Sasa</span>
            </button>
          </div>

          {/* 24/7 Hotline Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Msaada wa Moja kwa Moja (24/7)</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Ikiwa una swali kuhusu oda au malipo, timu yetu ipo tayari kukusaidia kupitia WhatsApp na simu masaa 24.
            </p>
            <div className="space-y-2">
              <a
                href="https://wa.me/255660771226?text=Habari%20Kukuza%20Pro"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>WhatsApp: 0660771226</span>
              </a>
              <a
                href="tel:0660771226"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Piga Simu: 0660771226</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
