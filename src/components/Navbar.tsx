import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Zap,
  Wallet as WalletIcon,
  PlusCircle,
  ShoppingBag,
  ListOrdered,
  CreditCard,
  Headphones,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Phone,
  MessageCircle,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openTopupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openTopupModal
}) => {
  const { user, wallet, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const formattedBalance = (wallet?.balance || 0).toLocaleString();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner for Tanzania Support Hotline */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              24/7 ONLINE TZ
            </span>
            <span className="hidden sm:inline text-emerald-100">
              Jukwaa Rasmi la Kukuza Mitandao Tanzania | Bei zote kwa Shilingi (TZS)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold ml-auto">
            <a
              href="https://wa.me/255660771226?text=Habari%20Kukuza%20Pro,%20nahitaji%20msaada"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors bg-emerald-900/40 px-2 py-0.5 rounded"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: 0660771226</span>
            </a>
            <a
              href="tel:0660771226"
              className="hidden md:flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simu: 0660771226</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    KUKUZA<span className="text-emerald-600">PRO</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded uppercase tracking-wider border border-emerald-300">
                    TZ
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                  Social Media Growth Tanzania
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === 'services'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Huduma (Services)
              </button>

              <button
                onClick={() => setActiveTab('new-order')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === 'new-order'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Oda Mpya</span>
              </button>

              {user && (
                <>
                  <button
                    onClick={() => setActiveTab('my-orders')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      activeTab === 'my-orders'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ListOrdered className="w-4 h-4" />
                    <span>Oda Zangu</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('wallet')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      activeTab === 'wallet'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <WalletIcon className="w-4 h-4 text-emerald-600" />
                    <span>Weka Salio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      activeTab === 'transactions'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Miamala
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('support')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === 'support'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Headphones className="w-4 h-4 text-teal-600" />
                <span>Msaada 24/7</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-900" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Live Wallet Balance Badge */}
                <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 p-1 pl-3 rounded-xl border border-slate-200 transition-colors">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase leading-tight">
                      Salio Lako
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700 leading-tight">
                      TZS {formattedBalance}
                    </span>
                  </div>
                  <button
                    onClick={openTopupModal}
                    title="Weka Salio kwa M-Pesa / Tigo Pesa"
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Umeingia kama</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                        <p className="text-xs text-emerald-600 font-medium">{user.phone}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                            Msimamizi Mkuu (Admin)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-500" />
                        Dashboard Yangu
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('wallet');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <WalletIcon className="w-4 h-4 text-emerald-600" />
                        Salio & Malipo (TZS)
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-amber-900 font-semibold bg-amber-50/50 hover:bg-amber-100/60 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Dashboard ya Admin
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Toka (Logout)
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Ingia (Login)
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm shadow-emerald-600/30 hover:shadow-md"
                >
                  Jisajili Bure
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {user && (
            <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Salio Lako la Sasa</p>
                <p className="text-lg font-extrabold text-emerald-700">TZS {formattedBalance}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openTopupModal();
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                + Weka Salio
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Nyumbani (Home)
          </button>

          <button
            onClick={() => {
              setActiveTab('services');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Huduma Zote (Services)
          </button>

          <button
            onClick={() => {
              setActiveTab('new-order');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-emerald-700 bg-emerald-50"
          >
            Agiza Oda Mpya (New Order)
          </button>

          {user && (
            <>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Dashboard Yangu
              </button>

              <button
                onClick={() => {
                  setActiveTab('my-orders');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Oda Zangu
              </button>

              <button
                onClick={() => {
                  setActiveTab('wallet');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Weka Salio (M-Pesa / Tigo Pesa)
              </button>

              <button
                onClick={() => {
                  setActiveTab('transactions');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Historia ya Miamala
              </button>
            </>
          )}

          <button
            onClick={() => {
              setActiveTab('support');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-teal-700 hover:bg-slate-100 flex items-center justify-between"
          >
            <span>Msaada & Mawasiliano (24/7)</span>
            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">0660771226</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg text-amber-900 bg-amber-100 border border-amber-300"
            >
              Msimamizi Mkuu (Admin Dashboard)
            </button>
          )}

          {user ? (
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Toka Kwenye Akaunti (Logout)
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-1/2 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg text-center"
              >
                Ingia
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('register');
                }}
                className="w-1/2 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg text-center"
              >
                Jisajili Bure
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
