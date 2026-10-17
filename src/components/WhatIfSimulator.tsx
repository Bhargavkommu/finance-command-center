import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Coins, 
  Calendar, 
  Clock, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Coffee,
  Check,
  Layers,
  HelpCircle,
  Table as TableIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Loan } from '../types/finance';
import { 
  simulatePrepayment, 
  formatINR, 
  formatMonths, 
  calculateDebtFreeDate 
} from '../utils/financeMath';

interface WhatIfSimulatorProps {
  loans: Loan[];
  onOpenAddLoan: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ loans, onOpenAddLoan }) => {
  // Mode: monthly recurring extra vs lump sum
  const [paymentMode, setPaymentMode] = useState<'monthly' | 'lumpSum'>('monthly');

  // User chosen affordable amount (default: ₹50,000 or ₹10,000 depending on mode)
  const [chosenAmount, setChosenAmount] = useState<number>(10000);

  // Selected loan
  const [selectedLoanId, setSelectedLoanId] = useState<string>(loans[0]?.id || 'highest-rate');

  // Identify target loan
  const targetLoan = useMemo(() => {
    if (loans.length === 0) return null;
    if (selectedLoanId === 'highest-rate') {
      return [...loans].sort((a, b) => b.interestRate - a.interestRate)[0];
    }
    if (selectedLoanId === 'lowest-balance') {
      return [...loans].sort((a, b) => a.currentBalance - b.currentBalance)[0];
    }
    return loans.find((l) => l.id === selectedLoanId) || loans[0];
  }, [loans, selectedLoanId]);

  // Baseline tiers for the variable affordability table
  const variableTiers = useMemo(() => {
    if (paymentMode === 'monthly') {
      const baseAmounts = [2500, 5000, 10000, 20000, 50000, 75000];
      // Include user's custom chosen amount if not already in the list
      const set = new Set([...baseAmounts, chosenAmount].filter((a) => a > 0));
      return Array.from(set).sort((a, b) => a - b);
    } else {
      const baseAmounts = [25000, 50000, 100000, 200000, 500000];
      const set = new Set([...baseAmounts, chosenAmount].filter((a) => a > 0));
      return Array.from(set).sort((a, b) => a - b);
    }
  }, [paymentMode, chosenAmount]);

  // Calculate table rows dynamically for all variable tiers
  const tableData = useMemo(() => {
    if (!targetLoan) return [];

    return variableTiers.map((tierAmount) => {
      const lumpSum = paymentMode === 'lumpSum' ? tierAmount : 0;
      const monthlyExtra = paymentMode === 'monthly' ? tierAmount : 0;
      const sim = simulatePrepayment(targetLoan, lumpSum, monthlyExtra);

      const interestCutPercent = sim.originalTotalInterest > 0
        ? Math.round((sim.interestSaved / sim.originalTotalInterest) * 100)
        : 0;

      // Daily equivalent for monthly extra
      const dailyEquivalent = paymentMode === 'monthly' ? Math.round(tierAmount / 30) : 0;

      return {
        amount: tierAmount,
        sim,
        interestCutPercent,
        dailyEquivalent,
        isChosen: tierAmount === chosenAmount,
      };
    });
  }, [targetLoan, variableTiers, paymentMode, chosenAmount]);

  // Primary active simulation based on chosen amount
  const activeSimulation = useMemo(() => {
    if (!targetLoan) return null;
    const lumpSum = paymentMode === 'lumpSum' ? chosenAmount : 0;
    const monthlyExtra = paymentMode === 'monthly' ? chosenAmount : 0;
    return simulatePrepayment(targetLoan, lumpSum, monthlyExtra);
  }, [targetLoan, chosenAmount, paymentMode]);

  // Trigger celebration confetti
  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#14b8a6', '#06b6d4', '#eab308'],
    });
  };

  // If no loans exist yet
  if (loans.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">No Loans Entered Yet</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Please enter your active loans first. Once added, you can test different affordable extra amounts (₹5k, ₹10k, ₹50k, etc.) to see how much tenure and interest you can save.
        </p>
        <button
          onClick={onOpenAddLoan}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
        >
          + Enter Your First Loan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Affordability & Prepayment Explorer</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Variable What-If Prepayment Table
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Choose what amount is comfortably affordable for your budget. Compare different monthly or lump-sum tiers side-by-side to discover your optimal payoff pace.
            </p>
          </div>

          {activeSimulation && activeSimulation.interestSaved > 20000 && (
            <button
              onClick={handleTriggerConfetti}
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Celebrate Savings 🎉</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Loan & Affordability Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Loan Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Target Loan:
            </label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="highest-rate">⚡ Highest Interest (Avalanche Priority)</option>
              <option value="lowest-balance">🎯 Smallest Balance (Snowball Priority)</option>
              <optgroup label="Specific Loan:">
                {loans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — ₹{formatINR(l.currentBalance)} @ {l.interestRate}% ({l.tenureMonths} mos)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Mode: Monthly vs Lump Sum */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Prepayment Strategy:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('monthly');
                  if (chosenAmount > 100000) setChosenAmount(10000);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  paymentMode === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Extra EMI
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('lumpSum');
                  if (chosenAmount < 25000) setChosenAmount(50000);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  paymentMode === 'lumpSum'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                One-Time Lump Sum
              </button>
            </div>
          </div>

          {/* Custom Affordable Amount Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">
                {paymentMode === 'monthly' ? 'My Affordable Monthly Extra:' : 'My Affordable Lump Sum:'}
              </span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{formatINR(chosenAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={paymentMode === 'monthly' ? 500 : 5000}
                min={paymentMode === 'monthly' ? 500 : 5000}
                value={chosenAmount}
                onChange={(e) => setChosenAmount(Math.max(100, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick Slider for Continuous Tuning */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Fine-tune amount slider:</span>
            <span>Current Selection: <strong className="text-white font-mono">₹{formatINR(chosenAmount)}</strong></span>
          </div>
          <input
            type="range"
            min={paymentMode === 'monthly' ? 1000 : 10000}
            max={paymentMode === 'monthly' ? 100000 : 1000000}
            step={paymentMode === 'monthly' ? 1000 : 10000}
            value={chosenAmount}
            onChange={(e) => setChosenAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* The Variable Affordability Comparison Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-emerald-400" />
              <span>Variable Affordability Table: {targetLoan?.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any tier below to choose it and view its complete accelerated payoff details.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Current Loan EMI: <strong className="text-white font-mono">₹{formatINR(targetLoan?.emi || 0)}/mo</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Affordable Extra Amount</th>
                {paymentMode === 'monthly' && <th className="py-3 px-4">Daily Budget Impact</th>}
                <th className="py-3 px-4">Time Saved</th>
                <th className="py-3 px-4">Total Interest Saved</th>
                <th className="py-3 px-4">New Debt-Free Date</th>
                <th className="py-3 px-4">Total Monthly Outflow</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableData.map((row) => {
                const isSelected = row.isChosen;
                const monthlyOutflow = (targetLoan?.emi || 0) + (paymentMode === 'monthly' ? row.amount : 0);

                return (
                  <tr
                    key={row.amount}
                    onClick={() => setChosenAmount(row.amount)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-l-4 border-l-emerald-500 font-medium'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          ₹{formatINR(row.amount)}
                          <span className="text-[10px] text-slate-400 font-normal">
                            {paymentMode === 'monthly' ? '/mo' : ' once'}
                          </span>
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Selected
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Daily Impact (if monthly) */}
                    {paymentMode === 'monthly' && (
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          <Coffee className="w-3 h-3 text-amber-400" />
                          <span>₹{row.dailyEquivalent}/day</span>
                        </span>
                      </td>
                    )}

                    {/* Time Saved */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-teal-400">
                        {row.sim.monthsSaved} Months
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({row.sim.yearsSaved} yrs sooner)
                      </span>
                    </td>

                    {/* Total Interest Saved */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold font-mono text-emerald-400 text-sm">
                        ₹{formatINR(row.sim.interestSaved)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({row.interestCutPercent}% less interest)
                      </span>
                    </td>

                    {/* New Debt-Free Date */}
                    <td className="py-3.5 px-4 text-slate-200">
                      {calculateDebtFreeDate(row.sim.newTenureMonths)}
                    </td>

                    {/* Total Outflow */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₹{formatINR(monthlyOutflow)}/mo
                    </td>

                    {/* Select Button */}
                    <td className="py-3.5 px-4 text-right">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChosenAmount(row.amount);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        >
                          Choose
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Breakdown for the Chosen Plan */}
      {activeSimulation && targetLoan && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                Detailed Impact: Paying Extra ₹{formatINR(chosenAmount)} {paymentMode === 'monthly' ? '/ Month' : ' Lump Sum'} on {targetLoan.name}
              </span>
            </h4>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Saves {activeSimulation.monthsSaved} Months Total
            </span>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Total Interest Avoided
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ₹{formatINR(activeSimulation.interestSaved)}
              </div>
              <p className="text-[10px] text-slate-400">Guaranteed direct savings</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Revised Loan Tenure
              </span>
              <div className="text-2xl font-black text-teal-300 font-mono">
                {activeSimulation.newTenureMonths} Months
              </div>
              <p className="text-[10px] text-slate-400">
                Reduced from {activeSimulation.originalTenureMonths} months ({formatMonths(activeSimulation.originalTenureMonths)})
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Debt-Free Date
              </span>
              <div className="text-2xl font-black text-white">
                {calculateDebtFreeDate(activeSimulation.newTenureMonths)}
              </div>
              <p className="text-[10px] text-emerald-400">
                {activeSimulation.yearsSaved} years earlier than original schedule
              </p>
            </div>
          </div>

          {/* Visual Amortization Trajectory Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Tenure reduction comparison</span>
              <span className="text-emerald-400 font-semibold">
                {Math.round((activeSimulation.monthsSaved / activeSimulation.originalTenureMonths) * 100)}% shorter tenure
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
                style={{ width: `${Math.max(5, (activeSimulation.newTenureMonths / activeSimulation.originalTenureMonths) * 100)}%` }}
              />
              <div 
                className="h-full bg-slate-700/60"
                style={{ width: `${(activeSimulation.monthsSaved / activeSimulation.originalTenureMonths) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>New finish: {activeSimulation.newTenureMonths} mos</span>
              <span className="text-emerald-400 font-medium">Shaved off: {activeSimulation.monthsSaved} mos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
