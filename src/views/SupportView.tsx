import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Headphones,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Bot
} from 'lucide-react';
import { SupportTicket } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface SupportViewProps {
  openAiModal: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ openAiModal, openAuthModal }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // New Ticket State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Malipo (Payments)');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Ticket Reply Modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      setLoadingTickets(true);
      const data = await api.get<SupportTicket[]>('/api/support/tickets');
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: 'Tafadhali jaza mada na ujumbe wako.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/api/support/tickets', {
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });

      setStatusMsg({ type: 'success', text: res.message });
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Haikuweza kutuma tiketi.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await api.post(`/api/support/tickets/${activeTicket.id}/reply`, {
        message: replyText.trim(),
      });

      setActiveTicket(res.ticket);
      setReplyText('');
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Haikuweza kutuma jibu.');
    } finally {
      setSendingReply(false);
    }
  };

  const faqs = [
    {
      q: 'Je, huduma zenu ni salama kwa akaunti yangu?',
      a: 'Ndiyo, 100%! Huduma zetu zote zinafuata miongozo salama. Muhimu zaidi, hatuwahi kuomba nenosiri (password) la akaunti yako. Unahitaji kuweka link ya umma (public link) pekee.',
    },
    {
      q: 'Je, inachukua muda gani oda kuanza kufanya kazi?',
      a: 'Huduma nyingi za Instagram, TikTok na YouTube huanza kufanya kazi mara moja ndani ya dakika 5 hadi 15 baada ya kuweka oda na kuthibitishwa.',
    },
    {
      q: 'Je, naweza kulipa kwa M-Pesa au Tigo Pesa?',
      a: 'Ndiyo! Jukwaa letu limetengenezwa maalum kwa Watanzania. Tunapokea Vodacom M-Pesa, Tigo Pesa (Mixx by Yas), Airtel Money na Halopesa kwa Shilingi za Kitanzania (TZS).',
    },
    {
      q: 'Nifanye nini nikipata changamoto yoyote?',
      a: 'Timu yetu ipo hewani masaa 24/7 kila siku. Unaweza kutupigia au kututumia ujumbe WhatsApp kupitia 0660771226 au kufungua tiketi kwenye ukurasa huu.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Msaada & Huduma kwa Wateja (24/7 Support)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tunapatikana masaa yote 24 kila siku kwa ajili ya kukuhudumia na kutatua changamoto zako.
        </p>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>KUKUZA AI CUSTOMER CARE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Una Swali la Haraka? Uliza Msaidizi Wetu wa AI Sasa
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
            Msaidizi wetu wa akili bandia (AI) amefunzwa kujibu maswali yote kuhusu huduma, bei za TZS, jinsi ya kuweka oda, na malipo ya simu papo hapo.
          </p>
        </div>

        <button
          onClick={openAiModal}
          className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 self-start md:self-auto shrink-0 cursor-pointer"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span>Ongea na AI Assistant (24/7)</span>
        </button>
      </div>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">WhatsApp Msaada</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Pata msaada wa haraka zaidi kupitia WhatsApp rasmi ya Kukuza Pro.
            </p>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 font-mono mb-3">0660771226</p>
            <a
              href="https://wa.me/255660771226?text=Habari%20Kukuza%20Pro,%20nahitaji%20msaada"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Fungua WhatsApp Chat</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Piga Simu ya Kawaida</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Ongea na afisa huduma kwa wateja moja kwa moja kwa simu ya sauti.
            </p>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 font-mono mb-3">0660771226</p>
            <a
              href="tel:0660771226"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Piga Simu Sasa</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Barua Pepe (Email)</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Tuma ujumbe wako kwa anwani rasmi ya barua pepe ya huduma.
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 font-mono mb-3 truncate">
              kukuzapro@gmail.com
            </p>
            <a
              href="mailto:kukuzapro@gmail.com"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Tuma Barua Pepe</span>
            </a>
          </div>
        </div>
      </div>

      {/* Ticket Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Open Ticket Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Fungua Tiketi ya Msaada (Submit Ticket)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Eleza suala lako kwa kina, timu yetu ya kiufundi itakujibu moja kwa moja.
            </p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            {statusMsg && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mada ya Suala (Subject)
              </label>
              <input
                type="text"
                required
                placeholder="mfano: Msaada wa kuweka oda ya Instagram..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kipengele (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Malipo (Payments)">Malipo (Payments)</option>
                  <option value="Ucheleweshaji wa Oda (Order Delay)">Ucheleweshaji wa Oda</option>
                  <option value="Huduma / Ushauri (General Inquiry)">Huduma / Ushauri</option>
                  <option value="Akaunti (Account Issues)">Akaunti</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Uharaka (Priority)
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="low">Kawaida (Low)</option>
                  <option value="medium">Wastani (Medium)</option>
                  <option value="high">Haraka (High)</option>
                  <option value="urgent">Dharura (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ujumbe Wako (Details)
              </label>
              <textarea
                required
                rows={4}
                placeholder="Eleza kwa undani changamoto unayokumbana nayo, ukiweka nambari ya oda au ya muamala ikiwa ipo..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Wasilisha Tiketi ya Msaada</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing User Tickets */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Tiketi Zako Zilizopo
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fuatilia majibu kutoka kwa msimamizi
              </p>
            </div>
            <button
              onClick={fetchTickets}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Pakia Upya
            </button>
          </div>

          {!user ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl p-6">
              <p className="text-xs text-slate-500 mb-3">
                Ingia kwenye akaunti yako ili kuona tiketi na majibu yako.
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Ingia Sasa
              </button>
            </div>
          ) : loadingTickets ? (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Inapakia tiketi...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl p-6">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Huna tiketi yoyote iliyofunguliwa bado.</p>
              <p className="text-[11px] text-slate-400 mt-1">Ukituma tiketi, itaonekana hapa pamoja na majibu yetu.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  onClick={() => setActiveTicket(tkt)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {tkt.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tkt.status === 'open'
                          ? 'bg-amber-100 text-amber-800'
                          : tkt.status === 'in_progress'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {tkt.status === 'open' ? 'Inasubiri' : tkt.status === 'in_progress' ? 'Inajibiwa' : 'Imefungwa'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tkt.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{tkt.category}</span>
                    <span>{new Date(tkt.created_at).toLocaleDateString('sw-TZ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details & Chat Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Tiketi #{activeTicket.id.replace('tkt_', '')}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                  {activeTicket.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1"
              >
                Funga
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-2xl max-h-[300px]">
              {(() => {
                let replies = [];
                try {
                  replies = JSON.parse(activeTicket.replies_json || '[]');
                } catch {
                  replies = [];
                }
                return replies.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs ${
                      msg.sender_role === 'admin'
                        ? 'bg-emerald-600 text-white ml-6'
                        : 'bg-white text-slate-800 mr-6 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
                      <span className="font-bold">{msg.sender}</span>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ));
              })()}
            </div>

            {/* Send Reply */}
            <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                placeholder="Andika jibu au maelezo ya ziada..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {sendingReply ? '...' : 'Tuma'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAQs Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Maswali & Majibu
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Maswali Yanayoulizwa Mara kwa Mara (FAQs)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-sm text-slate-900">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
