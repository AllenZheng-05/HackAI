import { useState } from 'react';
import { Upload, Check, Plus, FileText } from 'lucide-react';

type TrainingMode = 'tabular' | 'image';

interface TrainingPanelProps {
  mode: TrainingMode;
  onModeChange: (mode: TrainingMode) => void;
}

export function TrainingPanel({ mode, onModeChange }: TrainingPanelProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'AGE', 'SEX', 'TOTCHOL', 'SYSBP', 'GLUCOSE', 'BMI'
  ]);

  const features = ['AGE', 'SEX', 'TOTCHOL', 'SYSBP', 'GLUCOSE', 'BMI', 'CIGPDAY', 'HEARTRATE'];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Toggle Tabs */}
      <div className="flex gap-2 p-1 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <button
          onClick={() => onModeChange('tabular')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'tabular'
              ? 'bg-[#39FF14]/20 text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tabular
        </button>
        <button
          onClick={() => onModeChange('image')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'image'
              ? 'bg-[#00F0FF]/20 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Image
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {mode === 'tabular' ? (
          <>
            {/* File Upload */}
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <button className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium flex items-center justify-center gap-2 transition-all">
                <Upload className="w-5 h-5" />
                Choose File
              </button>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                <FileText className="w-4 h-4 text-[#39FF14]" />
                <span>Framingham Dataset.csv</span>
              </div>
            </div>

            {/* Features Selection */}
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">Features</h3>
              <div className="space-y-2">
                {features.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="w-4 h-4 rounded border-gray-600 bg-transparent checked:bg-[#39FF14] checked:border-[#39FF14] focus:ring-[#39FF14] focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Column */}
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">Target Column</h3>
              <select className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]">
                <option>TenYearCHD</option>
              </select>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 rounded-lg bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/50 font-medium text-sm shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                Classification
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-gray-400 border border-white/10 font-medium text-sm hover:bg-white/10">
                Regression
              </button>
            </div>

            {/* Train Button */}
            <button className="w-full px-6 py-4 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold text-lg shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_40px_rgba(57,255,20,0.7)] transition-all">
              TRAIN RANDOM FOREST
            </button>
          </>
        ) : (
          <>
            {/* Image Upload */}
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-sm text-gray-300 mb-3">Upload ZIP files (one per class)</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/20">
                  <FileText className="w-5 h-5 text-[#00F0FF]" />
                  <span className="flex-1 text-sm text-white">cats.zip</span>
                  <Check className="w-5 h-5 text-[#39FF14]" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/20">
                  <FileText className="w-5 h-5 text-[#00F0FF]" />
                  <span className="flex-1 text-sm text-white">dogs.zip</span>
                  <Check className="w-5 h-5 text-[#39FF14]" />
                </div>
              </div>

              <button className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium flex items-center justify-center gap-2 transition-all">
                <Plus className="w-5 h-5" />
                Add Class
              </button>

              <p className="mt-3 text-xs text-gray-400 italic">Classes extracted from zip filenames</p>
            </div>

            {/* Train Button */}
            <button className="w-full px-6 py-4 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold text-lg shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] transition-all">
              TRAIN IMAGE CLASSIFIER
            </button>

            <p className="text-xs text-gray-400 text-center">Using MobileNetV2 feature extractor</p>
          </>
        )}
      </div>
    </div>
  );
}
