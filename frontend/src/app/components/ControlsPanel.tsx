import { Check } from 'lucide-react';

interface ControlsPanelProps {
  trees: number;
  maxDepth: number;
  minSamplesSplit: number;
  featureSampling: string;
  onTreesChange: (value: number) => void;
  onMaxDepthChange: (value: number) => void;
  onMinSamplesSplitChange: (value: number) => void;
  onFeatureSamplingChange: (value: string) => void;
}

export function ControlsPanel({
  trees,
  maxDepth,
  minSamplesSplit,
  featureSampling,
  onTreesChange,
  onMaxDepthChange,
  onMinSamplesSplitChange,
  onFeatureSamplingChange,
}: ControlsPanelProps) {
  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Model Info Card */}
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Model Info</h3>
        <div className="space-y-2">
          <div className="text-white font-semibold">Random Forest Classifier</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Number of trees:</span>
              <span className="text-white font-medium">{trees}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Max depth:</span>
              <span className="text-white font-medium">{maxDepth}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Features:</span>
              <span className="text-white font-medium">8</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Classes:</span>
              <span className="text-white font-medium">2 (binary)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Card */}
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Performance</h3>
        
        {/* Progress Ring */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#39FF14"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.94)}`}
                className="drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-3xl font-bold text-white">94%</div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/50 mb-3">
          <Check className="w-4 h-4 text-[#39FF14]" />
          <span className="text-sm font-medium text-[#39FF14]">Training Complete</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-300">OOB score:</span>
          <span className="text-white font-semibold">0.89</span>
        </div>
      </div>

      {/* Parameters Card */}
      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase">Parameters</h3>
        
        <div className="space-y-4">
          {/* Trees Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Trees</label>
              <span className="text-sm text-white font-semibold">{trees}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              value={trees}
              onChange={(e) => onTreesChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#39FF14] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(57,255,20,0.8)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span>
              <span>500</span>
            </div>
          </div>

          {/* Max Depth Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Max depth</label>
              <span className="text-sm text-white font-semibold">{maxDepth}</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              value={maxDepth}
              onChange={(e) => onMaxDepthChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#39FF14] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(57,255,20,0.8)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3</span>
              <span>30</span>
            </div>
          </div>

          {/* Min Samples Split Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Min samples split</label>
              <span className="text-sm text-white font-semibold">{minSamplesSplit}</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={minSamplesSplit}
              onChange={(e) => onMinSamplesSplitChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#39FF14] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(57,255,20,0.8)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2</span>
              <span>20</span>
            </div>
          </div>

          {/* Feature Sampling Dropdown */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Feature sampling</label>
            <select
              value={featureSampling}
              onChange={(e) => onFeatureSamplingChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
            >
              <option>sqrt</option>
              <option>log2</option>
              <option>auto</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}