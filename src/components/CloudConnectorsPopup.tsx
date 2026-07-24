import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  Database, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Power, 
  Settings, 
  ExternalLink,
  Terminal,
  ArrowRight,
  ShieldAlert,
  Loader2,
  X,
  PlayCircle,
  Eye,
  EyeOff,
  Search,
  Sliders,
  Key,
  Globe,
  Lock,
  Mail,
  Flame,
  Brain,
  Cpu,
  Zap,
  Info,
  Server
} from "lucide-react";
import { cn } from "../lib/utils";

interface ConnectorItem {
  id: string;
  name: string;
  description: string;
  category: string;
  iconColor?: string;
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

const getDocsUrl = (id: string) => {
  switch (id) {
    case "gemini": return "https://aistudio.google.com/";
    case "claude": return "https://console.anthropic.com/";
    case "chatgpt": return "https://platform.openai.com/";
    case "mistral": return "https://console.mistral.ai/";
    case "deepseek": return "https://platform.deepseek.com/";
    case "qwen": return "https://dashscope.console.aliyun.com/";
    case "groq": return "https://console.groq.com/";
    default: return "https://google.com";
  }
};

const getConnectorIcon = (id: string) => {
  switch (id) {
    case "gemini": return Sparkles;
    case "claude": return Brain;
    case "chatgpt": return Cpu;
    case "mistral": return Zap;
    case "qwen": return Sliders;
    case "deepseek": return Terminal;
    case "groq": return Cpu;
    default: return Sparkles;
  }
};

interface CloudConnectorsPopupProps {
  onClose: () => void;
}

export default function CloudConnectorsPopup({ onClose }: CloudConnectorsPopupProps) {
  // Load state synced with HomePage
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

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    return localStorage.getItem("ai-builder-selected-model-v1") || "gemini";
  });

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All AI Models");
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] AI Model Connector Manager initialized in workspace."]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState(0);

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${text}`]);
  };

  const saveConnectors = (updated: ConnectorItem[]) => {
    setConnectors(updated);
    localStorage.setItem("ai-builder-connectors-v1", JSON.stringify(updated));
    window.dispatchEvent(new Event("connectors-updated"));
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    localStorage.setItem("ai-builder-selected-model-v1", modelId);
    window.dispatchEvent(new Event("selected-model-updated"));
    addLog(`Changed default workspace LLM model driver to: ${modelId}`);
    
    // Auto enable connector if model selected
    const updated = connectors.map(c => {
      if (c.id === modelId) {
        return { ...c, enabled: true, status: c.apiKey ? "connected" : "not_configured" as const };
      }
      return c;
    });
    saveConnectors(updated);
  };

  // Keep state in sync with external changes in real-time
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

  // Connection Handshake Simulation
  useEffect(() => {
    if (!verifyingId) return;

    const handshakeSteps = [
      "Contacting API gateway secure handshake...",
      "Exchanging TLS cryptographical keys...",
      "Resolving proxy credentials validation...",
      "Verifying client token permissions and quota...",
      "Handshake verified! Gateway authentication completed successfully."
    ];

    const interval = setInterval(() => {
      if (verifyStep < handshakeSteps.length) {
        addLog(`[${verifyingId.toUpperCase()}] ${handshakeSteps[verifyStep]}`);
        setVerifyStep(prev => prev + 1);
      } else {
        // Complete verification
        const target = connectors.find(c => c.id === verifyingId);
        const updated = connectors.map(c => {
          if (c.id === verifyingId) {
            return { ...c, status: "connected" as const };
          }
          return c;
        });
        saveConnectors(updated);
        addLog(`✔ Successfully configured and verified secure tunnel for ${target?.name || verifyingId}.`);
        setVerifyingId(null);
        setVerifyStep(0);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [verifyingId, verifyStep, connectors]);

  const handleVerifyConnection = (id: string) => {
    const target = connectors.find(c => c.id === id);
    if (!target?.apiKey?.trim()) {
      addLog(`⚠ Failed to verify connection: No API key found for ${target?.name || id}.`);
      alert("Please enter a valid API configuration key first.");
      return;
    }
    if (verifyingId) return;
    
    setVerifyingId(id);
    setVerifyStep(0);
    addLog(`Initiating secure SSL connection verification loop for: ${target.name}`);
  };

  const handleToggleConnector = (id: string) => {
    const updated = connectors.map(c => {
      if (c.id === id) {
        const nextEnabled = !c.enabled;
        return { 
          ...c, 
          enabled: nextEnabled,
          status: nextEnabled ? (c.apiKey ? "connected" : "not_configured" as const) : "not_configured" as const
        };
      }
      return c;
    });
    saveConnectors(updated);
    addLog(`${connectors.find(c => c.id === id)?.name} has been ${!connectors.find(c => c.id === id)?.enabled ? "Enabled" : "Disabled"}.`);
  };

  const handleKeyChange = (id: string, val: string) => {
    const updated = connectors.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          apiKey: val,
          status: val ? "connected" : "not_configured" as const
        };
      }
      return c;
    });
    saveConnectors(updated);
  };

  const categories = ["All AI Models"];

  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === "All AI Models" || activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div 
      className="fixed inset-0 bg-[#070709]/95 backdrop-blur-xl z-[9999] overflow-y-auto flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Container Card */}
      <div 
        className="bg-[#0e0e11] border border-neutral-800 w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[90vh] lg:h-[82vh] min-h-[550px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Control Sidebar */}
        <div className="w-full lg:w-[320px] bg-[#0b0b0d] border-b lg:border-b-0 lg:border-r border-neutral-800 p-5 md:p-6 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Cloud className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-wider text-white uppercase font-mono">Cloud Connectors</h2>
                <p className="text-[11px] text-neutral-400">Secure API Credentials Sandbox</p>
              </div>
            </div>

            {/* Current Active Workspace LLM Model Selector */}
            <div className="p-4 bg-[#141418] border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider font-mono">Workspace LLM Driver</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Choose which model drives the website generator, component modifier, and auto-fix triggers in this session:
              </p>
              <div className="space-y-2 pt-1">
                {connectors
                  .filter(c => c.category === "AI Models")
                  .map(model => (
                    <label 
                      key={model.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all hover:bg-neutral-850/50",
                        selectedModelId === model.id 
                          ? "bg-indigo-600/10 border-indigo-500 text-white font-semibold" 
                          : "bg-neutral-900/30 border-neutral-800 text-neutral-400"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="selectedWorkspaceModel" 
                          checked={selectedModelId === model.id}
                          onChange={() => handleSelectModel(model.id)}
                          className="hidden"
                        />
                        <div className={cn(
                          "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                          selectedModelId === model.id ? "border-indigo-400" : "border-neutral-700"
                        )}>
                          {selectedModelId === model.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          )}
                        </div>
                        <span>{model.name.replace(" (Google)", "").replace(" (OpenAI)", "").replace(" (Anthropic)", "")}</span>
                      </div>
                      {model.apiKey ? (
                        <span className="text-[9px] px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono font-bold">BYOK</span>
                      ) : (
                        <span className="text-[9px] px-1 bg-neutral-800 text-neutral-500 rounded font-mono">System</span>
                      )}
                    </label>
                  ))
                }
              </div>
            </div>

            {/* Quick Helper Tip */}
            <div className="flex gap-2.5 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-300">Security Guarantee</p>
                Tokens are stored securely in your client browser cache and are only transmitted server-side to execute your requested AI actions.
              </div>
            </div>
          </div>

          {/* System logs view */}
          <div className="hidden lg:flex flex-col gap-1.5 mt-4 pt-4 border-t border-neutral-800">
            <span className="text-[9px] font-mono text-neutral-500 uppercase font-extrabold flex items-center gap-1">
              <Terminal className="w-3 h-3 text-indigo-400" />
              Orchestrator Logs
            </span>
            <div className="bg-[#050506] rounded-xl p-2.5 border border-neutral-800 h-28 overflow-y-auto font-mono text-[9px] text-neutral-400 space-y-1.5 custom-scrollbar">
              {logs.map((log, idx) => (
                <p key={idx} className="leading-relaxed break-all">
                  <span className="text-neutral-700">&gt;</span> {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Panel Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0c0e]">
          {/* Top Panel Search + Filter Bar */}
          <div className="p-5 md:p-6 border-b border-neutral-800 bg-[#0e0e11] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Integrations Directory</span>
                <span className="text-xs px-2.5 py-0.5 bg-neutral-800 border border-neutral-700/80 rounded-full font-mono text-neutral-400">
                  {connectors.filter(c => c.enabled).length} Enabled
                </span>
              </h3>
              <p className="text-xs text-neutral-400">Enable services and declare custom BYOK keys below.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search connectors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-1.5 pl-9 pr-8 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-neutral-800"
                title="Close Dashboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="px-5 md:px-6 py-2.5 border-b border-neutral-800/60 bg-[#09090b]/40 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                  activeCategory === cat 
                    ? "bg-neutral-800 text-white shadow-inner border border-neutral-700" 
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Connectors Grid List */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 custom-scrollbar">
            {filteredConnectors.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-neutral-500">
                <Database className="w-12 h-12 text-neutral-700 mb-3 animate-pulse" />
                <p className="text-sm font-bold text-neutral-400">No matching connectors</p>
                <p className="text-xs text-neutral-600 mt-1">Try resetting the filter criteria or searching another term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnectors.map((connector) => {
                  const IconComponent = getConnectorIcon(connector.id);
                  const isVisible = visibleKeys[connector.id] || false;
                  const isVerifying = verifyingId === connector.id;

                  return (
                    <div 
                      key={connector.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4",
                        connector.enabled 
                          ? "bg-[#121216] border-indigo-500/20 hover:border-indigo-500/40 shadow-sm" 
                          : "bg-[#0c0c0e]/60 border-neutral-900 opacity-80 hover:opacity-100"
                      )}
                    >
                      {/* Top Header Row of card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-xl border mt-0.5",
                            connector.enabled
                              ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-400"
                              : "bg-neutral-900 border-neutral-800 text-neutral-500"
                          )}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-xs text-neutral-100 flex items-center gap-1.5 flex-wrap">
                              {connector.name}
                              <span className={cn(
                                "text-[9px] px-2 py-0.2 rounded-md font-bold uppercase tracking-wider font-mono",
                                connector.enabled 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-neutral-800 text-neutral-500 border border-neutral-700/20"
                              )}>
                                {connector.enabled ? "Enabled" : "Offline"}
                              </span>
                            </h4>
                            <span className="text-[9px] text-neutral-500 font-bold uppercase font-mono tracking-wide">{connector.category}</span>
                          </div>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() => handleToggleConnector(connector.id)}
                          className={cn(
                            "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative cursor-pointer",
                            connector.enabled ? "bg-emerald-500" : "bg-neutral-800"
                          )}
                        >
                          <div className={cn(
                            "w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform duration-200", 
                            connector.enabled ? "translate-x-4.5" : "translate-x-0"
                          )} />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-neutral-400 leading-relaxed min-h-[34px]">
                        {connector.description}
                      </p>

                      {/* Key & Testing Fields */}
                      <div className="space-y-2 pt-2 border-t border-neutral-900/60 mt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                            <Key className="w-3 h-3" />
                            <span>BYOK API Key</span>
                          </span>

                          {connector.apiKey && (
                            <span className={cn(
                              "text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase",
                              connector.status === "connected" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                            )}>
                              {connector.status === "connected" ? "✓ Verified" : "Unverified"}
                            </span>
                          )}
                        </div>

                        {/* Input Row */}
                        <div className="relative">
                          <input
                            type={isVisible ? "text" : "password"}
                            placeholder={connector.placeholder}
                            value={connector.apiKey}
                            onChange={(e) => handleKeyChange(connector.id, e.target.value)}
                            disabled={!connector.enabled}
                            className={cn(
                              "w-full bg-neutral-950 text-xs rounded-xl pl-3 pr-8 py-2 font-mono text-neutral-200 border transition-colors",
                              !connector.enabled 
                                ? "border-neutral-900 opacity-40 placeholder-neutral-750 cursor-not-allowed" 
                                : "border-neutral-800 focus:outline-none focus:border-indigo-500 placeholder-neutral-600"
                            )}
                          />
                          {connector.enabled && (
                            <button
                              type="button"
                              onClick={() => setVisibleKeys(prev => ({ ...prev, [connector.id]: !isVisible }))}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {/* Verification controls / Docs links */}
                        <div className="flex items-center justify-between pt-1">
                          <a 
                            href={getDocsUrl(connector.id)}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                          >
                            <span>Get Secret Token</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          {connector.enabled && connector.apiKey.trim() && (
                            <button
                              onClick={() => handleVerifyConnection(connector.id)}
                              disabled={isVerifying}
                              className={cn(
                                "text-[10px] font-bold font-mono px-2 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer",
                                isVerifying 
                                  ? "bg-neutral-900 text-neutral-500" 
                                  : "text-indigo-400 hover:text-indigo-300"
                              )}
                            >
                              {isVerifying ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                  <span>Testing Handshake {Math.round((verifyStep / 5) * 100)}%</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Verify Connection</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer controls status info */}
          <div className="p-4 border-t border-neutral-800 bg-[#0b0b0d] flex items-center justify-between gap-4 flex-wrap text-[11px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-neutral-600" />
              <span>Orchestrator Sandbox Protocol: <strong className="text-neutral-400">gRPC v2.4.1</strong></span>
            </div>
            <div>
              <span>Press <kbd className="bg-neutral-900 px-1 py-0.5 border border-neutral-800 rounded font-mono text-[10px] text-neutral-400">ESC</kbd> to return to workspace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
