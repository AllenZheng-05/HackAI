import { useState } from 'react';
import { Upload, Info } from 'lucide-react';

type PredictionMode = 'tabular' | 'image';

interface PredictionPanelProps {
  mode: PredictionMode;
}

export function PredictionPanel({ mode }: PredictionPanelProps) {
  const [showPrediction, setShowPrediction] = useState(true);
  const [formData, setFormData] = useState({
    age: '45',
    sex: 'M',
    totchol: '240',
    sysbp: '135',
    glucose: '95',
  });

  const handlePredict = () => {
    setShowPrediction(true);
  };

  return (
    <div className="w-full p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">Test Prediction</h2>

      {mode === 'tabular' ? (
        <>
          {/* Dynamic Form Fields */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">AGE</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">SEX</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
              >
                <option>M</option>
                <option>F</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">TOTCHOL</label>
              <input
                type="number"
                value={formData.totchol}
                onChange={(e) => setFormData({ ...formData, totchol: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">SYSBP</label>
              <input
                type="number"
                value={formData.sysbp}
                onChange={(e) => setFormData({ ...formData, sysbp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">GLUCOSE</label>
              <input
                type="number"
                value={formData.glucose}
                onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
              />
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            className="px-8 py-3 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_40px_rgba(57,255,20,0.7)] transition-all"
          >
            PREDICT
          </button>
        </>
      ) : (
        <>
          {/* Image Upload */}
          <div className="flex items-center gap-4 mb-4">
            <button className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium flex items-center gap-2 transition-all">
              <Upload className="w-5 h-5" />
              Choose File
            </button>
            <span className="text-sm text-gray-400">Upload Image to Classify</span>
          </div>

          {/* Image Preview Placeholder */}
          <div className="w-32 h-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span className="text-xs text-gray-500">Preview</span>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            className="px-8 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] transition-all"
          >
            PREDICT
          </button>
        </>
      )}

      {/* Prediction Results */}
      {showPrediction && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#39FF14]/10 to-[#39FF14]/5 border border-[#39FF14]/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Prediction: At Risk</h3>
              <p className="text-sm text-gray-300">78% confidence</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative">
              <Info className="w-5 h-5 text-gray-400" />
              <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-lg bg-black/90 border border-white/20 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="font-semibold text-white mb-2">Feature Importance for this prediction:</div>
                <div className="space-y-1">
                  <div>AGE: High contribution (+0.42)</div>
                  <div>SYSBP: Medium contribution (+0.28)</div>
                  <div>TOTCHOL: Medium contribution (+0.19)</div>
                  <div>GLUCOSE: Low contribution (+0.09)</div>
                </div>
              </div>
            </button>
          </div>

          {/* Confidence Bar */}
          <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#39FF14] to-[#2acc0f] shadow-[0_0_15px_rgba(57,255,20,0.6)] transition-all duration-1000"
              style={{ width: '78%' }}
            />
            <div className="absolute inset-0 flex items-center justify-end pr-2">
              <span className="text-xs font-bold text-black">78%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
