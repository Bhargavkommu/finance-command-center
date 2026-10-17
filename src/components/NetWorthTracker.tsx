import React, { useState } from 'react';
import { 
  PieChart, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Coins, 
  Building, 
  Landmark, 
  Award,
  Wallet,
  Sparkles
} from 'lucide-react';
import { Asset, Loan } from '../types/finance';
import { formatINR } from '../utils/financeMath';

interface NetWorthTrackerProps {
  assets: Asset[];
  loans: Loan[];
  onOpenAddAsset: () => void;
  onDeleteAsset: (id: string) => void;
  onOpenAddLoan: () => void;
}

export const NetWorthTracker: React.FC<NetWorthTrackerProps> = ({
  assets,
  loans,
  onOpenAddAsset,
  onDeleteAsset,
  onOpenAddLoan,
}) => {
  // Aggregate Assets
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);

  // Aggregate Liabilities (Auto-linked from Loans)
  const totalLiabilities = loans.reduce((sum, l) => sum + l.currentBalance, 0);

  // Net Worth
  const netWorth = totalAssets - totalLiabilities;

  // Asset Breakdown by Category
  const categories = [
    'Liquid/Cash',
    'Mutual Funds & Stocks',
    'Retirement (PF/PPF/NPS)',
    'Real Estate & Land',
    'Gold & SGB',
    'Crypto',
    'Vehicle & Other',
  ];

  const categoryTotals = categories.map((cat) => {
    const sum = assets
      .filter((a) => a.category === cat)
      .reduce((acc, a) => acc + a.value, 0);
    const pct = totalAssets > 0 ? (sum / totalAssets) * 100 : 0;
    return { category: cat, total: sum, percentage: pct };
  }).filter((c) => c.total > 0);

  // Liquid assets (Cash + Equity)
  const liquidAssets = assets
    .filter((a) => a.category === 'Liquid/Cash' || a.category === 'Mutual Funds & Stocks')
    .reduce((sum, a) => sum + a.value, 0);
  const liquidNetWorth = liquidAssets - totalLiabilities;

  // Solvency ratio (Net Worth / Total Assets)
  const solvencyRatio = totalAssets > 0 ? ((netWorth / totalAssets) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Balance Sheet</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Personal Net-Worth Command
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track your true wealth (Assets minus Debts). Real-time synchronized with all your active loans and investments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddAsset}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Asset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Assets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TOTAL ASSETS</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{formatINR(totalAssets)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {assets.length} investment & physical asset{assets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Liabilities */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TOTAL LIABILITIES</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            ₹{formatINR(totalLiabilities)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Synced from {loans.length} active loan{loans.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Net Worth */}
        <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 bg-gradient-to-br from-emerald-950/30 to-slate-900">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>TRUE NET WORTH</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{formatINR(netWorth)}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            Solvency Ratio: {solvencyRatio.toFixed(1)}% ({solvencyRatio > 50 ? 'Strong' : 'Moderate'})
          </p>
        </div>
      </div>

      {/* Asset Allocation Breakdown Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
          Asset Allocation Distribution
        </h3>

        {/* Multi-segmented bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
          {categoryTotals.map((c, i) => {
            const colors = [
              'bg-emerald-500',
              'bg-teal-400',
              'bg-blue-500',
              'bg-indigo-500',
              'bg-amber-400',
              'bg-purple-500',
              'bg-rose-400',
            ];
            return (
              <div
                key={c.category}
                className={`h-full ${colors[i % colors.length]}`}
                style={{ width: `${c.percentage}%` }}
                title={`${c.category}: ${c.percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 text-xs">
          {categoryTotals.map((c, i) => {
            const dotColors = [
              'bg-emerald-500',
              'bg-teal-400',
              'bg-blue-500',
              'bg-indigo-500',
              'bg-amber-400',
              'bg-purple-500',
              'bg-rose-400',
            ];
            return (
              <div key={c.category} className="flex items-center gap-1.5 text-slate-300">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColors[i % dotColors.length]}`} />
                <span className="font-medium">{c.category}:</span>
                <span className="font-mono font-bold text-white">₹{formatINR(c.total, true)}</span>
                <span className="text-[10px] text-slate-500">({c.percentage.toFixed(1)}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assets & Liabilities Side-by-Side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Asset Portfolio ({assets.length})</span>
            </h3>
            <button
              onClick={onOpenAddAsset}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2.5">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-slate-500">{asset.category}</span>
                    {asset.expectedReturnRate && (
                      <span className="text-emerald-400 font-mono">~{asset.expectedReturnRate}% return</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-white text-sm">
                    ₹{formatINR(asset.value)}
                  </span>
                  <button
                    onClick={() => onDeleteAsset(asset.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Remove asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities List (Auto-linked) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-rose-400" />
              <span>Liabilities & Debts ({loans.length})</span>
            </h3>
            <button
              onClick={onOpenAddLoan}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              + Add Loan
            </button>
          </div>

          <div className="space-y-2.5">
            {loans.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Zero liabilities recorded!
              </div>
            ) : (
              loans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{loan.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-slate-500">{loan.lenderName || loan.category}</span>
                      <span className="text-rose-400 font-mono">{loan.interestRate}% APR</span>
                      <span className="text-slate-500">EMI: ₹{formatINR(loan.emi)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-mono font-bold text-rose-400 text-sm">
                      ₹{formatINR(loan.currentBalance)}
                    </span>
                    <span className="block text-[10px] text-slate-500">Auto-synced</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
