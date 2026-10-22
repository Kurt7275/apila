"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Scan,
  RefreshCw,
  Volume2,
} from "lucide-react";

interface Attendee {
  id: string;
  residentId: string;
  residentName: string;
  programId: string;
  programTitle: string;
  purok?: string;
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  programTitle: string;
  programRegistrations: Attendee[];
  attendanceMap: Record<string, "PRESENT" | "ABSENT" | "UNMARKED">;
  onMarkPresent: (regId: string) => void;
}

export function QrScannerModal({
  isOpen,
  onClose,
  programTitle,
  programRegistrations,
  attendanceMap,
  onMarkPresent,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<{
    type: "SUCCESS" | "ALREADY_PRESENT" | "NOT_FOUND";
    message: string;
    residentName?: string;
    purok?: string;
  } | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Play a pleasant check-in beep using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // Audio not permitted or unsupported
    }
  };

  // Process a scanned / entered pass code
  const handleProcessCode = useCallback((rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // Normalize code (extract ID if format is APILA:reg_xxx or PASS:reg_xxx)
    const normalizedId = code.replace(/^(apila:|pass:|id:)\s*/i, "").trim();

    const attendee = programRegistrations.find(
      (r) =>
        r.id.toLowerCase() === normalizedId.toLowerCase() ||
        r.id.toLowerCase().endsWith(normalizedId.toLowerCase()) ||
        normalizedId.toLowerCase().includes(r.id.toLowerCase())
    );

    if (!attendee) {
      setScanResult({
        type: "NOT_FOUND",
        message: `Pass "${code}" is not registered for this program.`,
      });
      return;
    }

    if (attendanceMap[attendee.id] === "PRESENT") {
      setScanResult({
        type: "ALREADY_PRESENT",
        message: "Already marked present.",
        residentName: attendee.residentName,
        purok: attendee.purok,
      });
      return;
    }

    // Success!
    onMarkPresent(attendee.id);
    playBeep();
    setSessionCount((prev) => prev + 1);
    setScanResult({
      type: "SUCCESS",
      message: "Check-in Confirmed!",
      residentName: attendee.residentName,
      purok: attendee.purok,
    });
  }, [programRegistrations, attendanceMap, onMarkPresent]);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    let isCancelled = false;

    async function startCamera() {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
          setHasCameraPermission(true);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setHasCameraPermission(false);
          setCameraError(
            err instanceof Error
              ? err.message
              : "Unable to access camera. Please allow camera permissions."
          );
        }
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Real-time Barcode Detection loop if BarcodeDetector is supported
  useEffect(() => {
    if (!isOpen || !hasCameraPermission) return;

    let animationId: number;
    // Check if BarcodeDetector API exists in browser
    const BarcodeDetectorClass = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;

    if (!BarcodeDetectorClass) {
      return;
    }

    let detector: { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> };
    try {
      detector = new BarcodeDetectorClass({ formats: ["qr_code"] });
    } catch {
      return;
    }

    let lastScannedCode = "";
    let lastScanTime = 0;

    const detectLoop = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            const now = Date.now();
            // Debounce same code for 3 seconds
            if (rawValue !== lastScannedCode || now - lastScanTime > 3000) {
              lastScannedCode = rawValue;
              lastScanTime = now;
              handleProcessCode(rawValue);
            }
          }
        } catch {
          // Frame detection skip
        }
      }
      animationId = requestAnimationFrame(detectLoop);
    };

    animationId = requestAnimationFrame(detectLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isOpen, hasCameraPermission, handleProcessCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#ECE7DF] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#FFF9F3] border-b border-[#ECE7DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F45113]/10 text-[#F45113] flex items-center justify-center">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">Scan Resident QR Pass</h2>
              <p className="text-xs text-[#64748B] truncate max-w-[260px] sm:max-w-xs">{programTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#ECE7DF] hover:bg-slate-100 flex items-center justify-center text-[#64748B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
            playsInline
            muted
          />

          {/* Viewfinder Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-white/40 rounded-3xl relative flex items-center justify-center">
              {/* Corner accents in brand orange */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#F45113] rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#F45113] rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#F45113] rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#F45113] rounded-br-xl" />

              {/* Animated scan beam */}
              <div className="w-full h-0.5 bg-[#F45113] shadow-[0_0_12px_#F45113] animate-pulse" />
            </div>
          </div>

          {/* Camera Permission Error Overlay */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <Camera className="w-10 h-10 text-slate-400" />
              <p className="text-xs font-bold text-slate-200">{cameraError}</p>
              <p className="text-[11px] text-slate-400">
                You can still verify attendees using the Pass ID input below.
              </p>
            </div>
          )}
        </div>

        {/* Status / Feedback Alert */}
        {scanResult && (
          <div
            className={`p-4 border-b text-xs transition-all ${
              scanResult.type === "SUCCESS"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : scanResult.type === "ALREADY_PRESENT"
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.type === "SUCCESS" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-extrabold text-sm">{scanResult.message}</p>
                {scanResult.residentName && (
                  <p className="font-bold mt-0.5 text-xs">
                    {scanResult.residentName} · {scanResult.purok || "Lapasan"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Code Input Bar & Stats */}
        <div className="p-5 space-y-4 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCode(manualCode);
              setManualCode("");
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter or scan Pass ID (e.g. reg_101)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Verify Pass
            </button>
          </form>

          {/* Session Summary Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#ECE7DF] text-xs text-[#64748B]">
            <span className="font-semibold">
              Scanned this session: <strong className="text-[#0F172A]">{sessionCount}</strong>
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Chime Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
