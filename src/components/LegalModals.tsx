import React from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Lock } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'refund' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'privacy' && <Lock className="w-5 h-5" />}
              {type === 'refund' && <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {type === 'terms' && 'Masharti ya Huduma (Terms of Service)'}
                {type === 'privacy' && 'Sera ya Faragha na Usalama (Privacy Policy)'}
                {type === 'refund' && 'Sera ya Kurejeshewa Pesa (Refund Policy)'}
              </h3>
              <p className="text-xs text-slate-500">Kukuza Pro Tanzania • Ilisasishwa 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {type === 'terms' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Makubaliano ya Jumla</h4>
              <p>
                Kwa kutumia jukwaa la Kukuza Pro (https://kukuzapro.com au kikoa chetu cha mtandao), unakubaliana na masharti yote yaliyoainishwa hapa chini. Ikiwa hukubaliani na masharti haya, tafadhali usitumie huduma zetu.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Huduma Zinazotolewa</h4>
              <p>
                Kukuza Pro inatoa huduma za masoko ya mitandao ya kijamii (SMM) ikiwemo kukuza wafuasi (followers), maoni (comments), likes, na views kwa majukwaa mbalimbali kama vile Instagram, TikTok, YouTube, na Facebook. Huduma zote hufanyika kwa njia ya kisheria na salama.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Hakuna Nywila (Password) Inayohitajika</h4>
              <p>
                Kukuza Pro <strong>HAITAWAHI</strong> kukuomba nenosiri au taarifa za siri za akaunti yako ya Instagram, TikTok au YouTube. Unatakiwa tu kuweka link ya umma (public profile/post URL) inayoweza kufikiwa na umma.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">4. Uwekaji wa Oda na Majukumu ya Mteja</h4>
              <p>
                Mteja ana jukumu la kuhakikisha kuwa akaunti yake ipo hadharani (Public Account) wakati oda inapoendelea. Akaunti ikiwa ya siri (Private), mfumo hautaweza kuwasilisha huduma na oda inaweza kukwama.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">5. Malipo na Fedha</h4>
              <p>
                Malipo yote yanafanyika kwa Shilingi za Kitanzania (TZS) kupitia njia rasmi za simu (M-Pesa, Tigo Pesa, Airtel Money, Halopesa) na kuthibitishwa kielektroniki.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Ulinzi wa Taarifa Binafsi</h4>
              <p>
                Kukuza Pro inathamini na kuheshimu usiri wa wateja wetu. Tunakusanya taarifa za msingi pekee (Jina, Barua Pepe, na Nambari ya Simu) kwa ajili ya kufungua akaunti na mawasiliano ya oda zako.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Usalama wa Nenosiri na Malipo</h4>
              <p>
                Manenosiri yote yamehifadhiwa kwa njia ya usimbaji fiche wa kiwango cha juu (cryptographic hashing kwa kutumia scrypt). Hatushiriki wala kuuza taarifa zako kwa mtu wa tatu (third parties).
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Vidakuzi (Cookies) na Usalama wa Mtandao</h4>
              <p>
                Tunatumia vidakuzi vilivyolindwa (secure tokens) ili kukuwezesha kubaki umeingia kwenye akaunti yako kwa usalama. Tovuti yetu inazingatia miongozo yote ya usalama wa mtandao inayotakiwa na injini za utafutaji kama vile Google na Microsoft Bing.
              </p>
            </>
          )}

          {type === 'refund' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Masharti ya Kurejeshewa Pesa</h4>
              <p>
                Ikiwa oda yako imeshindwa kuanza au kukamilika kutokana na hitilafu ya kiufundi, kiasi cha pesa kilichokatwa kinarudishwa mara moja kwenye salio lako la Kukuza Pro (Wallet) ili uweze kutumia kwa oda nyingine au kuomba msaada wa kutoa.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Oda Zilizowekwa kwa Link Isiyo Sahihi</h4>
              <p>
                Tafadhali kagua kwa makini link yako kabla ya kuweka oda. Ikiwa link imewekwa kimakosa au akaunti imewekwa "Private", tafadhali wasiliana na huduma kwa wateja kupitia WhatsApp (0660771226) au barua pepe (kukuzapro@gmail.com) ili oda iweze kusahihishwa au kufutwa na kurudishiwa salio.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Mfumo wa Refill (Refill Guarantee)</h4>
              <p>
                Huduma zenye alama ya [Refill Guarantee] zina uhakika wa kuongezwa bure ikiwa kutatokea kushuka ndani ya muda uliotajwa (mfano siku 30 au Lifetime).
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kukuza Pro Tanzania • 100% Salama</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Nimeelewa & Funga
          </button>
        </div>
      </div>
    </div>
  );
};
