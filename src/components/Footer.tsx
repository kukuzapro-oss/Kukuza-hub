import React from 'react';
import { Phone, MessageCircle, Mail, Clock, MapPin, Zap, ShieldCheck } from 'lucide-react';

export const Footer: React.FC<{
  onNavigate: (tab: string) => void;
  onOpenLegal?: (type: 'terms' | 'privacy' | 'refund') => void;
}> = ({ onNavigate, onOpenLegal }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                KUKUZA<span className="text-emerald-400">PRO</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Jukwaa lenye ufanisi na kasi ya juu zaidi kwa ajili ya kukuza kurasa za mitandao ya kijamii Tanzania. Wafuasi, likes, views na maoni kwa bei nafuu za Shilingi (TZS).
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Salama na Hakuna Nywila Inayohitajika</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Huduma Maarufu
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Instagram Followers & Likes TZ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  TikTok Followers & Viral Views
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  YouTube Monetization & Watch Hours
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Facebook Page Likes & Engagement
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Telegram & WhatsApp Channel Members
                </button>
              </li>
            </ul>
          </div>

          {/* Tanzania Payments */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Njia za Malipo Tanzania
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Lipia salio lako moja kwa moja kupitia mitandao yote ya simu kwa Shilingi za Kitanzania (TZS):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Vodacom M-Pesa</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Tigo Pesa (Yas)</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>Airtel Money</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Halopesa</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Malipo yanathibitishwa kwa njia salama na mfumo wetu.
            </p>
          </div>

          {/* Support Info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Mawasiliano & Msaada 24/7
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">WhatsApp Msaada wa Haraka:</span>
                  <a
                    href="https://wa.me/255660771226?text=Habari%20Kukuza%20Pro"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    0660771226
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Piga Simu ya Kawaida:</span>
                  <a
                    href="tel:0660771226"
                    className="font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    0660771226
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Barua Pepe (Email):</span>
                  <a
                    href="mailto:kukuzapro@gmail.com"
                    className="font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    kukuzapro@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Masaa ya Kazi:</span>
                  <span className="font-semibold text-emerald-300">Saa 24 / 7 (Kila Siku)</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Kukuza Pro Tanzania. Haki zote zimehifadhiwa.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {onOpenLegal && (
              <>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Masharti ya Huduma (ToS)
                </button>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Sera ya Faragha (Privacy)
                </button>
                <button
                  onClick={() => onOpenLegal('refund')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Sera ya Marejesho (Refunds)
                </button>
              </>
            )}
            <button onClick={() => onNavigate('support')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Msaada 24/7
            </button>
            <button onClick={() => onNavigate('services')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Orodha ya Bei
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
