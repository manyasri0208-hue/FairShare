import React from 'react';
import { X, Calculator, Scale } from 'lucide-react';
import { FairnessAnalysis } from '../types';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FairnessAnalysis;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose, analysis }) => {
  if (!isOpen) return null;

  const { memberLoads, meanRatio, stdDev, score, label } = analysis;

  const ratios = memberLoads.map((m) => m.loadRatio);
  const minRatio = ratios.length > 0 ? Math.min(...ratios) : 0;
  const maxRatio = ratios.length > 0 ? Math.max(...ratios) : 0;
  const spread = maxRatio - minRatio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              How Fairness is Calculated
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Workload proportionality based on individual availability
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-indigo-500" />
              1. Individual Load Ratio (R)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              FairShare evaluates each member&apos;s commitment against their declared availability:
            </p>
            <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg font-mono text-xs text-center border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              Load Ratio (Rᵢ) = Assigned Hours / Available Hours
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-1">
              2. Divergence Penalty (Spread & StdDev)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              We compute the Standard Deviation (σ) of all members&apos; load ratios and the absolute difference (Spread) between the most loaded and least loaded student:
            </p>
            <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg font-mono text-xs text-center border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              Score = 100 - (σ × 55 + Spread × 18)
            </div>
          </div>

          <div className="border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl p-3.5">
            <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide mb-2">
              Current Project Calculation
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Mean Ratio (R̄):</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {(meanRatio * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Standard Deviation (σ):</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {stdDev.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Ratio Spread (Max - Min):</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {(spread * 100).toFixed(1)}%
                </span>
              </div>
              <div className="border-t border-indigo-200/60 dark:border-indigo-900/60 pt-2 mt-2 flex justify-between items-center font-bold">
                <span className="text-indigo-900 dark:text-indigo-200">Final Fairness Score:</span>
                <span className="text-base text-indigo-600 dark:text-indigo-400 font-mono">
                  {score}/100 ({label})
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            💡 <strong>Why this matters:</strong> A member with 6 available hours doing 6 hours (100% load) feels the same pressure as a member with 18 hours doing 18 hours. This formula ensures parity relative to real-life student bandwidth!
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
