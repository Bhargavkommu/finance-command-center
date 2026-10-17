import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingDown, 
  Clock, 
  Coins, 
  FileText,
  Building,
  HelpCircle
} from 'lucide-react';
import { Loan } from '../types/finance';
import { calculateBalanceTransfer, formatINR, formatMonths } from '../utils/financeMath';

interface BalanceTransferCalculatorProps {
  loans: Loan[];
}

export const BalanceTransferCalculator: React.FC<BalanceTransferCalculatorProps> = ({ loans }) => {
  // Pre-select first loan or home loan
  const defaultLoan = loans.find((l) => l.category === 'Home') || loans[0];

  const [selectedLoanId, setSelectedLoanId] = useState<string>(defaultLoan?.id || 'custom');
  const [balance, setBalance] = useState<number>(defaultLoan?.currentBalance || 3500000);
  const [currentRate, setCurrentRate] = useState<number>(defaultLoan?.interestRate || 8.95);
  const [remainingTenure, setRemainingTenure] = useState<number>(defaultLoan?.tenureMonths || 180);
  
  // New Lender details
  const [newRate, setNewRate] = useState<number>(8.40);
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(0.5); // 0.5%
  const [otherCharges, setOtherCharges] = useState<number>(3500); // MODT / legal / valuation
  const [adjustTenure, setAdjustTenure] = useState<boolean>(false);
  const [newTenureMonths, setNewTenureMonths] = useState<number>(remainingTenure);

  // When selected loan changes
  const handleSelectLoan = (loanId: string) => {
    setSelectedLoanId(loanId);
    if (loanId !== 'custom') {
      const loan = loans.find((l) => l.id === loanId);
      if (loan) {
        setBalance(loan.currentBalance);
        setCurrentRate(loan.interestRate);
        setRemainingTenure(loan.tenureMonths);
        setNewTenureMonths(loan.tenureMonths);
        // propose realistic 0.5% lower rate
        setNewRate(Number((Math.max(7.5, loan.interestRate - 0.5)).toFixed(2)));
      }
    }
  };

  const result = useMemo(() => {
    return calculateBalanceTransfer(
      balance,
      currentRate,
      remainingTenure,
      newRate,
      processingFeePercent,
      otherCharges,
      adjustTenure ? newTenureMonths : undefined
    );
  }, [balance, currentRate, remainingTenure, newRate, processingFeePercent, otherCharges, adjustTenure, newTenureMonths]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-cyan-950/70 border border-teal-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
              <ArrowLeftRight className="w-3.5 h-3.5 text-teal-400" />
              <span>Lender Refinancing Evaluator</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Loan Balance-Transfer Calculator
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Check if transferring your loan to another bank at a lower interest rate is truly profitable after accounting for processing fees (0.5% + 18% GST), MODT, and legal expenses.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              1. Current Loan Details
            </h3>

            {/* Quick load from active portfolio */}
            {loans.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Load from My Loans:</label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => handleSelectLoan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="custom">-- Enter Custom Loan --</option>
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} — ₹{formatINR(l.currentBalance)} @ {l.interestRate}% ({l.tenureMonths} mos)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Balance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Outstanding Principal Balance:</span>
                <span className="font-mono font-bold text-white">₹{formatINR(balance)}</span>
              </div>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Math.max(10000, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
              />
            </div>

            {/* Current Rate & Remaining Tenure */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Current Rate (%):</label>
                <input
                  type="number"
                  step="0.05"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Remaining Months:</label>
                <input
                  type="number"
                  value={remainingTenure}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRemainingTenure(val);
                    if (!adjustTenure) setNewTenureMonths(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Current Monthly EMI:</span>
              <span className="font-bold font-mono text-slate-200">₹{formatINR(result.currentMonthlyEMI)}/mo</span>
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 pt-3 border-t border-slate-800">
              2. New Lender Offer
            </h3>

            {/* New Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">New Interest Rate (% p.a.):</span>
                <span className="font-mono font-bold text-teal-400">{newRate}%</span>
              </div>
              <input
                type="number"
                step="0.05"
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
              />
              <span className="text-[11px] text-teal-400 block font-medium">
                Rate difference: {(currentRate - newRate).toFixed(2)}% lower
              </span>
            </div>

            {/* Processing Fee & Other Charges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Processing Fee (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={processingFeePercent}
                  onChange={(e) => setProcessingFeePercent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 block">+ 18% GST added</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Legal / MODT (₹):</label>
                <input
                  type="number"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Recommendation Banner */}
          <div className={`p-5 rounded-2xl border ${
            result.recommendationGrade === 'STRONG_SWITCH'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : result.recommendationGrade === 'MODERATE_SWITCH'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              {result.recommendationGrade === 'STRONG_SWITCH' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {result.recommendationGrade === 'MODERATE_SWITCH' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {result.recommendationGrade === 'STAY_PUT' && <XCircle className="w-5 h-5 text-rose-400" />}
              <span className="text-xs font-bold uppercase tracking-wider">
                {result.recommendationGrade === 'STRONG_SWITCH'
                  ? 'RECOMMENDED: GO FOR BALANCE TRANSFER'
                  : result.recommendationGrade === 'MODERATE_SWITCH'
                  ? 'MODERATE BENEFIT: NEGOTIATE FIRST'
                  : 'NOT RECOMMENDED: STAY WITH CURRENT LENDER'}
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {result.recommendationReason}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Net Lifetime Savings */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Net Lifetime Savings
              </span>
              <div className={`text-xl font-black font-mono ${result.netLifetimeSavings > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{formatINR(result.netLifetimeSavings)}
              </div>
              <p className="text-[10px] text-slate-500">After all fees & 18% GST</p>
            </div>

            {/* Monthly EMI Reduction */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Monthly EMI Reduction
              </span>
              <div className="text-xl font-black font-mono text-white">
                ₹{formatINR(result.monthlySavings)}
                <span className="text-xs text-slate-400 font-sans font-normal">/mo</span>
              </div>
              <p className="text-[10px] text-teal-400">₹{formatINR(result.newMonthlyEMI)} new EMI</p>
            </div>

            {/* Break-even timeline */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Break-Even Period
              </span>
              <div className="text-xl font-black font-mono text-cyan-300">
                {result.breakEvenMonths < 900 ? `${result.breakEvenMonths} Months` : 'N/A'}
              </div>
              <p className="text-[10px] text-slate-500">To recover switching fee</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
              Detailed Cost & Benefit Ledger
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Gross Interest Saved:</span>
                <span className="font-mono font-bold text-emerald-400">+₹{formatINR(result.grossInterestSaved)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Processing Fee ({processingFeePercent}% + 18% GST):</span>
                <span className="font-mono font-medium text-rose-400">-₹{formatINR(result.processingFeeAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">MODT / Legal / Valuation Charges:</span>
                <span className="font-mono font-medium text-rose-400">-₹{formatINR(result.otherCharges)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold">
                <span className="text-white">Net Clean In-Pocket Savings:</span>
                <span className={`font-mono ${result.netLifetimeSavings > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{formatINR(result.netLifetimeSavings)}
                </span>
              </div>
            </div>
          </div>

          {/* Negotiation Pro-Tip */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1 text-slate-400">
            <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
              <HelpCircle className="w-4 h-4" />
              <span>Pro-Tip: Internal Rate Conversion / "Retention Request"</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Before submitting balance transfer documents to a new bank, contact your existing bank's loan manager and request an <strong>Internal Rate Reset</strong> (often called a Switch Fee of ₹1,000 - ₹5,000). Banks routinely match competitor rates to prevent customer attrition without you having to re-do KYC or MODT!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
