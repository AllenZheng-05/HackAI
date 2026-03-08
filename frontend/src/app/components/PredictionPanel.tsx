import { useState, useRef, useEffect } from "react";
import { Upload, Info, Loader2, AlertCircle, ImageIcon, Download, FlaskConical } from "lucide-react";
import { predictCSV, predictImage } from "../services/api";
import { ModelState } from "../App";

type PredictionMode = "tabular" | "image";

interface PredictionPanelProps {
  mode: PredictionMode;
  modelState: ModelState;
}

interface PredictionResult {
  prediction: string;
  confidence?: number;
  probabilities?: number[];
}

export function PredictionPanel({ mode, modelState }: PredictionPanelProps) {
  const { isTrained, features, classes, dataType } = modelState;

  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDemoing, setIsDemoing] = useState(false);

  // CSV form state - dynamic based on features
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Reset form when features change
  useEffect(() => {
    if (features.length > 0) {
      const initialData: Record<string, string> = {};
      features.forEach((f) => {
        initialData[f] = "";
      });
      setFormData(initialData);
    }
  }, [features]);

  // Reset prediction when mode changes
  useEffect(() => {
    setPredictionResult(null);
    setError(null);
  }, [mode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPredictionResult(null);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePredictCSV = async () => {
    if (!isTrained || dataType !== "csv") {
      setError("Please train a CSV model first");
      return;
    }

    // Validate form data
    const emptyFields = features.filter((f) => !formData[f]?.trim());
    if (emptyFields.length > 0) {
      setError(`Please fill in: ${emptyFields.join(", ")}`);
      return;
    }

    setIsPredicting(true);
    setError(null);

    try {
      const result = await predictCSV(formData);
      setPredictionResult({
        prediction: result.prediction,
        probabilities: result.probabilities,
        confidence: result.probabilities
          ? Math.max(...result.probabilities) * 100
          : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setIsPredicting(false);
    }
  };

  const handlePredictImage = async () => {
    if (!isTrained || dataType !== "image") {
      setError("Please train an image model first");
      return;
    }

    if (!imageFile) {
      setError("Please upload an image");
      return;
    }

    setIsPredicting(true);
    setError(null);

    try {
      const result = await predictImage(imageFile);
      setPredictionResult({
        prediction: result.prediction,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleExportModel = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/export_model");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Export failed");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filename =
        disposition.match(/filename=([^\s;]+)/)?.[1] ??
        `trained_model_${modelState.dataType}.pkl`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDemo = async () => {
    setIsDemoing(true);
    // Placeholder: wire up your actual demo logic here
    await new Promise((r) => setTimeout(r, 800));
    setIsDemoing(false);
  };

  const isCSVMode = mode === "tabular";
  const canPredict =
    isTrained && (isCSVMode ? dataType === "csv" : dataType === "image");

  const accentColor = isCSVMode ? "#39FF14" : "#00F0FF";
  const accentShadow = isCSVMode
    ? "rgba(57,255,20,0.5)"
    : "rgba(0,240,255,0.5)";
  const accentShadowHover = isCSVMode
    ? "rgba(57,255,20,0.7)"
    : "rgba(0,240,255,0.7)";

  return (
    <div className="w-full p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">Test Prediction</h2>

      {!isTrained && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-yellow-500">
            Train a model first to make predictions
          </span>
        </div>
      )}

      {isTrained && !canPredict && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-yellow-500">
            Current model is for {dataType === "csv" ? "tabular" : "image"}{" "}
            data. Switch to {dataType === "csv" ? "Tabular" : "Image"} mode or
            train a new model.
          </span>
        </div>
      )}

      {isCSVMode ? (
        <>
          {/* Dynamic Form Fields */}
          {features.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {features.map((feature) => (
                <div key={feature}>
                  <label
                    className="text-xs text-gray-400 mb-1 block truncate"
                    title={feature}
                  >
                    {feature}
                  </label>
                  <input
                    type="text"
                    value={formData[feature] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [feature]: e.target.value })
                    }
                    disabled={!canPredict || isPredicting}
                    placeholder="Value"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14] disabled:opacity-50 text-sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">
              No features available. Train a model to see input fields.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* PREDICT */}
            <button
              onClick={handlePredictCSV}
              disabled={!canPredict || isPredicting}
              className="px-8 py-3 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_40px_rgba(57,255,20,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PREDICTING...
                </>
              ) : (
                "PREDICT"
              )}
            </button>

            {/* EXPORT MODEL — appears after result */}
            {predictionResult && (
              <button
                onClick={handleExportModel}
                disabled={isExporting}
                className="px-6 py-3 rounded-xl font-bold text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[#39FF14]/40 text-[#39FF14] bg-[#39FF14]/10 hover:bg-[#39FF14]/20 hover:border-[#39FF14]/70 hover:shadow-[0_0_20px_rgba(57,255,20,0.25)]"
                style={{ animationDuration: "0.3s" }}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    EXPORTING...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    EXPORT MODEL
                  </>
                )}
              </button>
            )}

            {/* DEMO — appears after result */}
            {predictionResult && (
              <button
                onClick={handleDemo}
                disabled={isDemoing}
                className="px-6 py-3 rounded-xl font-bold text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/20 text-gray-300 bg-white/5 hover:bg-white/10 hover:border-white/40 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                {isDemoing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    LOADING...
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4" />
                    DEMO
                  </>
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Image Upload */}
          <div className="flex items-start gap-4 mb-4">
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={!canPredict || isPredicting}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              Choose Image
            </button>

            {/* Image Preview */}
            <div className="w-32 h-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-xs">Preview</span>
                </div>
              )}
            </div>

            {imageFile && (
              <div className="flex-1">
                <p className="text-sm text-white">{imageFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(imageFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </div>

          {/* Available Classes */}
          {classes.length > 0 && (
            <p className="text-xs text-gray-400 mb-4">
              Available classes: {classes.join(", ")}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* PREDICT */}
            <button
              onClick={handlePredictImage}
              disabled={!canPredict || isPredicting || !imageFile}
              className="px-8 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PREDICTING...
                </>
              ) : (
                "PREDICT"
              )}
            </button>

            {/* EXPORT MODEL — appears after result */}
            {predictionResult && (
              <button
                onClick={handleExportModel}
                disabled={isExporting}
                className="px-6 py-3 rounded-xl font-bold text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[#00F0FF]/40 text-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 hover:border-[#00F0FF]/70 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    EXPORTING...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    EXPORT MODEL
                  </>
                )}
              </button>
            )}

            {/* DEMO — appears after result */}
            {predictionResult && (
              <button
                onClick={handleDemo}
                disabled={isDemoing}
                className="px-6 py-3 rounded-xl font-bold text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/20 text-gray-300 bg-white/5 hover:bg-white/10 hover:border-white/40 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                {isDemoing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    LOADING...
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4" />
                    DEMO
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      {/* Prediction Results */}
      {predictionResult && (
        <div
          className={`mt-6 p-4 rounded-xl border ${
            isCSVMode
              ? "bg-gradient-to-br from-[#39FF14]/10 to-[#39FF14]/5 border-[#39FF14]/30"
              : "bg-gradient-to-br from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/30"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Prediction: {predictionResult.prediction}
              </h3>
              {predictionResult.confidence !== undefined && (
                <p className="text-sm text-gray-300">
                  {predictionResult.confidence.toFixed(1)}% confidence
                </p>
              )}
            </div>
            {predictionResult.probabilities &&
              predictionResult.probabilities.length > 0 && (
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative">
                  <Info className="w-5 h-5 text-gray-400" />
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-lg bg-black/90 border border-white/20 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-semibold text-white mb-2">
                      Class Probabilities:
                    </div>
                    <div className="space-y-1">
                      {predictionResult.probabilities.map((prob, idx) => (
                        <div key={idx}>
                          Class {idx}: {(prob * 100).toFixed(1)}%
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              )}
          </div>

          {/* Confidence Bar */}
          {predictionResult.confidence !== undefined && (
            <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full shadow-[0_0_15px_rgba(57,255,20,0.6)] transition-all duration-1000 ${
                  isCSVMode
                    ? "bg-gradient-to-r from-[#39FF14] to-[#2acc0f]"
                    : "bg-gradient-to-r from-[#00F0FF] to-[#00c4cc]"
                }`}
                style={{ width: `${predictionResult.confidence}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-end pr-2">
                <span className="text-xs font-bold text-black">
                  {predictionResult.confidence.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}