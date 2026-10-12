import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LandingView } from './views/LandingView.tsx';
import { CustomerDashboard } from './views/CustomerDashboard.tsx';
import { NewOrderView } from './views/NewOrderView.tsx';
import { MyOrdersView } from './views/MyOrdersView.tsx';
import { WalletView } from './views/WalletView.tsx';
import { SupportView } from './views/SupportView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { AiCustomerCareModal } from './components/AiCustomerCareModal.tsx';
import { LegalModal } from './components/LegalModals.tsx';
import { Bot, MessageCircle } from 'lucide-react';
import { Order } from './types/index.ts';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const openTopupModal = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setActiveTab('wallet');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActiveTab('new-order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (_order: Order) => {
    // Navigate to my-orders on success
    setTimeout(() => {
      setActiveTab('my-orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={openAuthModal}
        openTopupModal={openTopupModal}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingView
            onSelectService={handleSelectService}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openAuthModal={openAuthModal}
          />
        )}

        {activeTab === 'services' && (
          <LandingView
            onSelectService={handleSelectService}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openAuthModal={openAuthModal}
          />
        )}

        {activeTab === 'dashboard' && (
          <CustomerDashboard
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openTopupModal={openTopupModal}
          />
        )}

        {activeTab === 'new-order' && (
          <NewOrderView
            initialServiceId={selectedServiceId}
            onOrderSuccess={handleOrderSuccess}
            openTopupModal={openTopupModal}
            openAuthModal={openAuthModal}
          />
        )}

        {activeTab === 'my-orders' && (
          <MyOrdersView
            onReorder={(srvId) => {
              setSelectedServiceId(srvId);
              setActiveTab('new-order');
            }}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {(activeTab === 'wallet' || activeTab === 'transactions') && (
          <WalletView />
        )}

        {activeTab === 'support' && (
          <SupportView
            openAiModal={() => setAiModalOpen(true)}
            openAuthModal={openAuthModal}
          />
        )}

        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {/* Floating WhatsApp Quick Contact */}
        <a
          href="https://wa.me/255660771226?text=Habari%20Kukuza%20Pro,%20nahitaji%20msaada"
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all group relative"
          title="Chat WhatsApp: 0660771226 (24/7)"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-14 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            WhatsApp Msaada: 0660771226
          </span>
        </a>

        {/* Floating AI Customer Care Launcher */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 hover:from-emerald-600 hover:to-slate-800 text-white font-extrabold text-xs shadow-xl hover:scale-105 transition-all border border-emerald-400/40 cursor-pointer"
        >
          <Bot className="w-5 h-5 text-emerald-300" />
          <span className="hidden sm:inline">Uliza AI Customer Care</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <AiCustomerCareModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={(type) => setLegalModalType(type)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
