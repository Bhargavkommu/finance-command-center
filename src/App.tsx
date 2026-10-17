import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { LoansManager } from './components/LoansManager';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { PrepayVsInvest } from './components/PrepayVsInvest';
import { BalanceTransferCalculator } from './components/BalanceTransferCalculator';
import { NetWorthTracker } from './components/NetWorthTracker';
import { AIAdvisor } from './components/AIAdvisor';
import { AddLoanModal } from './components/AddLoanModal';
import { AddAssetModal } from './components/AddAssetModal';
import { INITIAL_LOANS, INITIAL_ASSETS, INITIAL_USER_PROFILE } from './data/initialData';
import { Loan, Asset } from './types/finance';
import { calculateDebtFreeDate } from './utils/financeMath';

export default function App() {
  // Load loans strictly entered by the user (no preloaded dummy data)
  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      // Clear previous dummy demo data key if present
      localStorage.removeItem('dhanveda_loans');
      const saved = localStorage.getItem('dhanveda_user_loans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load assets entered by the user
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      localStorage.removeItem('dhanveda_assets');
      const saved = localStorage.getItem('dhanveda_user_assets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Profile data
  const [monthlyIncome, setMonthlyIncome] = useState<number>(INITIAL_USER_PROFILE.monthlyIncome);
  const [monthlyLivingExpenses, setMonthlyLivingExpenses] = useState<number>(INITIAL_USER_PROFILE.monthlyLivingExpenses);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal states
  const [isAddLoanOpen, setIsAddLoanOpen] = useState<boolean>(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState<boolean>(false);

  // Sync strictly to user storage
  useEffect(() => {
    try {
      localStorage.setItem('dhanveda_user_loans', JSON.stringify(loans));
    } catch (e) {
      console.error(e);
    }
  }, [loans]);

  useEffect(() => {
    try {
      localStorage.setItem('dhanveda_user_assets', JSON.stringify(assets));
    } catch (e) {
      console.error(e);
    }
  }, [assets]);

  // Aggregate metrics
  const totalDebt = loans.reduce((sum, l) => sum + l.currentBalance, 0);
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const netWorth = totalAssets - totalDebt;
  const maxRemainingMonths = loans.length > 0 ? Math.max(...loans.map((l) => l.tenureMonths)) : 0;
  const debtFreeDate = calculateDebtFreeDate(maxRemainingMonths);

  // Handlers for Loans
  const handleSaveLoan = (loan: Loan) => {
    setLoans((prev) => {
      const exists = prev.some((l) => l.id === loan.id);
      if (exists) {
        return prev.map((l) => (l.id === loan.id ? loan : l));
      }
      return [loan, ...prev];
    });
    setEditingLoan(null);
  };

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setIsAddLoanOpen(true);
  };

  const handleDeleteLoan = (loanId: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== loanId));
  };

  // Handlers for Assets
  const handleSaveAsset = (asset: Asset) => {
    setAssets((prev) => [asset, ...prev]);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  // Clear all data to start fresh
  const handleResetData = () => {
    if (window.confirm('Clear all entered loans and assets to start completely fresh?')) {
      setLoans([]);
      setAssets([]);
      localStorage.removeItem('dhanveda_user_loans');
      localStorage.removeItem('dhanveda_user_assets');
      localStorage.removeItem('dhanveda_loans');
      localStorage.removeItem('dhanveda_assets');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Header with navigation & quick KPIs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        netWorth={netWorth}
        totalDebt={totalDebt}
        debtFreeDate={debtFreeDate}
        onOpenAddLoan={() => {
          setEditingLoan(null);
          setIsAddLoanOpen(true);
        }}
        onOpenAddAsset={() => setIsAddAssetOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            loans={loans}
            assets={assets}
            monthlyIncome={monthlyIncome}
            monthlyLivingExpenses={monthlyLivingExpenses}
            onNavigateTab={setActiveTab}
            onOpenAddLoan={() => {
              setEditingLoan(null);
              setIsAddLoanOpen(true);
            }}
          />
        )}

        {activeTab === 'loans' && (
          <LoansManager
            loans={loans}
            onOpenAddLoan={() => {
              setEditingLoan(null);
              setIsAddLoanOpen(true);
            }}
            onEditLoan={handleEditLoan}
            onDeleteLoan={handleDeleteLoan}
            onSimulatePrepayment={() => setActiveTab('whatif')}
            onBalanceTransfer={() => setActiveTab('transfer')}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator
            loans={loans}
            onOpenAddLoan={() => {
              setEditingLoan(null);
              setIsAddLoanOpen(true);
            }}
          />
        )}

        {activeTab === 'prepay-invest' && (
          <PrepayVsInvest loans={loans} />
        )}

        {activeTab === 'transfer' && (
          <BalanceTransferCalculator loans={loans} />
        )}

        {activeTab === 'networth' && (
          <NetWorthTracker
            assets={assets}
            loans={loans}
            onOpenAddAsset={() => setIsAddAssetOpen(true)}
            onDeleteAsset={handleDeleteAsset}
            onOpenAddLoan={() => {
              setEditingLoan(null);
              setIsAddLoanOpen(true);
            }}
          />
        )}

        {activeTab === 'ai-advisor' && (
          <AIAdvisor
            loans={loans}
            assets={assets}
            monthlyIncome={monthlyIncome}
            monthlyLivingExpenses={monthlyLivingExpenses}
          />
        )}
      </main>

      {/* Modals */}
      <AddLoanModal
        isOpen={isAddLoanOpen}
        onClose={() => {
          setIsAddLoanOpen(false);
          setEditingLoan(null);
        }}
        onSaveLoan={handleSaveLoan}
        editingLoan={editingLoan}
      />

      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onSaveAsset={handleSaveAsset}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">DhanVeda</span>
            <span>•</span>
            <span>Personal Finance Command Centre</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Simulations reflect reducing balance amortizations & Section 24(b)/LTCG tax rules.
          </p>
        </div>
      </footer>
    </div>
  );
}
