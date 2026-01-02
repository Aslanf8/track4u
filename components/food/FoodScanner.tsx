"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  description: string;
  confidence: "low" | "medium" | "high";
}

interface FoodScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FoodAnalysisResult & { imageUrl?: string }) => Promise<void>;
}

type Step = "capture" | "confirm" | "analyzing" | "review" | "needs-key";

export function FoodScanner({ open, onOpenChange, onSave }: FoodScannerProps) {
  const [step, setStep] = useState<Step>("capture");
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [editedResult, setEditedResult] = useState<FoodAnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [context, setContext] = useState<string>("");
  const [contextExpanded, setContextExpanded] = useState(false);
  const contextInputRef = useRef<HTMLInputElement>(null);
  const [goals, setGoals] = useState<{
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
  } | null>(null);

  // Refine state (for review step)
  const [refineExpanded, setRefineExpanded] = useState(false);
  const [refineContext, setRefineContext] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const refineInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Camera switching state
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect device type on mount
  useEffect(() => {
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(
      navigator.userAgent
    );
    setIsMobile(isMobileDevice);
  }, []);

  // Fetch goals when review step is reached
  useEffect(() => {
    if (step === "review") {
      fetch("/api/goals")
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setGoals({
              dailyProtein: data.dailyProtein,
              dailyCarbs: data.dailyCarbs,
              dailyFat: data.dailyFat,
            });
          }
        })
        .catch((err) => console.error("Failed to fetch goals:", err));
    }
  }, [step]);

  // Enumerate cameras when dialog opens (but don't start camera automatically)
  useEffect(() => {
    const enumerateCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setAvailableCameras(cameras);
        setHasMultipleCameras(cameras.length > 1);
      } catch (err) {
        console.error("Failed to enumerate cameras:", err);
      }
    };

    if (open && step === "capture") {
      enumerateCameras();
    }

    // Cleanup when dialog closes
    return () => {
      if (!open && streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraActive(false);
      }
    };
  }, [open, step]);

  // Assign stream to video element once it's rendered
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const resetState = useCallback(() => {
    setStep("capture");
    setImageData(null);
    setResult(null);
    setEditedResult(null);
    setError(null);
    setIsSaving(false);
    setContext("");
    setContextExpanded(false);
    setRefineExpanded(false);
    setRefineContext("");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setFacingMode("environment"); // Reset to back camera
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const startCamera = async (
    cameraId?: string,
    mode?: "environment" | "user"
  ) => {
    try {
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let constraints: MediaStreamConstraints;

      if (cameraId) {
        // Specific camera requested
        constraints = { video: { deviceId: { exact: cameraId } } };
      } else if (isMobile) {
        // Mobile: use facingMode
        constraints = { video: { facingMode: { ideal: mode || facingMode } } };
      } else {
        // Desktop: just use default or first camera
        constraints = { video: true };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Set the selected camera ID
      const currentTrack = stream.getVideoTracks()[0];
      const settings = currentTrack.getSettings();
      if (settings.deviceId) {
        setSelectedCameraId(settings.deviceId);
      } else if (availableCameras.length > 0) {
        setSelectedCameraId(availableCameras[0].deviceId);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please use file upload instead.");
      setCameraActive(false);
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);

    if (cameraActive) {
      await startCamera(undefined, newMode);
    }
  };

  const selectCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (cameraActive) {
      await startCamera(deviceId);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setImageData(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);

    setStep("confirm");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageData(dataUrl);
      setStep("confirm");
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (image: string, userContext?: string) => {
    setStep("analyzing");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, context: userContext || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle missing API key - show special step
        if (data.code === "NO_API_KEY") {
          setStep("needs-key");
          return;
        }
        // Handle specific API key errors
        if (data.code === "INVALID_KEY") {
          throw new Error(
            "Your API key is invalid. Please update it in Settings."
          );
        }
        if (data.code === "QUOTA_EXCEEDED") {
          throw new Error(
            "API quota exceeded. Please add credits to your OpenAI account."
          );
        }
        if (data.code === "RATE_LIMIT") {
          throw new Error(
            "Rate limit reached. Please wait a moment and try again."
          );
        }
        throw new Error(data.error || "Failed to analyze image");
      }

      setResult(data);
      setEditedResult(data);
      setStep("review");
      // Reset refine state when new analysis completes
      setRefineExpanded(false);
      setRefineContext("");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze the image. Please try again."
      );
      setStep("capture");
    }
  };

  const handleRefine = async () => {
    if (!imageData) return;

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData,
          context: refineContext.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refine analysis");
      }

      setResult(data);
      setEditedResult(data);
      setRefineExpanded(false);
      setRefineContext("");
    } catch (err) {
      console.error("Refine error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refine. Please try again."
      );
    } finally {
      setIsRefining(false);
    }
  };

  const handleSave = async () => {
    if (!editedResult) return;

    setIsSaving(true);
    try {
      await onSave({
        ...editedResult,
        imageUrl: imageData || undefined,
      });
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (
    field: keyof FoodAnalysisResult,
    value: string | number
  ) => {
    if (!editedResult) return;
    setEditedResult({ ...editedResult, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {step === "capture" && "Scan Your Food"}
            {step === "confirm" && "Ready to Analyze"}
            {step === "analyzing" && "Analyzing..."}
            {step === "review" && "Review & Save"}
            {step === "needs-key" && "API Key Required"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === "capture" && (
          <div className="space-y-4">
            {cameraActive ? (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Camera switch button overlay */}
                  {hasMultipleCameras && (
                    <div className="absolute top-3 right-3">
                      {isMobile ? (
                        // Mobile: Simple flip button
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0"
                          onClick={switchCamera}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5 text-white"
                          >
                            <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                            <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="m18 22-3-3 3-3" />
                            <path d="m6 2 3 3-3 3" />
                          </svg>
                        </Button>
                      ) : (
                        // Desktop: Dropdown to select camera
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-10 px-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white text-xs"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 mr-1"
                              >
                                <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                                <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                                <circle cx="12" cy="12" r="3" />
                                <path d="m18 22-3-3 3-3" />
                                <path d="m6 2 3 3-3 3" />
                              </svg>
                              Switch
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-zinc-900/95 border-zinc-700 backdrop-blur-sm"
                          >
                            {availableCameras.map((camera, index) => (
                              <DropdownMenuItem
                                key={camera.deviceId}
                                onClick={() => selectCamera(camera.deviceId)}
                                className={`text-zinc-200 hover:bg-zinc-800 cursor-pointer ${
                                  selectedCameraId === camera.deviceId
                                    ? "bg-zinc-800"
                                    : ""
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-4 h-4 mr-2"
                                >
                                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                                  <circle cx="12" cy="13" r="3" />
                                </svg>
                                {camera.label || `Camera ${index + 1}`}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}

                  {/* Current camera indicator */}
                  {isMobile && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                      <span className="text-xs text-white/80">
                        {facingMode === "environment"
                          ? "Back Camera"
                          : "Front Camera"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                    onClick={() => {
                      if (streamRef.current) {
                        streamRef.current
                          .getTracks()
                          .forEach((track) => track.stop());
                      }
                      setCameraActive(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                    onClick={capturePhoto}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 mr-2"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Capture
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500/50 bg-zinc-100/30 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 flex flex-col gap-2"
                  onClick={() => startCamera()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-amber-500"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span>Take Photo</span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500/50 bg-zinc-100/30 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 flex flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-amber-500"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  <span>Upload Image</span>
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        )}

        {step === "confirm" && imageData && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
              <Image
                src={imageData}
                alt="Food preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Context input - subtle expandable */}
            <div className="space-y-2">
              {!contextExpanded ? (
                <button
                  type="button"
                  onClick={() => {
                    setContextExpanded(true);
                    setTimeout(() => contextInputRef.current?.focus(), 50);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add context
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    ref={contextInputRef}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. half portion, no sauce, 2 servings..."
                    className="flex-1 h-9 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        analyzeImage(imageData, context.trim());
                      }
                    }}
                  />
                  {context && (
                    <button
                      type="button"
                      onClick={() => {
                        setContext("");
                        setContextExpanded(false);
                      }}
                      className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              {contextExpanded && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                  Help AI estimate more accurately
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                onClick={resetState}
              >
                Retake
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                onClick={() => analyzeImage(imageData, context.trim())}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Analyze
              </Button>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="py-12 flex flex-col items-center gap-4">
            {imageData && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={imageData}
                  alt="Food"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-amber-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-zinc-700 dark:text-zinc-300">
                Analyzing your food...
              </span>
            </div>
          </div>
        )}

        {step === "needs-key" && (
          <div className="py-8 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-amber-500"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                OpenAI API Key Required
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">
                To use AI-powered food scanning, please add your OpenAI API key
                in Settings. You&apos;ll be billed directly by OpenAI.
              </p>
            </div>

            <div className="space-y-3 w-full">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                onClick={() => {
                  handleClose();
                  window.location.href = "/settings";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Go to Settings
              </Button>

              <Button
                variant="outline"
                className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                onClick={resetState}
              >
                Cancel
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                How to get an API key:
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to platform.openai.com</li>
                <li>Sign in or create an account</li>
                <li>Navigate to API Keys section</li>
                <li>Create a new secret key</li>
              </ol>
            </div>
          </div>
        )}

        {step === "review" && editedResult && (
          <div className="space-y-4">
            {imageData && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={imageData}
                  alt="Food"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">
                  Food Name
                </Label>
                <Input
                  value={editedResult.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">
                    Calories
                  </Label>
                  <Input
                    type="number"
                    value={editedResult.calories}
                    onChange={(e) =>
                      updateField("calories", parseInt(e.target.value) || 0)
                    }
                    className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">
                    Protein (g)
                    {goals?.dailyProtein && editedResult.protein > 0 && (
                      <span className="ml-2 text-xs text-zinc-500">
                        (
                        {(
                          (editedResult.protein / goals.dailyProtein) *
                          100
                        ).toFixed(1)}
                        % of daily)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={editedResult.protein}
                    onChange={(e) =>
                      updateField("protein", parseFloat(e.target.value) || 0)
                    }
                    className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">
                    Carbs (g)
                    {goals?.dailyCarbs && editedResult.carbs > 0 && (
                      <span className="ml-2 text-xs text-zinc-500">
                        (
                        {(
                          (editedResult.carbs / goals.dailyCarbs) *
                          100
                        ).toFixed(1)}
                        % of daily)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={editedResult.carbs}
                    onChange={(e) =>
                      updateField("carbs", parseFloat(e.target.value) || 0)
                    }
                    className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">
                    Fat (g)
                    {goals?.dailyFat && editedResult.fat > 0 && (
                      <span className="ml-2 text-xs text-zinc-500">
                        (
                        {((editedResult.fat / goals.dailyFat) * 100).toFixed(1)}
                        % of daily)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={editedResult.fat}
                    onChange={(e) =>
                      updateField("fat", parseFloat(e.target.value) || 0)
                    }
                    className="bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {result && (
                <Card className="p-3 bg-zinc-100/30 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {result.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Confidence:</span>
                    <span
                      className={`text-xs font-medium ${
                        result.confidence === "high"
                          ? "text-green-500 dark:text-green-400"
                          : result.confidence === "medium"
                          ? "text-yellow-500 dark:text-yellow-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {result.confidence}
                    </span>
                  </div>
                </Card>
              )}

              {/* Refine with AI */}
              <div className="pt-1">
                {!refineExpanded ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRefineExpanded(true);
                      setTimeout(() => refineInputRef.current?.focus(), 50);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                    Refine with AI
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={refineInputRef}
                        value={refineContext}
                        onChange={(e) => setRefineContext(e.target.value)}
                        placeholder="e.g. half portion, no sauce, 2 servings..."
                        className="flex-1 h-9 text-sm bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                        disabled={isRefining}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleRefine();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleRefine}
                        disabled={isRefining}
                        className="h-9 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      >
                        {isRefining ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 16h5v5" />
                          </svg>
                        )}
                      </Button>
                      {!isRefining && (
                        <button
                          type="button"
                          onClick={() => {
                            setRefineContext("");
                            setRefineExpanded(false);
                          }}
                          className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Add context to refine the analysis
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                onClick={resetState}
              >
                Retake
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
