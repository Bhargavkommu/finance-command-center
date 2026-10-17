import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  PieChart, 
  Flame, 
  ShieldAlert,
  CreditCard,
  Building,
  Car,
  Coins
} from 'lucide-react';
import { Loan, Asset } from '../types/finance';
import { formatINR, formatMonths, calculateDebtFreeDate } from '../utils/financeMath';

interface DashboardOverviewProps {
  loans: Loan[];
  assets: Asset[];
  monthlyIncome: number;
  monthlyLivingExpenses: number;
  onNavigateTab: (tab: string) => void;
  onOpenAddLoan: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  loans,
  assets,
  monthlyIncome,
  monthlyLivingExpenses,
  onNavigateTab,
  onOpenAddLoan,
}) => {
  // Financial computations
  const totalDebt = loans.reduce((sum, l) => sum + l.currentBalance, 0);
  const totalEMI = loans.reduce((sum, l) => sum + l.emi, 0);
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const netWorth = totalAssets - totalDebt;

  // Maximum remaining months across all loans
  const maxRemainingMonths = loans.length > 0 ? Math.max(...loans.map((l) => l.tenureMonths)) : 0;
  const debtFreeDate = calculateDebtFreeDate(maxRemainingMonths);

  // Toxic debts (Interest >= 12%)
  const toxicLoans = loans.filter((l) => l.interestRate >= 12);

  // Emergency Fund (Liquid Assets)
  const liquidAssets = assets
    .filter((a) => a.category === 'Liquid/Cash')
    .reduce((sum, a) => sum + a.value, 0);
  const totalMonthlyOutflow = totalEMI + monthlyLivingExpenses;
  const emergencyMonths = totalMonthlyOutflow > 0 ? Number((liquidAssets / totalMonthlyOutflow).toFixed(1)) : 0;

  // Ratios
  const emiToIncomeRatio = monthlyIncome > 0 ? (totalEMI / monthlyIncome) * 100 : 0;
  const debtToAssetRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Home': return Building;
      case 'Car': return Car;
      case 'CreditCard': return CreditCard;
      default: return Coins;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome & High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debt */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>TOTAL OUTSTANDING DEBT</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
            ₹{formatINR(totalDebt)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-slate-300 font-semibold">{loans.length} active loan{loans.length !== 1 ? 's' : ''}</span>
            <span>across lenders</span>
          </div>
        </div>

        {/* Monthly EMI Commitment */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>MONTHLY EMI COMMITMENT</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
            ₹{formatINR(totalEMI)}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">/month</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`font-semibold ${emiToIncomeRatio > 45 ? 'text-rose-400' : emiToIncomeRatio > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {emiToIncomeRatio.toFixed(1)}% of income
            </span>
            <span className="text-slate-500">({emiToIncomeRatio < 35 ? 'Safe' : emiToIncomeRatio < 50 ? 'Moderate' : 'Heavy'})</span>
          </div>
        </div>

        {/* Debt-Free Countdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>DEBT-FREE TARGET DATE</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-teal-300 tracking-tight">
            {debtFreeDate}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-teal-400 font-semibold">{formatMonths(maxRemainingMonths)}</span>
            <span>remaining on longest loan</span>
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>CURRENT NET WORTH</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl lg:text-3xl font-extrabold tracking-tight font-mono ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{formatINR(netWorth)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Assets: ₹{formatINR(totalAssets, true)}</span>
            <span className="text-emerald-400/80 font-medium cursor-pointer hover:underline" onClick={() => onNavigateTab('networth')}>
              View Balance Sheet →
            </span>
          </div>
        </div>
      </div>

      {/* If 0 loans, show welcoming onboarding card */}
      {loans.length === 0 && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Started</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Enter your loans to unlock your Command Centre
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No preloaded dummy data. Enter your actual home loan, car loan, personal loan, or credit card EMI to track total outstanding principal, simulate variable affordable prepayments, and plan your debt-free target date.
            </p>
          </div>
          <button
            onClick={onOpenAddLoan}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 shrink-0 active:scale-95"
          >
            <span>+ Enter Your Loan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero "What If I Pay Extra?" Highlight Banner */}
      <div className="relative rounded-2xl p-6 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 border border-emerald-500/30 overflow-hidden shadow-xl shadow-emerald-950/30">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Variable Affordability Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              "What if I pay extra towards my debt?"
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore our variable affordability table: compare ₹5k, ₹10k, ₹50k, or any budget you can comfortably afford to see exact months shaved off and lifetime interest saved.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('whatif')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 shrink-0 hover:scale-[1.02] active:scale-95"
          >
            <span>Open Variable Table</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Health Radar & Diagnostic Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagnostic Panel */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>FINANCIAL STABILITY RADAR</span>
            <span className="text-xs font-normal text-slate-400">Indian SEBI Rules</span>
          </h3>

          {/* Metric 1: Emergency Fund */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Emergency Fund Buffer</span>
              <span className={`font-bold font-mono ${emergencyMonths >= 6 ? 'text-emerald-400' : emergencyMonths >= 3 ? 'text-amber-400' : 'text-rose-400'}`}>
                {emergencyMonths} months runway
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${emergencyMonths >= 6 ? 'bg-emerald-500' : emergencyMonths >= 3 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, (emergencyMonths / 6) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {emergencyMonths >= 6 
                ? '✅ Excellent! 6+ months of living costs & EMIs secured.' 
                : '⚠️ Build at least 6 months of EMI buffer before aggressive prepayments.'}
            </p>
          </div>

          {/* Metric 2: Debt to Asset Ratio */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Debt-to-Asset Ratio</span>
              <span className={`font-bold font-mono ${debtToAssetRatio < 35 ? 'text-emerald-400' : debtToAssetRatio < 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {debtToAssetRatio.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${debtToAssetRatio < 35 ? 'bg-emerald-500' : debtToAssetRatio < 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, debtToAssetRatio)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {debtToAssetRatio < 35 
                ? '✅ Healthy solvency. Your total assets comfortably cover all debts.' 
                : '⚠️ Leverage is elevated. Prioritize debt reduction to increase solvency.'}
            </p>
          </div>

          {/* Metric 3: Toxic Debt Check */}
          {toxicLoans.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-rose-300 block">Toxic High-Interest Debt Alert!</span>
                <p className="text-slate-400 mt-0.5">
                  You have {toxicLoans.length} loan(s) with rate ≥ 12% ({toxicLoans.map((l) => l.name).join(', ')}). Wipe these out first using the Avalanche method.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-300 block">No Toxic High-APR Debts</span>
                <p className="text-slate-400 mt-0.5">
                  All active loans are below 12% p.a. You can balance loan prepayment with long-term equity investing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Active Loans Snapshot */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>ACTIVE LOAN PORTFOLIO</span>
              <span className="text-xs font-normal text-slate-400">({loans.length} Loans)</span>
            </h3>
            <button
              onClick={() => onNavigateTab('loans')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Manage & Amortization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loans.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No loans added yet.{' '}
              <button onClick={onOpenAddLoan} className="text-emerald-400 underline font-semibold ml-1">
                Add your first loan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => {
                const Icon = getCategoryIcon(loan.category);
                const progressPct = loan.originalPrincipal > 0 
                  ? Math.max(0, Math.min(100, ((loan.originalPrincipal - loan.currentBalance) / loan.originalPrincipal) * 100))
                  : 0;

                return (
                  <div
                    key={loan.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-white truncate">{loan.name}</h4>
                          <span className="text-xs text-slate-400">{loan.lenderName || loan.category}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-white font-mono">
                          ₹{formatINR(loan.currentBalance)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          EMI: <span className="font-semibold text-slate-200">₹{formatINR(loan.emi)}/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Rate Info */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                            loan.interestRate >= 12 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {loan.interestRate}% p.a.
                          </span>
                          <span>• {formatMonths(loan.tenureMonths)} left</span>
                        </span>
                        <span>{progressPct.toFixed(0)}% paid</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick links footer */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('prepay-invest')}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-slate-300 group-hover:text-emerald-400 flex items-center justify-between">
                <span>Prepay vs Invest</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Compare home loan payoff vs Nifty 50</p>
            </button>
            <button
              onClick={() => onNavigateTab('transfer')}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-slate-300 group-hover:text-emerald-400 flex items-center justify-between">
                <span>Balance Transfer</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Calculate net savings after switching fees</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
