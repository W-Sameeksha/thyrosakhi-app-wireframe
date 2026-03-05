import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Zap, ZapOff, CheckCircle, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScreeningLockedNotice from "@/components/ScreeningLockedNotice";
import { getNextScreeningRoute, isScreeningLocked, saveNeckResult } from "@/lib/screeningLock";

const NeckScan = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const screeningLocked = isScreeningLocked();
  const [flash, setFlash] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);

    const isLocalHost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalHost) {
      setCameraError("Camera needs HTTPS or localhost. Open the app on localhost.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera API not supported in this browser.");
      return;
    }

    stopCameraStream();

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
        videoRef.current.onplaying = () => {
          setCameraReady(true);
        };
        videoRef.current
          .play()
          .then(() => setCameraReady(true))
          .catch(() => {
            setCameraError("Tap Retry Camera to start preview.");
          });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access.");
        return;
      }
      if (error instanceof DOMException && error.name === "NotFoundError") {
        setCameraError("No camera device found on this system.");
        return;
      }
      setCameraError("Unable to access camera. Please check browser camera settings.");
    }
  }, [stopCameraStream]);

  useEffect(() => {
    if (screeningLocked) {
      return;
    }

    startCamera();

    return () => {
      stopCameraStream();
    };
  }, [screeningLocked, startCamera, stopCameraStream]);

  const handleCapture = async () => {
    if (screeningLocked) {
      return;
    }

    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      return;
    }

    setAnalysisError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Unable to capture image. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(true);

    try {
      setAnalyzing(true);
      const base64Image = canvas.toDataURL("image/png");

      const response = await fetch("http://localhost:5000/analyze-neck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? result?.error ?? "Neck image analysis failed.");
      }

      saveNeckResult({
        neck_score: result.neck_score,
        swelling_level: result.swelling_level,
        message: result.message,
      });

      navigate("/processing", {
        replace: true,
        state: {
          nextRoute: getNextScreeningRoute(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze neck image.";
      setAnalysisError(message);
      setCaptured(false);
    } finally {
      setAnalyzing(false);
    }
  };

  if (screeningLocked) {
    return <ScreeningLockedNotice />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titleKey="neck.title" />
      <div className="flex flex-col items-center px-6 pt-4 gap-5">
        {/* Camera preview placeholder */}
        <div className="relative w-full max-w-sm aspect-[3/4] bg-foreground/5 rounded-2xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Chin-up guide overlay */}
          <div className="absolute inset-x-8 top-1/4 bottom-1/3 border-2 border-primary/40 rounded-3xl flex items-end justify-center pb-4">
            <p className="text-primary text-sm font-semibold bg-background/80 px-3 py-1 rounded-full">
              {t("neck.chinUp")} ↑
            </p>
          </div>
        </div>

        {/* Flash toggle */}
        <button
          onClick={() => setFlash(!flash)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground font-semibold text-sm"
        >
          {flash ? <Zap className="w-5 h-5 text-warning" /> : <ZapOff className="w-5 h-5" />}
          {t("neck.flash")} {flash ? "ON" : "OFF"}
        </button>

        {/* Quality indicator */}
        {captured ? (
          <div className="flex items-center gap-2 text-success font-semibold">
            <CheckCircle className="w-5 h-5" />
            {analyzing ? "Analyzing neck image..." : t("neck.quality.good")}
          </div>
        ) : cameraError ? (
          <div className="flex items-center gap-2 text-danger text-sm">
            <AlertCircle className="w-4 h-4" />
            {cameraError}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <AlertCircle className="w-4 h-4" />
            {t("neck.instruction")}
          </div>
        )}

        {analysisError && (
          <div className="flex items-center gap-2 text-danger text-sm text-center">
            <AlertCircle className="w-4 h-4" />
            {analysisError}
          </div>
        )}

        {!cameraReady && (
          <button
            onClick={startCamera}
            className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-semibold"
          >
            Retry Camera
          </button>
        )}

        {/* Capture button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCapture}
          disabled={captured || !cameraReady || analyzing}
          className="w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center border-4 border-primary-foreground/20"
        >
          <div className="w-14 h-14 rounded-full border-2 border-primary-foreground" />
        </motion.button>
        <p className="text-muted-foreground text-sm">{t("neck.capture")}</p>
      </div>
    </div>
  );
};

export default NeckScan;
