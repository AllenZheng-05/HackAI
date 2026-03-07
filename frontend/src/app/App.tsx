import { useState } from 'react';
import { Header } from './components/Header';
import { TrainingPanel } from './components/TrainingPanel';
import { ModelVisualization } from './components/ModelVisualization';
import { ControlsPanel } from './components/ControlsPanel';
import { PredictionPanel } from './components/PredictionPanel';

export default function App() {
  const [trainingMode, setTrainingMode] = useState<'tabular' | 'image'>('tabular');
  const [trees, setTrees] = useState(100);
  const [maxDepth, setMaxDepth] = useState(10);
  const [minSamplesSplit, setMinSamplesSplit] = useState(2);
  const [featureSampling, setFeatureSampling] = useState('sqrt');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#14141F] text-white">
      <Header />
      
      <div className="flex gap-6 p-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Training Input (30%) */}
        <div className="w-[30%]">
          <TrainingPanel mode={trainingMode} onModeChange={setTrainingMode} />
        </div>

        {/* Middle Panel - Model Visualization (45%) */}
        <div className="w-[45%]">
          <ModelVisualization
            trees={trees}
            maxDepth={maxDepth}
            minSamplesSplit={minSamplesSplit}
            featureSampling={featureSampling}
          />
        </div>

        {/* Right Panel - Controls & Metrics (25%) */}
        <div className="w-[25%]">
          <ControlsPanel
            trees={trees}
            maxDepth={maxDepth}
            minSamplesSplit={minSamplesSplit}
            featureSampling={featureSampling}
            onTreesChange={setTrees}
            onMaxDepthChange={setMaxDepth}
            onMinSamplesSplitChange={setMinSamplesSplit}
            onFeatureSamplingChange={setFeatureSampling}
          />
        </div>
      </div>

      {/* Bottom Panel - Test Prediction */}
      <div className="px-6 pb-6">
        <PredictionPanel mode={trainingMode} />
      </div>
    </div>
  );
}