import React, { useState, useEffect } from 'react';
import { X, Calculator, Wallet, Check, AlertCircle } from 'lucide-react';
import { Loan, LoanCategory } from '../types/finance';
import { calculateEMI, formatINR } from '../utils/financeMath';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLoan: (loan: Loan) => void;
  editingLoan?: Loan | null;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  isOpen,
  onClose,
  onSaveLoan,
  editingLoan,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LoanCategory>('Home');
  const [lenderName, setLenderName] = useState('');
  const [originalPrincipal, setOriginalPrincipal] = useState<number>(3000000);
  const [currentBalance, setCurrentBalance] = useState<number>(2800000);
  const [interestRate, setInterestRate] = useState<number>(8.75);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [tenureMonths, setTenureMonths] = useState<number>(180);
  const [isTenureInYears, setIsTenureInYears] = useState<boolean>(true);
  const [customEMI, setCustomEMI] = useState<number>(0);
  const [useCustomEMI, setUseCustomEMI] = useState<boolean>(false);
  const [notes, setNotes] = useState('');

  // Calculate standard EMI
  const computedTenureMonths = isTenureInYears ? tenureYears * 12 : tenureMonths;
  const calculatedEMI = calculateEMI(currentBalance, interestRate, computedTenureMonths);

  useEffect(() => {
    if (editingLoan) {
      setName(editingLoan.name);
      setCategory(editingLoan.category);
      setLenderName(editingLoan.lenderName || '');
      setOriginalPrincipal(editingLoan.originalPrincipal);
      setCurrentBalance(editingLoan.currentBalance);
      setInterestRate(editingLoan.interestRate);
      setTenureMonths(editingLoan.tenureMonths);
      setTenureYears(Number((editingLoan.tenureMonths / 12).toFixed(1)));
      setCustomEMI(editingLoan.emi);
      setUseCustomEMI(true);
      setNotes(editingLoan.notes || '');
    } else {
      // Default clean values
      setName('');
      setCategory('Home');
      setLenderName('');
      setOriginalPrincipal(2500000);
      setCurrentBalance(2300000);
      setInterestRate(8.75);
      setTenureYears(15);
      setTenureMonths(180);
      setIsTenureInYears(true);
      setUseCustomEMI(false);
      setNotes('');
    }
  }, [editingLoan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalEMI = useCustomEMI && customEMI > 0 ? customEMI : calculatedEMI;
    const finalTenureMonths = isTenureInYears ? Math.round(tenureYears * 12) : tenureMonths;

    const newLoan: Loan = {
      id: editingLoan ? editingLoan.id : `loan-${Date.now()}`,
      name: name.trim(),
      category,
      lenderName: lenderName.trim() || 'Institutional Lender',
      originalPrincipal: Number(originalPrincipal) || Number(currentBalance),
      currentBalance: Number(currentBalance),
      interestRate: Number(interestRate),
      tenureMonths: finalTenureMonths,
      emi: finalEMI,
      startDate: editingLoan?.startDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    };

    onSaveLoan(newLoan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingLoan ? 'Edit Loan Details' : 'Enter Loan & EMI Details'}
              </h3>
              <p className="text-xs text-slate-400">
                Loan balance, interest rate, and tenure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Loan Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Loan Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Home Loan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LoanCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Home">Home Loan</option>
                <option value="Car">Car / Vehicle Loan</option>
                <option value="Personal">Personal Loan</option>
                <option value="Education">Education Loan</option>
                <option value="CreditCard">Credit Card EMI</option>
                <option value="Gold">Gold Loan</option>
                <option value="Other">Other Liability</option>
              </select>
            </div>
          </div>

          {/* Lender Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Bank / Lender</label>
            <input
              type="text"
              placeholder="e.g. SBI, HDFC, ICICI, Axis, Bajaj Finserv"
              value={lenderName}
              onChange={(e) => setLenderName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Current Outstanding Balance & Original Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Current Outstanding (₹) *</label>
              <input
                type="number"
                required
                min={1000}
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Original Loan Amount (₹)</label>
              <input
                type="number"
                min={1000}
                value={originalPrincipal}
                onChange={(e) => setOriginalPrincipal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Interest Rate & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Annual Interest Rate (% p.a.) *</label>
              <input
                type="number"
                step="0.05"
                min={1}
                max={60}
                required
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Remaining Tenure *</label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setIsTenureInYears(true)}
                    className={`px-1.5 py-0.5 rounded ${isTenureInYears ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    Yrs
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTenureInYears(false)}
                    className={`px-1.5 py-0.5 rounded ${!isTenureInYears ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    Mos
                  </button>
                </div>
              </div>

              {isTenureInYears ? (
                <input
                  type="number"
                  step="0.5"
                  min={0.5}
                  max={40}
                  value={tenureYears}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setTenureYears(y);
                    setTenureMonths(Math.round(y * 12));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              ) : (
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={tenureMonths}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setTenureMonths(m);
                    setTenureYears(Number((m / 12).toFixed(1)));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              )}
            </div>
          </div>

          {/* Computed Monthly EMI Preview with override toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Calculated Monthly EMI:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ₹{formatINR(calculatedEMI)}/month
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomEMI}
                  onChange={(e) => {
                    setUseCustomEMI(e.target.checked);
                    if (e.target.checked && customEMI === 0) setCustomEMI(calculatedEMI);
                  }}
                  className="rounded bg-slate-800 text-emerald-500 border-slate-700"
                />
                <span>My bank charges slightly different EMI</span>
              </label>

              {useCustomEMI && (
                <input
                  type="number"
                  placeholder="Actual EMI"
                  value={customEMI}
                  onChange={(e) => setCustomEMI(Number(e.target.value))}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-right"
                />
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Notes / Prepayment terms</label>
            <input
              type="text"
              placeholder="e.g. Repo linked, zero foreclosure charges"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
            >
              {editingLoan ? 'Update Loan' : 'Save Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
