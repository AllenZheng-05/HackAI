import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { TrainingPanel } from "./components/TrainingPanel";
import { ModelVisualization } from "./components/ModelVisualization";
import { ControlsPanel } from "./components/ControlsPanel";
import { PredictionPanel } from "./components/PredictionPanel";
import {
  getMetrics,
  getFeatureImportance,
  getModelInfo,
  MetricsResponse,
  ModelInfoResponse,
} from "./services/api";

export interface ModelState {
  isTrained: boolean;
  isTraining: boolean;
  dataType: "csv" | "image" | null;
  mode: "Classification" | "Regression" | null;
  metrics: MetricsResponse | null;
  featureImportance: [string, number][];
  features: string[];
  classes: string[];
  error: string | null;
}

export default function App() {
  const [trainingMode, setTrainingMode] = useState<"tabular" | "image">(
    "tabular",
  );
  const [trees, setTrees] = useState(100);
  const [maxDepth, setMaxDepth] = useState(10);
  const [minSamplesSplit, setMinSamplesSplit] = useState(2);
  const [featureSampling, setFeatureSampling] = useState("sqrt");

  const [modelState, setModelState] = useState<ModelState>({
    isTrained: false,
    isTraining: false,
    dataType: null,
    mode: null,
    metrics: null,
    featureImportance: [],
    features: [],
    classes: [],
    error: null,
  });

  const setTrainingStatus = useCallback(
    (isTraining: boolean, error?: string) => {
      setModelState((prev) => ({
        ...prev,
        isTraining,
        error: error || null,
      }));
    },
    [],
  );

  const onTrainingComplete = useCallback(async () => {
    try {
      const [metrics, featureImportance, modelInfo] = await Promise.all([
        getMetrics(),
        getFeatureImportance().catch(() => [] as [string, number][]),
        getModelInfo(),
      ]);

      setModelState((prev) => ({
        ...prev,
        isTrained: true,
        isTraining: false,
        dataType: modelInfo.data_type,
        mode: modelInfo.mode as "Classification" | "Regression",
        metrics,
        featureImportance,
        features: modelInfo.features || [],
        classes: modelInfo.classes || [],
        error: null,
      }));
    } catch (error) {
      setModelState((prev) => ({
        ...prev,
        isTraining: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch model data",
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#14141F] text-white">
      <Header />

      <div className="flex gap-6 p-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Training Input (30%) */}
        <div className="w-[30%]">
          <TrainingPanel
            mode={trainingMode}
            onModeChange={setTrainingMode}
            modelParams={{ trees, maxDepth, minSamplesSplit }}
            isTraining={modelState.isTraining}
            onTrainingStart={() => setTrainingStatus(true)}
            onTrainingComplete={onTrainingComplete}
            onTrainingError={(err) => setTrainingStatus(false, err)}
          />
        </div>

        {/* Middle Panel - Model Visualization (45%) */}
        <div className="w-[45%]">
          <ModelVisualization
            trees={trees}
            maxDepth={maxDepth}
            minSamplesSplit={minSamplesSplit}
            featureSampling={featureSampling}
            modelState={modelState}
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
            modelState={modelState}
          />
        </div>
      </div>

      {/* Bottom Panel - Test Prediction */}
      <div className="px-6 pb-6">
        <PredictionPanel mode={trainingMode} modelState={modelState} />
      </div>
    </div>
  );
}
