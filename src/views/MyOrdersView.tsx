import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ListOrdered,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { OrderProgressTracker } from '../components/OrderProgressTracker.tsx';

interface MyOrdersViewProps {
  onReorder: (serviceId: string) => void;
  onNavigate: (tab: string) => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onReorder, onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await api.get<{ orders: Order[]; stats: any }>(
        `/api/orders?status=${statusFilter}&limit=100`
      );
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter]);

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.service_name.toLowerCase().includes(q) ||
      o.link.toLowerCase().includes(q)
    );
  });

  // Identify active orders for prominent tracker cards
  const activeOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'in_progress' || o.status === 'partial'
  );

  const statusTabs = [
    { id: 'all', label: 'Zote (All)' },
    { id: 'active', label: `Zinazoendelea (${activeOrders.length})` },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'canceled', label: 'Canceled' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Historia ya Oda Zangu (My Orders)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fuatilia maendeleo ya hatua 4 (Pending → Processing → In Progress → Completed) kwa wakati halisi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
            title="Sasisha Oda (Refresh)"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sasisha</span>
          </button>

          <button
            onClick={() => onNavigate('new-order')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>+ Agiza Huduma Mpya</span>
          </button>
        </div>
      </div>

      {/* Prominent Active Orders Visual Progress Tracker Section */}
      {activeOrders.length > 0 && statusFilter !== 'completed' && statusFilter !== 'canceled' && (
        <section className="space-y-3.5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-4 sm:p-6 rounded-3xl border border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Kifuatiliaji cha Oda Zinazoendelea (Active Orders Tracker)
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {activeOrders.length} {activeOrders.length === 1 ? 'Oda' : 'Oda'}
              </span>
            </div>

            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Hatua: Pending → Processing → In Progress → Completed
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeOrders.map((activeOrd) => (
              <OrderProgressTracker
                key={activeOrd.id}
                order={activeOrd}
                variant="card"
                onViewDetails={(ord) => setSelectedOrder(ord)}
                onReorder={(srvId) => onReorder(srvId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex overflow-x-auto gap-1.5 w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tafuta kwa oda ID au link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Inapakua orodha ya oda zako...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700">Hakuna oda zilizopatikana</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {statusFilter !== 'all'
                ? `Hakuna oda zenye hali ya "${statusFilter}".`
                : 'Bado hujaweka oda yoyote kwenye mfumo.'}
            </p>
            <button
              onClick={() => onNavigate('new-order')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Agiza Huduma Sasa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Oda ID</th>
                  <th className="py-3 px-4">Huduma</th>
                  <th className="py-3 px-4">Link ya Umma</th>
                  <th className="py-3 px-4">Idadi</th>
                  <th className="py-3 px-4">Gharama</th>
                  <th className="py-3 px-4">Maendeleo & Hali (Stage Tracker)</th>
                  <th className="py-3 px-4">Tarehe</th>
                  <th className="py-3 px-4 text-right">Kitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {ord.id.replace('ord_', '')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 max-w-[200px] truncate">
                      {ord.service_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-mono max-w-[160px] truncate"
                      >
                        <span className="truncate">{ord.link}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">
                      {ord.quantity.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700 font-mono">
                      TZS {ord.charge_tzs.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Visual Compact Progress Tracker */}
                      <OrderProgressTracker order={ord} variant="compact" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(ord.created_at).toLocaleDateString('sw-TZ', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Tazama
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal with Multi-Stage Visual Tracker */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Taarifa Kamili za Oda
                </span>
                <h3 className="font-mono font-bold text-lg text-slate-900 mt-0.5">
                  ID: {selectedOrder.id}
                </h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                {selectedOrder.status.toUpperCase()}
              </span>
            </div>

            {/* Visual Multi-Stage Progress Tracker Inside Modal */}
            <OrderProgressTracker order={selectedOrder} variant="modal" />

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Huduma:</span>
                <span className="font-bold text-slate-800 text-right max-w-[280px]">
                  {selectedOrder.service_name}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Link ya Akaunti / Maudhui:</span>
                <a
                  href={selectedOrder.link.startsWith('http') ? selectedOrder.link : `https://${selectedOrder.link}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline max-w-[280px] truncate"
                >
                  {selectedOrder.link}
                </a>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Idadi Iliyoagizwa:</span>
                <span className="font-extrabold text-slate-900 font-mono">
                  {selectedOrder.quantity.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gharama:</span>
                <span className="font-extrabold text-emerald-700 text-sm font-mono">
                  TZS {selectedOrder.charge_tzs.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Iliyobaki (Remains):</span>
                <span className="font-bold text-slate-700 font-mono">
                  {(selectedOrder.remains || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tarehe ya Kuweka:</span>
                <span className="font-mono text-slate-600">
                  {new Date(selectedOrder.created_at).toLocaleString('sw-TZ')}
                </span>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                  <span className="font-bold block text-slate-700 mb-1">Maelezo ya Mfumo:</span>
                  {selectedOrder.notes}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  onReorder(selectedOrder.service_id);
                  onNavigate('new-order');
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Agiza Tena (Re-order)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

