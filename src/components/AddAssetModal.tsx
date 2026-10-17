import React, { useState } from 'react';
import { X, Coins, Plus } from 'lucide-react';
import { Asset, AssetCategory } from '../types/finance';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsset: (asset: Asset) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onSaveAsset,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Mutual Funds & Stocks');
  const [value, setValue] = useState<number>(100000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || value <= 0) return;

    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: name.trim(),
      category,
      value: Number(value),
      expectedReturnRate: Number(expectedReturnRate),
      notes: notes.trim(),
    };

    onSaveAsset(newAsset);
    onClose();
    setName('');
    setValue(100000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Asset to Net Worth</h3>
              <p className="text-xs text-slate-400">Investments, property, PF, gold, or cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Asset Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Parag Parikh Flexi Cap Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Asset Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Liquid/Cash">Liquid / Cash / Emergency FD</option>
              <option value="Mutual Funds & Stocks">Mutual Funds & Stocks (Equity)</option>
              <option value="Retirement (PF/PPF/NPS)">Retirement (EPF / PPF / NPS)</option>
              <option value="Real Estate & Land">Real Estate & Land</option>
              <option value="Gold & SGB">Gold & Sovereign Gold Bonds (SGB)</option>
              <option value="Crypto">Cryptocurrency</option>
              <option value="Vehicle & Other">Vehicle & Other Assets</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Current Value (₹) *</label>
              <input
                type="number"
                required
                min={100}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Expected Yield (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. In Groww app, 3 year lock-in"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

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
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
