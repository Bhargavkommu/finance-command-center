import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize Google Gemini AI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Financial Advisor Endpoint
app.post('/api/ai/advisor', async (req, res) => {
  try {
    const { message, financialContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const contextStr = financialContext ? `
CURRENT USER FINANCIAL SNAPSHOT (All figures in INR ₹):
- Total Outstanding Debt: ₹${Number(financialContext.totalDebt || 0).toLocaleString('en-IN')}
- Total Monthly EMI Commitment: ₹${Number(financialContext.totalEMI || 0).toLocaleString('en-IN')}/month
- Total Assets: ₹${Number(financialContext.totalAssets || 0).toLocaleString('en-IN')}
- Total Liabilities: ₹${Number(financialContext.totalLiabilities || 0).toLocaleString('en-IN')}
- Net Worth: ₹${Number(financialContext.netWorth || 0).toLocaleString('en-IN')}
- Debt-to-Asset Ratio: ${Number(financialContext.debtToAssetRatio || 0).toFixed(1)}%
- Active Loans:
${(financialContext.loans || []).map((l: any, i: number) => `  ${i + 1}. ${l.name} (${l.category}): Balance ₹${Number(l.balance).toLocaleString('en-IN')}, Rate: ${l.interestRate}% p.a., EMI: ₹${Number(l.emi).toLocaleString('en-IN')}, Remaining: ${l.remainingMonths} months`).join('\n') || '  None listed'}
- Assets Breakdown:
${(financialContext.assets || []).map((a: any) => `  - ${a.name} (${a.category}): ₹${Number(a.value).toLocaleString('en-IN')}`).join('\n') || '  None listed'}
` : 'No financial data provided yet.';

    const systemPrompt = `You are DhanVeda AI, an elite Chief Financial Strategist specialized in Indian personal finance, debt eradication, and long-term wealth compounding.
You communicate with mathematical precision, deep empathy, and razor-sharp clarity.

Your core expertise:
1. Indian loan dynamics: Home loans (Repo-linked external benchmark EBLR, Section 24b ₹2L interest deduction, Section 80C principal deduction), Car/Personal loans, Credit cards (36-45% APR high-risk debt).
2. Repayment strategies: Debt Avalanche (mathematical maximum savings targeting highest interest first), Debt Snowball (psychological momentum targeting lowest balance first), and Hybrid "Barbell" Prepayment (e.g. paying 1 extra EMI per year or 5% annual step-up prepayment alongside active SIP).
3. Prepayment vs Investment Arbitrage: Comparing guaranteed debt-free return vs Nifty 50 / Flexi-cap equity mutual funds (12-14% CAGR nominal, adjusted for 12.5% LTCG tax above ₹1.25 Lakh).
4. Financial safety essentials: 6-month emergency fund runway in Liquid Funds/Sweep-in FD, pure term life insurance (15x-20x annual income), and comprehensive health insurance before aggressive prepayment.
5. Balance transfers: Real savings after 0.5-1% processing fees + 18% GST + MODT / stamp duty.

Style rules:
- Format numbers in Indian numbering system (e.g., ₹50,000, ₹12.5 Lakh, ₹1.4 Crore).
- Provide clear headings, bullet points, numbers, and an actionable "Recommended Execution Steps" section.
- Give concrete numbers based on the user's snapshot rather than vague generalities.
- If asked "What should I do with ₹X extra", compare Prepay vs SIP vs 50/50 split explicitly with return figures.`;

    // If Gemini API is available, call it
    if (ai && apiKey) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${contextStr}\n\nUSER QUESTION / GOAL:\n"${message}"\n\nPlease provide a clear, structured, actionable financial strategy.`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
        },
      });

      const replyText = response.text || 'Unable to generate response at this moment.';
      return res.json({ reply: replyText });
    }

    // Heuristic rule-based fallback if no API key is provided
    const fallbackReply = generateHeuristicAdvice(message, financialContext);
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Error generating AI advice:', error);
    // Graceful fallback to heuristic advice so the user is never stuck
    const fallback = generateHeuristicAdvice(req.body.message, req.body.financialContext);
    return res.json({
      reply: fallback + '\n\n*(Note: Generated via DhanVeda Offline Financial Rules Engine)*',
    });
  }
});

// Heuristic offline financial rule engine
function generateHeuristicAdvice(message: string, context: any): string {
  const loans = context?.loans || [];
  const totalDebt = Number(context?.totalDebt || 0);
  const totalEMI = Number(context?.totalEMI || 0);
  const totalAssets = Number(context?.totalAssets || 0);
  const netWorth = Number(context?.netWorth || 0);

  // Identify high-interest debts (>12%)
  const toxicLoans = loans.filter((l: any) => l.interestRate >= 12);
  const homeLoans = loans.filter((l: any) => l.category === 'Home' || l.interestRate <= 9.5);

  const queryLower = (message || '').toLowerCase();

  if (queryLower.includes('bonus') || queryLower.includes('extra') || queryLower.includes('50k') || queryLower.includes('lump')) {
    return `### 💡 Strategic Allocation for Your Extra Funds

Based on your current debt profile of **₹${totalDebt.toLocaleString('en-IN')}** with monthly EMIs of **₹${totalEMI.toLocaleString('en-IN')}**:

1. **Step 1: Eliminate Toxic Debt First**
${toxicLoans.length > 0 ? `You have high-interest debts like **${toxicLoans.map((l: any) => `${l.name} (${l.interestRate}%)`).join(', ')}**. Any extra funds must first wipe these out immediately. A 14-40% interest rate is an emergency.` : `Great news: You have no high-interest credit card or unsecured personal debt. All your loans are low/moderate rate.`}

2. **Step 2: Emergency Buffer Check**
Before prepaying home or car loans, ensure you have **at least 6 months of living expenses + EMIs** (approx ₹${(totalEMI * 6).toLocaleString('en-IN')}) safe in liquid funds or sweep FDs.

3. **Step 3: The Prepay vs. Invest "Golden 50/50 Split"**
- If your extra cash is **₹50,000 to ₹2,00,000**:
  - **50% Prepayment:** Knock down principal on your highest-rate loan. This yields a guaranteed, tax-free return equal to your loan interest rate.
  - **50% Equity SIP / Index Fund:** Invest in Nifty 50 / Flexi-cap funds with an expected 12% CAGR over 7+ years to prevent missing out on long-term wealth compounding.

**Net Result:** You shorten your loan tenure while concurrently building a growing wealth corpus!`;
  }

  if (queryLower.includes('avalanche') || queryLower.includes('snowball') || queryLower.includes('repay') || queryLower.includes('plan')) {
    const sortedAvalanche = [...loans].sort((a: any, b: any) => b.interestRate - a.interestRate);
    return `### 🎯 Your Tailored Debt Elimination Roadmap

#### 1. Debt Avalanche Strategy (Mathematically Optimal)
Ranked by interest rate to save the maximum money in lifetime interest:
${sortedAvalanche.map((l: any, i: number) => `**${i + 1}. ${l.name}** — Balance: ₹${Number(l.balance).toLocaleString('en-IN')} @ **${l.interestRate}% p.a.** (EMI: ₹${Number(l.emi).toLocaleString('en-IN')})`).join('\n')}

**Action:** Pay minimum EMIs on all loans, and divert every spare ₹1,000/month as principal prepayment toward **#1 (${sortedAvalanche[0]?.name || 'Highest Rate Loan'})**. Once killed, roll its entire EMI into #2.

#### 2. Key Multipliers:
- **Annual 5% Step-Up:** Increasing your EMI or prepayment by just 5% every year (matching your salary increment) can cut a 20-year home loan down to under 11 years!
- **Round-up Prepayments:** Rounding up an EMI of ₹32,400 to ₹35,000 pays off massive principal early in the amortization curve.`;
  }

  return `### 📊 DhanVeda Strategic Financial Assessment

**Current Net Worth:** ₹${netWorth.toLocaleString('en-IN')} (Assets: ₹${totalAssets.toLocaleString('en-IN')} | Debt: ₹${totalDebt.toLocaleString('en-IN')})

#### Key Recommendations for Your Portfolio:
1. **Debt-to-Asset Health:** Your debt represents ${totalAssets > 0 ? ((totalDebt / totalAssets) * 100).toFixed(1) : '0'}% of your gross assets. A ratio below 35% is considered healthy in Indian financial planning.
2. **Prepayment Pacing:** For loans below 9% (like Home Loans), do not prepay 100% of your spare cash. Indian equity markets historically return 12-14% CAGR over 10-year rolling periods. Strike a balance between peace-of-mind prepayment and mutual fund wealth creation.
3. **Interest Deduction Optimization:** If you have a Home Loan, utilize the full ₹2,00,000 Section 24(b) deduction if applicable to reduce your effective borrowing cost.
4. **Loan Balance Transfer:** If you are paying over 9.25% on a home loan, explore transferring to a PSU or private lender offering 8.40% - 8.65% to save lakhs over your remaining tenure.`;
}

// Development or Production handler
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DhanVeda Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
