import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Wallet as WalletIcon,
  CreditCard,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { Transaction, PaymentRecord } from '../types/index.ts';
import { api } from '../lib/api.ts';

export const WalletView: React.FC = () => {
  const { user, wallet, refreshUser } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Top up flow states
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'>('mpesa');
  const [amount, setAmount] = useState<number | string>(10000);
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [initiating, setInitiating] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Active payment intent modal
  const [activePayment, setActivePayment] = useState<any | null>(null);
  const [smsTransactionId, setSmsTransactionId] = useState('');
  const [submittingSms, setSubmittingSms] = useState(false);
  const [smsSuccessMsg, setSmsSuccessMsg] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const presetAmounts = [2000, 5000, 10000, 25000, 50000, 100000];

  const fetchHistory = async () => {
    try {
      setLoading(true);
      await refreshUser();
      const data = await api.get<{ payments: PaymentRecord[]; transactions: Transaction[] }>('/api/payments/history');
      setPayments(data.payments);
      setTransactions(data.transactions);
    } catch (err) {
      console.error('Failed to load wallet history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleInitiateTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitError(null);
    setInitiating(true);
    setSmsSuccessMsg(null);
    setSmsTransactionId('');

    const parsedAmt = Number(amount);
    if (isNaN(parsedAmt) || parsedAmt < 1000) {
      setInitError('Kiwango cha chini cha kuweka salio ni TZS 1,000.');
      setInitiating(false);
      return;
    }

    try {
      const res = await api.post('/api/payments/initiate', {
        amount: parsedAmt,
        method: selectedMethod,
        phone_number: phone,
      });

      setActivePayment(res);
      fetchHistory();
    } catch (err: any) {
      setInitError(err.message || 'Haikuweza kuanzisha ombi la malipo.');
    } finally {
      setInitiating(false);
    }
  };

  const handleSubmitSmsRef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsTransactionId || !activePayment) return;

    setSubmittingSms(true);
    setInitError(null);

    try {
      const res = await api.post('/api/payments/submit-sms-ref', {
        reference: activePayment.reference,
        sms_transaction_id: smsTransactionId.trim(),
      });

      setSmsSuccessMsg(res.message);
      fetchHistory();
    } catch (err: any) {
      setInitError(err.message || 'Haikuweza kuwasilisha nambari ya muamala.');
    } finally {
      setSubmittingSms(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Salio & Malipo (Wallet Top-up)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Weka salio la Shilingi za Kitanzania (TZS) kupitia M-Pesa, Tigo Pesa, Airtel Money au Halopesa.
        </p>
      </div>

      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-500/30">
            Salio Lako la Sasa
          </span>
          <p className="text-3xl sm:text-5xl font-black mt-3 text-white tracking-tight">
            TZS {(wallet?.balance || 0).toLocaleString()}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-emerald-100 mt-3 pt-3 border-t border-emerald-800/80">
            <span>Jumla Iliyowekwa: <strong>TZS {(wallet?.total_deposited || 0).toLocaleString()}</strong></span>
            <span>Jumla Iliyotumika: <strong>TZS {(wallet?.total_spent || 0).toLocaleString()}</strong></span>
            <span>Sarafu: <strong>TZS (Shilingi ya Tanzania)</strong></span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="bg-emerald-950/60 border border-emerald-500/30 p-3 rounded-2xl text-xs text-emerald-200 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Malipo yanathibitishwa na kukaguliwa kuzuia miamala feki.</span>
          </div>
        </div>
      </div>

      {/* Top Up Form & Networks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            Weka Salio Mpya (Deposit Funds)
          </h2>

          <form onSubmit={handleInitiateTopup} className="space-y-6">
            {initError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span>{initError}</span>
              </div>
            )}

            {/* Select Network */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                1. Chagua Mtandao wa Malipo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('mpesa')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedMethod === 'mpesa'
                      ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-600 block mb-2"></span>
                  <p className="font-extrabold text-xs text-slate-900">Vodacom M-Pesa</p>
                  <p className="text-[10px] text-slate-500">Lipa Namba ya Haraka</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('tigopesa')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedMethod === 'tigopesa'
                      ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-sky-500 block mb-2"></span>
                  <p className="font-extrabold text-xs text-slate-900">Tigo Pesa</p>
                  <p className="text-[10px] text-slate-500">Mixx by Yas</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('airtel')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedMethod === 'airtel'
                      ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-600 block mb-2"></span>
                  <p className="font-extrabold text-xs text-slate-900">Airtel Money</p>
                  <p className="text-[10px] text-slate-500">Lipa kwa Airtel</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('halopesa')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedMethod === 'halopesa'
                      ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-orange-500 block mb-2"></span>
                  <p className="font-extrabold text-xs text-slate-900">Halopesa</p>
                  <p className="text-[10px] text-slate-500">Halotel Tanzania</p>
                </button>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Chagua Kiasi (Au Andika Chini)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-extrabold transition-all ${
                      Number(amount) === preset
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    TZS {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <span className="absolute left-4 top-3.5 font-bold text-xs text-slate-400">
                  TZS
                </span>
                <input
                  type="number"
                  min="1000"
                  max="5000000"
                  step="500"
                  required
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Kiwango cha chini: TZS 1,000 | Kiwango cha juu: TZS 5,000,000
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Nambari ya Simu ya Kufanyia Malipo
              </label>
              <input
                type="tel"
                required
                placeholder="07XXXXXXXX au 255XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={initiating || Number(amount) < 1000}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {initiating ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Pata Maelekezo ya Kulipa (TZS {Number(amount).toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Tanzania Instructions Guide */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">
              Jinsi Malipo Yanavyofanyika
            </h3>
            <ol className="space-y-3 text-xs text-slate-600 leading-relaxed list-decimal list-inside font-medium">
              <li>Chagua mtandao wako na uweke kiasi.</li>
              <li>Pata nambari ya Lipa Namba na Reference yako.</li>
              <li>Tuma pesa kupitia simu yako.</li>
              <li>Weka nambari ya muamala (Transaction ID) ya SMS kuthibitisha.</li>
              <li>Salio linaongezwa mara baada ya muamala kuhakikiwa!</li>
            </ol>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-2">
              Usaidizi wa Malipo (24/7)
            </h4>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Kama unahitaji msaada wa haraka kuhusu kuongeza salio, wasiliana nasi:
            </p>
            <div className="space-y-1.5 text-xs font-bold text-slate-800">
              <p>• WhatsApp & Simu: 0660771226</p>
              <p>• Barua pepe: kukuzapro@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions Modal / Confirmation */}
      {activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Maelekezo ya Malipo
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 mt-1">
                  Kamilisha Muamala Wako
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                Inasubiri Uthibitisho
              </span>
            </div>

            {/* Step-by-step instructions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Mtandao:</span>
                <span className="font-extrabold text-slate-800 uppercase">
                  {activePayment.manual_instructions.method}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Lipa Namba:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-base text-slate-900">
                    {activePayment.manual_instructions.lipa_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activePayment.manual_instructions.lipa_number)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    title="Copy Lipa Number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Jina la Mfanyabiashara:</span>
                <span className="font-extrabold text-emerald-800">
                  {activePayment.manual_instructions.merchant_name}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Kiasi cha Kulipa:</span>
                <span className="font-black text-emerald-700 text-base">
                  TZS {activePayment.manual_instructions.amount_tzs.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Kumbukumbu (Reference):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-800">
                    {activePayment.manual_instructions.reference_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activePayment.manual_instructions.reference_code)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit SMS transaction form */}
            <form onSubmit={handleSubmitSmsRef} className="space-y-4">
              {smsSuccessMsg ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{smsSuccessMsg}</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Ingiza Nambari ya Muamala ya SMS (Transaction ID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="mfano: 9K7X8M2P10 au BP2401..."
                      value={smsTransactionId}
                      onChange={(e) => setSmsTransactionId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Weka nambari uliyopokea kwenye ujumbe wa SMS kutoka Vodacom M-Pesa au Tigo Pesa.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSms || !smsTransactionId}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingSms ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Wasilisha Nambari ya Muamala Kuthibitisha</span>
                    )}
                  </button>
                </>
              )}
            </form>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActivePayment(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Funga Dirisha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Historia ya Miamala ya Salio (Transaction Ledger)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Miamala yote ya kuweka salio, oda na marejesho imehifadhiwa kwa usahihi.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Inapakia miamala...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Hakuna miamala iliyofanyika bado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Aina ya Muamala</th>
                  <th className="py-3 px-4">Kumbukumbu (Ref)</th>
                  <th className="py-3 px-4">Maelezo</th>
                  <th className="py-3 px-4">Kiasi (TZS)</th>
                  <th className="py-3 px-4">Salio Baada</th>
                  <th className="py-3 px-4 text-right">Tarehe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      {tx.type === 'deposit' && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          + Kuweka Salio
                        </span>
                      )}
                      {tx.type === 'order' && (
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          - Gharama ya Oda
                        </span>
                      )}
                      {tx.type === 'refund' && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          + Rejesho la Salio
                        </span>
                      )}
                      {tx.type === 'adjustment' && (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Marekebisho
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {tx.reference}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[240px] truncate">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3 px-4 font-extrabold ${
                        tx.type === 'deposit' || tx.type === 'refund'
                          ? 'text-emerald-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}TZS{' '}
                      {tx.amount_tzs.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      TZS {tx.balance_after.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      {new Date(tx.created_at).toLocaleDateString('sw-TZ', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
