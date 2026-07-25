import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { 
  Sparkles,
  MousePointerClick,
  Check,
  X,
  CornerDownLeft,
  Wand2,
  Sliders,
  Palette,
  Eye,
  RotateCw,
  Rocket,
  Cpu,
  ShoppingBag,
  Layers,
  LayoutTemplate,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Globe,
  Play,
  Zap,
  Plus,
  Tablet,
  Smartphone,
  Monitor,
  Bug,
  FileCode
} from "lucide-react";
import { cn } from "../lib/utils";

const STARTER_TEMPLATES = [
  {
    id: "saas-landing",
    title: "SaaS Product Landing Page",
    category: "Marketing & Landing",
    icon: Rocket,
    color: "from-indigo-500 to-purple-600",
    borderColor: "border-indigo-500/30 hover:border-indigo-500/60",
    bgGradient: "from-indigo-950/30 to-purple-950/20",
    badge: "Most Popular",
    description: "Modern SaaS landing page with dark hero section, CTA buttons, metrics bar, interactive pricing tables, and testimonial cards.",
    tags: ["Hero Section", "Pricing Toggle", "Testimonials", "Features Grid"],
    prompt: "Build a sleek modern SaaS Landing Page with dark theme, animated hero CTA buttons, feature comparison cards, interactive pricing toggle, testimonial grid, and responsive navigation."
  },
  {
    id: "ai-dashboard",
    title: "AI Analytics Dashboard",
    category: "Dashboard & Admin",
    icon: Cpu,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
    bgGradient: "from-emerald-950/30 to-teal-950/20",
    badge: "High Density",
    description: "Real-time analytics dashboard with metric stat cards, line chart data visualization, recent activity feed, and model selector.",
    tags: ["Recharts Line Graph", "Metric Badges", "Data Table", "Dark UI"],
    prompt: "Create an AI Analytics & Admin Dashboard with metric cards (Revenue, Active Models, Token Usage), interactive Recharts line graph, real-time activity log table, and dark/light mode toggle."
  },
  {
    id: "e-commerce",
    title: "E-Commerce Tech Store",
    category: "Online Shop",
    icon: ShoppingBag,
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    bgGradient: "from-amber-950/30 to-orange-950/20",
    badge: "Interactive",
    description: "Full electronics online shop with category filter sidebar, product search, quick view modal, and animated shopping cart drawer.",
    tags: ["Product Filter", "Cart Drawer", "Quick View", "Rating Stars"],
    prompt: "Build a responsive E-Commerce Tech Store with product categories, search and price range filters, interactive product cards, quick view modal, and slide-over shopping cart drawer."
  },
  {
    id: "developer-portfolio",
    title: "Developer Portfolio & Blog",
    category: "Personal & Showcase",
    icon: Palette,
    color: "from-pink-500 to-rose-600",
    borderColor: "border-pink-500/30 hover:border-pink-500/60",
    bgGradient: "from-pink-950/30 to-rose-950/20",
    badge: "Creative",
    description: "Personal developer portfolio with interactive project cards, filterable skill pills, work experience timeline, and contact drawer.",
    tags: ["Filterable Projects", "Skill Cloud", "Timeline", "Glassmorphism"],
    prompt: "Build a modern Developer Portfolio with hero intro, interactive project showcase filterable by tech stack, work experience timeline, skill tags, and animated contact form."
  },
  {
    id: "kanban-app",
    title: "Task Kanban & Productivity",
    category: "Productivity Tool",
    icon: Layers,
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/30 hover:border-cyan-500/60",
    bgGradient: "from-cyan-950/30 to-blue-950/20",
    badge: "App Workspace",
    description: "Interactive Kanban board with columns (To-Do, In Progress, Completed), task creation modal, priority tags, and completion progress.",
    tags: ["Kanban Columns", "Task Modal", "Priority Badges", "Progress Tracker"],
    prompt: "Build a Task & Project Kanban Board app with To-Do, In Progress, and Completed columns, new task modal with priority badges, task drag/move buttons, and progress bar."
  }
];

function StarterWelcomeTemplate({
  onSelectTemplate,
  isGenerating
}: {
  onSelectTemplate: (prompt: string) => void;
  isGenerating: boolean;
}) {
  const [customInput, setCustomInput] = useState("");
  const [interactiveCounter, setInteractiveCounter] = useState(1);
  const [accentTheme, setAccentTheme] = useState<"indigo" | "emerald" | "amber">("indigo");

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isGenerating) return;
    onSelectTemplate(customInput.trim());
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0d] p-4 sm:p-6 text-neutral-200 select-text custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/50 via-[#12121c] to-purple-950/40 border border-indigo-500/25 p-5 sm:p-6 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-36 h-36 text-indigo-400" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>AI Studio Preview Container</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Vite v6.2.0 • React 19 • Client WebContainer Ready</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Starter Welcome Template
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Welcome to your isolated web workspace! Choose a starter template below or enter any prompt to generate a full-stack, responsive website in seconds.
            </p>

            {/* Interactive Sandbox Teaser Box */}
            <div className="mt-4 pt-4 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#0f0f18]/60 p-3 rounded-xl border border-indigo-500/15">
              <div className="flex items-center gap-3">
                <span className="text-neutral-400 font-medium">Interactive Sandbox Test:</span>
                <div className="flex items-center gap-1 bg-black/40 border border-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setInteractiveCounter(c => Math.max(0, c - 1))}
                    className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-indigo-300">{interactiveCounter}</span>
                  <button
                    onClick={() => setInteractiveCounter(c => c + 1)}
                    className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">Theme Preview:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAccentTheme("indigo")}
                    className={cn("w-4 h-4 rounded-full bg-indigo-500 transition-transform cursor-pointer", accentTheme === "indigo" && "ring-2 ring-white scale-110")}
                    title="Indigo Theme"
                  />
                  <button
                    onClick={() => setAccentTheme("emerald")}
                    className={cn("w-4 h-4 rounded-full bg-emerald-500 transition-transform cursor-pointer", accentTheme === "emerald" && "ring-2 ring-white scale-110")}
                    title="Emerald Theme"
                  />
                  <button
                    onClick={() => setAccentTheme("amber")}
                    className={cn("w-4 h-4 rounded-full bg-amber-500 transition-transform cursor-pointer", accentTheme === "amber" && "ring-2 ring-white scale-110")}
                    title="Amber Theme"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Prompt Direct Generation Bar */}
        <form onSubmit={handleSubmitCustom} className="relative">
          <div className="flex items-center bg-[#13131a] border border-[#2d2d38] rounded-xl p-2 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg">
            <Wand2 className="w-5 h-5 text-indigo-400 ml-2 shrink-0" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Or type a custom prompt (e.g., 'Build a fitness tracking dashboard with dark theme')..."
              className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-neutral-500 px-3 py-1.5 focus:outline-none"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!customInput.trim() || isGenerating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate</span>
            </button>
          </div>
        </form>

        {/* Starter Templates Title */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Pick a Starter Template
            </h2>
          </div>
          <span className="text-[11px] text-neutral-500">1-Click Instant AI Generation</span>
        </div>

        {/* Starter Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STARTER_TEMPLATES.map((tmpl) => {
            const IconComponent = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                onClick={() => !isGenerating && onSelectTemplate(tmpl.prompt)}
                className={cn(
                  "group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden bg-gradient-to-b bg-[#121218]",
                  tmpl.borderColor,
                  tmpl.bgGradient
                )}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white shadow-md", tmpl.color)}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {tmpl.title}
                        </h3>
                        <span className="text-[10px] text-neutral-400 font-sans">
                          {tmpl.category}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                      {tmpl.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
                    {tmpl.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tmpl.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#1a1a24] text-neutral-300 border border-neutral-800 px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Use Starter Template</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default function LivePreviewFrame() {
  const { 
    previewUrl, 
    previewHtml, 
    inspectModeActive, 
    setInspectModeActive,
    selectedElement,
    setSelectedElement,
    triggerElementEdit,
    isGenerating,
    isAutoFixing,
    autoFixEnabled,
    setAutoFixEnabled,
    triggerAutoFix,
    latestPreviewError,
    setLatestPreviewError,
    setPrompt,
    triggerGeneration,
    activeProjectId,
    deviceMode,
    setDeviceMode,
    cycleDeviceMode
  } = useWorkspace();
  
  const [reloadKey, setReloadKey] = useState(0);
  const [editPrompt, setEditPrompt] = useState("");
  const [showStarterTemplates, setShowStarterTemplates] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Sync inspection mode with compiled iframe whenever it is updated or mode toggles
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SET_INSPECT_MODE", active: inspectModeActive },
        "*"
      );
    }
  }, [inspectModeActive, previewHtml, reloadKey]);

  // Track container size for precise positioning
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Make sure we update edit prompt or clear when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setEditPrompt("");
    }
  }, [selectedElement]);

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  // Preset options tailored for selected element type
  const getPresetsForTag = (tagName: string) => {
    const common = ["Modern styling", "Add subtle glow", "Rounder edges"];
    const lower = tagName.toLowerCase();
    if (lower === "button") {
      return [
        "Sleek indigo gradient background",
        "Minimal outline with bounce hover",
        "Make fully rounded with icon slot",
        ...common
      ];
    } else if (lower === "div" || lower === "section" || lower === "header" || lower === "footer" || lower === "main") {
      return [
        "Modern glassmorphism card style",
        "Faint inner border & dark fill",
        "Add neon gradient border accent",
        ...common
      ];
    } else if (lower === "h1" || lower === "h2" || lower === "h3" || lower === "h4" || lower === "p" || lower === "span") {
      return [
        "Vibrant text gradient effect",
        "Uppercase tracking-wider font",
        "Muted secondary reading text size",
        ...common
      ];
    } else if (lower === "img" || lower === "svg" || lower === "canvas") {
      return [
        "Grayscale transition on hover",
        "Delicate outline + outer glow",
        "Make it circular avatar shape",
        ...common
      ];
    } else if (lower === "input" || lower === "textarea" || lower === "select") {
      return [
        "Elegant glowing focus borders",
        "Ghost transparent input style",
        "Thicker dark aesthetic borders",
        ...common
      ];
    }
    return common;
  };

  // Calculate coordinates for the highlight overlay and anchored editor
  let overlayTop = 0;
  let overlayLeft = 0;
  let overlayWidth = 0;
  let overlayHeight = 0;
  let editorStyle: React.CSSProperties = {};
  const editorWidth = 350;

  if (selectedElement && selectedElement.box) {
    const box = selectedElement.box;
    overlayTop = box.top;
    overlayLeft = box.left;
    overlayWidth = box.width;
    overlayHeight = box.height;

    // Estimate editor panel height to choose above vs below
    const editorHeightEstimate = 320;
    const spaceBelow = containerSize.height - (box.top + box.height);
    const preferAbove = spaceBelow < editorHeightEstimate && box.top > editorHeightEstimate;

    // Center the editor relative to the element horizontally
    let computedLeft = box.left + (box.width - editorWidth) / 2;
    // Keep 12px margins from left/right edges of preview container
    computedLeft = Math.max(12, Math.min(containerSize.width - editorWidth - 12, computedLeft));

    if (preferAbove) {
      editorStyle = {
        bottom: `${containerSize.height - box.top + 8}px`,
        left: `${computedLeft}px`,
        width: `${editorWidth}px`
      };
    } else {
      editorStyle = {
        top: `${box.top + box.height + 8}px`,
        left: `${computedLeft}px`,
        width: `${editorWidth}px`
      };
    }
  }

  const handleSelectStarter = (promptText: string) => {
    setPrompt(promptText);
    setShowStarterTemplates(false);
    triggerGeneration(promptText);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#141414] h-full overflow-hidden select-none relative">


      {/* Frame Body Preview container */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#0c0c0c] relative flex flex-col min-h-0"
      >
        {showStarterTemplates || !previewHtml ? (
          <StarterWelcomeTemplate 
            onSelectTemplate={handleSelectStarter}
            isGenerating={isGenerating}
          />
        ) : deviceMode === "tablet" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-[#08080c] overflow-hidden min-h-0 relative">
            <div className="w-[768px] max-w-full h-full max-h-[96%] border border-neutral-700/80 rounded-2xl shadow-2xl bg-[#0c0c0c] flex flex-col overflow-hidden transition-all duration-300">
              <div className="h-7 bg-[#141418] border-b border-neutral-800 flex items-center justify-between px-3 shrink-0 text-[10px] font-mono text-neutral-400 select-none">
                <div className="flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-neutral-200">Tab Preview Mode</span>
                  <span className="text-neutral-500">(768 × 1024)</span>
                </div>
                <button 
                  onClick={cycleDeviceMode}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[9px] font-sans font-bold transition-colors cursor-pointer"
                  title="Click for Mobile View"
                >
                  Switch to Mobile
                </button>
              </div>
              <div className="flex-1 relative min-h-0">
                <iframe
                  key={reloadKey}
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full h-full border-none bg-[#0c0c0c]"
                  title="Live Preview"
                  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                />
              </div>
            </div>
          </div>
        ) : deviceMode === "mobile" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-[#08080c] overflow-hidden min-h-0 relative">
            <div className="w-[375px] max-w-full h-[667px] max-h-[96%] border-4 border-neutral-800 rounded-[32px] shadow-2xl bg-[#0c0c0c] flex flex-col overflow-hidden transition-all duration-300 relative">
              <div className="h-7 bg-[#141418] border-b border-neutral-800/80 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-neutral-400 select-none">
                <div className="flex items-center gap-1.5 text-[9px] text-neutral-300 font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mobile View</span>
                  <span className="text-neutral-500">(375px)</span>
                </div>
                <button 
                  onClick={cycleDeviceMode}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[9px] font-sans font-bold transition-colors cursor-pointer"
                  title="Click to repeat Desktop Mode"
                >
                  Switch to Desktop
                </button>
              </div>
              <div className="flex-1 relative min-h-0">
                <iframe
                  key={reloadKey}
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full h-full border-none bg-[#0c0c0c]"
                  title="Live Preview"
                  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                />
              </div>
            </div>
          </div>
        ) : (
          <iframe
            key={reloadKey}
            ref={iframeRef}
            srcDoc={previewHtml}
            className="w-full h-full border-none bg-[#0c0c0c]"
            title="Live Preview"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          />
        )}


        {/* AI Auto-Fixing Loading Overlay Layer */}
        {isAutoFixing && latestPreviewError?.projectId === activeProjectId && (
          <div className="absolute inset-0 bg-[#0a0a0df2] backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="relative mb-6">
              <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center shadow-2xl relative">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
            
            <h3 className="text-sm font-extrabold text-white tracking-wide font-sans mb-1.5 uppercase">AI Auto-Fixing Preview Error...</h3>
            <p className="text-[11px] text-indigo-300/80 max-w-sm mb-4 leading-relaxed font-mono truncate max-w-lg">
              {latestPreviewError?.message || "Running smart code analysis to fix the issue automatically."}
            </p>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-950/50 border border-indigo-800/35 rounded-full text-[10px] text-indigo-400 font-mono">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
              <span>Scanning imports, tags, and JSX structures</span>
            </div>
          </div>
        )}

        {/* Manual Auto-Fix Trigger Box Overlay */}
        {!isAutoFixing && latestPreviewError && latestPreviewError.projectId === activeProjectId && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-950/95 border border-red-500/30 rounded-xl p-4 shadow-2xl z-50 flex items-start gap-3.5 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
              <X className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 text-left space-y-1.5 min-w-0">
              <h4 className="text-xs font-bold text-red-200 font-sans">Preview Error Detected</h4>
              <p className="text-[10px] font-mono text-red-300/90 leading-relaxed truncate" title={latestPreviewError.message}>
                {latestPreviewError.message}
              </p>
              
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => triggerAutoFix(latestPreviewError.message, latestPreviewError.context)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-500/15 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Fix with AI</span>
                </button>
                <button
                  onClick={() => setLatestPreviewError(null)}
                  className="px-2.5 py-1 bg-[#1c1c1f] hover:bg-neutral-800 text-neutral-400 hover:text-white text-[10px] font-medium rounded-lg transition-colors border border-neutral-850 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inspect Prompt Instruction Toast */}
        {inspectModeActive && !selectedElement && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-950/90 text-indigo-300 border border-indigo-500/25 px-4 py-2.5 rounded-xl text-xs font-medium backdrop-blur-md flex items-center gap-2.5 shadow-2xl animate-bounce">
            <MousePointerClick className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Hover and click any element in the preview below to edit it with AI</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* PREMIUM ENHANCED ANCHORED ELEMENT SELECTION OVERLAY LAYER */}
        {/* ======================================================== */}
        {selectedElement && selectedElement.box && (
          <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
            
            {/* Outline Highlight Frame exactly over selected DOM node */}
            <div 
              style={{
                top: `${overlayTop}px`,
                left: `${overlayLeft}px`,
                width: `${overlayWidth}px`,
                height: `${overlayHeight}px`,
              }}
              className="absolute border-2 border-indigo-500 bg-indigo-500/10 pointer-events-none rounded-md shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-pulse transition-all duration-300"
            />

            {/* Anchored Modern Touch Editor Box directly below or above the selected component */}
            <div 
              style={editorStyle}
              className="absolute z-50 pointer-events-auto bg-[#131316]/98 backdrop-blur-xl border border-indigo-500/35 rounded-2xl p-4 shadow-2xl space-y-4 animate-in zoom-in-95 fade-in duration-200"
            >
              {/* Header section with tag name details */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest font-mono">AI Touch Editor</h4>
                    <span className="text-[9px] text-neutral-500 font-medium">Anchored below target element</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedElement(null)}
                  className="text-neutral-500 hover:text-white text-xs cursor-pointer bg-neutral-900 hover:bg-neutral-800 w-5 h-5 rounded-full flex items-center justify-center transition-colors border border-neutral-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Element Description Metadata Bar */}
              <div className="bg-[#0b0b0d] border border-neutral-800/80 rounded-xl p-2.5 space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/10 rounded font-mono font-extrabold uppercase tracking-wide">
                    {selectedElement.tagName.toLowerCase()}
                  </span>
                  {selectedElement.id && (
                    <span className="text-[9px] font-mono font-bold text-neutral-400">#{selectedElement.id}</span>
                  )}
                  {selectedElement.className && (
                    <span className="text-[9px] font-mono text-neutral-500 truncate max-w-[150px]" title={selectedElement.className}>
                      .{selectedElement.className.split(" ")[0]}
                    </span>
                  )}
                </div>
                {selectedElement.innerText && (
                  <p className="text-[10px] text-neutral-400 italic leading-relaxed line-clamp-1">
                    "{selectedElement.innerText.trim()}"
                  </p>
                )}
              </div>

              {/* Dynamic Preset Pills based on Selected Tag */}
              <div className="space-y-1 text-left">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <Palette className="w-3 h-3 text-neutral-500" />
                  <span>Style Suggestions</span>
                </span>
                <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto custom-scrollbar">
                  {getPresetsForTag(selectedElement.tagName).map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setEditPrompt(preset)}
                      className={cn(
                        "text-[9px] px-2 py-1 rounded-lg border transition-all cursor-pointer text-left shrink-0",
                        editPrompt === preset 
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                          : "bg-[#18181c] text-neutral-400 hover:text-neutral-200 border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Text Input Form Box */}
              <div className="space-y-1 text-left">
                <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-neutral-400" />
                  <span>Interactive Refinement</span>
                </label>
                <div className="relative mt-1">
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe how you'd like to refine this element (styles, classes, structure)..."
                    className="w-full h-18 bg-[#0b0b0d] border border-neutral-800 focus:border-indigo-500/60 rounded-xl p-2.5 text-[11px] text-white placeholder-neutral-500 focus:outline-none transition-colors resize-none leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (editPrompt.trim() && !isGenerating) {
                          triggerElementEdit(editPrompt);
                          setEditPrompt("");
                        }
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 text-[9px] text-neutral-600 font-mono flex items-center gap-1 pointer-events-none select-none">
                    <span>Press Enter</span>
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedElement(null)}
                  className="flex-1 py-1.5 bg-[#18181c] hover:bg-neutral-800 text-neutral-400 hover:text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer border border-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerElementEdit(editPrompt);
                    setEditPrompt("");
                  }}
                  disabled={isGenerating || !editPrompt.trim()}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 disabled:text-indigo-300/50 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Edit</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
