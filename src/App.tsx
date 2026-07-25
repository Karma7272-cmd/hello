/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Loader2,
  Sparkles,
  Mic,
  Plus,
  ArrowLeft,
  GitFork,
  Settings,
  Edit3,
  Bug,
  Sun,
  Moon,
  Flag,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronRight,
  ArrowUp,
  PanelLeft,
  Globe,
  FileText,
  Layers,
  Monitor,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Zap,
  MousePointerClick,
  Columns,
  Cloud,
  Trash2,
  Tablet,
  Smartphone,
  Wand2,
  Wrench
} from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import StackBlitzWorkspace from "./components/StackBlitzWorkspace";
import HomePage from "./components/HomePage";
import MobileSettingsView from "./components/MobileSettingsView";
import CloudConnectorsPopup from "./components/CloudConnectorsPopup";
import { AILoadBalancerModal } from "./components/AILoadBalancerModal";
import { PreviewErrorLogModal } from "./components/PreviewErrorLogModal";
import { cn } from "./lib/utils";

function AppContent() {
  const { 
    prompt, 
    setPrompt, 
    triggerGeneration, 
    isGenerating, 
    error, 
    setError,
    files,
    activeFile,
    resetWorkspace,
    layoutMode,
    setLayoutMode,
    isSidebarOpen,
    setIsSidebarOpen,
    previewUrl,
    restartDevServer,
    inspectModeActive,
    setInspectModeActive,
    isMobile,
    isTablet,
    mobileTab,
    setMobileTab,
    selectedElement,
    setSelectedElement,
    triggerElementEdit,
    user,
    loadingUser,
    signIn,
    logout,
    projectHistory,
    loadProjectFromHistory,
    deleteProjectFromHistory,
    activeProjectId,
    setActiveProjectId,
    deviceMode,
    setDeviceMode,
    cycleDeviceMode,
    isAutoFixing,
    autoFixEnabled,
    setAutoFixEnabled,
    triggerAutoFix,
    latestPreviewError,
    runPreview
  } = useWorkspace();

  const [isReloading, setIsReloading] = useState(false);
  const [view, setView] = useState<"home" | "ide">("home");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  // Editable title state
  const [title, setTitle] = useState("AI Web Builder IDE");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [simulateTablet, setSimulateTablet] = useState(false);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [isLoadBalancerOpen, setIsLoadBalancerOpen] = useState(false);
  const [isErrorLogOpen, setIsErrorLogOpen] = useState(false);

  // Interactive message history matching the active workspace
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: "user" | "gemini";
    text: string;
    modelInfo?: string;
    duration?: string;
    checkpoint?: boolean;
    isStatus?: boolean;
  }>>([]);

  // Load chat messages specifically for the active workspace
  useEffect(() => {
    if (!activeProjectId) return;
    try {
      const saved = localStorage.getItem(`ai-builder-messages-${activeProjectId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
        return;
      }
    } catch (e) {
      console.error("Failed to parse saved workspace messages:", e);
    }

    const proj = projectHistory.find((p) => p.id === activeProjectId);
    setMessages([
      {
        id: "1",
        sender: "gemini",
        modelInfo: "Gemini 3.6 Flash",
        duration: "Ready",
        checkpoint: true,
        text: proj
          ? `• **Workspace active**: "${proj.prompt}".\n\nAll files for this website are isolated in this workspace. Any prompts or code edits here will modify only this website.`
          : `Welcome to your AI Web Workspace! Enter a prompt below to build or customize this website.`
      }
    ]);
  }, [activeProjectId]);

  // Save messages whenever they change for the active workspace
  useEffect(() => {
    if (activeProjectId && messages.length > 0) {
      try {
        localStorage.setItem(`ai-builder-messages-${activeProjectId}`, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save workspace messages:", e);
      }
    }
  }, [messages, activeProjectId]);

  const handleHomeSubmit = async (promptText: string) => {
    setPrompt(promptText);
    setView("ide");
    
    const userMsgId = Date.now().toString();
    setMessages([
      {
        id: userMsgId,
        sender: "user",
        text: promptText
      }
    ]);

    try {
      await triggerGeneration(promptText, false);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          modelInfo: "Gemini 3.6 Flash",
          duration: "Ran for 12s",
          checkpoint: true,
          text: `I have created your new separated workspace and updated it with the requested features:
• Built a customized layout update matching: **${promptText}**.
• Modified appropriate files with correct React hooks and Tailwind utility declarations.
• Automatically recompiled the local preview server. You can view the live result in the preview tab!`
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          modelInfo: "Gemini 3.6 Flash",
          duration: "Failed",
          text: `❌ Generation failed: ${err.message || "Unknown error occurring during synthesis."}`
        }
      ]);
    }
  };

  // Suggestion chips matching screenshot
  const [suggestions, setSuggestions] = useState([
    "✦ AI Features",
    "Add keyboard shortcuts",
    "Add token usage monitor",
    "Create dashboard layout",
    "Build responsive settings modal"
  ]);

  const [feedback, setFeedback] = useState<Record<string, "up" | "down" | null>>({});

  // Dynamic system status loader during generation
  const [genStatus, setGenStatus] = useState("Analyzing requirements...");

  useEffect(() => {
    if (isGenerating) {
      const statuses = [
        "Analyzing prompt requirements...",
        "Evaluating dependency updates...",
        "Writing robust React code...",
        "Generating Tailwind layout styles...",
        "Compiling workspace modules..."
      ];
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < statuses.length - 1) {
          idx++;
          setGenStatus(statuses[idx]);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // Handle user submit action
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userPrompt = prompt.trim();
    
    // Add user's message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: selectedElement 
          ? `[AI Touch Edit - <${selectedElement.tagName.toLowerCase()}>] ${userPrompt}` 
          : userPrompt
      }
    ]);

    setPrompt("");

    try {
      if (selectedElement) {
        // Trigger Element specific AI edit
        await triggerElementEdit(userPrompt);

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "gemini",
            modelInfo: "Gemini 3.5 Flash",
            duration: "Ran for 5s",
            checkpoint: true,
            text: `I have successfully styled and edited the selected element on your webpage matching: "${userPrompt}".`
          }
        ]);
      } else {
        // Trigger actual Gemini file update logic
        await triggerGeneration(userPrompt, true);

        // Successfully generated: Add Gemini's text reply to chat
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "gemini",
            modelInfo: "Gemini 3.5 Flash",
            duration: "Ran for 12s",
            checkpoint: true,
            text: `I have updated the workspace with the requested features:
• Built a customized layout update matching: **${userPrompt}**.
• Modified appropriate files with correct React hooks and Tailwind utility declarations.
• Automatically recompiled the local preview server. You can view the live result in the preview tab!`
          }
        ]);
      }
    } catch (err: any) {
      // Generation failed
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          modelInfo: "Gemini 3.5 Flash",
          duration: "Failed",
          text: `❌ Generation failed: ${err.message || "Unknown error occurring during synthesis."}`
        }
      ]);
    }
  };

  const handleSuggestionClick = (sug: string) => {
    // Clean prefix for better text input
    const cleanPrompt = sug.startsWith("✦ ") ? sug.substring(2) : sug;
    setPrompt(cleanPrompt);
  };

  const removeSuggestion = (index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  if (view === "home") {
    return <HomePage onSubmit={handleHomeSubmit} isGenerating={isGenerating} onLoadProject={() => setView("ide")} />;
  }

  return (
    <div className="h-screen w-full bg-[#0c0c0c] text-neutral-200 flex flex-col font-sans overflow-hidden">
      
      {/* Top Header matching user screenshot exactly */}
      <header className="h-14 flex items-center justify-between px-3 sm:px-4 shrink-0 bg-[#121214] z-20 border-b border-[#222] overflow-x-auto overflow-y-hidden max-w-full custom-scrollbar gap-2 sm:gap-4 select-none">
        
        {/* Left Side: Navigation, Title & Layout switchers */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 overflow-x-auto overflow-y-hidden py-1 custom-scrollbar">
          {/* Back Button */}
          <button 
            onClick={() => setView("home")}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Back to start"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          {/* Editable title */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                className="bg-[#1c1c1e] text-neutral-100 font-semibold text-xs px-2 py-0.5 border border-indigo-500 rounded focus:outline-none w-28"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1 group">
                <span className="text-xs font-semibold text-neutral-400 tracking-tight max-w-[100px] truncate">
                  {title}
                </span>
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white text-neutral-500 transition-opacity cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#2d2d2d] shrink-0" />

          {/* Workspace Switcher Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#1c1c20] hover:bg-[#26262b] border border-[#2d2d35] text-xs font-semibold px-2.5 py-1 rounded-lg text-neutral-200 transition-all cursor-pointer max-w-[140px] sm:max-w-[200px]"
              title="Switch or create separated website workspace"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                {projectHistory.find(p => p.id === activeProjectId)?.prompt || "Workspace"}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0 ml-0.5" />
            </button>

            {isWorkspaceDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsWorkspaceDropdownOpen(false)} 
                />
                <div 
                  className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-[#141417] border border-[#2d2d35] rounded-xl shadow-2xl z-50 p-2 space-y-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#242429] mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-300">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>My Workspaces</span>
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                        {projectHistory.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        setView("home");
                      }}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Site</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                    {projectHistory.map((proj) => {
                      const isActive = proj.id === activeProjectId;
                      return (
                        <div
                          key={proj.id}
                          onClick={() => {
                            loadProjectFromHistory(proj);
                            setIsWorkspaceDropdownOpen(false);
                          }}
                          className={cn(
                            "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-left",
                            isActive
                              ? "bg-indigo-600/20 border border-indigo-500/40 text-white font-medium shadow-sm"
                              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <Sparkles className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-indigo-400" : "text-neutral-500")} />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-xs leading-tight">{proj.prompt}</div>
                              <div className="text-[10px] text-neutral-500 mt-0.5">
                                {new Date(proj.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Active Workspace" />
                            )}
                            {projectHistory.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteProjectFromHistory(proj.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/80 rounded transition-all cursor-pointer"
                                title="Delete workspace"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-[#2d2d2d] shrink-0" />

          {/* Sidebar Toggle button matching screenshot */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-all cursor-pointer shrink-0",
              isSidebarOpen && "text-white bg-neutral-800/40"
            )}
            title={isSidebarOpen ? "Collapse Gemini Assistant" : "Expand Gemini Assistant"}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Interactive Layout switcher pill matching user image */}
          <div className="relative flex items-center gap-1.5 bg-[#0a0a0b] p-1 rounded-full border border-[#2d2d2d]/60 select-none shrink-0">
            {/* Preview Tab */}
            <button 
              onClick={() => setLayoutMode("preview")}
              className={cn(
                "px-2 sm:px-3.5 py-1 text-[11px] font-bold rounded-full transition-all flex items-center gap-1 cursor-pointer",
                layoutMode === "preview" 
                  ? "bg-[#1d4ed8]/30 border border-[#2563eb]/40 text-[#4285f4] shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Preview</span>
            </button>
            
            {/* Auto Fix Errors Icon Button */}
            <button 
              id="desktop-sidebar-inspect-btn"
              onClick={() => {
                if (latestPreviewError) {
                  triggerAutoFix(latestPreviewError.message, latestPreviewError.context);
                } else {
                  setAutoFixEnabled(!autoFixEnabled);
                }
              }}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 relative",
                isAutoFixing
                  ? "text-amber-400 bg-amber-500/20 border border-amber-500/30 animate-pulse"
                  : latestPreviewError
                  ? "text-red-400 bg-red-500/20 border border-red-500/40 animate-bounce"
                  : autoFixEnabled 
                  ? "text-indigo-400 bg-indigo-500/15 border border-indigo-500/30" 
                  : "text-neutral-500 hover:text-neutral-300"
              )}
              title={
                isAutoFixing
                  ? "Auto-Fixing preview errors..."
                  : latestPreviewError
                  ? `Click to Auto-Fix Error: ${latestPreviewError.message}`
                  : autoFixEnabled
                  ? "Auto-Fix Errors: Enabled (Click to toggle)"
                  : "Auto-Fix Errors: Disabled (Click to enable)"
              }
            >
              <Wand2 className={cn("w-3.5 h-3.5", isAutoFixing && "animate-spin")} />
              {latestPreviewError && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>

            <div className="h-4 w-px bg-[#2d2d2d]/80 shrink-0" />

            {/* Code Only tab */}
            <button 
              onClick={() => setLayoutMode("code")}
              className={cn(
                "flex p-1 rounded-lg transition-all cursor-pointer items-center justify-center font-mono text-[10px] leading-none shrink-0 font-bold px-1.5",
                layoutMode === "code" 
                  ? "text-white bg-neutral-800/40" 
                  : "text-neutral-500 hover:text-neutral-300"
              )}
              title="Code Editor Only"
            >
              &lt;/&gt;
            </button>

            <div className="h-4 w-px bg-[#2d2d2d]/80 shrink-0" />

            {/* Cloud Connectors & Database status */}
            <button 
              onClick={() => setIsConnectorsOpen(!isConnectorsOpen)}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center relative shrink-0",
                isConnectorsOpen 
                  ? "text-[#4285f4] bg-[#4285f4]/15 border border-[#4285f4]/30" 
                  : "text-neutral-500 hover:text-neutral-300"
              )}
              title="Cloud Connectors & Database status"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-[#0a0a0b]" />
            </button>

            {isConnectorsOpen && (
              <CloudConnectorsPopup onClose={() => setIsConnectorsOpen(false)} />
            )}

            <div className="h-4 w-px bg-[#2d2d2d]/80 shrink-0" />

            {/* AI Load Balancer Engine Pill Button */}
            <button
              onClick={() => setIsLoadBalancerOpen(!isLoadBalancerOpen)}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 text-xs font-bold border",
                isLoadBalancerOpen
                  ? "text-purple-300 bg-purple-500/20 border-purple-500/50 shadow-sm shadow-purple-500/20"
                  : "text-neutral-300 hover:text-white bg-[#18181c] hover:bg-[#202025] border-[#2d2d2d]"
              )}
              title="Touch / click to view and control the real-time AI Model Load Balancer Engine"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400/30" />
              <span className="hidden sm:inline text-[11px] font-bold">AI Load Balancer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <div className="h-4 w-px bg-[#2d2d2d]/80 shrink-0" />

            {/* Preview Error Log Dashboard Pill Button */}
            <button
              onClick={() => setIsErrorLogOpen(!isErrorLogOpen)}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 text-xs font-bold border relative",
                isErrorLogOpen
                  ? "text-red-300 bg-red-500/20 border-red-500/50 shadow-sm shadow-red-500/20"
                  : latestPreviewError && latestPreviewError.projectId === activeProjectId
                  ? "text-red-400 bg-red-950/50 hover:bg-red-900/60 border-red-500/40 animate-pulse"
                  : "text-neutral-300 hover:text-white bg-[#18181c] hover:bg-[#202025] border-[#2d2d2d]"
              )}
              title="View detailed WebContainer Preview Error Log & Actionable Fixes"
            >
              <Bug className={cn("w-3.5 h-3.5", latestPreviewError && latestPreviewError.projectId === activeProjectId ? "text-red-400" : "text-amber-400")} />
              <span className="hidden sm:inline text-[11px] font-bold">Error Log</span>
              {latestPreviewError && latestPreviewError.projectId === activeProjectId ? (
                <span className="px-1.5 py-0.2 text-[9px] bg-red-500 text-white rounded-full font-black">1</span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>
        
        {/* Center: Address Bar with device mode toggle button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            type="button"
            onClick={cycleDeviceMode}
            className={cn(
              "p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0",
              deviceMode === "desktop" 
                ? "bg-[#18181c] text-neutral-400 hover:text-white border-[#2d2d2d]" 
                : deviceMode === "tablet"
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/20"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
            )}
            title={
              deviceMode === "desktop"
                ? "Current: Desktop Mode. Click/touch for Tab Preview Mode"
                : deviceMode === "tablet"
                ? "Current: Tab Preview Mode (768px). Click/touch for Mobile View"
                : "Current: Mobile View (375px). Click/touch for Desktop Mode"
            }
          >
            {deviceMode === "desktop" && <Monitor className="w-4 h-4" />}
            {deviceMode === "tablet" && <Tablet className="w-4 h-4 text-indigo-400" />}
            {deviceMode === "mobile" && <Smartphone className="w-4 h-4 text-emerald-400" />}
          </button>
          
          <div className="flex items-center bg-[#09090b]/80 border border-[#2d2d2d]/60 rounded-full px-3 py-1 text-xs text-neutral-300 w-44 sm:w-60 md:w-80 lg:w-[320px] transition-all shrink-0">
            <button 
              onClick={() => {
                setIsReloading(true);
                runPreview();
                setTimeout(() => setIsReloading(false), 600);
              }}
              className="text-neutral-500 hover:text-neutral-200 transition-colors shrink-0 cursor-pointer p-0.5 rounded-full hover:bg-neutral-800 active:scale-90"
              title="Touch / click to reload website preview"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 transition-transform", isReloading && "animate-spin text-indigo-400")} />
            </button>
            <div className="flex-1 text-center font-bold text-neutral-200 truncate select-none px-2 text-[11px] flex items-center justify-center gap-1.5">
              <span>Homepage</span>
              {deviceMode !== "desktop" && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase font-bold tracking-tight",
                  deviceMode === "tablet" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                )}>
                  {deviceMode === "tablet" ? "Tab 768px" : "Mobile 375px"}
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          </div>

          <a 
            href={previewUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        
        {/* Right Side: Action buttons matching screenshot */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Sign-In or Avatar Profile Dropdown */}
          {loadingUser ? (
            <div className="h-7 w-7 flex items-center justify-center mr-1">
              <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
            </div>
          ) : user ? (
            <div className="relative mr-1">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-7 w-7 rounded-full overflow-hidden border border-neutral-700 hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-center bg-indigo-600 font-bold text-xs text-white"
                title={`Logged in as ${user.email}`}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                ) : (
                  (user.displayName || user.email || "U").charAt(0).toUpperCase()
                )}
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141416] border border-neutral-800 p-3 shadow-2xl z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-900">
                    <div className="h-9 w-9 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center overflow-hidden font-bold text-sm shrink-0">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        (user.displayName || user.email || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-200 truncate leading-none mb-1">{user.displayName || "User"}</p>
                      <p className="text-[10px] text-neutral-500 truncate leading-none">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => signIn().catch(err => console.error(err))}
              className="px-3 py-1.5 bg-[#18181b] hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 mr-1"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sign In</span>
            </button>
          )}

          <button className="px-4 py-1.5 bg-[#1a1a1c] hover:bg-[#252528] text-neutral-200 border border-[#2d2d2d]/80 rounded-full text-[11px] font-bold transition-colors cursor-pointer shrink-0">
            Share
          </button>
          
          {/* Upgrade Purple Pill */}
          <button 
            onClick={() => setView("home")}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center shadow-md shadow-purple-500/20 active:scale-95 shrink-0"
            title="Touch to view Pricing & Subscription Plans"
          >
            <span>Upgrade</span>
          </button>
          
          {/* Publish Blue Pill with Notification dot */}
          <button className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full text-[11px] font-bold transition-colors cursor-pointer relative shadow-md shadow-blue-500/20 shrink-0">
            <span>Publish</span>
            {/* Precise notification dot exactly as shown in screenshot */}
            <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border border-[#2563eb] animate-pulse" />
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 relative flex overflow-hidden min-h-0 bg-[#0c0c0c]">
        {error && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1c1c1e] border border-red-500/20 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Bug className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {error.includes("429") || error.toLowerCase().includes("quota") ? "Gemini API Quota Exceeded (429)" : "An error occurred"}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {error.includes("429") || error.toLowerCase().includes("quota") 
                      ? "You have reached the temporary rate limit or quota allocated for the free-tier Gemini API key."
                      : "The virtual workspace compiler or generator encountered an issue."}
                  </p>
                </div>
              </div>

              <div className="bg-[#141415] border border-[#2d2d2d] rounded-xl p-3.5 text-xs text-neutral-300 font-mono overflow-auto max-h-40 custom-scrollbar leading-relaxed">
                {error}
              </div>

              {(error.includes("429") || error.toLowerCase().includes("quota")) && (
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Recommended Next Steps:</h4>
                  <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside pl-1">
                    <li><span className="text-neutral-200 font-medium">Wait a short moment</span>: Rate limits on the Google AI Studio free tier reset automatically every minute.</li>
                    <li><span className="text-neutral-200 font-medium">Provide your own key</span>: Update the <code className="text-indigo-400 bg-indigo-500/5 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> in Settings.</li>
                    <li><span className="text-neutral-200 font-medium">Reset Workspace</span>: Revert to the stable template to test preview features.</li>
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button 
                  onClick={() => {
                    resetWorkspace();
                    setError(null);
                  }}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Workspace
                </button>
                <button 
                  onClick={() => setError(null)}
                  className="flex-1 py-2 bg-[#252526] hover:bg-[#323233] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isMobile ? (
          <div className="flex-1 flex flex-col h-full w-full relative min-h-0 bg-[#0c0c0c]">
            {/* Main content depending on mobileTab */}
            <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0c0c0c]">
              {mobileTab === "chat" && (
                <div className="flex-1 flex flex-col h-full w-full bg-[#0c0c0c] min-h-0">
                  {/* Mobile Chat Header */}
                  <div className="h-12 border-b border-[#222]/80 px-4 flex items-center justify-between shrink-0 bg-[#0e0e10]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">AI Chat</span>
                    </div>
                  </div>
                  
                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex flex-col gap-2">
                        {/* Sender */}
                        {msg.sender === "gemini" && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-neutral-300">{msg.modelInfo}</span>
                              {msg.duration && (
                                <>
                                  <span className="text-neutral-600">•</span>
                                  <span className="text-neutral-500">{msg.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {msg.sender === "user" && (
                          <div className="flex items-center gap-2 mb-1 self-end">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-neutral-400">You</span>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-neutral-300">
                              U
                            </div>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className={cn(
                          "text-xs leading-relaxed max-w-[95%] whitespace-pre-wrap font-sans",
                          msg.sender === "user" 
                            ? "bg-[#1c1c1e] text-neutral-100 p-3.5 rounded-2xl border border-[#2d2d2d]/60 self-end" 
                            : "text-neutral-300 pl-7"
                        )}>
                          {msg.sender === "user" ? (
                            msg.text
                          ) : (
                            <div className="space-y-4">
                              {msg.text.split("\n\n").map((para, pIdx) => {
                                if (para.startsWith("•") || para.startsWith("1.") || para.startsWith("2.") || para.startsWith("3.")) {
                                  return (
                                    <div key={pIdx} className="space-y-2">
                                      {para.split("\n").map((line, lIdx) => {
                                        const isSubItem = line.trim().startsWith("•");
                                        return (
                                          <p 
                                            key={lIdx} 
                                            className={cn(
                                              "text-neutral-300",
                                              isSubItem ? "pl-4 text-neutral-400" : "font-medium text-neutral-200"
                                            )}
                                          >
                                            {line}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  );
                                }
                                return <p key={pIdx}>{para}</p>;
                              })}
                            </div>
                          )}
                        </div>

                        {/* Checkpoint row */}
                        {msg.sender === "gemini" && msg.checkpoint && (
                          <div className="pl-7 mt-2 pt-2 border-t border-[#222]/40 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-neutral-500">
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                                  <Flag className="w-3.5 h-3.5 text-neutral-500" />
                                  Checkpoint
                                </span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setFeedback(prev => ({ ...prev, [msg.id]: prev[msg.id] === "up" ? null : "up" }))}
                                    className={cn("p-1 rounded transition-colors hover:text-neutral-300", feedback[msg.id] === "up" && "text-emerald-400")}
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => setFeedback(prev => ({ ...prev, [msg.id]: prev[msg.id] === "down" ? null : "down" }))}
                                    className={cn("p-1 rounded transition-colors hover:text-neutral-300", feedback[msg.id] === "down" && "text-red-400")}
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button className="px-2.5 py-1 text-[11px] font-semibold text-neutral-300 hover:text-white bg-transparent border border-[#2d2d2d] rounded hover:bg-[#1a1a1a] transition-all cursor-pointer">
                                  View changes
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isGenerating && (
                      <div className="flex flex-col gap-2 pt-2 animate-pulse pl-7">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-cyan-400">Gemini compiling...</span>
                        </div>
                        <span className="text-[11px] text-neutral-500 pl-6">{genStatus}</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestion pills */}
                  <div className="px-4 bg-[#0c0c0c] pt-2 relative border-t border-[#1a1a1a]/50">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar whitespace-nowrap">
                      {suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(sug)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[#2d2d2d]/60 text-neutral-300 rounded-full text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                        >
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Box */}
                  <div className="p-4 pt-1 pb-4 bg-[#0c0c0c] shrink-0">
                    <div className={cn(
                      "bg-[#1c1c1e] border rounded-2xl p-2.5 flex flex-col shadow-xl transition-all duration-200",
                      selectedElement ? "border-indigo-500/50 bg-[#16161b]" : "border-[#2c2c2d]"
                    )}>
                      {selectedElement && (
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d2d2d]/60 text-[10px]">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                            <span>TOUCH EDIT:</span>
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md font-mono font-extrabold uppercase text-[9px]">
                              {selectedElement.tagName.toLowerCase()}
                            </span>
                          </div>
                          <button 
                            onClick={() => setSelectedElement(null)}
                            className="text-neutral-500 hover:text-white transition-colors cursor-pointer text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <textarea 
                        rows={1}
                        placeholder={selectedElement ? `Edit selected <${selectedElement.tagName.toLowerCase()}>...` : "Type instruction for Gemini..."}
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-neutral-100 placeholder-neutral-500 py-1 resize-none h-10 custom-scrollbar leading-relaxed"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate();
                          }
                        }}
                      />
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#222]/60">
                        <span className="text-[10px] text-neutral-500 font-bold">Ready</span>
                        <button 
                          onClick={handleGenerate}
                          disabled={isGenerating || !prompt.trim()}
                          className={cn(
                            "p-1.5 rounded-full text-white transition-all cursor-pointer",
                            prompt.trim() ? "bg-[#6366f1]" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                          )}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mobileTab === "preview" && (
                <div className="flex-1 flex flex-col min-h-0 relative bg-[#0c0c0c]">
                  <StackBlitzWorkspace />
                </div>
              )}

              {mobileTab === "settings" && (
                <MobileSettingsView simulateTablet={simulateTablet} setSimulateTablet={setSimulateTablet} />
              )}
            </div>

            {/* Mobile Footer Navigation Bar with curved container edges & Cloud icon */}
            <div className="h-14 bg-[#141418] border border-[#2d2d38] m-2 rounded-2xl sm:rounded-3xl shadow-xl px-4 flex items-center justify-around shrink-0 z-30 select-none transition-all">
              <button 
                onClick={() => setMobileTab("chat")}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all py-1 px-3.5 rounded-xl cursor-pointer",
                  mobileTab === "chat" ? "text-indigo-400 bg-indigo-500/10 font-bold" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Chat</span>
              </button>

              <button 
                onClick={() => {
                  setMobileTab("preview");
                  setLayoutMode("preview");
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all py-1 px-3.5 rounded-xl cursor-pointer",
                  mobileTab === "preview" ? "text-blue-400 bg-blue-500/10 font-bold" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Globe className="w-4 h-4" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Preview</span>
              </button>

              <button 
                onClick={() => setMobileTab("settings")}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all py-1 px-3.5 rounded-xl cursor-pointer",
                  mobileTab === "settings" ? "text-purple-400 bg-purple-500/10 font-bold" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Cloud className="w-4 h-4" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Settings</span>
              </button>
            </div>
          </div>
        ) : (
          /* Desktop / Tablet with simulateTablet wrapper option */
          <div className="flex-1 flex h-full w-full relative min-h-0 bg-[#0c0c0d] items-center justify-center overflow-hidden">
            <div 
              className={cn(
                "flex-1 flex h-full w-full relative transition-all duration-300 ease-in-out",
                simulateTablet && "max-w-[1024px] max-h-[768px] border-8 border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl relative bg-[#0c0c0c] my-auto aspect-[4/3] border-t-[28px] border-b-[28px]"
              )}
            >
              {/* Left Sidebar (Gemini Assistant Panel) with smooth collapse transition */}
              <div 
                className={cn(
                  "bg-[#0c0c0c] flex flex-col shrink-0 h-full border-r border-[#222] relative transition-all duration-300 ease-in-out overflow-hidden",
                  isSidebarOpen 
                    ? isTablet ? "w-[340px]" : "w-[430px]"
                    : "w-0 border-r-0"
                )}
              >
                {/* Sidebar Header with Select Element toggle */}
                <div className="h-12 border-b border-[#222]/80 px-4 flex items-center justify-between shrink-0 bg-[#0e0e10]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">Gemini AI Assistant</span>
                  </div>
                  
                  <button 
                    onClick={() => setInspectModeActive(!inspectModeActive)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer border",
                      inspectModeActive 
                        ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/30 font-bold" 
                        : "text-neutral-400 hover:text-neutral-200 border-[#2d2d2d]/60 bg-[#1c1c1e]"
                    )}
                    title="Toggle Select Element Mode"
                    id="desktop-sidebar-inspect-btn"
                  >
                    <MousePointerClick className={cn("w-3.5 h-3.5", inspectModeActive && "animate-pulse")} />
                    <span>Select Element</span>
                  </button>
                </div>
                
                {/* Scrollable message feed matching screenshot layout */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-2">
                      
                      {/* Sender Details */}
                      {msg.sender === "gemini" && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-neutral-300">{msg.modelInfo}</span>
                            {msg.duration && (
                              <>
                                <span className="text-neutral-600">•</span>
                                <span className="text-neutral-500">{msg.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {msg.sender === "user" && (
                        <div className="flex items-center gap-2 mb-1 self-end">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-neutral-400">You</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-neutral-300">
                            U
                          </div>
                        </div>
                      )}

                      {/* Message Bubble Body */}
                      <div className={cn(
                        "text-xs leading-relaxed max-w-[95%] whitespace-pre-wrap font-sans",
                        msg.sender === "user" 
                          ? "bg-[#1c1c1e] text-neutral-100 p-3.5 rounded-2xl border border-[#2d2d2d]/60 self-end" 
                          : "text-neutral-300 pl-7"
                      )}>
                        {msg.sender === "user" ? (
                          msg.text
                        ) : (
                          <div className="space-y-4">
                            {msg.text.split("\n\n").map((para, pIdx) => {
                              if (para.startsWith("•") || para.startsWith("1.") || para.startsWith("2.") || para.startsWith("3.")) {
                                  return (
                                    <div key={pIdx} className="space-y-2">
                                      {para.split("\n").map((line, lIdx) => {
                                        const isSubItem = line.trim().startsWith("•");
                                        return (
                                          <p 
                                            key={lIdx} 
                                            className={cn(
                                              "text-neutral-300",
                                              isSubItem ? "pl-4 text-neutral-400" : "font-medium text-neutral-200"
                                            )}
                                          >
                                            {line}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  );
                              }
                              return <p key={pIdx}>{para}</p>;
                            })}
                          </div>
                        )}
                      </div>

                      {/* Checkpoint row matching screenshot */}
                      {msg.sender === "gemini" && msg.checkpoint && (
                        <div className="pl-7 mt-2 pt-2 border-t border-[#222]/40 flex flex-col gap-3">
                          {/* Left: Flag, Likes. Right: action buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-neutral-500">
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                                <Flag className="w-3.5 h-3.5 text-neutral-500" />
                                Checkpoint
                              </span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setFeedback(prev => ({ ...prev, [msg.id]: prev[msg.id] === "up" ? null : "up" }))}
                                  className={cn("p-1 rounded transition-colors hover:text-neutral-300", feedback[msg.id] === "up" && "text-emerald-400")}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => setFeedback(prev => ({ ...prev, [msg.id]: prev[msg.id] === "down" ? null : "down" }))}
                                  className={cn("p-1 rounded transition-colors hover:text-neutral-300", feedback[msg.id] === "down" && "text-red-400")}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button className="px-2.5 py-1 text-[11px] font-semibold text-neutral-300 hover:text-white bg-transparent border border-[#2d2d2d] rounded hover:bg-[#1a1a1a] transition-all cursor-pointer">
                                View changes
                              </button>
                              <button 
                                disabled 
                                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-500 bg-transparent border border-[#2d2d2d]/40 rounded cursor-not-allowed flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3 text-neutral-600" />
                                Restore
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}

                  {/* Loader indicator inside Chat when generating */}
                  {isGenerating && (
                    <div className="flex flex-col gap-2 pt-2 animate-pulse pl-7">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-cyan-400">Gemini is compiling components...</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 pl-6">{genStatus}</span>
                    </div>
                  )}
                </div>

                {/* Suggested Pills list at bottom of chat panel */}
                <div className="px-4 shrink-0 bg-[#0c0c0c] border-t border-[#1e1e20] pt-3 relative">
                  <div className="flex items-center justify-between overflow-x-auto custom-scrollbar whitespace-nowrap gap-1.5 pb-2 max-w-full">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(sug)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[#2d2d2d]/60 text-neutral-300 hover:text-white rounded-full text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                      >
                        <span>{sug}</span>
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSuggestion(idx);
                          }} 
                          className="ml-1 text-neutral-500 hover:text-red-400 text-[10px]"
                        >
                          ✕
                        </span>
                      </button>
                    ))}
                    
                    {/* Arrow indicator pill */}
                    <button className="p-1 text-neutral-500 hover:text-white bg-[#1c1c1e] rounded-full border border-[#2d2d2d] shrink-0">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Bottom Large Prompt Input Box container matching screenshot */}
                <div className="p-4 pt-1 pb-6 bg-[#0c0c0c] shrink-0">
                  <div className={cn(
                    "bg-[#1c1c1e] border rounded-2xl p-3 shadow-2xl flex flex-col transition-all duration-200",
                    selectedElement ? "border-indigo-500/50 bg-[#16161b]" : "border-[#2c2c2d]"
                  )}>
                    {selectedElement && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d2d2d]/60 text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                          <span>AI TOUCH EDIT:</span>
                          <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md font-mono font-extrabold uppercase text-[9px]">
                            {selectedElement.tagName.toLowerCase()}
                          </span>
                          {selectedElement.id && (
                            <span className="text-neutral-400 font-mono">#{selectedElement.id}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => setSelectedElement(null)}
                          className="text-neutral-500 hover:text-white transition-colors cursor-pointer text-[10px] bg-[#242427] hover:bg-[#2f2f32] w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                          title="Clear selection"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <textarea 
                      rows={2}
                      placeholder={selectedElement ? `Type how to edit the selected <${selectedElement.tagName.toLowerCase()}> element...` : "Make changes, add new features, ask for anything"}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-neutral-100 placeholder-neutral-500 py-1 resize-none h-14 custom-scrollbar leading-relaxed"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                    />
                    
                    {/* Bottom line with icons & purple send button on right */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#222]/60 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {/* Status badge in input box */}
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-500 select-none">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Ready</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg cursor-pointer" title="Voice instructions">
                          <Mic className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg cursor-pointer" title="Add supplementary files">
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={handleGenerate}
                          disabled={isGenerating || !prompt.trim()}
                          className={cn(
                            "p-2 rounded-full text-white transition-all cursor-pointer flex items-center justify-center",
                            prompt.trim() 
                              ? "bg-[#6366f1] hover:bg-[#5053ee]" 
                              : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                          )}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Custom StackBlitz WebContainer Workspace */}
              <StackBlitzWorkspace />
            </div>
          </div>
        )}
      </main>

      {/* Real-time AI Model Load Balancer Control Dashboard */}
      <AILoadBalancerModal 
        isOpen={isLoadBalancerOpen} 
        onClose={() => setIsLoadBalancerOpen(false)} 
      />

      {/* WebContainer Preview Error Log & Fix Dashboard */}
      <PreviewErrorLogModal
        isOpen={isErrorLogOpen}
        onClose={() => setIsErrorLogOpen(false)}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.35);
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}
