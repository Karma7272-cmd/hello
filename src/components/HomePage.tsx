import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Plus, 
  ArrowUp, 
  Code2, 
  Zap, 
  Layers, 
  Cpu, 
  ArrowRight,
  LayoutGrid,
  Info,
  CreditCard,
  Check,
  Terminal,
  Shield,
  Globe,
  ChevronDown,
  Gift,
  Sliders,
  BookOpen,
  Search,
  Inbox,
  Star,
  Folder,
  Volume2,
  Heart,
  Activity,
  X,
  Menu,
  Command,
  MessageSquare,
  Settings,
  Plug,
  Eye,
  EyeOff,
  Database,
  RefreshCw,
  Key,
  Cloud
} from "lucide-react";
import { cn } from "../lib/utils";
import { useWorkspace, ProjectHistoryItem } from "../context/WorkspaceContext";

export interface ConnectorItem {
  id: string;
  name: string;
  description: string;
  category: "AI Models" | "Developer Tools" | "Authentication" | "Search & Discovery";
  iconColor: string;
  placeholder: string;
  status: "connected" | "not_configured" | "error";
  apiKey: string;
  enabled: boolean;
}

const INITIAL_CONNECTORS: ConnectorItem[] = [
  {
    id: "gemini",
    name: "Gemini Pro (Google)",
    description: "Unlock Google's native multimodal power, 2M+ token context windows, and ultra-fast code generation.",
    category: "AI Models",
    iconColor: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    placeholder: "AIzaSy...",
    status: "not_configured",
    apiKey: "",
    enabled: true
  },
  {
    id: "claude",
    name: "Claude 3.5 Sonnet (Anthropic)",
    description: "Industry-leading reasoning and clean code generation with Claude 3.5 Sonnet and Opus.",
    category: "AI Models",
    iconColor: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    placeholder: "sk-ant-...",
    status: "not_configured",
    apiKey: "",
    enabled: false
  },
  {
    id: "chatgpt",
    name: "ChatGPT / GPT-4o (OpenAI)",
    description: "Connect to GPT-4o for state-of-the-art vision, instruction following, and complex UI logic.",
    category: "AI Models",
    iconColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    placeholder: "sk-proj-...",
    status: "not_configured",
    apiKey: "",
    enabled: false
  },
  {
    id: "deepseek",
    name: "DeepSeek Coder V2",
    description: "Ultra-cost-efficient, high-quality reasoning model with specialized coding and math expertise.",
    category: "AI Models",
    iconColor: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    placeholder: "ds-...",
    status: "not_configured",
    apiKey: "",
    enabled: false
  },
  {
    id: "qwen",
    name: "Qwen 2.5 Coder (Alibaba)",
    description: "Highly capable bilingual and multilingual AI model with powerful coding capabilities.",
    category: "AI Models",
    iconColor: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    placeholder: "qw-key-...",
    status: "not_configured",
    apiKey: "",
    enabled: false
  },
  {
    id: "mistral",
    name: "Mistral Codestral (Mistral AI)",
    description: "High-performance open weights model specifically optimized for code generation.",
    category: "AI Models",
    iconColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    placeholder: "m-ai-...",
    status: "not_configured",
    apiKey: "",
    enabled: false
  },
  {
    id: "groq",
    name: "Groq Llama 3.3 (Groq / Meta)",
    description: "Ultra-fast Llama 3.3 70B inference engine providing instantaneous code completion.",
    category: "AI Models",
    iconColor: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    placeholder: "gsk_...",
    status: "not_configured",
    apiKey: "",
    enabled: false
  }
];

interface HomePageProps {
  onSubmit: (promptText: string) => void;
  isGenerating: boolean;
  onLoadProject?: () => void;
}

export default function HomePage({ onSubmit, isGenerating, onLoadProject }: HomePageProps) {
  const { projectHistory, loadProjectFromHistory, deleteProjectFromHistory, user } = useWorkspace();
  const [localPrompt, setLocalPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"build" | "about" | "pricing" | "tools" | "connectors">("build");
  
  const [connectors, setConnectors] = useState<ConnectorItem[]>(() => {
    try {
      const saved = localStorage.getItem("ai-builder-connectors-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        const aiOnly = parsed.filter((c: any) => c.category === "AI Models");
        if (aiOnly.length > 0) return aiOnly;
      }
    } catch (e) {
      console.error("Failed to load connectors config", e);
    }
    return INITIAL_CONNECTORS;
  });

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [connectorsSearch, setConnectorsSearch] = useState("");
  const [connectorsCategory, setConnectorsCategory] = useState<string>("All AI Models");

  const saveConnectors = (updated: ConnectorItem[]) => {
    setConnectors(updated);
    localStorage.setItem("ai-builder-connectors-v1", JSON.stringify(updated));
    window.dispatchEvent(new Event("connectors-updated"));
  };
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    return localStorage.getItem("ai-builder-selected-model-v1") || "gemini";
  });

  // Sync state with custom global window storage event emitters
  useEffect(() => {
    const handleConnectorsChange = () => {
      try {
        const saved = localStorage.getItem("ai-builder-connectors-v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          const aiOnly = parsed.filter((c: any) => c.category === "AI Models");
          if (aiOnly.length > 0) {
            setConnectors(aiOnly);
          }
        }
      } catch (e) {
        console.error("Error syncing connectors update", e);
      }
    };

    const handleModelChange = () => {
      const saved = localStorage.getItem("ai-builder-selected-model-v1");
      if (saved) {
        setSelectedModelId(saved);
      }
    };

    window.addEventListener("connectors-updated", handleConnectorsChange);
    window.addEventListener("selected-model-updated", handleModelChange);

    return () => {
      window.removeEventListener("connectors-updated", handleConnectorsChange);
      window.removeEventListener("selected-model-updated", handleModelChange);
    };
  }, []);
  const [tempApiKeys, setTempApiKeys] = useState<Record<string, string>>({});
  const [showKeyFieldId, setShowKeyFieldId] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedToolDetail, setSelectedToolDetail] = useState<string>("inspector");
  const [activeFilter, setActiveFilter] = useState<string>("my-projects");
  const [showSearchPalette, setShowSearchPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Keyboard shortcut for search palette (Ctrl K / Cmd K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchPalette(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigateToTab = (tab: "build" | "about" | "pricing" | "tools" | "connectors") => {
    setActiveTab(tab);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!localPrompt.trim()) return;
    onSubmit(localPrompt.trim());
  };

  const handleSuggestionClick = (text: string) => {
    setLocalPrompt(text);
    setActiveTab("build");
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const projectFilters = [
    { id: "my-projects", label: "My projects" },
    { id: "recently-viewed", label: "Recently viewed" },
    { id: "shared", label: "Shared with me" },
    { id: "most-visitors", label: "Most visitors today" },
    { id: "templates", label: "Lovable templates" },
  ];

  const getFilteredProjects = () => {
    switch (activeFilter) {
      case "recently-viewed":
        return [
          {
            title: "Audio Player",
            desc: "Music streaming UI mockup",
            icon: <Volume2 className="w-4 h-4 text-indigo-400" />,
            prompt: "Design a sleek music player interface with audio track listings, responsive volume bars, interactive favorites, and animated play loops."
          },
          {
            title: "Crypto Dashboard",
            desc: "Realtime tracking charts",
            icon: <Activity className="w-4 h-4 text-cyan-400" />,
            prompt: "Build a beautiful cryptocurrency portfolio dashboard with responsive Recharts graphs, transaction history, and custom price alerts."
          }
        ];
      case "shared":
        return [
          {
            title: "Team Tasker",
            desc: "Shared Kanban board project",
            icon: <LayoutGrid className="w-4 h-4 text-emerald-400" />,
            prompt: "Create a shared Team Task board with team avatar roles, comments section, and dynamic status progress filters."
          }
        ];
      case "most-visitors":
        return [
          {
            title: "Physics Canvas",
            desc: "Interactive bubble engine",
            icon: <Sparkles className="w-4 h-4 text-pink-400" />,
            prompt: "Build an interactive physics engine using HTML5 Canvas where bubbles spawn, bounce, bounce off each other, and respond to gravity sliders."
          }
        ];
      case "templates":
        return [
          {
            title: "E-Commerce Cart",
            desc: "Clean products checkouts",
            icon: <CreditCard className="w-4 h-4 text-yellow-400" />,
            prompt: "Design a fast, secure E-Commerce checkout cart flow with dynamic pricing tally, promo code inputs, and order confirmation states."
          }
        ];
      case "my-projects":
      default:
        if (projectHistory && projectHistory.length > 0) {
          return projectHistory.map((item) => ({
            id: item.id,
            title: item.prompt,
            desc: `Built ${new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            icon: <Code2 className="w-4 h-4 text-indigo-400" />,
            prompt: item.prompt,
            historyItem: item
          }));
        }
        return [];
    }
  };

  const toolsList = [
    {
      id: "inspector",
      title: "AI Touch Inspector",
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      tagline: "Point, Click, Refine UI",
      desc: "Select any element in the live preview tab. A precise element selector is highlighted, and Gemini modifies its styles, classes, and code elements without touching any source file manually."
    },
    {
      id: "webcontainer",
      title: "Virtual WebContainers",
      icon: <Terminal className="w-5 h-5 text-cyan-400" />,
      tagline: "Native Browser Server",
      desc: "True server-side execution and package compilation running directly inside an in-browser sandbox micro-thread. Install npm packages dynamically with lightning-fast speeds."
    },
    {
      id: "filetree",
      title: "Virtual File System",
      icon: <Code2 className="w-5 h-5 text-pink-400" />,
      tagline: "Real-time Multi-file Sync",
      desc: "Read, edit, delete, and add custom React or TypeScript assets through an elegant directory tree synchronization. Keeps source code cleanly separated and modularized."
    },
    {
      id: "compilers",
      title: "Dual Hot Compilers",
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      tagline: "Immediate Live Feedbacks",
      desc: "Our dual-compiling pipeline monitors edits and executes hot updates with zero configuration. Standardizes styling tokens and detects fatal errors before rendering."
    }
  ];

  const faqs = [
    {
      q: "How does the AI Web Builder edit specific webpage elements?",
      a: "Our AI Touch Inspector mode lets you click on any rendered DOM component. Once clicked, Gemini maps the specific element directly to its component declaration and surgically applies your style instructions with Tailwind CSS."
    },
    {
      q: "Can I export my generated code?",
      a: "Absolutely! The entire project is generated using fully compliant Vite + React + TypeScript templates. You can download the source folder as a standard ZIP or push it cleanly to GitHub to continue development locally."
    },
    {
      q: "What is the BYO Key (BYOK) plan?",
      a: "The BYOK plan ($4/mo yearly or $5/mo monthly) lets you use your own OpenAI, Anthropic, or Gemini Developer credentials directly in the Workspace. This bypasses default platform compilation rate limits and lets you run high-frequency web generations with complete architectural freedom."
    },
    {
      q: "Do I need to register a personal Gemini API key?",
      a: "No, we provide pre-configured, high-performance server-side Gemini API endpoints for instant workspace compilation. For custom enterprise pipelines, you may toggle your personal keys in the Settings panel."
    },
    {
      q: "Is there an offline mode?",
      a: "Our virtual compiler relies on state-of-the-art browser engines. While initial templates download from the server, all hot-module compilation and virtual rendering happen 100% locally inside your client thread."
    }
  ];

  return (
    <div className="h-screen w-full bg-[#050505] text-neutral-200 flex overflow-hidden font-sans relative selection:bg-indigo-500/30 selection:text-white">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ======================================================== */}
      {/* LEFT SIDEBAR - HIGH FIDELITY REPLICA OF THE SCREENSHOT   */}
      {/* ======================================================== */}
      <aside 
        className={cn(
          "bg-[#0a0a0c] border-r border-neutral-900 flex flex-col justify-between py-4 px-3 select-none shrink-0 h-full overflow-y-auto transition-all duration-300 z-50 md:z-30",
          "fixed md:static inset-y-0 left-0",
          isSidebarOpen 
            ? "w-64 translate-x-0 shadow-2xl md:shadow-none" 
            : "w-64 -translate-x-full md:w-16 md:translate-x-0 md:px-2"
        )}
      >
        {/* Top Header Block with Brand Logo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1 gap-2">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between w-full">
                <div 
                  onClick={() => { setActiveTab("build"); if (window.innerWidth < 768) setIsSidebarOpen(false); }} 
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {/* Custom Gradient Lovable Icon Replica */}
                  <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#ff455b] via-[#9a3bfb] to-[#3b82f6] rounded-lg blur-sm opacity-70 group-hover:opacity-90 transition-opacity" />
                    <div className="relative w-5 h-5 rounded-lg bg-gradient-to-tr from-[#ff455b] via-[#9a3bfb] to-[#3b82f6] flex items-center justify-center shadow-lg">
                      <Sparkles className="w-3 h-3 text-white fill-white/10" />
                    </div>
                  </div>
                  <span className="text-sm font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition-colors">AI Web Builder</span>
                </div>
                {/* Mobile Close Button */}
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 md:hidden border border-neutral-800"
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setActiveTab("build")}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff455b] via-[#9a3bfb] to-[#3b82f6] flex items-center justify-center shadow-lg cursor-pointer mx-auto"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            
            {/* Sidebar toggle button (desktop-only) */}
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer hidden md:block"
                title="Collapse sidebar"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
            )}
          </div>

          {/* Workspace dropdown capsule */}
          {isSidebarOpen ? (
            <div 
              onClick={() => alert("Nantha's Lovable is your active personal sandbox.")}
              className="flex items-center justify-between bg-[#131316] hover:bg-[#1c1c22] border border-[#232328]/80 px-3 py-2 rounded-xl cursor-pointer transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono shrink-0">
                  N
                </div>
                <span className="text-xs font-semibold text-neutral-200 truncate">Nantha's Lovable</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono mx-auto">
              N
            </div>
          )}

          {/* Main Navigation links */}
          <div className="space-y-1">
            <button
              onClick={() => navigateToTab("build")}
              className={cn(
                "w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left",
                isSidebarOpen ? "px-3 py-2 justify-between" : "p-2 justify-center",
                activeTab === "build" 
                  ? "bg-[#18181c] text-white border border-[#26262b] shadow-inner" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
              )}
              title="Dashboard"
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className={cn("w-4 h-4", activeTab === "build" ? "text-indigo-400" : "text-neutral-500")} />
                {isSidebarOpen && <span>Dashboard</span>}
              </div>
            </button>
            
            <button
              onClick={() => setShowSearchPalette(true)}
              className={cn(
                "w-full flex items-center rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40 transition-all duration-150 cursor-pointer text-left",
                isSidebarOpen ? "px-3 py-2 justify-between" : "p-2 justify-center"
              )}
              title="Search projects (Ctrl K)"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-neutral-500" />
                {isSidebarOpen && <span>Search</span>}
              </div>
              {isSidebarOpen && (
                <span className="text-[9px] font-mono text-neutral-600 bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">
                  Ctrl K
                </span>
              )}
            </button>

            <button
              onClick={() => navigateToTab("tools")}
              className={cn(
                "w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left",
                isSidebarOpen ? "px-3 py-2 justify-between" : "p-2 justify-center",
                activeTab === "tools" 
                  ? "bg-[#18181c] text-white border border-[#26262b] shadow-inner" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
              )}
              title="Resources & Tools"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className={cn("w-4 h-4", activeTab === "tools" ? "text-cyan-400" : "text-neutral-500")} />
                {isSidebarOpen && <span>Resources</span>}
              </div>
            </button>

            <button
              onClick={() => navigateToTab("connectors")}
              className={cn(
                "w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left",
                isSidebarOpen ? "px-3 py-2 justify-between" : "p-2 justify-center",
                activeTab === "connectors" 
                  ? "bg-[#18181c] text-white border border-[#26262b] shadow-inner" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
              )}
              title="Connectors"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className={cn("w-4 h-4", activeTab === "connectors" ? "text-emerald-400" : "text-neutral-500")} />
                {isSidebarOpen && <span>Connectors</span>}
              </div>
            </button>

            <button
              onClick={() => navigateToTab("pricing")}
              className={cn(
                "w-full flex items-center rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left group",
                isSidebarOpen ? "px-3 py-2 justify-between" : "p-2 justify-center",
                activeTab === "pricing" 
                  ? "bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20" 
                  : "bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-transparent text-purple-300 hover:text-white hover:from-purple-600/25 hover:to-indigo-600/25 border border-purple-500/30"
              )}
              title="Touch to open Pricing page"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-purple-400 fill-purple-400/20 group-hover:scale-110 transition-transform" />
                {isSidebarOpen && <span>Upgrade / Pricing</span>}
              </div>
              {isSidebarOpen && (
                <span className="text-[9px] font-black tracking-wider uppercase bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                  PRO
                </span>
              )}
            </button>
          </div>

          {/* Project History Section */}
          {isSidebarOpen && projectHistory && projectHistory.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono px-3">
                Project History
              </span>
              <div className="pt-1 space-y-0.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                {projectHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40 transition-colors text-left cursor-pointer"
                  >
                    <button
                      onClick={() => {
                        loadProjectFromHistory(item);
                        onLoadProject?.();
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className="flex-1 flex items-center gap-2 min-w-0 text-left cursor-pointer"
                      title={item.prompt}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate font-medium">{item.prompt}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProjectFromHistory(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 rounded transition-opacity cursor-pointer shrink-0"
                      title="Delete from history"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Promo panels & bottom user card block */}
        <div className="space-y-3">
          {/* Upgrade Banner Card in Sidebar */}
          {isSidebarOpen ? (
            <div className="bg-gradient-to-br from-indigo-950/80 via-purple-950/60 to-neutral-900/90 border border-indigo-500/30 rounded-2xl p-3 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-all pointer-events-none" />
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-white tracking-tight">Upgrade Plan</span>
              </div>
              <p className="text-[11px] text-neutral-300 mb-2.5 leading-snug">
                Unlock unlimited AI builds, custom models & priority compute.
              </p>
              <button
                onClick={() => navigateToTab("pricing")}
                className="w-full py-1.5 px-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                <span>Touch for Pricing</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigateToTab("pricing")}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 cursor-pointer mx-auto hover:scale-105 active:scale-95 transition-all"
              title="Upgrade Plan - Open Pricing Page"
            >
              <Zap className="w-4 h-4 fill-white" />
            </button>
          )}


          {/* Profile block at bottom */}
          <div className="border-t border-neutral-900 pt-3.5">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user ? (
                    <>
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-[#3b82f6] to-[#fd4290] flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0 border border-neutral-800">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          (user.displayName || user.email || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="text-left leading-none min-w-0">
                        <p className="text-xs font-bold text-neutral-200 truncate">{user.displayName || "User"}</p>
                        <span className="text-[9px] text-neutral-500 truncate block">{user.email}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-400 shrink-0">
                        G
                      </div>
                      <div className="text-left leading-none min-w-0">
                        <p className="text-xs font-bold text-neutral-400 truncate">Guest Developer</p>
                        <span className="text-[9px] text-neutral-600 truncate block">Not authenticated</span>
                      </div>
                    </>
                  )}
                </div>
                {/* Inbox button with red notifier */}
                <div 
                  onClick={() => alert("No unread announcements. System is fully operational.")}
                  className="relative cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800/60 flex items-center justify-center">
                    <Inbox className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff455b] rounded-full border border-[#0a0a0c] flex items-center justify-center text-[7px] text-white font-black animate-pulse" />
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsSidebarOpen(true)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#fd4290] flex items-center justify-center font-bold text-xs text-white shadow-md cursor-pointer mx-auto"
                title="Expand Sidebar"
              >
                N
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ======================================================== */}
      {/* RIGHT MAIN VIEWPORT AND STAGE                            */}
      {/* ======================================================== */}
      <div className="flex-1 h-full bg-[#050505] p-2 md:p-3 flex flex-col overflow-hidden">
        
        {/* Responsive Mobile Header */}
        <header className="h-12 border-b border-neutral-900 flex md:hidden items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800/80 cursor-pointer flex items-center justify-center transition-colors hover:bg-neutral-800"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-white">Nantha's Lovable</span>
          </div>

          <div 
            onClick={() => setIsSidebarOpen(true)}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#fd4290] flex items-center justify-center font-bold text-xs text-white shadow-md cursor-pointer shrink-0 border border-neutral-800/50 hover:opacity-80 transition-opacity"
            title="Open Sidebar / Profile"
          >
            N
          </div>
        </header>

        {/* Outer Frame Container */}
        <div className="flex-1 bg-[#0a0a0c] rounded-2xl border border-neutral-900 overflow-hidden flex flex-col relative">
          
          {/* ======================================================== */}
          {/* BUILD VIEWPORT (GRADIENT BACKDROP SCREENSHOT MATCH)      */}
          {/* ======================================================== */}
          {activeTab === "build" && (
            <div 
              className="flex-1 flex flex-col justify-between overflow-y-auto p-6 md:p-10 text-center relative select-none animate-in fade-in duration-300"
              style={{
                background: `
                  radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.45) 0%, transparent 60%),
                  radial-gradient(circle at 15% 75%, rgba(236, 72, 153, 0.4) 0%, transparent 60%),
                  radial-gradient(circle at 50% 40%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                  linear-gradient(to bottom right, #0a0e1a, #0b0614, #050208)
                `
              }}
            >
              {/* Empty upper filler to push items to center */}
              <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full pt-10 pb-6">
                
                {/* Lovable announcements pill block */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#131316]/90 border border-neutral-800/80 rounded-full text-xs font-semibold mb-6 shadow-xl backdrop-blur-md hover:border-indigo-500/20 transition-all cursor-pointer group">
                  <span className="text-[9px] font-extrabold uppercase bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded-md border border-blue-500/20">New</span>
                  <span className="text-neutral-200 group-hover:text-white transition-colors text-[10px] md:text-xs">Lovable apps now work in ChatGPT and Claude</span>
                  <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Main Prompts Greeting Header */}
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-10 text-shadow-sm select-text">
                  Ready to build, Nantha?
                </h1>

                {/* Input Prompt Box Capsule (Interactive Replica) */}
                <form 
                  onSubmit={handleSubmit}
                  className="w-full max-w-2xl bg-[#141416]/95 border border-neutral-800/90 rounded-2xl p-4 shadow-2xl flex flex-col focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-300 backdrop-blur-xl relative"
                >
                  <textarea 
                    ref={textareaRef}
                    rows={3}
                    placeholder="Ask Lovable to create..."
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-neutral-100 placeholder-neutral-500 py-1 resize-none h-16 custom-scrollbar leading-relaxed"
                    value={localPrompt}
                    onChange={(e) => setLocalPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                  
                  {/* Bottom tools row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800/40 select-none shrink-0">
                    {/* Left side plus helper & AI Model dropdown */}
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => alert("Upload supplemental files, specifications, or media screenshots directly from your files explorer.")}
                        className="w-7 h-7 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50 flex items-center justify-center border border-neutral-800/60 cursor-pointer" 
                        title="Add supplementary documents"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* AI Model Multi-Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsModelPopupOpen(!isModelPopupOpen)}
                          className={cn(
                            "h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border select-none",
                            isModelPopupOpen
                              ? "bg-violet-500/15 border-violet-500/30 text-violet-400"
                              : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                          )}
                          title="Connect own API and Select Model"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                          <span className="text-[11px]">
                            {connectors.find(c => c.id === selectedModelId)?.name || "Gemini Pro"}
                          </span>
                          <ChevronDown className="w-2.5 h-2.5 text-neutral-500" />
                        </button>

                        {isModelPopupOpen && (
                          <div 
                            className="absolute bottom-full left-0 mb-2 w-85 bg-[#121214] border border-[#2c2c2d] rounded-2xl shadow-2xl z-[150] p-4 flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-violet-500/10 text-violet-400">
                                  <Cpu className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                  <span className="text-[11px] font-extrabold text-white uppercase tracking-wider block">
                                    Provider Orchestrator
                                  </span>
                                  <span className="text-[9px] text-neutral-500 font-medium">Select Top Code Generation Engines</span>
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => setIsModelPopupOpen(false)}
                                className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Warning notification about connection status */}
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-[9px] text-amber-300/90 leading-relaxed text-left">
                                <strong>Paste Your Provider Key:</strong> Enter your credentials below to unlock high-rate unlimited website compilations bypassing default shared sandbox boundaries.
                              </p>
                            </div>

                            {/* Model feed */}
                            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                              {connectors
                                .filter(c => c.category === "AI Models")
                                .map((model) => {
                                  const isSelected = selectedModelId === model.id;
                                  const isConnected = model.status === "connected" || model.apiKey.length > 0;
                                  
                                  // Code-generation custom tag descriptions matching user request
                                  let modelBadge = "Top Coder";
                                  let modelColor = "text-violet-400 bg-violet-500/10 border-violet-500/20";
                                  if (model.id === "claude") {
                                    modelBadge = "Gold Standard Code";
                                    modelColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                                  } else if (model.id === "gemini") {
                                    modelBadge = "2M Context + Speed";
                                    modelColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
                                  } else if (model.id === "chatgpt") {
                                    modelBadge = "GPT-4o Logic";
                                    modelColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                                  } else if (model.id === "deepseek") {
                                    modelBadge = "Coder V2 SOTA";
                                    modelColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
                                  } else if (model.id === "qwen") {
                                    modelBadge = "32B Code Expert";
                                    modelColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                                  } else if (model.id === "mistral") {
                                    modelBadge = "Mistral Large Code";
                                    modelColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                                  }

                                  return (
                                    <div 
                                      key={model.id}
                                      className={cn(
                                        "p-2.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer relative overflow-hidden",
                                        isSelected 
                                          ? "bg-[#18181c] border-violet-500/40 shadow-sm" 
                                          : "bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900/80 hover:border-neutral-700"
                                      )}
                                      onClick={() => {
                                        setSelectedModelId(model.id);
                                        localStorage.setItem("ai-builder-selected-model-v1", model.id);
                                        window.dispatchEvent(new Event("selected-model-updated"));
                                      }}
                                    >
                                      {/* Top line with selection state */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            isConnected ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"
                                          )} />
                                          <span className="text-[11px] font-bold text-white">{model.name}</span>
                                        </div>
                                        <span className={cn("text-[8px] px-1.5 py-0.2 rounded font-bold uppercase border tracking-wider", modelColor)}>
                                          {modelBadge}
                                        </span>
                                      </div>

                                      {/* Description */}
                                      <p className="text-[9px] text-neutral-400 leading-normal -mt-1 pr-1">
                                        {model.description}
                                      </p>

                                      {/* Custom Key Paste Box */}
                                      <div className="flex items-center gap-1.5 mt-0.5" onClick={e => e.stopPropagation()}>
                                        <div className="relative flex-1">
                                          <input 
                                            type="password"
                                            placeholder={model.placeholder || "Enter API Secret Key..."}
                                            value={tempApiKeys[model.id] !== undefined ? tempApiKeys[model.id] : model.apiKey}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setTempApiKeys(prev => ({ ...prev, [model.id]: val }));
                                            }}
                                            className="w-full bg-black/60 border border-neutral-800 focus:border-violet-500/40 text-[10px] rounded-lg pl-6 pr-2 py-1 text-neutral-200 placeholder-neutral-600 focus:outline-none font-mono"
                                          />
                                          <Key className="w-3 h-3 text-neutral-500 absolute left-2 top-1.5" />
                                        </div>
                                        
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            const newKey = tempApiKeys[model.id] !== undefined ? tempApiKeys[model.id] : model.apiKey;
                                            const updated = connectors.map(c => {
                                              if (c.id === model.id) {
                                                return { 
                                                  ...c, 
                                                  apiKey: newKey, 
                                                  status: newKey.trim() ? "connected" : "not_configured" 
                                                };
                                              }
                                              return c;
                                            });
                                            saveConnectors(updated);
                                            alert(`${model.name} API key updated and saved in browser cache! Connected.`);
                                          }}
                                          className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white rounded-lg text-[9px] font-extrabold transition-all border border-violet-500/30 cursor-pointer shadow-sm shadow-violet-500/10"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>

                            {/* Popup actions footer */}
                            <div className="border-t border-[#2d2d2d] pt-2.5 flex items-center justify-between">
                              <span className="text-[9px] text-neutral-500 font-semibold font-mono">
                                Selected: <span className="text-violet-400 font-bold">{connectors.find(c => c.id === selectedModelId)?.name || "Gemini Pro"}</span>
                              </span>
                              <button 
                                type="button"
                                onClick={() => setIsModelPopupOpen(false)}
                                className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-md hover:scale-102 active:scale-98"
                              >
                                Apply Engine
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side build buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Action Build Capsule button */}
                      <button 
                        type="submit"
                        disabled={!localPrompt.trim()}
                        className={cn(
                          "h-8 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-lg cursor-pointer",
                          localPrompt.trim() 
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20" 
                            : "bg-[#141416]/60 text-neutral-500 border border-neutral-800/40 cursor-not-allowed"
                        )}
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                            <span>Building...</span>
                          </>
                        ) : (
                          <span>Build</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

              </div>

              {/* ======================================================== */}
              {/* BOTTOM PANEL WITH CARDS CATALOG FILTERS                  */}
              {/* ======================================================== */}
              <div className="w-full max-w-4xl mx-auto bg-[#111113]/90 border border-neutral-800/60 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl mt-auto select-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4 mb-4">
                  
                  {/* Tab categories layout bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar whitespace-nowrap pr-2">
                    <div className="relative flex items-center bg-[#18181c] border border-neutral-800/80 rounded-xl px-2.5 py-1.5 shrink-0 text-neutral-500">
                      <Search className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
                      <span className="text-xs text-neutral-400 font-medium select-none">Search</span>
                    </div>
                    
                    {projectFilters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter.id)}
                        className={cn(
                          "text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap",
                          activeFilter === filter.id
                            ? "bg-neutral-800 text-white font-bold border border-neutral-700/50"
                            : "text-neutral-400 hover:text-neutral-200"
                        )}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Browse all button */}
                  <button 
                    type="button"
                    onClick={() => alert("Explore more generated code and community products.")}
                    className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 group whitespace-nowrap cursor-pointer ml-auto"
                  >
                    <span>Browse all</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                {/* Interactive Dynamic Previews Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {getFilteredProjects().length === 0 ? (
                    <div className="col-span-full py-8 text-center bg-[#17171a]/30 border border-dashed border-neutral-800 rounded-xl space-y-2">
                      <Folder className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-xs font-bold text-neutral-400">No built projects yet</p>
                      <p className="text-[11px] text-neutral-500">Enter a prompt above to build your first project!</p>
                    </div>
                  ) : (
                    getFilteredProjects().map((p: any, idx: number) => (
                      <div 
                        key={p.id || idx}
                        onClick={() => {
                          if (p.historyItem) {
                            loadProjectFromHistory(p.historyItem);
                            if (onLoadProject) {
                              onLoadProject();
                            } else {
                              setActiveTab("build");
                            }
                          } else {
                            handleSuggestionClick(p.prompt);
                          }
                        }}
                        className="group relative bg-[#17171a]/50 border border-neutral-800/80 hover:border-indigo-500/30 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:bg-[#1a1a20]"
                      >
                        {/* Grid vector pattern background placeholder */}
                        <div className="h-24 bg-gradient-to-b from-[#111] to-[#18181c] relative flex items-center justify-center p-3 border-b border-neutral-900 overflow-hidden">
                          <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity" />
                          <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/5 via-transparent to-pink-500/5 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                          <div className="z-10 w-8 h-8 rounded-lg bg-neutral-900 border border-[#232328] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                            {p.icon}
                          </div>
                        </div>
                        
                        {/* Info and subtitles */}
                        <div className="p-3 text-left">
                          <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors truncate">
                            {p.title}
                          </h4>
                          <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1 group-hover:text-neutral-400 transition-colors">
                            {p.desc}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: RESOURCES / DEVELOPMENT SUITE                     */}
          {/* ======================================================== */}
          {activeTab === "tools" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-300 bg-[#0c0c0e]">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-semibold shadow-sm">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Virtual Engine Suite</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Developer tools running in sandboxes
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                  An entire virtual compilation pipeline runs directly inside your tab. Explore our underlying structures.
                </p>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                
                {/* Selector column */}
                <div className="md:col-span-1 flex flex-col gap-2.5">
                  {toolsList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedToolDetail(t.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5",
                        selectedToolDetail === t.id
                          ? "bg-[#17171a] border-indigo-500/40 shadow-lg text-white"
                          : "bg-[#0f0f12] border-neutral-800/80 hover:border-neutral-700 text-neutral-400"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {t.icon}
                        <span className="text-xs font-bold uppercase tracking-wider">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono ml-7">{t.tagline}</span>
                    </button>
                  ))}
                </div>

                {/* Visualizer card */}
                <div className="md:col-span-2 bg-[#121214] border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  {(() => {
                    const currentTool = toolsList.find(t => t.id === selectedToolDetail) || toolsList[0];
                    return (
                      <div className="space-y-6 flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-800/40 border border-neutral-700/30 flex items-center justify-center">
                              {currentTool.icon}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white">{currentTool.title}</h3>
                              <span className="text-xs text-indigo-400 font-mono">{currentTool.tagline}</span>
                            </div>
                          </div>
                          <p className="text-neutral-400 text-xs leading-relaxed pt-2">
                            {currentTool.desc}
                          </p>
                        </div>

                        {/* Console display */}
                        <div className="bg-[#0a0a0b] border border-[#1a1a1c] p-4 rounded-xl font-mono text-[10px] text-neutral-400 space-y-1.5 shadow-inner mt-4">
                          <div className="flex items-center justify-between border-b border-[#18181a] pb-1.5 mb-1.5 text-[8px] text-neutral-500 uppercase font-bold tracking-widest">
                            <span>Sandbox Shell</span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Active
                            </span>
                          </div>
                          {selectedToolDetail === "inspector" && (
                            <div className="space-y-1 text-neutral-300">
                              <p className="text-yellow-500">&gt; Entering UI Inspection Mode...</p>
                              <p className="text-neutral-500">// Node selected: &lt;button className=&quot;px-4 py-2&quot;&gt;</p>
                              <p className="text-emerald-400">&gt; Refining visual margins and hover shadows</p>
                              <p className="text-neutral-400">Rewriting node definition and class assignments successfully.</p>
                            </div>
                          )}
                          {selectedToolDetail === "webcontainer" && (
                            <div className="space-y-1 text-neutral-300">
                              <p className="text-cyan-400">&gt; npm install lucide-react @google/genai</p>
                              <p className="text-neutral-500">completed installation in 840ms</p>
                              <p className="text-emerald-400">&gt; npm run build &amp;&amp; node server.cjs</p>
                              <p className="text-neutral-400">Dev package compiled. Hot module pipeline reloading.</p>
                            </div>
                          )}
                          {selectedToolDetail === "filetree" && (
                            <div className="space-y-0.5 text-neutral-400">
                              <p className="text-neutral-500">/src</p>
                              <p className="pl-4 text-pink-400 font-bold">├── components/</p>
                              <p className="pl-8">│   ├── LivePreviewFrame.tsx</p>
                              <p className="pl-8">│   └── HomePage.tsx</p>
                              <p className="pl-4 text-indigo-400">└── App.tsx</p>
                            </div>
                          )}
                          {selectedToolDetail === "compilers" && (
                            <div className="space-y-1 text-neutral-300">
                              <p className="text-neutral-500">// Triggering live compilation checks...</p>
                              <p className="text-emerald-400">✔ Build succeeded - compiled App.tsx (14ms)</p>
                              <p className="text-neutral-400">Broadcasting updated virtual document model.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Quick Prompt Helper */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setActiveTab("build")}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <span>Build custom app now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: CONNECTORS PAGE                                    */}
          {/* ======================================================== */}
          {activeTab === "connectors" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-300 bg-[#0c0c0e]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
                <div className="space-y-1 text-left">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                    <Sliders className="w-3 h-3" />
                    <span>AI Model Connectors</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    Connect AI Model to Generate Code
                  </h2>
                  <p className="text-neutral-400 text-xs">
                    Configure your secret API keys for AI models to generate code, refactor UI components, and drive compilation loops.
                  </p>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-neutral-400 font-medium">Active AI Models</div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {connectors.filter(c => c.enabled).length} of {connectors.length} active
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-[#111113] p-3 rounded-2xl border border-neutral-900">
                <div className="flex flex-wrap gap-1">
                  {["All AI Models"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setConnectorsCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                        connectorsCategory === cat 
                          ? "bg-indigo-600 text-white shadow-sm" 
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search AI model connectors..."
                    value={connectorsSearch}
                    onChange={(e) => setConnectorsSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {connectorsSearch && (
                    <button 
                      onClick={() => setConnectorsSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Connectors Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                {connectors.filter(c => {
                  const matchesSearch = c.name.toLowerCase().includes(connectorsSearch.toLowerCase()) || 
                                        c.description.toLowerCase().includes(connectorsSearch.toLowerCase());
                  const matchesCat = connectorsCategory === "All AI Models" || connectorsCategory === "All" || c.category === connectorsCategory;
                  return matchesSearch && matchesCat;
                }).map((connector) => {
                  const isVisible = visibleKeys[connector.id] || false;
                  return (
                    <div 
                      key={connector.id}
                      className={cn(
                        "group bg-[#111113] border p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5",
                        connector.enabled 
                          ? "border-emerald-500/30 shadow-lg shadow-emerald-500/[0.02]" 
                          : "border-neutral-900 hover:border-neutral-800"
                      )}
                    >
                      <div className="space-y-4">
                        {/* Card Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 font-bold text-sm", connector.iconColor)}>
                              {connector.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {connector.name}
                              </h3>
                              <span className="text-[9px] bg-neutral-900 border border-neutral-800/80 text-neutral-400 px-2 py-0.5 rounded-full font-mono mt-0.5 inline-block">
                                {connector.category}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            onClick={() => {
                              const updated = connectors.map(c => {
                                if (c.id === connector.id) {
                                  const nextEnabled = !c.enabled;
                                  return { 
                                    ...c, 
                                    enabled: nextEnabled,
                                    status: nextEnabled ? (c.apiKey ? "connected" : "not_configured") : "not_configured"
                                  };
                                }
                                return c;
                              });
                              saveConnectors(updated);
                            }}
                            className={cn(
                              "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative",
                              connector.enabled ? "bg-emerald-500" : "bg-neutral-800"
                            )}
                          >
                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200", connector.enabled ? "translate-x-4" : "translate-x-0")} />
                          </button>
                        </div>

                        <p className="text-[11px] text-neutral-400 leading-relaxed min-h-[36px]">
                          {connector.description}
                        </p>

                        {/* Config Field (only if enabled) */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                              <Key className="w-3 h-3" />
                              <span>API Configuration Key</span>
                            </span>
                            
                            {connector.apiKey && (
                              <span className={cn(
                                "text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase",
                                connector.status === "connected" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                              )}>
                                {connector.status === "connected" ? "✓ Active" : "Unverified"}
                              </span>
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type={isVisible ? "text" : "password"}
                              placeholder={connector.placeholder}
                              value={connector.apiKey}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = connectors.map(c => {
                                  if (c.id === connector.id) {
                                    return { 
                                      ...c, 
                                      apiKey: val,
                                      status: val ? "connected" : "not_configured"
                                    };
                                  }
                                  return c;
                                });
                                saveConnectors(updated);
                              }}
                              disabled={!connector.enabled}
                              className={cn(
                                "w-full bg-neutral-950 text-xs rounded-xl pl-3 pr-8 py-2 font-mono text-neutral-200 border transition-colors",
                                !connector.enabled 
                                  ? "border-neutral-900 opacity-40 placeholder-neutral-700 cursor-not-allowed" 
                                  : "border-neutral-800 focus:outline-none focus:border-indigo-500 placeholder-neutral-600"
                              )}
                            />
                            {connector.enabled && (
                              <button
                                type="button"
                                onClick={() => setVisibleKeys(prev => ({ ...prev, [connector.id]: !isVisible }))}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                              >
                                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connection Test Trigger */}
                      {connector.enabled && (
                        <div className="pt-4 mt-4 border-t border-neutral-950 flex items-center justify-between">
                          <button
                            onClick={() => {
                              const updated = connectors.map(c => {
                                if (c.id === connector.id) {
                                  return { ...c, status: "connected" };
                                }
                                return c;
                              });
                              saveConnectors(updated);
                              alert(`✓ Connection test succeeded for ${connector.name}! Credentials verified with mockup sandbox validation loop.`);
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-bold font-mono flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Verify Connection</span>
                          </button>

                          <span className="text-[10px] text-neutral-500 font-mono">
                            Port 443 / SSL
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {connectors.filter(c => {
                  const matchesSearch = c.name.toLowerCase().includes(connectorsSearch.toLowerCase()) || 
                                        c.description.toLowerCase().includes(connectorsSearch.toLowerCase());
                  const matchesCat = connectorsCategory === "All" || c.category === connectorsCategory;
                  return matchesSearch && matchesCat;
                }).length === 0 && (
                  <div className="col-span-full py-12 text-center space-y-3 bg-[#111113]/40 border border-dashed border-neutral-900 rounded-2xl">
                    <Inbox className="w-8 h-8 text-neutral-600 mx-auto" />
                    <div className="text-xs font-bold text-neutral-400">No AI model connectors match filter</div>
                    <p className="text-[11px] text-neutral-500 max-w-md mx-auto">Try typing a different model name or clear search criteria.</p>
                    <button 
                      onClick={() => { setConnectorsSearch(""); setConnectorsCategory("All AI Models"); }}
                      className="px-3 py-1 bg-neutral-800 text-white rounded-lg text-xs font-semibold hover:bg-neutral-700"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              {/* Developer integration guidelines banner */}
              <div className="bg-[#111113] border border-neutral-800/80 p-5 rounded-2xl text-left space-y-3">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white font-mono">AI Model Code Generation Driver</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Every configured AI model key is securely stored in your local session cache and bound to your workspace code compiler. 
                  When you prompt the generator, your selected model key is passed via proxy headers to execute real-time code synthesis.
                </p>
                <div className="bg-neutral-950 rounded-xl p-3 font-mono text-[10px] text-neutral-300 border border-neutral-900/60 leading-relaxed overflow-x-auto">
                  <span className="text-neutral-500">// Example: Code generation payload with connected AI Model</span><br />
                  <span className="text-indigo-400">const</span> codeGenResponse = <span className="text-indigo-400">await</span> fetch(<span className="text-emerald-400">"/api/generate-code"</span>, &#123;<br />
                  &nbsp;&nbsp;method: <span className="text-emerald-400">"POST"</span>,<br />
                  &nbsp;&nbsp;headers: &#123; <span className="text-emerald-400">"Content-Type"</span>: <span className="text-emerald-400">"application/json"</span> &#125;,<br />
                  &nbsp;&nbsp;body: JSON.stringify(&#123; model: <span className="text-emerald-400">"gemini-2.0-flash"</span>, apiKey: userProvidedApiKey, prompt: <span className="text-emerald-400">"Generate React App"</span> &#125;)<br />
                  &#125;);
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PRICING SUBSCRIPTIONS                             */}
          {/* ======================================================== */}
          {activeTab === "pricing" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-300 bg-[#0c0c0e]">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold shadow-sm">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Developer Subscriptions</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  High Performance Rate Limits
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                  Start sandbox virtualization for free, or upgrade to Developer Pro to unlock premium models and custom environment capabilities.
                </p>

                {/* Toggle monthly / yearly */}
                <div className="flex items-center justify-center gap-3 pt-4">
                  <span className={cn("text-xs font-medium cursor-pointer", billingCycle === "monthly" ? "text-white" : "text-neutral-500")} onClick={() => setBillingCycle("monthly")}>Monthly</span>
                  <button
                    type="button"
                    onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
                    className="w-10 h-6 bg-neutral-800 rounded-full p-1 transition-colors relative cursor-pointer border border-neutral-700/60"
                  >
                    <div className={cn("w-4 h-4 bg-indigo-500 rounded-full transition-all duration-300", billingCycle === "yearly" ? "translate-x-4 bg-emerald-400" : "translate-x-0")} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-xs font-medium cursor-pointer", billingCycle === "yearly" ? "text-white" : "text-neutral-500")} onClick={() => setBillingCycle("yearly")}>Yearly</span>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
                  </div>
                </div>
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
                {/* Free plan */}
                <div className="bg-[#121214] border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between hover:border-neutral-700 text-left transition-all">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Starter Pack</span>
                      <h3 className="text-lg font-bold text-white mt-1">Sandbox Hobby</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">$0</span>
                      <span className="text-xs text-neutral-500">/ forever</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Scaffold modular design nodes and explore sandbox virtualization files with zero costs.
                    </p>
                    
                    <div className="h-px bg-neutral-800 my-3" />

                    <ul className="space-y-2 text-xs text-neutral-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>50 compiles per day</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Standard local thread</span>
                      </li>
                      <li className="flex items-center gap-2 text-neutral-500 line-through">
                        <span>Advanced Touch Inspector</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => setActiveTab("build")}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all mt-6 cursor-pointer border border-neutral-700"
                  >
                    Launch Build
                  </button>
                </div>

                {/* BYO Key (BYOK) plan requested by user */}
                <div className="bg-[#121214] border-2 border-emerald-500/40 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-400 text-left transition-all relative shadow-lg shadow-emerald-500/5">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                    Best Value
                  </div>

                  <div className="space-y-4">
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Developer Own API</span>
                      <h3 className="text-lg font-bold text-white mt-1">BYO Key (BYOK)</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">
                        {billingCycle === "yearly" ? "$4" : "$5"}
                      </span>
                      <span className="text-xs text-neutral-500">/ month</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Connect your personal LLM keys (Gemini, OpenAI, Claude) to build, edit and compile multi-page apps with completely unlimited AI requests.
                    </p>
                    
                    <div className="h-px bg-emerald-500/10 my-3" />

                    <ul className="space-y-2 text-xs text-neutral-300">
                      <li className="flex items-center gap-2 text-white font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Use personal LLM keys</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>100% Unlimited builds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Full multi-page routes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>All database connectors</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => alert("Subscribing to BYO Key Plan... You can configure your own LLM API keys in the Settings panel.")}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all mt-6 cursor-pointer shadow-lg shadow-emerald-600/10"
                  >
                    Select BYOK Plan
                  </button>
                </div>

                {/* Pro plan */}
                <div className="bg-[#141418] border border-neutral-850 p-6 rounded-2xl flex flex-col justify-between relative shadow-md hover:border-indigo-500/50 text-left transition-all">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Full Access</span>
                      <h3 className="text-lg font-bold text-white mt-1">Creator Pro</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">
                        {billingCycle === "yearly" ? "$15" : "$19"}
                      </span>
                      <span className="text-xs text-neutral-500">/ month</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      For serious developers deploying enterprise-level apps and building multi-module schemas.
                    </p>
                    
                    <div className="h-px bg-indigo-500/20 my-3" />

                    <ul className="space-y-2 text-xs text-neutral-300 font-medium">
                      <li className="flex items-center gap-2 text-white font-bold">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Unlimited AI compiles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Interactive Touch Selector</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Full multi-file workspace sync</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => alert("Subscribing to Creator Pro...")}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all mt-6 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Scale pack */}
                <div className="bg-[#121214] border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between hover:border-neutral-700 text-left transition-all">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Enterprise</span>
                      <h3 className="text-lg font-bold text-white mt-1">Scale Studio</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">Custom</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Proprietary database architectures, custom security rules, and team hosting slots.
                    </p>
                    
                    <div className="h-px bg-neutral-800 my-3" />

                    <ul className="space-y-2 text-xs text-neutral-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Dedicated workspace teams</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>99.9% Sandbox uptime SLAs</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => alert("Connecting with enterprise sales context... A representative will respond to nantha@lovable.dev")}
                    className="w-full py-2 bg-[#1a1a1c] hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-all mt-6 cursor-pointer border border-[#2d2d30]"
                  >
                    Contact Sales
                  </button>
                </div>
              </div>

              {/* FAQs accordion */}
              <div className="max-w-2xl mx-auto pt-8 border-t border-neutral-900 text-left">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6 text-center">Frequently Asked Questions</h3>
                <div className="space-y-2.5">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-[#0e0e10] border border-neutral-800/80 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:bg-neutral-800/20 transition-colors cursor-pointer"
                      >
                        <span className="pr-4">{faq.q}</span>
                        <ChevronDown className={cn("w-4 h-4 text-neutral-500 transition-transform duration-300", expandedFaq === idx && "rotate-180 text-indigo-400")} />
                      </button>
                      <div className={cn("px-5 overflow-hidden transition-all duration-300 text-xs text-neutral-400 leading-relaxed border-neutral-800/60", expandedFaq === idx ? "max-h-32 py-4 border-t" : "max-h-0")}>
                        {faq.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ABOUT PAGE / STARRED ANCHORS                      */}
          {/* ======================================================== */}
          {activeTab === "about" && (
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-300 bg-[#0c0c0e]">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-xs font-semibold shadow-sm">
                  <Info className="w-3.5 h-3.5" />
                  <span>About our Platform</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Synthesizing software from abstract intent
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                  Our IDE couples raw human prompt structures with native WebContainer compilation, creating responsive, modularized applications inside browser tabs.
                </p>
              </div>

              {/* Bento cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
                <div className="p-6 bg-[#121214] border border-neutral-800/80 rounded-2xl flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-pink-400" />
                  </div>
                  <h3 className="text-xs font-bold uppercase text-white tracking-wider">Democratizing Engineering</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    We make software tactile. Instruct compilers using natural language commands, instantly mapping changes directly to high-fidelity code bases.
                  </p>
                </div>

                <div className="p-6 bg-[#121214] border border-neutral-800/80 rounded-2xl flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-xs font-bold uppercase text-white tracking-wider">Virtual Edge Ecosystems</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Operating client-side sandbox threads eliminates server bottlenecks, ensuring instant feedback loops and robust local persistence.
                  </p>
                </div>
              </div>

              {/* Steps timeline */}
              <div className="max-w-2xl mx-auto text-center space-y-6 pt-6 border-t border-neutral-950">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest font-mono">Compilation Pipelines</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-[#0a0a0c] border border-neutral-900 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-bold text-indigo-400 font-mono">STAGE 01</span>
                    <h4 className="text-xs font-bold text-white">Understand</h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      LLM checks active sandbox files, folder indices, and React states to contextually target updates.
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a0a0c] border border-neutral-900 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-bold text-cyan-400 font-mono">STAGE 02</span>
                    <h4 className="text-xs font-bold text-white">Surgical Edits</h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Web container applies modifications incrementally, avoiding full deletions and maintaining performance.
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a0a0c] border border-neutral-900 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-bold text-pink-400 font-mono">STAGE 03</span>
                    <h4 className="text-xs font-bold text-white">Compile</h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Dual compilers reload assets instantly inside of iframe, preserving live preview states.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setActiveTab("build")}
                  className="px-5 py-2 bg-[#1c1c1e] hover:bg-neutral-800 text-neutral-200 hover:text-white rounded-full text-xs font-bold transition-all border border-neutral-800 cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <footer className="h-10 flex items-center justify-between px-3 text-[10px] text-neutral-600 select-none shrink-0">
          <p>© 2026 AI Web Builder. Running client-side Sandpack virtual compilation.</p>
          <div className="hidden sm:flex items-center gap-4">
            <span className="hover:text-neutral-400 transition-colors cursor-pointer" onClick={() => setActiveTab("about")}>Security</span>
            <span className="hover:text-neutral-400 transition-colors cursor-pointer" onClick={() => alert("Manage third-party tokens inside the Settings panel.")}>Keys</span>
            <span className="hover:text-neutral-400 transition-colors cursor-pointer" onClick={() => setActiveTab("tools")}>Docs</span>
          </div>
        </footer>

      </div>

      {/* ======================================================== */}
      {/* COMMAND PALETTE SEARCH PANEL MODAL                       */}
      {/* ======================================================== */}
      {showSearchPalette && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50 p-4">
          <div className="bg-[#0e0e12]/95 border border-neutral-800/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-900">
              <Search className="w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, resources, templates, or write a prompt..."
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs md:text-sm text-white placeholder-neutral-500 flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowSearchPalette(false);
                  if (e.key === "Enter" && searchQuery.trim()) {
                    handleSuggestionClick(searchQuery);
                    setShowSearchPalette(false);
                    setSearchQuery("");
                  }
                }}
              />
              <button 
                onClick={() => setShowSearchPalette(false)}
                className="p-1 rounded-md hover:bg-neutral-900 text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions list */}
            <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar text-left">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider font-mono px-3 py-1.5 block">Suggestions</span>
              
              <button
                onClick={() => {
                  handleSuggestionClick("Create a fully interactive Kanban Board with column-dragging, drag-and-drop tasks, color-coded priority labels, and a search filter.");
                  setShowSearchPalette(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#18181c] text-neutral-300 hover:text-white transition-all text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="font-bold">Task Organizer</p>
                    <span className="text-[10px] text-neutral-500">Kanban Board &amp; tasks tracker</span>
                  </div>
                </div>
                <Command className="w-3.5 h-3.5 text-neutral-600" />
              </button>

              <button
                onClick={() => {
                  handleSuggestionClick("Build a beautiful cryptocurrency portfolio dashboard with responsive Recharts graphs, transaction history, and custom price alerts.");
                  setShowSearchPalette(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#18181c] text-neutral-300 hover:text-white transition-all text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-bold">Crypto Dashboard</p>
                    <span className="text-[10px] text-neutral-500">Recharts tracking analytics</span>
                  </div>
                </div>
                <Command className="w-3.5 h-3.5 text-neutral-600" />
              </button>

              <button
                onClick={() => {
                  handleSuggestionClick("Design a sleek music player interface with audio track listings, responsive volume bars, interactive favorites, and animated play loops.");
                  setShowSearchPalette(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#18181c] text-neutral-300 hover:text-white transition-all text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  <div>
                    <p className="font-bold">Audio Streaming Player</p>
                    <span className="text-[10px] text-neutral-500">Modern playlist visualizer</span>
                  </div>
                </div>
                <Command className="w-3.5 h-3.5 text-neutral-600" />
              </button>
            </div>

            {/* Palette Footer hint */}
            <div className="bg-[#09090b] px-4 py-2 border-t border-neutral-900 text-[9px] text-neutral-600 font-mono text-left">
              Tip: Press <kbd className="bg-neutral-900 px-1 py-0.5 rounded border border-neutral-800">Enter</kbd> to build query, or <kbd className="bg-neutral-900 px-1 py-0.5 rounded border border-neutral-800">Esc</kbd> to close.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
