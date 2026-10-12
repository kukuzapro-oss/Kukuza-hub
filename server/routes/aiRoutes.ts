import { Router } from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db.ts';

export const aiRouter = Router();

// Server-side Gemini initialization
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Handler for AI customer care assistant
async function handleAiChat(req: Request, res: Response): Promise<any> {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Ujumbe unahitajika.' });
    }

    const ai = getGenAIClient();

    // Fetch active services summary from DB to give real current context
    const services = db.prepare('SELECT category, name, rate_per_1000, min_quantity, max_quantity FROM services WHERE active = 1 LIMIT 20').all() as any[];
    const servicesSummary = services.map(s => `- ${s.category}: ${s.name} (Bei: TZS ${s.rate_per_1000.toLocaleString()} kwa 1,000, Min: ${s.min_quantity})`).join('\n');

    const systemInstruction = `
Wewe ni Msaidizi Rasmi wa Huduma kwa Wateja (Customer Care AI) wa jukwaa la "Kukuza Pro" (https://kukuzapro.com) nchini Tanzania.

MAELEKEZO MUHIMU:
1. Jukumu lako ni kusaidia wateja KWA MAMBO YANAYOHUSU TOVUTI YA KUKUZA PRO PEKEE. Ukipokea swali lisilohusu Kukuza Pro, mitandao ya kijamii, malipo ya simu, au huduma zetu, jibu kwa upole kuwa wewe ni msaidizi wa Kukuza Pro pekee na waelekeze kuhusu huduma zetu.
2. Zungumza kwa Kiswahili fasaha chenye heshima na upendo, au Kiingereza kama mteja ataanza kwa Kiingereza.
3. TAARIFA RASMI ZA KUKUZA PRO:
   - Jina: Kukuza Pro Tanzania
   - Malipo: Shilingi za Kitanzania (TZS) kupitia mitandao yote: Vodacom M-Pesa, Tigo Pesa (Mixx by Yas), Airtel Money na Halopesa.
   - Nambari ya Msaada & WhatsApp: 0660771226 (Inapatikana masaa 24/7 kila siku).
   - Barua pepe ya Msaada: kukuzapro@gmail.com
   - Msimamizi Mkuu: juniorjustus8272@gmail.com / 255705160226.
   - Hakuna nenosiri (password) linalohitajika wakati wa kuweka oda! Mteja anaweka tu link ya profile au video au post ya umma.
   - Kasi: Oda huanza ndani ya dakika chache baada ya kuweka.
   - Salio haliongezwi kwa uongo; malipo yanathibitishwa kupitia mfumo au nambari ya SMS ya muamala.

HUDUMA NA BEI ZA SASA KATIKA TOVUTI (Kila 1,000):
${servicesSummary}

Jibu kwa ufupi, kwa uwazi, na kwa usaidizi mzuri wa haraka.
`;

    // If Gemini API Key is not set, provide an intelligent local fallback
    if (!ai) {
      const lower = message.toLowerCase();
      let reply = 'Habari! Mimi ni Msaidizi wa Kukuza Pro. ';
      if (lower.includes('bei') || lower.includes('gharama') || lower.includes('shilingi')) {
        reply += 'Bei zetu zote zipo kwa Shilingi za Kitanzania (TZS). Mfano: Instagram Followers ni kuanzia TZS 7,500 kwa 1K, TikTok Views ni TZS 850 kwa 1K, na YouTube Subscribers ni TZS 36,000 kwa 1K. Unaweza kuangalia orodha kamili kwenye ukurasa wa "Huduma".';
      } else if (lower.includes('lipa') || lower.includes('salio') || lower.includes('mpesa') || lower.includes('tigo')) {
        reply += 'Unaweza kuweka salio kwa urahisi kupitia Vodacom M-Pesa, Tigo Pesa, Airtel Money au Halopesa. Bofya kitufe cha "+ Weka Salio", chagua mtandao wako na ufuate maelekezo ya Lipa Namba yetu.';
      } else if (lower.includes('simu') || lower.includes('namba') || lower.includes('whatsapp') || lower.includes('msaada')) {
        reply += 'Mawasiliano yetu rasmi yapo 24/7 mtandaoni:\n• WhatsApp & Simu: 0660771226\n• Barua pepe: kukuzapro@gmail.com';
      } else if (lower.includes('password') || lower.includes('nywila') || lower.includes('salama')) {
        reply += 'Kukuza Pro ni salama kwa 100%! Hatuhitaji wala kuomba nenosiri (password) ya akaunti yako ya Instagram, TikTok au YouTube. Unahitaji kuweka link ya umma tu.';
      } else {
        reply += 'Tupo hapa kukusaidia kukuza kurasa zako za Instagram, TikTok, YouTube, Facebook na mitandao yote. Kwa msaada wa haraka wa mtu binafsi, unaweza pia kuwasiliana nasi kupitia WhatsApp: 0660771226 (Saa 24/7).';
      }

      return res.json({ reply });
    }

    // Call Gemini 3.8 Flash via @google/genai SDK
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const reply = response.text || 'Samahani, sijaelewa vizuri. Tafadhali uliza kuhusu huduma za Kukuza Pro au wasiliana na timu yetu kupitia 0660771226.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Gemini Customer Care Error:', err);
    return res.status(500).json({
      error: 'Hitilafu ya msaidizi wa AI: ' + (err.message || 'Haikuweza kujibu kwa sasa.'),
      reply: 'Samahani, kumetokea hitilafu ya mtandao kwa msaidizi wa AI. Unaweza kuwasiliana nasi moja kwa moja kupitia WhatsApp: 0660771226 au kukuzapro@gmail.com.'
    });
  }
}

aiRouter.post('/chat', handleAiChat);
aiRouter.post('/ask', handleAiChat);
aiRouter.post('/', handleAiChat);
