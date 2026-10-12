import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  PlusCircle,
  Link as LinkIcon,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Zap,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Service, Order } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface NewOrderViewProps {
  initialServiceId?: string;
  onOrderSuccess: (order: Order) => void;
  openTopupModal: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const NewOrderView: React.FC<NewOrderViewProps> = ({
  initialServiceId,
  onOrderSuccess,
  openTopupModal,
  openAuthModal,
}) => {
  const { user, wallet, refreshUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [link, setLink] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter/X', 'Telegram', 'WhatsApp'];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await api.get<Service[]>('/api/services');
        setServices(data);

        // Preselect initial service or first available
        if (initialServiceId) {
          const match = data.find((s) => s.id === initialServiceId);
          if (match) {
            setSelectedPlatform(match.platform || match.category);
            setSelectedServiceId(match.id);
            setQuantity(match.min_quantity);
          }
        } else if (data.length > 0) {
          const firstIg = data.find((s) => s.category.toLowerCase().includes('instagram')) || data[0];
          setSelectedPlatform(firstIg.platform || firstIg.category);
          setSelectedServiceId(firstIg.id);
          setQuantity(firstIg.min_quantity);
        }
      } catch (err: any) {
        setError('Haikuweza kupakua orodha ya huduma.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [initialServiceId]);

  const filteredServices = services.filter(
    (s) => s.platform.toLowerCase() === selectedPlatform.toLowerCase() || s.category.toLowerCase() === selectedPlatform.toLowerCase()
  );

  const activeService = services.find((s) => s.id === selectedServiceId) || filteredServices[0];

  // Update selected service if platform changes
  const handlePlatformChange = (plat: string) => {
    setSelectedPlatform(plat);
    const firstInPlat = services.find(
      (s) => s.platform.toLowerCase() === plat.toLowerCase() || s.category.toLowerCase() === plat.toLowerCase()
    );
    if (firstInPlat) {
      setSelectedServiceId(firstInPlat.id);
      setQuantity(firstInPlat.min_quantity);
    }
  };

  const parsedQty = Number(quantity) || 0;
  const chargeTzs = activeService ? Math.round((parsedQty / 1000) * activeService.rate_per_1000) : 0;
  const userBalance = wallet?.balance || 0;
  const hasInsufficientBalance = user && chargeTzs > userBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!activeService) {
      setError('Tafadhali chagua huduma.');
      return;
    }

    if (!link || link.trim().length < 3) {
      setError('Tafadhali weka link sahihi ya profile au post.');
      return;
    }

    if (parsedQty < activeService.min_quantity) {
      setError(`Idadi ya chini ya huduma hii ni ${activeService.min_quantity.toLocaleString()}.`);
      return;
    }

    if (parsedQty > activeService.max_quantity) {
      setError(`Idadi ya juu ya huduma hii ni ${activeService.max_quantity.toLocaleString()}.`);
      return;
    }

    if (hasInsufficientBalance) {
      setError(`Salio lako halitoshi. Una TZS ${userBalance.toLocaleString()}, lakini oda inahitaji TZS ${chargeTzs.toLocaleString()}.`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post<{ message: string; order: Order }>('/api/orders', {
        service_id: activeService.id,
        link: link.trim(),
        quantity: parsedQty,
      });

      await refreshUser();
      setSuccessOrder(res.order);
      onOrderSuccess(res.order);
      setLink('');
    } catch (err: any) {
      setError(err.message || 'Haikuweza kuweka oda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Agiza Huduma Mpya (New Order)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Chagua mtandao, weka link ya ukurasa au chapisho lako, kisha thibitisha oda kwa Shilingi za Kitanzania (TZS).
        </p>
      </div>

      {successOrder && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-base">Oda Yako Imepokewa Kikamilifu!</h3>
              <p className="text-xs text-emerald-700">
                Oda ID: <span className="font-mono font-bold">{successOrder.id}</span> | Huduma:{' '}
                <span className="font-bold">{successOrder.service_name}</span> | Gharama:{' '}
                <span className="font-bold">TZS {successOrder.charge_tzs.toLocaleString()}</span>
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                Mfumo umeanza kutekeleza oda yako. Unaweza kuangalia maendeleo kwenye ukurasa wa "Oda Zangu".
              </p>
              <button
                type="button"
                onClick={() => setSuccessOrder(null)}
                className="mt-3 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
              >
                Agiza Huduma Nyingine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Switcher */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex overflow-x-auto gap-1.5 scrollbar-none">
        {platforms.map((plat) => (
          <button
            key={plat}
            onClick={() => handlePlatformChange(plat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedPlatform.toLowerCase() === plat.toLowerCase()
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {plat}
          </button>
        ))}
      </div>

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {hasInsufficientBalance && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={openTopupModal}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                  >
                    Weka Salio Sasa Hivi (M-Pesa / Tigo Pesa)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Chagua Huduma (Service)
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => {
              setSelectedServiceId(e.target.value);
              const found = services.find((s) => s.id === e.target.value);
              if (found) {
                setQuantity(found.min_quantity);
              }
            }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          >
            {filteredServices.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {srv.name} — TZS {srv.rate_per_1000.toLocaleString()} / 1K
              </option>
            ))}
          </select>
        </div>

        {/* Selected Service Information Card */}
        {activeService && (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-extrabold text-emerald-800">
                Bei: TZS {activeService.rate_per_1000.toLocaleString()} kwa 1,000
              </span>
              <span className="text-emerald-700 font-medium">
                Kiwango: {activeService.min_quantity.toLocaleString()} - {activeService.max_quantity.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeService.description || 'Huduma imara na salama kwa 100% kwa ajili ya kukuza hadhi ya akaunti yako.'}
            </p>
          </div>
        )}

        {/* Link Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Weka Link ya Profile, Post au Video (Public Link)
          </label>
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              placeholder={
                selectedPlatform === 'Instagram'
                  ? 'https://instagram.com/jina_lako au https://instagram.com/p/...'
                  : selectedPlatform === 'TikTok'
                  ? 'https://www.tiktok.com/@jina_lako/video/...'
                  : selectedPlatform === 'YouTube'
                  ? 'https://youtube.com/watch?v=... au link ya channel'
                  : 'Weka link kamili ya umma (Public link)'
              }
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hakikisha akaunti au video ipo wazi (Public). Hatuhitaji wala kuomba password yako kamwe!</span>
          </p>
        </div>

        {/* Quantity Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Idadi Unayotaka (Quantity)
            </label>
            {activeService && (
              <span className="text-xs text-slate-400">
                Min: {activeService.min_quantity.toLocaleString()} | Max: {activeService.max_quantity.toLocaleString()}
              </span>
            )}
          </div>
          <input
            type="number"
            required
            min={activeService?.min_quantity || 10}
            max={activeService?.max_quantity || 1000000}
            step="10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Dynamic Price Calculation & Balance Summary */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">
              Jumla ya Gharama (Total Charge)
            </span>
            <span className="text-2xl font-black text-emerald-700">
              TZS {chargeTzs.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Idadi: {parsedQty.toLocaleString()} @ TZS {activeService?.rate_per_1000.toLocaleString()}/1K
            </span>
          </div>

          <div className="flex flex-col sm:items-end text-center sm:text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase">
              Salio Lako la Sasa
            </span>
            <span
              className={`text-lg font-extrabold ${
                hasInsufficientBalance ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              TZS {userBalance.toLocaleString()}
            </span>
            {hasInsufficientBalance && (
              <span className="text-[11px] font-bold text-rose-500">
                Upungufu wa TZS {(chargeTzs - userBalance).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Submit or Auth Button */}
        {user ? (
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || hasInsufficientBalance || parsedQty <= 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : hasInsufficientBalance ? (
                <span>Salio Halitoshi — Tafadhali Weka Salio Kwanza</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Kamilisha Oda Sasa (TZS {chargeTzs.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="pt-2 text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-600 mb-3 font-medium">
              Tafadhali ingia kwenye akaunti yako au ujisajili bure ili kuendelea na oda.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Ingia (Login)
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                Jisajili Bure
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
