import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  Percent, 
  DollarSign, 
  Coins, 
  Zap,
  Award
} from 'lucide-react';
import { Loan } from '../types/finance';
import { comparePrepayVsInvest, formatINR } from '../utils/financeMath';

interface PrepayVsInvestProps {
  loans: Loan[];
}

export const PrepayVsInvest: React.FC<PrepayVsInvestProps> = ({ loans }) => {
  // Inputs
  const [extraAmount, setExtraAmount] = useState<number>(10000);
  const [isMonthly, setIsMonthly] = useState<boolean>(true);
  const [loanRate, setLoanRate] = useState<number>(() => {
    // Default to lowest or home loan rate if available
    const homeLoan = loans.find((l) => l.category === 'Home');
    return homeLoan ? homeLoan.interestRate : 8.75;
  });
  const [investmentReturnRate, setInvestmentReturnRate] = useState<number>(12.5); // Nifty 50 / Equity MF
  const [durationYears, setDurationYears] = useState<number>(10);
  const [hasTaxBenefit, setHasTaxBenefit] = useState<boolean>(false); // Section 24b
  const [taxSlab, setTaxSlab] = useState<number>(30); // 30% tax bracket

  // Computation
  const comparison = useMemo(() => {
    const taxRelief = hasTaxBenefit ? taxSlab : 0;
    return comparePrepayVsInvest(
      extraAmount,
      isMonthly,
      loanRate,
      investmentReturnRate,
      durationYears,
      taxRelief
    );
  }, [extraAmount, isMonthly, loanRate, investmentReturnRate, durationYears, hasTaxBenefit, taxSlab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/70 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-500/30">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>The Great Financial Dilemma</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Prepayment vs Investment Arbitrage
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Should you aggressively pay off your loan, or invest the surplus cash into Equity Mutual Funds? Compare post-tax mathematical returns and psychological peace of mind.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Simulation Parameters
            </h3>

            {/* Mode: Monthly vs Lump Sum */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Surplus Type</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsMonthly(true); setExtraAmount(10000); }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    isMonthly ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly SIP Surplus
                </button>
                <button
                  type="button"
                  onClick={() => { setIsMonthly(false); setExtraAmount(200000); }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    !isMonthly ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  One-time Lump Sum
                </button>
              </div>
            </div>

            {/* Surplus Amount */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">
                  {isMonthly ? 'Extra Monthly Amount:' : 'Lump Sum Amount:'}
                </span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  ₹{formatINR(extraAmount)}
                </span>
              </div>
              <input
                type="range"
                min={isMonthly ? 2000 : 25000}
                max={isMonthly ? 100000 : 2000000}
                step={isMonthly ? 1000 : 25000}
                value={extraAmount}
                onChange={(e) => setExtraAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Loan Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Loan Interest Rate (% p.a.):</span>
                <span className="font-mono font-bold text-rose-400">{loanRate}%</span>
              </div>
              <input
                type="range"
                min={6}
                max={18}
                step={0.25}
                value={loanRate}
                onChange={(e) => setLoanRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2">
                {loans.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLoanRate(l.interestRate)}
                    className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Use {l.name} ({l.interestRate}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Section 24b Tax Deduction */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTaxBenefit}
                    onChange={(e) => setHasTaxBenefit(e.target.checked)}
                    className="rounded bg-slate-800 text-emerald-500 border-slate-700 w-4 h-4"
                  />
                  <span>Section 24(b) Home Loan Tax Relief</span>
                </label>
                <span className="text-[10px] text-slate-500">Up to ₹2L interest</span>
              </div>

              {hasTaxBenefit && (
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Your Income Tax Slab:</span>
                  <select
                    value={taxSlab}
                    onChange={(e) => setTaxSlab(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value={20}>20% Tax Bracket</option>
                    <option value={30}>30% Tax Bracket</option>
                  </select>
                </div>
              )}
            </div>

            {/* Investment Expected Return */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Expected Investment Return (CAGR):</span>
                <span className="font-mono font-bold text-emerald-400">{investmentReturnRate}% p.a.</span>
              </div>
              <input
                type="range"
                min={7}
                max={18}
                step={0.5}
                value={investmentReturnRate}
                onChange={(e) => setInvestmentReturnRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  onClick={() => setInvestmentReturnRate(7.5)}
                  className="py-1 px-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-center"
                >
                  FD / Debt (7.5%)
                </button>
                <button
                  onClick={() => setInvestmentReturnRate(12.0)}
                  className="py-1 px-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-center"
                >
                  Nifty 50 (12%)
                </button>
                <button
                  onClick={() => setInvestmentReturnRate(14.0)}
                  className="py-1 px-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-center"
                >
                  Flexi-cap (14%)
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Time Horizon:</span>
                <span className="font-mono font-bold text-slate-200">{durationYears} Years</span>
              </div>
              <input
                type="range"
                min={3}
                max={25}
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results & Comparison Analysis */}
        <div className="lg:col-span-7 space-y-5">
          {/* Winner Banner */}
          <div className={`rounded-2xl p-5 border ${
            comparison.winner === 'INVESTMENT'
              ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-r from-teal-950/60 to-slate-900 border-teal-500/40'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Award className="w-4 h-4" />
              <span>THE ARBITRAGE VERDICT</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              {comparison.winner === 'INVESTMENT'
                ? `Investing creates ₹${formatINR(Math.abs(comparison.netWealthDifference))} MORE net wealth!`
                : `Prepaying saves ₹${formatINR(Math.abs(comparison.netWealthDifference))} MORE money!`}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Break-even Hurdle Rate: Your investments need to return at least{' '}
              <strong className="text-white font-mono">{comparison.hurdleRate}% p.a.</strong> (post 12.5% LTCG tax) to beat paying off a {comparison.effectiveLoanRate}% loan.
            </p>
          </div>

          {/* Three Paths Card Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Path 1: 100% Prepay */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% PREPAY</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total Interest Saved:</span>
                <span className="text-lg font-bold text-white font-mono">
                  ₹{formatINR(comparison.interestSaved)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• Guaranteed risk-free return of {comparison.effectiveLoanRate}% p.a.</p>
                <p>• Psychological peace of mind & zero debt anxiety.</p>
              </div>
            </div>

            {/* Path 2: 100% Invest */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                MAX WEALTH
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>100% INVEST (SIP)</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Net Corpus Created:</span>
                <span className="text-lg font-bold text-white font-mono">
                  ₹{formatINR(comparison.netInvestmentValue)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• ₹{formatINR(comparison.investmentGain)} capital growth.</p>
                <p>• Factored 12.5% LTCG tax (₹{formatINR(comparison.estimatedTax)}).</p>
              </div>
            </div>

            {/* Path 3: The 50/50 Golden Ratio */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/40 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <Zap className="w-4 h-4" />
                <span>50/50 HYBRID (RECOMMENDED)</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Combined Value:</span>
                <span className="text-lg font-bold text-white font-mono">
                  ₹{formatINR(comparison.hybridNetWealth)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• Saves ₹{formatINR(comparison.hybridInterestSaved)} interest.</p>
                <p>• Builds solid equity wealth simultaneously.</p>
              </div>
            </div>
          </div>

          {/* Practical Wisdom Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>How Smart Indian Investors Choose:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <strong className="text-rose-400 block mb-1">When to Prepay 100%:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  If the loan interest rate is above 10% (Car loans, Personal loans, Credit cards), prepay immediately. No stock market can guarantee 10-14% post-tax risk-free returns.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <strong className="text-emerald-400 block mb-1">When to Invest in Equity:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  If you have a Home Loan at 8.5% with Section 24b tax rebate (effective ~6.5%), diverting everything into prepayment loses out on compounding Nifty 50 returns (12-14%). Choose the 50/50 split!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
