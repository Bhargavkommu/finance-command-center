import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  Table, 
  Sparkles, 
  ArrowLeftRight, 
  ArrowUpDown, 
  Building, 
  Car, 
  CreditCard, 
  Coins, 
  Info,
  Calendar,
  X
} from 'lucide-react';
import { Loan } from '../types/finance';
import { 
  formatINR, 
  formatMonths, 
  generateAmortizationSchedule 
} from '../utils/financeMath';

interface LoansManagerProps {
  loans: Loan[];
  onOpenAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onSimulatePrepayment: (loanId: string) => void;
  onBalanceTransfer: (loanId: string) => void;
}

export const LoansManager: React.FC<LoansManagerProps> = ({
  loans,
  onOpenAddLoan,
  onEditLoan,
  onDeleteLoan,
  onSimulatePrepayment,
  onBalanceTransfer,
}) => {
  const [sortMethod, setSortMethod] = useState<'avalanche' | 'snowball' | 'balance' | 'emi'>('avalanche');
  const [selectedAmortizationLoan, setSelectedAmortizationLoan] = useState<Loan | null>(null);

  // Sorting
  const sortedLoans = [...loans].sort((a, b) => {
    if (sortMethod === 'avalanche') return b.interestRate - a.interestRate;
    if (sortMethod === 'snowball') return a.currentBalance - b.currentBalance;
    if (sortMethod === 'balance') return b.currentBalance - a.currentBalance;
    if (sortMethod === 'emi') return b.emi - a.emi;
    return 0;
  });

  // Aggregates
  const totalPrincipal = loans.reduce((sum, l) => sum + l.currentBalance, 0);
  const totalEMI = loans.reduce((sum, l) => sum + l.emi, 0);
  const weightedRate = totalPrincipal > 0
    ? loans.reduce((sum, l) => sum + l.interestRate * l.currentBalance, 0) / totalPrincipal
    : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Home': return Building;
      case 'Car': return Car;
      case 'CreditCard': return CreditCard;
      default: return Coins;
    }
  };

  // Amortization schedule for modal
  const amortizationData = selectedAmortizationLoan
    ? generateAmortizationSchedule(
        selectedAmortizationLoan.currentBalance,
        selectedAmortizationLoan.interestRate,
        selectedAmortizationLoan.emi,
        Math.min(selectedAmortizationLoan.tenureMonths, 360)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Active Debt & Loan Portfolio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track all institutional and unsecured liabilities, EMIs, and interest burdens.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={onOpenAddLoan}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Enter New Loan</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block mb-1">TOTAL PRINCIPAL DEBT</span>
          <span className="text-2xl font-black text-rose-400 font-mono">₹{formatINR(totalPrincipal)}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block mb-1">TOTAL MONTHLY EMI BURDEN</span>
          <span className="text-2xl font-black text-white font-mono">₹{formatINR(totalEMI)}<span className="text-xs text-slate-500 font-normal">/mo</span></span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block mb-1">WEIGHTED AVERAGE INTEREST RATE</span>
          <span className="text-2xl font-black text-teal-400 font-mono">{weightedRate.toFixed(2)}%<span className="text-xs text-slate-500 font-normal"> p.a.</span></span>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between text-xs bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Payoff Strategy Order:</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortMethod('avalanche')}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${
              sortMethod === 'avalanche'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Avalanche (Highest APR)
          </button>
          <button
            onClick={() => setSortMethod('snowball')}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${
              sortMethod === 'snowball'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Snowball (Lowest Balance)
          </button>
        </div>
      </div>

      {/* Loans Grid */}
      {loans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <p className="text-slate-400 text-sm">No loans found. Congratulations on zero debt, or click above to add your loans!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLoans.map((loan, index) => {
            const Icon = getCategoryIcon(loan.category);
            const progress = loan.originalPrincipal > 0
              ? Math.max(0, Math.min(100, ((loan.originalPrincipal - loan.currentBalance) / loan.originalPrincipal) * 100))
              : 0;

            return (
              <div
                key={loan.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500">#{index + 1}</span>
                          <h3 className="font-bold text-white text-sm">{loan.name}</h3>
                        </div>
                        <span className="text-xs text-slate-400">{loan.lenderName || loan.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditLoan(loan)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                        title="Edit loan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLoan(loan.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        title="Delete loan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                      loan.interestRate >= 12
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {loan.interestRate}% p.a.
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {formatMonths(loan.tenureMonths)} left
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400">
                      {loan.category}
                    </span>
                  </div>
                </div>

                {/* Balance & Progress */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Outstanding:</span>
                    <span className="text-lg font-black text-white font-mono">₹{formatINR(loan.currentBalance)}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400">Monthly EMI:</span>
                    <span className="font-bold text-slate-200 font-mono">₹{formatINR(loan.emi)}/mo</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Repaid: {progress.toFixed(0)}%</span>
                      <span>Orig: ₹{formatINR(loan.originalPrincipal, true)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 text-[11px]">
                  <button
                    onClick={() => setSelectedAmortizationLoan(loan)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 font-medium transition-all"
                  >
                    <Table className="w-3 h-3 text-teal-400" />
                    <span>Table</span>
                  </button>
                  <button
                    onClick={() => onSimulatePrepayment(loan.id)}
                    className="py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1 font-medium transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Prepay</span>
                  </button>
                  <button
                    onClick={() => onBalanceTransfer(loan.id)}
                    className="py-1.5 px-2 rounded-lg bg-teal-950/40 hover:bg-teal-900/60 text-teal-300 border border-teal-500/30 flex items-center justify-center gap-1 font-medium transition-all"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-teal-400" />
                    <span>Switch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Amortization Schedule Drawer/Modal */}
      {selectedAmortizationLoan && amortizationData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Amortization Schedule: {selectedAmortizationLoan.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Balance: ₹{formatINR(selectedAmortizationLoan.currentBalance)} @ {selectedAmortizationLoan.interestRate}% p.a. | EMI: ₹{formatINR(selectedAmortizationLoan.emi)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAmortizationLoan(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick summary stats in modal */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Total Projected Interest:</span>
                <span className="font-bold text-rose-400 font-mono">₹{formatINR(amortizationData.totalInterest)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Outflow (P+I):</span>
                <span className="font-bold text-white font-mono">₹{formatINR(amortizationData.totalPaid)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Months to Payoff:</span>
                <span className="font-bold text-emerald-400 font-mono">{amortizationData.monthsTaken} Months ({formatMonths(amortizationData.monthsTaken)})</span>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 sticky top-0 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Mo</th>
                    <th className="py-2.5 px-3">Beginning Balance</th>
                    <th className="py-2.5 px-3">EMI</th>
                    <th className="py-2.5 px-3">Principal</th>
                    <th className="py-2.5 px-3">Interest</th>
                    <th className="py-2.5 px-3 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {amortizationData.schedule.slice(0, 120).map((row) => (
                    <tr key={row.month} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-500">{row.month}</td>
                      <td className="py-2 px-3">₹{formatINR(row.beginningBalance)}</td>
                      <td className="py-2 px-3 font-semibold text-white">₹{formatINR(row.emi)}</td>
                      <td className="py-2 px-3 text-emerald-400">₹{formatINR(row.principal)}</td>
                      <td className="py-2 px-3 text-rose-400">₹{formatINR(row.interest)}</td>
                      <td className="py-2 px-3 text-right font-semibold">₹{formatINR(row.endingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {amortizationData.schedule.length > 120 && (
                <p className="text-center text-xs text-slate-500 py-3">
                  Showing first 120 months of {amortizationData.schedule.length} months.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
