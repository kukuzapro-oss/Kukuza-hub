import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  HelpCircle,
  CreditCard,
  Users
} from 'lucide-react';
import { Service } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface LandingViewProps {
  onSelectService: (serviceId: string) => void;
  onNavigate: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectService,
  onNavigate,
  openAuthModal,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await api.get<Service[]>('/api/services');
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ['All', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter/X', 'Telegram', 'WhatsApp'];

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>JUKWAA NAMBARI 1 LA MASOKO YA MITANDAO TANZANIA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
            Kuza Ukurasa Wako wa <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Instagram, TikTok & YouTube
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            Wafuasi halisi (Followers), Likes, Views na Subscribers kwa Shilingi za Kitanzania (TZS). Lipia kwa M-Pesa, Tigo Pesa, Airtel Money au Halopesa kwa urahisi na usalama wa 100%.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => onNavigate('new-order')}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 flex items-center gap-2"
            >
              <span>Agiza Oda Sasa</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('services')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base border border-white/20 transition-all backdrop-blur-md flex items-center gap-2"
            >
              <span>Tazama Orodha ya Bei</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800">
            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 font-medium">Salama (No Password)</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-2xl font-black text-emerald-400">TZS</p>
              <p className="text-xs text-slate-400 font-medium">Shilingi za Tanzania</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-2xl font-black text-emerald-400">0660771226</p>
              <p className="text-xs text-slate-400 font-medium">Msaada WhatsApp 24/7</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-2xl font-black text-emerald-400">Dakika 5</p>
              <p className="text-xs text-slate-400 font-medium">Kasi ya Kuanza Oda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Partners & Supported Networks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Malipo ya Papo kwa Papo
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Lipia Salio Lako kwa Mitandao Yote Tanzania
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tanzania Mobile Money: M-Pesa, Tigo Pesa, Airtel Money na Halopesa
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Vodacom M-Pesa</span>
            </div>
            <div className="flex items-center gap-2 bg-sky-50 text-sky-700 border border-sky-200 px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Tigo Pesa (Yas)</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <span>Airtel Money</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>Halopesa</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Catalog & Pricing Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Orodha ya Huduma & Bei (TZS)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Bei zote ni kwa kila idadi ya 1,000 (Rate per 1,000). Chagua huduma kisha uweke oda yako mara moja.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Tafuta huduma yoyote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'All' ? 'Huduma Zote' : cat}
            </button>
          ))}
        </div>

        {/* Services List Table / Cards */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500 font-medium">Inapakua orodha ya huduma za Kukuza Pro...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700">Hakuna huduma iliyopatikana</h4>
            <p className="text-xs text-slate-400 mt-1">Jaribu neno lingine au badilisha mtandao.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-emerald-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {service.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {service.id.replace('srv_', '')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                    {service.description || 'Huduma bora na yenye uhakika kwa ajili ya ukuaji wa akaunti yako.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs text-slate-400 font-medium">Bei / 1,000:</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      TZS {service.rate_per_1000.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                    <span>Min: {service.min_quantity.toLocaleString()}</span>
                    <span>Max: {service.max_quantity.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectService(service.id);
                      onNavigate('new-order');
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Agiza Huduma Hii</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Hatua Rahisi 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Jinsi Kukuza Pro Inavyofanya Kazi
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Hakuna ugumu wala mahitaji ya password ya akaunti yako.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h4 className="font-bold text-base text-white mb-2">Chagua Huduma & Weka Salio</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tazama huduma unayotaka (Instagram, TikTok, YouTube). Weka salio la Shilingi kupitia M-Pesa au Tigo Pesa papo hapo.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 font-black flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h4 className="font-bold text-base text-white mb-2">Weka Link ya Ukurasa au Post</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Weka link ya video, post au username yako ya umma (public profile link). Hatuhitaji wala kuomba nenosiri la akaunti yako.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h4 className="font-bold text-base text-white mb-2">Ukuaji wa Papo kwa Papo</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mfumo unaanza kutekeleza oda yako mara moja. Fuatilia maendeleo ya oda yako moja kwa moja kwenye dashibodi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Direct Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Msaada Saa 24/7 Tanzania
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Unahitaji Msaada au Ushauri wa Kukuza Akaunti?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Tupo hewani masaa 24 kila siku kukuhudumia kupitia WhatsApp na Simu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/255660771226?text=Habari%20Kukuza%20Pro,%20nahitaji%20msaada"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: 0660771226</span>
            </a>
            <a
              href="tel:0660771226"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 flex items-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Piga: 0660771226</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
