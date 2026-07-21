import React, { useState } from "react";
import { 
  Zap, 
  Sparkles,
  Github, 
  Cloud, 
  Code, 
  Smartphone, 
  Tablet, 
  CheckCircle2, 
  Globe, 
  Database, 
  ExternalLink, 
  FolderOpen, 
  FileCode,
  Shield,
  UploadCloud,
  Layers,
  ChevronRight,
  ArrowLeft,
  MousePointerClick
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { cn } from "../lib/utils";

interface MobileSettingsViewProps {
  simulateTablet: boolean;
  setSimulateTablet: (val: boolean) => void;
}

export default function MobileSettingsView({ simulateTablet, setSimulateTablet }: MobileSettingsViewProps) {
  const { 
    files, 
    activeFile, 
    openFile, 
    inspectModeActive, 
    setInspectModeActive, 
    setMobileTab, 
    setLayoutMode,
    autoFixEnabled,
    setAutoFixEnabled
  } = useWorkspace();
  const [activeSection, setActiveSection] = useState<"menu" | "publish" | "github" | "cloud" | "code" | "tablet">("menu");
  const [selectedFileCode, setSelectedFileCode] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Quick statistics for Cloud/Project
  const fileKeys = Object.keys(files);
  const totalFilesCount = fileKeys.length;

  const handleFileClick = (path: string) => {
    setSelectedFileName(path);
    setSelectedFileCode(files[path]?.code || "");
  };

  if (activeSection === "publish") {
    return (
      <div className="flex-1 flex flex-col bg-[#0c0c0d] p-5 overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => setActiveSection("menu")}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 bg-neutral-900/50 w-fit px-3 py-1.5 rounded-lg border border-[#2d2d2d]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Publish Applet</h2>
              <p className="text-[11px] text-neutral-400">Deploy and share your live full-stack applet</p>
            </div>
          </div>

          <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Production Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE & HEALTHY
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Live URL</span>
              <a 
                href="https://ais-pre-2qhfwbezvt5scw3qce43le-124159575945.asia-southeast1.run.app" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono break-all"
              >
                <span>ais-pre-2qhfwbezvt5scw3qce43le-124159575945.run.app</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2">
              <UploadCloud className="w-4 h-4" />
              <span>Trigger Production Rebuild</span>
            </button>
          </div>

          <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-neutral-200">Deployment Logs</h3>
            <div className="font-mono text-[10px] text-neutral-400 space-y-1.5 bg-[#09090b] p-3 rounded-xl border border-[#2d2d2d]/40">
              <p className="text-neutral-500">[2026-07-19 11:34:20] Building production assets...</p>
              <p className="text-emerald-500">✔ Vite client build finished in 1.48s</p>
              <p className="text-neutral-500">[2026-07-19 11:34:22] Container ingress routed successfully</p>
              <p className="text-blue-400">ℹ Deployed to Cloud Run region: asia-southeast1</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "github") {
    return (
      <div className="flex-1 flex flex-col bg-[#0c0c0d] p-5 overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => setActiveSection("menu")}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 bg-neutral-900/50 w-fit px-3 py-1.5 rounded-lg border border-[#2d2d2d]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">GitHub Integration</h2>
              <p className="text-[11px] text-neutral-400">Sync with your code repositories</p>
            </div>
          </div>

          <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-neutral-300 font-medium">Connected to nanthablackbird</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Target Repository</label>
              <input 
                type="text" 
                defaultValue="nanthablackbird/veo-gallery-app" 
                className="w-full bg-[#0a0a0b] border border-[#2d2d2d] rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <button className="w-full py-2.5 bg-[#252526] hover:bg-[#323233] border border-[#2d2d2d] text-neutral-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
              <Github className="w-4 h-4 text-neutral-400" />
              <span>Create GitHub Pull Request</span>
            </button>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-[11px] text-purple-300/90 leading-relaxed">
            Every commit made via the workspace automatically synchronizes with your development branch on GitHub to guarantee absolute safety and version control.
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "cloud") {
    return (
      <div className="flex-1 flex flex-col bg-[#0c0c0d] p-5 overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => setActiveSection("menu")}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 bg-neutral-900/50 w-fit px-3 py-1.5 rounded-lg border border-[#2d2d2d]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cloud Infrastructure</h2>
              <p className="text-[11px] text-neutral-400">Server status & Database provisioning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-neutral-200 block">Firestore Database</span>
                  <span className="text-[10px] text-neutral-500">Auto-backup and indexing</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-xs font-bold text-neutral-200 block">Firebase Authentication</span>
                  <span className="text-[10px] text-neutral-500">Google OAuth & email sign-in</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ENABLED
              </span>
            </div>

            <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-4 h-4 text-pink-400" />
                <div>
                  <span className="text-xs font-bold text-neutral-200 block">Google Cloud Run</span>
                  <span className="text-[10px] text-neutral-500">Container orchestration</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                RUNNING
              </span>
            </div>
          </div>

          <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-neutral-200">Environment Variables</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-[#0a0a0b] rounded-xl border border-[#2d2d2d]/60 font-mono text-[10px]">
                <span className="text-neutral-400">GEMINI_API_KEY</span>
                <span className="text-neutral-600">••••••••••••••••</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0a0a0b] rounded-xl border border-[#2d2d2d]/60 font-mono text-[10px]">
                <span className="text-neutral-400">NODE_ENV</span>
                <span className="text-neutral-300">development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "code") {
    return (
      <div className="flex-1 flex flex-col bg-[#0c0c0d] p-5 overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => {
            if (selectedFileCode !== null) {
              setSelectedFileCode(null);
              setSelectedFileName(null);
            } else {
              setActiveSection("menu");
            }
          }}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 bg-neutral-900/50 w-fit px-3 py-1.5 rounded-lg border border-[#2d2d2d]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{selectedFileCode !== null ? "Back to File List" : "Back to Settings"}</span>
        </button>

        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Code Preview</h2>
              <p className="text-[11px] text-neutral-400">Browse and inspect code on mobile</p>
            </div>
          </div>

          {selectedFileCode === null ? (
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">Project Files ({totalFilesCount})</span>
              <div className="grid grid-cols-1 gap-2">
                {fileKeys.map((path) => (
                  <button 
                    key={path}
                    onClick={() => handleFileClick(path)}
                    className={cn(
                      "w-full p-3 bg-[#141416] hover:bg-[#1a1a1c] border border-[#2d2d2d] rounded-2xl text-left flex items-center justify-between transition-colors",
                      activeFile === path && "border-indigo-500/40 bg-indigo-500/5"
                    )}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs text-neutral-200 font-mono truncate">{path}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono text-neutral-300 font-bold break-all">{selectedFileName}</span>
                <span className="text-[10px] text-neutral-500 font-mono">READ-ONLY</span>
              </div>
              <div className="flex-1 bg-[#09090b] border border-[#2d2d2d] rounded-2xl p-4 font-mono text-[10px] overflow-auto custom-scrollbar text-neutral-300 leading-relaxed whitespace-pre select-text">
                {selectedFileCode}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "tablet") {
    return (
      <div className="flex-1 flex flex-col bg-[#0c0c0d] p-5 overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => setActiveSection("menu")}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 bg-neutral-900/50 w-fit px-3 py-1.5 rounded-lg border border-[#2d2d2d]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Tablet Layout Simulator</h2>
              <p className="text-[11px] text-neutral-400">Simulate tablet view layouts on mobile</p>
            </div>
          </div>

          <div className="bg-[#141416] border border-[#2d2d2d] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300">Simulator Status</span>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                simulateTablet 
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                  : "bg-neutral-800 text-neutral-400 border-transparent"
              )}>
                {simulateTablet ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Activating this simulator constrains the workspace dimensions to exactly match tablet viewports, allowing you to test split layouts and responsive features.
            </p>

            <button 
              onClick={() => setSimulateTablet(!simulateTablet)}
              className={cn(
                "w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
                simulateTablet 
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/15"
              )}
            >
              <Tablet className="w-4 h-4" />
              <span>{simulateTablet ? "Deactivate Tablet Simulation" : "Activate Tablet Simulation"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0c0c0d] p-5 overflow-y-auto custom-scrollbar select-none">
      <div className="mb-6">
        <h2 className="text-sm font-bold text-white tracking-tight uppercase">Applet Settings</h2>
        <p className="text-[11px] text-neutral-500">Configure deployment, cloud, code & view preferences</p>
      </div>

      <div className="space-y-2.5">
        {/* Publish Option */}
        <button 
          onClick={() => setActiveSection("publish")}
          className="w-full p-4 bg-[#141416] hover:bg-[#1a1a1c] border border-[#2d2d2d] rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Publish</span>
              <span className="text-[10px] text-neutral-500">Manage production deploys & domains</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </button>

        {/* GitHub Option */}
        <button 
          onClick={() => setActiveSection("github")}
          className="w-full p-4 bg-[#141416] hover:bg-[#1a1a1c] border border-[#2d2d2d] rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">GitHub</span>
              <span className="text-[10px] text-neutral-500">Synchronize version control branch</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </button>

        {/* Cloud Option */}
        <button 
          onClick={() => setActiveSection("cloud")}
          className="w-full p-4 bg-[#141416] hover:bg-[#1a1a1c] border border-[#2d2d2d] rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Cloud Services</span>
              <span className="text-[10px] text-neutral-500">Firestore, Auth, and Google Container stats</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </button>

        {/* Code Preview Option */}
        <button 
          onClick={() => setActiveSection("code")}
          className="w-full p-4 bg-[#141416] hover:bg-[#1a1a1c] border border-[#2d2d2d] rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Code Preview</span>
              <span className="text-[10px] text-neutral-500">Read and audit source files on-the-go</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </button>

        {/* Tablet view Simulator Option */}
        <button 
          onClick={() => setActiveSection("tablet")}
          className="w-full p-4 bg-[#141416] hover:bg-[#1a1a1c] border border-[#2d2d2d] rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Tablet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Tab View Simulator</span>
              <span className="text-[10px] text-neutral-500">Simulate tablet responsive scaling</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </button>

        {/* Select Element Toggle Option */}
        <button 
          onClick={() => {
            setInspectModeActive(!inspectModeActive);
            if (!inspectModeActive) {
              setMobileTab("preview");
              setLayoutMode("preview");
            }
          }}
          className={cn(
            "w-full p-4 border rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group",
            inspectModeActive 
              ? "bg-indigo-500/5 border-indigo-500/40 hover:bg-indigo-500/10" 
              : "bg-[#141416] hover:bg-[#1a1a1c] border-[#2d2d2d]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border transition-colors",
              inspectModeActive 
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" 
                : "bg-neutral-800/50 border-neutral-700/20 text-neutral-400"
            )}>
              <MousePointerClick className={cn("w-4 h-4", inspectModeActive && "animate-pulse")} />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">Select Element Mode</span>
              <span className="text-[10px] text-neutral-500">
                {inspectModeActive ? "Touch edit active — tap items in live preview" : "Tap live preview elements to edit their code"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-extrabold px-1.5 py-0.5 rounded border font-mono transition-all",
              inspectModeActive 
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
                : "bg-[#09090b] text-neutral-500 border-neutral-800"
            )}>
              {inspectModeActive ? "ACTIVE" : "INACTIVE"}
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
        </button>

        {/* AI Auto-Fix Errors Toggle Option */}
        <button 
          onClick={() => setAutoFixEnabled(!autoFixEnabled)}
          className={cn(
            "w-full p-4 border rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group",
            autoFixEnabled 
              ? "bg-indigo-500/5 border-indigo-500/40 hover:bg-indigo-500/10" 
              : "bg-[#141416] hover:bg-[#1a1a1c] border-[#2d2d2d]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border transition-colors",
              autoFixEnabled 
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" 
                : "bg-neutral-800/50 border-neutral-700/20 text-neutral-400"
            )}>
              <Sparkles className={cn("w-4 h-4", autoFixEnabled && "animate-pulse")} />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-200 block">AI Auto-Fix Errors</span>
              <span className="text-[10px] text-neutral-500">
                {autoFixEnabled ? "AI auto-rebuild active on build/preview errors" : "Automatically repair code errors using Gemini API"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-extrabold px-1.5 py-0.5 rounded border font-mono transition-all",
              autoFixEnabled 
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
                : "bg-[#09090b] text-neutral-500 border-neutral-800"
            )}>
              {autoFixEnabled ? "ACTIVE" : "INACTIVE"}
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
        </button>
      </div>

      <div className="mt-8 bg-[#18181b]/40 border border-[#2d2d2d]/60 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-neutral-400" />
          <span className="text-[11px] font-bold text-neutral-400">Active View: Mobile Portrait</span>
        </div>
        <span className="text-[10px] font-bold text-neutral-500 font-mono">v1.2.0</span>
      </div>
    </div>
  );
}
