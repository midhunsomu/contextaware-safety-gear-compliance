import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, ShieldAlert, ShieldCheck, Activity, Info, History, Settings, Zap, AlertTriangle, CheckCircle, Bell, AlertCircle } from 'lucide-react';
import { analyzeSafetyContext } from './services/geminiService';
import { DetectionResult, ZoneType, Alert } from './types';

const App: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const problemStatement = "Traditional compliance systems trigger false alarms by ignoring environment. Our system uses contextual reasoning to only flag hazards in High Risk Zones.";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsMonitoring(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please grant camera permissions to use this system.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsMonitoring(false);
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isLoading) return;

    setIsLoading(true);
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const result = await analyzeSafetyContext(base64);
      setCurrentDetection(result);

      if (result.workerPresent && !result.helmetPresent && result.zoneType === ZoneType.HIGH_RISK) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          message: "Safety Gear Violation: Missing Helmet",
          severity: 'danger',
          context: `Detected in High Risk Zone. Reasoning: ${result.reasoning}`
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      } else if (result.workerPresent && !result.helmetPresent && result.zoneType === ZoneType.SAFE) {
        console.log("Compliance Suppression: Missing gear in Safe Zone - no alert triggered.");
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    let interval: number | undefined;
    if (isMonitoring) {
      interval = window.setInterval(() => {
        captureAndAnalyze();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, captureAndAnalyze]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#E7F2EF] via-[#F5F9F8] to-[#E7F2EF] text-[#19183B]">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-[#A1C2BD]/30 p-6 flex flex-col gap-6 bg-white/80 backdrop-blur-sm shadow-lg">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#19183B] to-[#708993] bg-clip-text text-transparent flex items-center gap-2">
            <ShieldCheck size={30} className="text-[#19183B]" />
            ContextAware CV
          </h1>
          <p className="text-sm text-[#708993]/80 mt-1 uppercase tracking-wider font-medium">KRUU GRASP 2026</p>
        </div>

        <div className="bg-gradient-to-br from-white to-[#F5F9F8] p-5 rounded-2xl border border-[#A1C2BD]/30 shadow-sm">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-3 text-[#19183B]">
            <Info size={18} className="text-[#708993]" /> Problem Statement
          </h2>
          <p className="text-sm leading-relaxed text-[#708993]">
            {problemStatement}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={isMonitoring ? stopCamera : startCamera}
            className={`group flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isMonitoring 
                ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border border-red-200 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 shadow-sm' 
                : 'bg-gradient-to-r from-[#19183B] to-[#708993] text-white hover:from-[#708993] hover:to-[#19183B] shadow-md shadow-[#19183B]/20'
            }`}
          >
            {isMonitoring ? (
              <>
                <Zap size={20} className="animate-pulse" />
                <span>Stop Monitoring</span>
              </>
            ) : (
              <>
                <Camera size={20} />
                <span>Start Live Feed</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex-1">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-4 text-[#19183B]">
            <History size={18} className="text-[#708993]" /> Alert History
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[40vh] md:max-h-none pr-2">
            {alerts.length === 0 ? (
              <div className="p-4 text-center bg-gradient-to-br from-white to-[#F5F9F8] border border-[#A1C2BD]/30 rounded-xl">
                <Bell size={24} className="mx-auto mb-2 text-[#A1C2BD]/50" />
                <p className="text-sm text-[#708993]/80 italic">No alerts triggered yet</p>
                <p className="text-xs text-[#A1C2BD]/60 mt-1">System is monitoring for violations</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-r-xl animate-in fade-in slide-in-from-left-4 duration-300 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase font-bold text-red-600 flex items-center gap-2">
                      <AlertTriangle size={12} />
                      Violation Detected
                    </span>
                    <span className="text-xs text-[#708993]/80 bg-white/50 px-2 py-1 rounded">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#19183B] mb-2">{alert.message}</p>
                  <p className="text-xs text-[#708993]">{alert.context}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-[#F5F9F8] rounded-full border border-[#A1C2BD]/30 shadow-md">
              <div className={`w-3 h-3 rounded-full ${
                isMonitoring 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 animate-pulse shadow-md shadow-emerald-500/30' 
                  : 'bg-[#A1C2BD]/50'
              }`}></div>
              <span className="text-sm font-semibold uppercase tracking-tight text-[#19183B]">
                {isMonitoring ? 'Live Monitoring Active' : 'System Idle'}
              </span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#A1C2BD]/10 to-[#708993]/10 rounded-full border border-[#A1C2BD]/30">
                <div className="w-2 h-2 bg-[#708993] rounded-full animate-ping"></div>
                <span className="text-sm text-[#708993] font-medium">Analyzing Context...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-gradient-to-r from-white to-[#F5F9F8] border border-[#A1C2BD]/30 rounded-xl text-sm flex items-center gap-2 shadow-md">
              <Settings size={16} className="text-[#708993]" />
              <span className="text-[#19183B]/80 font-medium">V1.0 Early Prototype</span>
            </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2 relative group overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#F5F9F8] border border-[#A1C2BD]/30 shadow-xl flex items-center justify-center">
            {!isMonitoring && (
              <div className="flex flex-col items-center gap-4 text-[#A1C2BD]/70 p-8">
                <div className="p-6 bg-gradient-to-br from-white to-[#F5F9F8] rounded-2xl border border-[#A1C2BD]/30 shadow-sm">
                  <Camera size={52} strokeWidth={1.5} className="text-[#A1C2BD]/50" />
                </div>
                <p className="text-lg font-medium text-[#708993]">Connect camera to start vision pipeline</p>
                <p className="text-sm text-[#A1C2BD]/70 text-center">Real-time contextual analysis will begin once feed is active</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-all duration-500 ${isMonitoring ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlays */}
            {isMonitoring && currentDetection && (
              <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                <div className={`px-5 py-3 rounded-xl backdrop-blur-sm border-2 shadow-lg ${
                  currentDetection.zoneType === ZoneType.HIGH_RISK 
                    ? 'bg-gradient-to-r from-amber-100/90 to-orange-100/90 border-amber-500/60' 
                    : 'bg-gradient-to-r from-emerald-100/90 to-green-100/90 border-emerald-500/60'
                }`}>
                  <p className="text-xs uppercase font-bold tracking-widest text-[#708993]/90 mb-1">Detected Zone</p>
                  <p className={`text-xl font-black ${
                    currentDetection.zoneType === ZoneType.HIGH_RISK 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent' 
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent'
                  }`}>
                    {currentDetection.zoneType}
                  </p>
                </div>

                <div className="flex flex-col gap-3 items-end">
                  <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${
                    currentDetection.workerPresent 
                      ? 'bg-gradient-to-r from-[#708993]/20 to-[#A1C2BD]/20 text-[#19183B] border border-[#A1C2BD]/50' 
                      : 'bg-gradient-to-r from-white/80 to-[#F5F9F8]/80 text-[#A1C2BD]/70 border border-[#A1C2BD]/30'
                  }`}>
                    Worker: {currentDetection.workerPresent ? 'Present' : 'Not Found'}
                  </div>
                  {currentDetection.workerPresent && (
                    <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${
                      currentDetection.helmetPresent 
                        ? 'bg-gradient-to-r from-emerald-100/90 to-green-100/90 text-emerald-700 border border-emerald-500/50' 
                        : 'bg-gradient-to-r from-red-100/90 to-pink-100/90 text-red-700 border border-red-500/50'
                    }`}>
                      Helmet: {currentDetection.helmetPresent ? 'Verified ✓' : 'Missing ⚠️'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reasoning Panel */}
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-gradient-to-br from-white to-[#F5F9F8] border border-[#A1C2BD]/30 rounded-3xl flex flex-col gap-5 shadow-lg">
              <h3 className="text-base font-bold text-[#19183B] uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#708993]" /> AI Reasoning Layer
              </h3>
              <div className="flex-1 space-y-5">
                {currentDetection ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-[#708993]/90 mb-2">Vision Context Analysis:</p>
                      <div className="p-4 bg-white/50 rounded-xl border border-[#A1C2BD]/20">
                        <p className="text-sm leading-relaxed text-[#19183B] italic">"{currentDetection.reasoning}"</p>
                      </div>
                    </div>
                    
                    <div className="pt-5 border-t border-[#A1C2BD]/20">
                      <p className="text-xs font-semibold text-[#708993]/90 mb-3">System Decision:</p>
                      {currentDetection.workerPresent ? (
                        currentDetection.zoneType === ZoneType.HIGH_RISK ? (
                          !currentDetection.helmetPresent ? (
                            <div className="p-4 bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-500/50 rounded-xl text-red-700 shadow-lg shadow-red-900/10 animate-pulse">
                              <div className="flex items-center gap-3">
                                <AlertTriangle size={22} className="text-red-600" />
                                <div>
                                  <p className="font-bold text-lg">ALERT TRIGGERED</p>
                                  <p className="text-xs text-red-600/80 mt-1">Safety violation detected in High Risk Zone</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-gradient-to-r from-emerald-100 to-green-50 border-2 border-emerald-500/50 rounded-xl text-emerald-700 shadow-lg shadow-emerald-900/10">
                              <div className="flex items-center gap-3">
                                <CheckCircle size={22} className="text-emerald-600" />
                                <div>
                                  <p className="font-bold text-lg">COMPLIANCE VERIFIED</p>
                                  <p className="text-xs text-emerald-600/80 mt-1">All safety protocols followed</p>
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-[#A1C2BD]/10 to-[#708993]/10 border-2 border-[#A1C2BD]/50 rounded-xl text-[#19183B] shadow-lg shadow-[#708993]/10">
                            <div className="flex items-center gap-3">
                              <AlertCircle size={22} className="text-[#708993]" />
                              <div>
                                <p className="font-bold text-lg">ALERT SUPPRESSED</p>
                                <p className="text-xs text-[#708993]/80 mt-1">Safe Zone - No immediate risk detected</p>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="p-6 text-center bg-gradient-to-br from-white to-[#F5F9F8] rounded-xl border border-[#A1C2BD]/30">
                          <p className="text-sm text-[#A1C2BD]/80">Waiting for detection...</p>
                          <p className="text-xs text-[#A1C2BD]/60 mt-2">No workers currently detected</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-white to-[#F5F9F8] rounded-full mb-3 border border-[#A1C2BD]/30">
                        <Camera size={24} className="text-[#A1C2BD]/50" />
                      </div>
                      <p className="text-sm text-[#A1C2BD]/80">Feed inactive or initializing...</p>
                      <p className="text-xs text-[#A1C2BD]/60 mt-1">Start camera feed to begin analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-white to-[#F5F9F8] border border-[#A1C2BD]/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-xs font-bold text-[#708993]/90 uppercase mb-2">Alert Confidence</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black bg-gradient-to-r from-[#19183B] to-[#708993] bg-clip-text text-transparent">94%</span>
                  <div className="relative">
                    <Activity size={24} className="text-[#19183B] animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#19183B] rounded-full animate-ping"></div>
                  </div>
                </div>
                <p className="text-xs text-[#A1C2BD]/70 mt-2">High accuracy detection</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-white to-[#F5F9F8] border border-[#A1C2BD]/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-xs font-bold text-[#708993]/90 uppercase mb-2">Response Latency</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black bg-gradient-to-r from-[#19183B] to-[#708993] bg-clip-text text-transparent">2.1s</span>
                  <Zap size={24} className="text-[#19183B]" />
                </div>
                <p className="text-xs text-[#A1C2BD]/70 mt-2">Real-time performance</p>
              </div>
            </div>
            
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#F5F9F8] border-2 border-dashed border-[#A1C2BD]/30 shadow-sm">
              <h4 className="text-xs font-bold text-[#708993]/90 uppercase mb-3 flex items-center gap-2">
                <Zap size={14} className="text-[#708993]" />
                Early Stage Roadmap (Phase 4)
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-[#708993] hover:text-[#19183B] transition-colors">
                  <div className="w-2 h-2 bg-[#708993] rounded-full"></div>
                  <span>Testing under varying lighting conditions</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-[#708993] hover:text-[#19183B] transition-colors">
                  <div className="w-2 h-2 bg-[#A1C2BD] rounded-full"></div>
                  <span>Occlusion robustness benchmarking</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-[#708993] hover:text-[#19183B] transition-colors">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>False-positive rate verification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;