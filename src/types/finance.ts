export type LoanCategory = 
  | 'Home' 
  | 'Car' 
  | 'Personal' 
  | 'Education' 
  | 'CreditCard' 
  | 'Gold' 
  | 'Other';

export interface Loan {
  id: string;
  name: string;
  category: LoanCategory;
  lenderName: string;
  originalPrincipal: number;
  currentBalance: number;
  interestRate: number; // annual percentage e.g. 8.75
  tenureMonths: number; // remaining months
  emi: number; // monthly installment
  startDate?: string;
  notes?: string;
}

export type AssetCategory = 
  | 'Liquid/Cash' 
  | 'Mutual Funds & Stocks' 
  | 'Retirement (PF/PPF/NPS)' 
  | 'Real Estate & Land' 
  | 'Gold & SGB' 
  | 'Crypto' 
  | 'Vehicle & Other';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  expectedReturnRate?: number; // annual %
  notes?: string;
}

export interface Liability {
  id: string;
  name: string;
  category: string;
  value: number;
  isLoanLinked?: boolean;
  loanId?: string;
}

export interface AmortizationRow {
  month: number;
  beginningBalance: number;
  emi: number;
  principal: number;
  interest: number;
  extraPrepayment: number;
  endingBalance: number;
}

export interface PrepaymentSimulationResult {
  originalTenureMonths: number;
  newTenureMonths: number;
  monthsSaved: number;
  yearsSaved: number;
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  prepaymentAmount: number;
  schedule: AmortizationRow[];
}

export interface BalanceTransferResult {
  currentMonthlyEMI: number;
  newMonthlyEMI: number;
  monthlySavings: number;
  currentRemainingInterest: number;
  newRemainingInterest: number;
  grossInterestSaved: number;
  processingFeeAmount: number;
  otherCharges: number;
  totalSwitchingCost: number;
  netLifetimeSavings: number;
  breakEvenMonths: number;
  isRecommended: boolean;
  recommendationGrade: 'STRONG_SWITCH' | 'MODERATE_SWITCH' | 'STAY_PUT';
  recommendationReason: string;
}

export interface PrepayVsInvestResult {
  extraMonthlyAmount: number;
  lumpSumAmount: number;
  durationYears: number;
  // Prepayment side
  interestSaved: number;
  monthsSaved: number;
  effectiveLoanRate: number;
  // Investment side
  grossInvestmentValue: number;
  investedCapital: number;
  investmentGain: number;
  estimatedTax: number;
  netInvestmentValue: number;
  // Comparison
  netWealthDifference: number; // positive means investing wins
  winner: 'INVESTMENT' | 'PREPAYMENT' | 'BALANCED';
  hurdleRate: number; // break-even return rate needed
  // 50/50 hybrid
  hybridNetWealth: number;
  hybridInterestSaved: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isError?: boolean;
}
