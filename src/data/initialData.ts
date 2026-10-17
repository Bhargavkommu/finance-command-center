import { Loan, Asset } from '../types/finance';

// Start with empty loans so user enters their own loans
export const INITIAL_LOANS: Loan[] = [];

// Start with clean assets so user enters their own portfolio
export const INITIAL_ASSETS: Asset[] = [];

export const INITIAL_USER_PROFILE = {
  monthlyIncome: 150000,
  monthlyLivingExpenses: 50000,
  currencySymbol: '₹',
  userName: 'You',
};
