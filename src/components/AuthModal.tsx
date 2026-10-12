import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Mail, Lock, User, Phone, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    initialMode === 'register' ? 'register' : 'login'
  );

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccess('Umeingia kikamilifu! Karibu tena.');
        setTimeout(() => {
          onClose();
        }, 600);
      } else if (mode === 'register') {
        await register(fullName, email, phone, password);
        setSuccess('Hongera! Usajili umekamilika kikamilifu. Karibu Kukuza Pro!');
        setTimeout(() => {
          onClose();
        }, 600);
      } else if (mode === 'forgot') {
        const res = await api.post('/api/auth/forgot-password', { email });
        setSuccess(res.message || 'Ikiwa barua pepe hii ipo kwenye mfumo, maelekezo yametumwa.');
      }
    } catch (err: any) {
      setError(err.message || 'Kumetokea hitilafu. Tafadhali jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
          <div className="inline-flex p-2 rounded-xl bg-white/10 backdrop-blur-md mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {mode === 'login' && 'Ingia Kwenye Kukuza Pro'}
            {mode === 'register' && 'Fungua Akaunti Yako Bure'}
            {mode === 'forgot' && 'Rejesha Nenosiri Lako'}
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            {mode === 'login' && 'Simamia na fuatilia oda zako zote za kukuza mitandao.'}
            {mode === 'register' && 'Anza kukuza kurasa zako sasa kwa Shilingi za Kitanzania (TZS).'}
            {mode === 'forgot' && 'Ingiza barua pepe yako ili kupokea maelekezo.'}
          </p>
        </div>

        {/* Tab switcher for Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-emerald-600 text-emerald-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Ingia (Login)
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
                mode === 'register'
                  ? 'border-emerald-600 text-emerald-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Jisajili Mpya
            </button>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 font-medium animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jina Kamili (Full Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="mfano: Juma Rashid"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nambari ya Simu (M-Pesa / Tigo Pesa)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="07XXXXXXXX au 255XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Barua Pepe (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="jina@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nenosiri (Password)
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    Umesahau nenosiri?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Angalau herufi 6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Ingia Kwenye Akaunti'}
                  {mode === 'register' && 'Kamilisha Usajili (Anza Bure)'}
                  {mode === 'forgot' && 'Tuma Maelekezo'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                Rudi Kwenye Kuingia (Login)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
