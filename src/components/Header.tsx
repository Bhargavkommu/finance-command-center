import React from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  TrendingUp, 
  Sparkles, 
  Calculator, 
  ArrowLeftRight, 
  PieChart, 
  RotateCcw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { formatINR } from '../utils/financeMath';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  netWorth: number;
  totalDebt: number;
  debtFreeDate: string;
  onOpenAddLoan: () => void;
  onOpenAddAsset: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  netWorth,
  totalDebt,
  debtFreeDate,
  onOpenAddLoan,
  onOpenAddAsset,
  onResetData,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Command Centre', icon: ShieldCheck },
    { id: 'loans', label: 'Loans & EMIs', icon: Wallet },
    { id: 'whatif', label: 'What-If Prepay', icon: Sparkles, badge: 'Variable' },
    { id: 'prepay-invest', label: 'Prepay vs Invest', icon: TrendingUp },
    { id: 'transfer', label: 'Balance Transfer', icon: ArrowLeftRight },
    { id: 'networth', label: 'Net-Worth Tracker', icon: PieChart },
    { id: 'ai-advisor', label: 'AI Strategist', icon: HelpCircle, aiGlow: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & quick KPI bar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          {/* Logo & title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">₹</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    DhanVeda
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Command Centre
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Personal Finance, Debt Eradication & Wealth Strategy
                </p>
              </div>
            </div>

            {/* Quick KPI badge on mobile */}
            <div className="md:hidden text-right">
              <span className="text-xs text-slate-400">Net Worth</span>
              <p className={`text-sm font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{formatINR(netWorth, true)}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
            {/* Desktop Quick KPIs */}
            <div className="hidden lg:flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Net Worth</span>
                <span className={`font-bold font-mono ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{formatINR(netWorth)}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Total Debt</span>
                <span className="font-bold font-mono text-rose-400">
                  ₹{formatINR(totalDebt)}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Debt-Free Target</span>
                <span className="font-bold text-teal-300">
                  {debtFreeDate}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddLoan}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm shadow-emerald-600/30 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Loan</span>
              </button>
              <button
                onClick={onOpenAddAsset}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 transition-all active:scale-95"
              >
                <span>+ Add Asset</span>
              </button>
              <button
                onClick={onResetData}
                title="Reset to realistic Indian sample portfolio"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-850 pt-2 -mb-px">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all relative ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-inner border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                } ${tab.aiGlow && !isActive ? 'hover:text-purple-300' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  isActive 
                    ? 'text-emerald-400' 
                    : tab.aiGlow 
                      ? 'text-purple-400' 
                      : 'text-slate-400'
                }`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                    {tab.badge}
                  </span>
                )}
                {tab.aiGlow && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
