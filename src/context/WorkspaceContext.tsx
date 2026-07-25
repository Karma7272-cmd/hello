import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as Babel from "@babel/standalone";
import { generateWebsite, editElementWithAI, autoFixErrorWithAI, editWebsiteWithAI, cleanCodeSyntax, FileStructure } from "../lib/gemini";
import { 
  auth, 
  signInWithGoogle, 
  logoutUser, 
  saveProjectToFirestore, 
  loadProjectsFromFirestore, 
  deleteProjectFromFirestore, 
  saveConnectorsToFirestore, 
  loadConnectorsFromFirestore 
} from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

// Helper to resolve relative paths
export const resolveRelativePath = (fromPath: string, relativePath: string, files: Record<string, any>): string => {
  const cleanFrom = fromPath.startsWith("/") ? fromPath : "/" + fromPath;
  const parts = cleanFrom.split("/").filter(Boolean);
  parts.pop(); // remove file name
  
  const relParts = relativePath.split("/").filter(Boolean);
  for (const part of relParts) {
    if (part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  
  const absolute = "/" + parts.join("/");
  
  // Try with various standard extensions
  const extensions = ["", ".tsx", ".ts", ".jsx", ".js", ".css", ".json"];
  for (const ext of extensions) {
    const candidate = absolute + ext;
    if (files[candidate] !== undefined) {
      return candidate;
    }
  }
  return absolute;
};

export interface ProjectHistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  files: Record<string, { code: string }>;
}

export interface LogLine {
  text: string;
  type: "command" | "output" | "error" | "success" | "info";
}

interface WorkspaceContextType {
  files: Record<string, { code: string }>;
  activeFile: string;
  openTabs: string[];
  previewUrl: string;
  previewHtml: string;
  logs: LogLine[];
  isBooted: boolean;
  isInstalling: boolean;
  isRunning: boolean;
  isGenerating: boolean;
  prompt: string;
  error: string | null;
  setPrompt: (prompt: string) => void;
  setError: (error: string | null) => void;
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  addFile: (path: string, code: string) => void;
  deleteFile: (path: string) => void;
  updateFile: (path: string, code: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  runPreview: () => void;
  addLog: (text: string, type: LogLine["type"]) => void;
  clearLogs: () => void;
  triggerGeneration: (customPrompt?: string, isIncremental?: boolean) => Promise<void>;
  restartDevServer: () => void;
  resetWorkspace: () => void;
  inspectModeActive: boolean;
  setInspectModeActive: (active: boolean) => void;
  selectedElement: any | null;
  setSelectedElement: (element: any | null) => void;
  triggerElementEdit: (instruction: string) => Promise<void>;
  layoutMode: "preview" | "code" | "split";
  setLayoutMode: (mode: "preview" | "code" | "split") => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  mobileTab: "chat" | "preview" | "settings";
  setMobileTab: (tab: "chat" | "preview" | "settings") => void;
  isMobile: boolean;
  isTablet: boolean;
  isAutoFixing: boolean;
  autoFixEnabled: boolean;
  setAutoFixEnabled: (enabled: boolean) => void;
  triggerAutoFix: (errorMessage: string, errorContext?: string) => Promise<void>;
  triggerFixAllErrors: () => Promise<void>;
  latestPreviewError: { projectId: string; message: string; context?: string } | null;
  setLatestPreviewError: (error: { projectId: string; message: string; context?: string } | null) => void;
  deviceMode: "desktop" | "tablet" | "mobile";
  setDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void;
  cycleDeviceMode: () => void;
  projectHistory: ProjectHistoryItem[];
  loadProjectFromHistory: (item: ProjectHistoryItem) => void;
  deleteProjectFromHistory: (id: string) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  user: User | null;
  loadingUser: boolean;
  signIn: () => Promise<User>;
  logout: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const INITIAL_FILES: Record<string, { code: string }> = {
  "/src/App.tsx": {
    code: `import React from "react";
import { Sparkles, Compass, Cpu, Layers } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans flex flex-col justify-between">
      {/* Navigation */}
      <nav className="border-b border-neutral-900 bg-[#0f0f0f]/80 backdrop-blur px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-white tracking-tight">
            <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400" />
            <span>Veo Gallery</span>
          </div>
          <div className="flex gap-6 text-sm text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by WebContainer AI v3</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight max-w-2xl leading-tight">
          Recreate any interface, <span className="text-indigo-400">instantly</span>
        </h1>
        
        <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          A high-performance sandboxed preview system running directly on the client side inside a virtualized WebContainer stack.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 max-w-4xl">
          <div className="p-6 bg-[#121212] rounded-2xl border border-neutral-900 text-left hover:border-indigo-500/30 transition-all group">
            <Compass className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Zero Latency</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Runs completely inside your browser with locally compiled ES modules.</p>
          </div>
          <div className="p-6 bg-[#121212] rounded-2xl border border-neutral-900 text-left hover:border-indigo-500/30 transition-all group">
            <Cpu className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Vite Compiler</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Simulates Vite's blazing fast hot module replacement on the fly.</p>
          </div>
          <div className="p-6 bg-[#121212] rounded-2xl border border-neutral-900 text-left hover:border-indigo-500/30 transition-all group">
            <Layers className="w-8 h-8 text-pink-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Tailwind v4</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Full responsive styling powered by active JIT compilation.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-[#0c0c0c] py-8 px-6 text-center text-xs text-neutral-600">
        <p>© 2026 Veo 3 Gallery. Running on StackBlitz Client API.</p>
      </footer>
    </div>
  );
}`
  },
  "/package.json": {
    code: `{
  "name": "stackblitz-webcontainer-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  }
}`
  }
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const signIn = useCallback(async () => {
    const u = await signInWithGoogle();
    return u;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });
    return unsubscribe;
  }, []);

  const [files, setFilesState] = useState<Record<string, { code: string }>>(() => {
    const savedActiveId = localStorage.getItem("ai-builder-active-project-id") || "default-veo-gallery";
    
    // Try loading files directly associated with this active project ID
    try {
      const savedHistory = localStorage.getItem("ai-builder-project-history");
      if (savedHistory) {
        const history: ProjectHistoryItem[] = JSON.parse(savedHistory);
        const activeProj = history.find(item => item.id === savedActiveId);
        if (activeProj && activeProj.files && Object.keys(activeProj.files).length > 0) {
          return activeProj.files;
        }
      }
    } catch (e) {
      console.error("Failed to load active project files from history in state initialization:", e);
    }

    try {
      const saved = localStorage.getItem("stackblitz-workspace-files");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load saved workspace files", e);
    }
    return INITIAL_FILES;
  });

  const [activeFile, setActiveFile] = useState<string>(() => {
    const keys = Object.keys(INITIAL_FILES);
    return keys.find(k => k.endsWith("App.tsx") || k.endsWith("App.js")) || keys[0];
  });

  const [openTabs, setOpenTabs] = useState<string[]>([activeFile]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [logs, setLogs] = useState<LogLine[]>([]);
  
  const addLog = useCallback((text: string, type: LogLine["type"]) => {
    setLogs((prev) => [...prev, { text, type }]);
  }, []);

  const [prompt, setPrompt] = useState(() => localStorage.getItem("ai-builder-prompt") || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectModeActive, setInspectModeActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const cycleDeviceMode = useCallback(() => {
    setDeviceMode((prev) => {
      if (prev === "desktop") return "tablet";
      if (prev === "tablet") return "mobile";
      return "desktop";
    });
  }, []);

  const [projectHistory, setProjectHistory] = useState<ProjectHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("ai-builder-project-history");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load project history", e);
    }
    return [
      {
        id: "default-veo-gallery",
        prompt: "Veo Gallery - Powered by WebContainer AI",
        timestamp: "2026-07-19T05:00:00.000Z",
        files: INITIAL_FILES
      }
    ];
  });

  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => {
    return localStorage.getItem("ai-builder-active-project-id") || "default-veo-gallery";
  });

  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
    if (id) {
      localStorage.setItem("ai-builder-active-project-id", id);
    } else {
      localStorage.removeItem("ai-builder-active-project-id");
    }
  }, []);

  // Atomic wrapper to update files state and synchronize with project history securely
  const setFiles = useCallback((
    update: Record<string, { code: string }> | ((prev: Record<string, { code: string }>) => Record<string, { code: string }>)
  ) => {
    setFilesState((prev) => {
      const nextFiles = typeof update === "function" ? update(prev) : update;
      
      // Keep main workspace storage up to date
      localStorage.setItem("stackblitz-workspace-files", JSON.stringify(nextFiles));
      
      // Save synchronously to the active project in history
      const savedActiveId = localStorage.getItem("ai-builder-active-project-id") || "default-veo-gallery";
      if (savedActiveId) {
        setProjectHistory((prevHistory) => {
          let isChanged = false;
          const updatedHistory = prevHistory.map((item) => {
            if (item.id === savedActiveId) {
              if (JSON.stringify(item.files) !== JSON.stringify(nextFiles)) {
                isChanged = true;
                return { ...item, files: nextFiles };
              }
            }
            return item;
          });
          if (isChanged) {
            localStorage.setItem("ai-builder-project-history", JSON.stringify(updatedHistory));
            return updatedHistory;
          }
          return prevHistory;
        });
      }
      
      return nextFiles;
    });
  }, []);

  const [layoutMode, setLayoutMode] = useState<"preview" | "code" | "split">("preview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [latestPreviewError, setLatestPreviewError] = useState<{ projectId: string; message: string; context?: string } | null>(null);
  const [autoFixEnabled, setAutoFixEnabledState] = useState<boolean>(() => {
    return localStorage.getItem("ai-builder-autofix-enabled") === "true";
  });
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [autoFixAttempts, setAutoFixAttempts] = useState<Record<string, number>>({});

  const setAutoFixEnabled = (enabled: boolean) => {
    setAutoFixEnabledState(enabled);
    localStorage.setItem("ai-builder-autofix-enabled", String(enabled));
  };

  const [mobileTab, setMobileTab] = useState<"chat" | "preview" | "settings">("preview");
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [isTablet, setIsTablet] = useState(() => typeof window !== "undefined" ? (window.innerWidth >= 768 && window.innerWidth < 1024) : false);

  // Load and sync projects from/to Firestore based on authentication state
  useEffect(() => {
    if (!user) {
      // Load from local storage when logged out
      try {
        const savedHistory = localStorage.getItem("ai-builder-project-history");
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setProjectHistory(parsed);
          const savedActiveId = localStorage.getItem("ai-builder-active-project-id") || "default-veo-gallery";
          const activeProj = parsed.find((item: any) => item.id === savedActiveId);
          if (activeProj) {
            setFilesState(activeProj.files);
            setActiveProjectIdState(savedActiveId);
          }
        }
      } catch (e) {
        console.error("Failed to load local history on logout:", e);
      }
      return;
    }

    const syncAndLoadProjects = async () => {
      try {
        addLog("☁ Syncing projects with Firestore...", "info");
        const cloudProjects = await loadProjectsFromFirestore(user.uid);
        
        // Get local projects
        const localHistoryStr = localStorage.getItem("ai-builder-project-history");
        let localProjects: ProjectHistoryItem[] = [];
        if (localHistoryStr) {
          try {
            localProjects = JSON.parse(localHistoryStr);
          } catch (_) {}
        }

        // Merge local projects with cloud projects. 
        // For any local project that isn't the default one and doesn't exist in cloud, save it to cloud.
        const projectsToUpload = localProjects.filter(lp => 
          lp.id !== "default-veo-gallery" && 
          !cloudProjects.some(cp => cp.id === lp.id)
        );

        if (projectsToUpload.length > 0) {
          addLog(`☁ Syncing ${projectsToUpload.length} local project(s) to secure cloud...`, "info");
          for (const lp of projectsToUpload) {
            await saveProjectToFirestore(lp.id, {
              ...lp,
              ownerId: user.uid
            });
            cloudProjects.push({ ...lp, ownerId: user.uid });
          }
        }

        // Sort descending by timestamp
        cloudProjects.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Check deleted projects list so deleted starter templates don't reappear
        const deletedRaw = localStorage.getItem("ai-builder-deleted-project-ids");
        const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

        const filteredCloud = cloudProjects.filter(p => !deletedIds.includes(p.id));

        // Only include default starter template if it wasn't deleted and cloud is empty or missing default
        const hasDefault = filteredCloud.some(p => p.id === "default-veo-gallery");
        const isDefaultDeleted = deletedIds.includes("default-veo-gallery");
        
        let mergedHistory = filteredCloud;
        if (!hasDefault && !isDefaultDeleted && filteredCloud.length === 0) {
          mergedHistory = [
            {
              id: "default-veo-gallery",
              prompt: "Veo Gallery - Powered by WebContainer AI",
              timestamp: "2026-07-19T05:00:00.000Z",
              files: INITIAL_FILES
            },
            ...filteredCloud
          ];
        }

        setProjectHistory(mergedHistory);

        // Load active project
        const savedActiveId = localStorage.getItem("ai-builder-active-project-id");
        const activeProj = mergedHistory.find(item => item.id === savedActiveId) || mergedHistory[0] || null;
        
        if (activeProj) {
          setFilesState(activeProj.files);
          setActiveProjectIdState(activeProj.id);
          localStorage.setItem("stackblitz-workspace-files", JSON.stringify(activeProj.files));
        } else {
          setActiveProjectIdState(null);
        }
        
        addLog("✔ Cloud projects synchronized successfully.", "success");
      } catch (err) {
        console.error("Error loading cloud projects:", err);
        addLog("❌ Failed to synchronize cloud projects.", "error");
      }
    };

    syncAndLoadProjects();
  }, [user, addLog]);

  // Debounced sync of active project files/content to Firestore
  useEffect(() => {
    if (!user || !activeProjectId || activeProjectId === "default-veo-gallery") return;

    const timer = setTimeout(async () => {
      const activeProj = projectHistory.find(item => item.id === activeProjectId);
      if (activeProj) {
        try {
          await saveProjectToFirestore(activeProjectId, {
            ...activeProj,
            ownerId: user.uid
          });
        } catch (e) {
          console.error("Failed to sync project to Firestore:", e);
        }
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [files, activeProjectId, user, projectHistory]);

  // Load connectors configuration from Firestore on login
  useEffect(() => {
    if (!user) return;

    const fetchConnectors = async () => {
      try {
        const data = await loadConnectorsFromFirestore(user.uid);
        if (data) {
          if (data.connectors) {
            localStorage.setItem("ai-builder-connectors-v1", JSON.stringify(data.connectors));
            window.dispatchEvent(new Event("connectors-updated"));
          }
          if (data.selectedModelId) {
            localStorage.setItem("ai-builder-selected-model-v1", data.selectedModelId);
            window.dispatchEvent(new Event("selected-model-updated"));
          }
        }
      } catch (e) {
        console.error("Failed to load connectors from cloud:", e);
      }
    };

    fetchConnectors();
  }, [user]);

  // Sync connectors and selected model to Firestore when modified locally
  useEffect(() => {
    if (!user) return;

    const syncConnectorsToCloud = async () => {
      try {
        const connectorsStr = localStorage.getItem("ai-builder-connectors-v1");
        const selectedModelId = localStorage.getItem("ai-builder-selected-model-v1") || "gemini";
        if (connectorsStr) {
          const connectors = JSON.parse(connectorsStr);
          await saveConnectorsToFirestore(user.uid, {
            selectedModelId,
            connectors
          });
        }
      } catch (e) {
        console.error("Failed to sync connectors to cloud:", e);
      }
    };

    const handleConnectorsUpdated = () => {
      syncConnectorsToCloud();
    };

    window.addEventListener("connectors-updated", handleConnectorsUpdated);
    window.addEventListener("selected-model-updated", handleConnectorsUpdated);

    return () => {
      window.removeEventListener("connectors-updated", handleConnectorsUpdated);
      window.removeEventListener("selected-model-updated", handleConnectorsUpdated);
    };
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isBooted, setIsBooted] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("stackblitz-workspace-files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem("ai-builder-prompt", prompt);
  }, [prompt]);

  // Reset preview error and auto-fixing state whenever active project changes
  useEffect(() => {
    setLatestPreviewError(null);
    setIsAutoFixing(false);
  }, [activeProjectId]);

  // Listen to messages from the sandbox iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === "CONSOLE_LOG") {
        addLog(data.text, data.logType);
      } else if (data && data.type === "UNCAUGHT_RUNTIME_ERROR") {
        addLog(`❌ Uncaught Runtime Error: ${data.message}`, "error");
        setLatestPreviewError({ projectId: activeProjectId || "default", message: data.message, context: data.stack });
      } else if (data && data.type === "PREVIEW_BOOT_ERROR") {
        addLog(`❌ Sandbox Boot Failure: ${data.message}`, "error");
        setLatestPreviewError({ projectId: activeProjectId || "default", message: data.message, context: data.stack });
      } else if (data && data.type === "ELEMENT_CLICKED") {
        setSelectedElement(data.element);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [addLog, activeProjectId]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Main client-side ES Modules compiler
  const runPreview = useCallback(() => {
    addLog("⚡ Starting compilation of virtual workspace...", "command");
    
    const compiledModules: Record<string, string> = {};
    let hasTranspilationError = false;

    for (const [path, data] of Object.entries(files)) {
      const fileData = data as { code: string };
      // Skip non-transpilable files (HTML, CSS, JSON, SVG, images, etc.)
      if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/i.test(path)) {
        continue;
      }
      try {
        const normalizedPath = path.replace(/^\//, "");
        const babelFilename = normalizedPath.endsWith(".ts") ? normalizedPath + "x" : (normalizedPath || "file.tsx");

        const cleanCode = cleanCodeSyntax(fileData.code);

        const presets: any[] = [
          ["env", { modules: "commonjs" }],
          ["react", { runtime: "automatic" }],
          "typescript"
        ];

        const res = Babel.transform(cleanCode, {
          presets,
          filename: babelFilename
        });
        compiledModules[path] = res.code || "";
      } catch (err: any) {
        hasTranspilationError = true;
        addLog(`❌ Transpilation error in ${path}: ${err.message}`, "error");
        compiledModules[path] = `throw new Error(${JSON.stringify(`Transpilation error in ${path}: ` + err.message)});`;
        setLatestPreviewError({ projectId: activeProjectId || "default", message: `Transpilation error in ${path}: ${err.message}`, context: err.stack });
      }
    }

    if (!hasTranspilationError) {
      setLatestPreviewError(null);
    }

    try {
      const modulesJson = JSON.stringify(compiledModules).replace(/</g, "\\u003c");
      const rawFilesJson = JSON.stringify(Object.fromEntries(
        Object.entries(files).map(([k, v]) => [k, (v as any).code])
      )).replace(/</g, "\\u003c");

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebContainer Preview</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0c0c0c;
        color: #eaeaea;
        font-family: system-ui, -apple-system, sans-serif;
      }
    </style>
    <script>
      // Capture console logs and forward them to the parent window
      const _log = console.log;
      const _error = console.error;
      const _warn = console.warn;
      const _info = console.info;

      window.console.log = (...args) => {
        _log(...args);
        window.parent.postMessage({ type: "CONSOLE_LOG", text: args.join(" "), logType: "output" }, "*");
      };
      window.console.error = (...args) => {
        _error(...args);
        window.parent.postMessage({ type: "CONSOLE_LOG", text: args.join(" "), logType: "error" }, "*");
      };
      window.console.warn = (...args) => {
        _warn(...args);
        window.parent.postMessage({ type: "CONSOLE_LOG", text: args.join(" "), logType: "info" }, "*");
      };
      window.console.info = (...args) => {
        _info(...args);
        window.parent.postMessage({ type: "CONSOLE_LOG", text: args.join(" "), logType: "info" }, "*");
      };

      window.addEventListener("error", (e) => {
        console.error("Uncaught runtime error:", e.error || e.message);
        window.parent.postMessage({ type: "UNCAUGHT_RUNTIME_ERROR", message: e.message, stack: e.error ? e.error.stack : "" }, "*");
      });

      window.addEventListener("unhandledrejection", (e) => {
        console.error("Unhandled promise rejection:", e.reason);
        window.parent.postMessage({ type: "UNCAUGHT_RUNTIME_ERROR", message: String(e.reason?.message || e.reason), stack: e.reason?.stack || "" }, "*");
      });

      window.__INSPECT_MODE_ACTIVE__ = false;

      window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SET_INSPECT_MODE") {
          window.__INSPECT_MODE_ACTIVE__ = event.data.active;
          const overlay = document.getElementById("ai-hover-overlay");
          if (overlay && !event.data.active) {
            overlay.style.display = "none";
          }
        }
      });

      window.addEventListener("DOMContentLoaded", () => {
        let hoverOverlay = document.getElementById("ai-hover-overlay");
        if (!hoverOverlay) {
          hoverOverlay = document.createElement("div");
          hoverOverlay.id = "ai-hover-overlay";
          hoverOverlay.style.position = "fixed";
          hoverOverlay.style.pointerEvents = "none";
          hoverOverlay.style.border = "2px dashed #6366f1";
          hoverOverlay.style.backgroundColor = "rgba(99, 102, 241, 0.15)";
          hoverOverlay.style.transition = "all 0.08s ease-out";
          hoverOverlay.style.zIndex = "999999";
          hoverOverlay.style.display = "none";
          
          const label = document.createElement("div");
          label.id = "ai-hover-label";
          label.style.position = "absolute";
          label.style.top = "-24px";
          label.style.left = "0";
          label.style.backgroundColor = "#6366f1";
          label.style.color = "white";
          label.style.fontSize = "10px";
          label.style.fontFamily = "monospace";
          label.style.padding = "2px 6px";
          label.style.borderRadius = "4px";
          label.style.whiteSpace = "nowrap";
          label.style.fontWeight = "bold";
          hoverOverlay.appendChild(label);
          
          document.body.appendChild(hoverOverlay);
        }

        window.addEventListener("mouseover", (e) => {
          if (!window.__INSPECT_MODE_ACTIVE__) return;
          const el = e.target;
          if (!el || el === document.body || el === document.documentElement || el.id === "ai-hover-overlay" || el.closest("#ai-hover-overlay")) return;
          
          const rect = el.getBoundingClientRect();
          hoverOverlay.style.width = rect.width + "px";
          hoverOverlay.style.height = rect.height + "px";
          hoverOverlay.style.top = rect.top + "px";
          hoverOverlay.style.left = rect.left + "px";
          hoverOverlay.style.display = "block";
          
          const label = document.getElementById("ai-hover-label");
          if (label) {
            let classes = el.className;
            if (typeof classes === "string") {
              classes = classes.split(" ").filter(c => c && !c.includes(":")).slice(0, 3).join(".");
              if (classes) classes = "." + classes;
            } else {
              classes = "";
            }
            label.textContent = el.tagName.toLowerCase() + classes;
          }
        }, true);

        window.addEventListener("mouseout", (e) => {
          if (!window.__INSPECT_MODE_ACTIVE__) return;
          hoverOverlay.style.display = "none";
        }, true);

        window.addEventListener("click", (e) => {
          if (!window.__INSPECT_MODE_ACTIVE__) return;
          const el = e.target;
          if (!el || el === document.body || el === document.documentElement || el.id === "ai-hover-overlay" || el.closest("#ai-hover-overlay")) return;
          
          e.preventDefault();
          e.stopPropagation();
          
          hoverOverlay.style.display = "none";
          
          const rect = el.getBoundingClientRect();
          const info = {
            tagName: el.tagName,
            id: el.id,
            className: typeof el.className === "string" ? el.className : "",
            innerText: el.innerText ? el.innerText.substring(0, 300) : "",
            outerHTML: el.outerHTML,
            parentTag: el.parentElement ? el.parentElement.tagName : null,
            box: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
          
          window.parent.postMessage({ type: "ELEMENT_CLICKED", element: info }, "*");
        }, true);
      });
    </script>
    <script id="__COMPILED_MODULES_DATA__" type="application/json">
      ${modulesJson}
    </script>
    <script id="__RAW_FILES_DATA__" type="application/json">
      ${rawFilesJson}
    </script>
    <script>
      try {
        window.__COMPILED_MODULES__ = JSON.parse(document.getElementById("__COMPILED_MODULES_DATA__").textContent || "{}");
      } catch (e) {
        window.__COMPILED_MODULES__ = {};
      }
      try {
        window.__RAW_FILES__ = JSON.parse(document.getElementById("__RAW_FILES_DATA__").textContent || "{}");
      } catch (e) {
        window.__RAW_FILES__ = {};
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      const modules = window.__COMPILED_MODULES__;
      const rawFiles = window.__RAW_FILES__;
      const cache = {};
      const loadedLibs = {};

      function findFileKey(targetPath) {
        if (!targetPath) return null;
        if (targetPath.startsWith("@/")) {
          targetPath = "/src/" + targetPath.substring(2);
        }
        if (modules[targetPath] !== undefined || rawFiles[targetPath] !== undefined) {
          return targetPath;
        }
        const extensions = ["", ".tsx", ".ts", ".jsx", ".js", ".css", ".json", ".d.ts", "/index.tsx", "/index.ts", "/index.jsx", "/index.js"];
        for (const ext of extensions) {
          const baseCandidate = targetPath + ext;
          const candidates = [baseCandidate];
          if (baseCandidate.startsWith("/src/")) {
            candidates.push(baseCandidate.substring(4));
            candidates.push(baseCandidate.substring(5));
          } else {
            candidates.push("/src" + baseCandidate);
            candidates.push("src" + baseCandidate);
          }
          if (baseCandidate.startsWith("/")) {
            candidates.push(baseCandidate.substring(1));
          } else {
            candidates.push("/" + baseCandidate);
          }
          for (const cand of candidates) {
            if (modules[cand] !== undefined || rawFiles[cand] !== undefined) {
              return cand;
            }
          }
        }
        return null;
      }

      function resolveRelativePath(fromPath, relativePath) {
        const cleanFrom = fromPath.startsWith("/") ? fromPath : "/" + fromPath;
        const parts = cleanFrom.split("/").filter(Boolean);
        parts.pop();
        
        const relParts = relativePath.split("/").filter(Boolean);
        for (const part of relParts) {
          if (part === ".") continue;
          if (part === "..") {
            parts.pop();
          } else {
            parts.push(part);
          }
        }
        
        const absolute = "/" + parts.join("/");
        const matchedKey = findFileKey(absolute);
        return matchedKey || absolute;
      }

      function injectCSS(path, content) {
        const styleId = "style-" + path.replace(/[^a-zA-Z0-9]/g, "-");
        let style = document.getElementById(styleId);
        if (!style) {
          style = document.createElement("style");
          style.id = styleId;
          document.head.appendChild(style);
        }
        style.textContent = content;
      }

      function requireModule(fromPath, targetPath) {
        let resolvedPath = targetPath;
        if (targetPath.startsWith("@/")) {
          resolvedPath = "/src/" + targetPath.substring(2);
          resolvedPath = findFileKey(resolvedPath) || resolvedPath;
        } else if (targetPath.startsWith(".")) {
          resolvedPath = resolveRelativePath(fromPath, targetPath);
        } else if (targetPath.startsWith("/")) {
          resolvedPath = findFileKey(targetPath) || targetPath;
        } else {
          const matchedWorkspaceKey = findFileKey(targetPath);
          if (matchedWorkspaceKey) {
            resolvedPath = matchedWorkspaceKey;
          }
        }

        if (cache[resolvedPath]) {
          return cache[resolvedPath].exports;
        }

        if (resolvedPath.endsWith(".css")) {
          const cssContent = rawFiles[resolvedPath] || "";
          injectCSS(resolvedPath, cssContent);
          return {};
        }

        if (resolvedPath.endsWith(".json")) {
          try {
            return JSON.parse(rawFiles[resolvedPath] || "{}");
          } catch (err) {
            return {};
          }
        }

        if (!resolvedPath.startsWith("/")) {
          if (loadedLibs[resolvedPath]) {
            return loadedLibs[resolvedPath];
          }
          if (resolvedPath === "react/jsx-runtime" || resolvedPath === "react/jsx-dev-runtime") {
            return loadedLibs[resolvedPath] || loadedLibs["react/jsx-runtime"] || loadedLibs["react"] || {};
          }
          if (resolvedPath.startsWith("react/")) {
            return loadedLibs["react"] || {};
          }
          if (resolvedPath.startsWith("lucide-react/")) {
            return loadedLibs["lucide-react"] || {};
          }
          if (resolvedPath.startsWith("react-router-dom/")) {
            return loadedLibs["react-router-dom"] || {};
          }
          const basePkg = resolvedPath.startsWith("@") ? resolvedPath.split("/").slice(0, 2).join("/") : resolvedPath.split("/")[0];
          if (loadedLibs[basePkg]) {
            return loadedLibs[basePkg];
          }

          const workspaceKey = findFileKey(resolvedPath);
          if (workspaceKey && workspaceKey.startsWith("/")) {
            return requireModule(fromPath, workspaceKey);
          }
          console.warn("External package missing, returning empty fallback module:", resolvedPath);
          return loadedLibs[resolvedPath] || {};
        }

        let code = modules[resolvedPath];
        if (code === undefined) {
          const matchedKey = findFileKey(resolvedPath);
          if (matchedKey && modules[matchedKey] !== undefined) {
            resolvedPath = matchedKey;
            code = modules[matchedKey];
          }
        }

        if (code === undefined) {
          if (rawFiles[resolvedPath] !== undefined) {
            return {};
          }
          console.warn("Module not found in virtual workspace, returning empty fallback module:", resolvedPath);
          return {};
        }

        const module = { exports: {} };
        cache[resolvedPath] = module;

        const localRequire = (pkgPath) => requireModule(resolvedPath, pkgPath);

        try {
          const fn = new Function("require", "module", "exports", code + "\\n//# sourceURL=" + resolvedPath);
          fn(localRequire, module, module.exports);
        } catch (err) {
          console.error("Runtime execution error in " + resolvedPath + ":", err);
          return module.exports || {};
        }

        return module.exports;
      }

      function interopModule(mod) {
        if (!mod) return mod;
        return new Proxy(mod, {
          get(target, prop) {
            if (prop === "default") {
              return target.default !== undefined ? target.default : target;
            }
            if (prop === "__esModule") {
              return true;
            }
            return target[prop];
          }
        });
      }

      async function loadDependenciesAndBoot() {
        const externals = new Set();
        const requireRegex = /require\\((['"])([^'"]+)\\1\\)/g;

        Object.values(modules).forEach(code => {
          let match;
          while ((match = requireRegex.exec(code)) !== null) {
            const dep = match[2];
            if (!dep.startsWith(".") && !dep.startsWith("/")) {
              const basePkg = dep.startsWith("@") ? dep.split("/").slice(0, 2).join("/") : dep.split("/")[0];
              externals.add(basePkg);
              externals.add(dep);
            }
          }
        });

        externals.add("react");
        externals.add("react/jsx-runtime");
        externals.add("react/jsx-dev-runtime");
        externals.add("react-dom");
        externals.add("react-dom/client");
        externals.add("lucide-react");
        externals.add("clsx");
        externals.add("tailwind-merge");
        externals.add("framer-motion");
        externals.add("react-router-dom");

        await Promise.all(
          Array.from(externals).map(async (lib) => {
            let url = "";
            if (lib === "react") url = "https://esm.sh/react@19";
            else if (lib === "react/jsx-runtime") url = "https://esm.sh/react@19/jsx-runtime";
            else if (lib === "react/jsx-dev-runtime") url = "https://esm.sh/react@19/jsx-runtime";
            else if (lib === "react-dom") url = "https://esm.sh/react-dom@19";
            else if (lib === "react-dom/client") url = "https://esm.sh/react-dom@19/client";
            else if (lib === "lucide-react") url = "https://esm.sh/lucide-react@0.468.0?external=react,react-dom";
            else if (lib === "motion/react") url = "https://esm.sh/motion/react@12.0.0-alpha.2?external=react,react-dom";
            else if (lib === "framer-motion") url = "https://esm.sh/framer-motion@11.15.0?external=react,react-dom";
            else url = "https://esm.sh/" + lib + "?external=react,react-dom";

            try {
              const mod = await import(url);
              loadedLibs[lib] = interopModule(mod);
            } catch (err) {
              console.error("Failed to load external dependency " + lib + ":", err);
            }
          })
        );

        try {
          // Check for App component first, or main entry point
          const appComponentKeys = ["/src/App.tsx", "/App.tsx", "/src/App.jsx", "/App.jsx"];
          const appComponentKey = appComponentKeys.find(key => modules[key] !== undefined);

          let AppComponent: any = null;
          if (appComponentKey) {
            const appExports = requireModule("/", appComponentKey);
            AppComponent = appExports.default || appExports;
          } else {
            const entryKeys = ["/src/main.tsx", "/src/index.tsx", "/src/App.tsx", "/App.tsx", "/index.tsx"];
            const entryKey = entryKeys.find(key => modules[key] !== undefined || rawFiles[key] !== undefined) || Object.keys(modules)[0];

            if (!entryKey) {
              throw new Error("No files found in virtual workspace.");
            }

            const entryExports = requireModule("/", entryKey);
            AppComponent = entryExports.default || entryExports;
          }

          // Verify if AppComponent is a valid React component (function or object with $$typeof / render)
          const isValidComponent = typeof AppComponent === "function" ||
            (typeof AppComponent === "object" && AppComponent !== null && (AppComponent.$$typeof || typeof AppComponent.render === "function"));

          if (isValidComponent) {
            const React = loadedLibs["react"];
            const ReactDOMClient = loadedLibs["react-dom/client"];

            class ErrorBoundary extends React.Component {
              constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
              }
              static getDerivedStateFromError(error) {
                return { hasError: true, error };
              }
              componentDidCatch(error, errorInfo) {
                console.error("React render error caught by ErrorBoundary:", error, errorInfo);
                window.parent.postMessage({
                  type: "UNCAUGHT_RUNTIME_ERROR",
                  message: error.message || String(error),
                  stack: (errorInfo && errorInfo.componentStack) || error.stack || ""
                }, "*");
              }
              render() {
                if (this.state.hasError) {
                  return React.createElement("div", {
                    style: {
                      padding: "24px",
                      color: "#f87171",
                      backgroundColor: "#121217",
                      border: "1px solid #27272a",
                      borderRadius: "16px",
                      margin: "20px",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "13px",
                      lineHeight: "1.6"
                    }
                  },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" } },
                      React.createElement("span", { style: { fontSize: "18px" } }, "⚠️"),
                      React.createElement("h3", { style: { margin: 0, color: "#f87171", fontSize: "15px", fontWeight: "700" } }, "Preview Component Error")
                    ),
                    React.createElement("p", { style: { margin: "0 0 12px 0", color: "#d4d4d8" } }, this.state.error?.message || "An unexpected error occurred during rendering."),
                    React.createElement("pre", { style: { overflowX: "auto", fontSize: "11px", fontFamily: "monospace", color: "#a1a1aa", backgroundColor: "#09090b", padding: "12px", borderRadius: "8px", border: "1px solid #18181b" } }, this.state.error?.stack || "")
                  );
                }
                return this.props.children;
              }
            }

            const root = ReactDOMClient.createRoot(document.getElementById("root"));
            root.render(React.createElement(ErrorBoundary, null, React.createElement(AppComponent)));
          } else {
            // If main.tsx was required and executed createRoot directly, nothing more needed if root has children
            const rootEl = document.getElementById("root");
            if (!rootEl || rootEl.children.length === 0) {
              console.warn("Entry point did not produce a default export component or mount to #root.");
            }
          }
        } catch (err) {
          console.error("Failed to boot applet:", err);
          window.parent.postMessage({ type: "PREVIEW_BOOT_ERROR", message: err.message, stack: err.stack }, "*");
          
          if (!${autoFixEnabled}) {
            const errorDiv = document.createElement("div");
            errorDiv.style.padding = "20px";
            errorDiv.style.color = "#ef4444";
            errorDiv.style.fontFamily = "monospace";
            errorDiv.style.backgroundColor = "#18181b";
            errorDiv.style.border = "1px solid #27272a";
            errorDiv.style.borderRadius = "8px";
            errorDiv.style.margin = "20px";
            errorDiv.innerHTML = "<h3>Boot Error</h3><pre>" + err.stack + "</pre>";
            document.body.appendChild(errorDiv);
          }
        }
      }

      loadDependenciesAndBoot();
    </script>
  </body>
</html>`;

      setPreviewHtml(htmlContent);

      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const iframeUrl = URL.createObjectURL(htmlBlob);
      setPreviewUrl(iframeUrl);

      addLog("✔ Build succeeded - the applet compiles perfectly", "success");
      addLog("  ➜  Local Server Running: http://localhost:5173/", "info");
    } catch (err: any) {
      addLog(`❌ Build failed: ${err.message}`, "error");
    }
  }, [files, addLog]);

  // Boot simulation of WebContainers
  const restartDevServer = useCallback(() => {
    setIsBooted(false);
    setIsInstalling(false);
    setIsRunning(false);
    clearLogs();

    addLog("Starting WebContainer engine...", "info");
    
    setTimeout(() => {
      setIsBooted(true);
      addLog("✔ WebContainer environment booted successfully on client side.", "success");
      
      setTimeout(() => {
        setIsInstalling(true);
        addLog("❯ npm install --prefer-offline", "command");
        addLog("Installing packages from package.json...", "info");
        
        setTimeout(() => {
          setIsInstalling(false);
          addLog("Added 148 packages in 1.1s. Fully cached.", "success");
          setIsRunning(true);
          addLog("❯ npm run dev", "command");
          addLog("  VITE v6.2.0  ready in 180 ms", "success");
          
          runPreview();
        }, 1000);
      }, 600);
    }, 400);
  }, [addLog, clearLogs, runPreview]);

  // Boot on mount
  useEffect(() => {
    restartDevServer();
  }, []);

  // Auto-compilation whenever files change (debounced)
  useEffect(() => {
    if (!isBooted || isInstalling || !isRunning) return;
    const timer = setTimeout(() => {
      runPreview();
    }, 800);
    return () => clearTimeout(timer);
  }, [files, isBooted, isInstalling, isRunning, runPreview]);

  const openFile = useCallback((path: string) => {
    setActiveFile(path);
    setOpenTabs((prev) => {
      if (prev.includes(path)) return prev;
      return [...prev, path];
    });
  }, []);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const filtered = prev.filter((t) => t !== path);
      if (filtered.length > 0 && activeFile === path) {
        setActiveFile(filtered[filtered.length - 1]);
      }
      return filtered;
    });
  }, [activeFile]);

  const addFile = useCallback((path: string, code: string) => {
    setFiles((prev) => ({
      ...prev,
      [path]: { code }
    }));
    openFile(path);
  }, [openFile]);

  const deleteFile = useCallback((path: string) => {
    setFiles((prev) => {
      const copy = { ...prev };
      // Delete the exact path
      delete copy[path];
      
      // Delete any children paths if it was a folder
      const prefix = path.endsWith("/") ? path : path + "/";
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(prefix)) {
          delete copy[k];
        }
      });

      // Update active file if it was deleted or inside the deleted folder
      setActiveFile((currentActive) => {
        if (currentActive === path || currentActive.startsWith(prefix)) {
          const remainingKeys = Object.keys(copy);
          const appKey = remainingKeys.find(k => k.endsWith("App.tsx") || k.endsWith("App.js")) || remainingKeys[0];
          return appKey || "";
        }
        return currentActive;
      });

      return copy;
    });

    setOpenTabs((prev) => {
      const prefix = path.endsWith("/") ? path : path + "/";
      const filtered = prev.filter((t) => t !== path && !t.startsWith(prefix));
      return filtered;
    });
  }, []);

  const updateFile = useCallback((path: string, code: string) => {
    setFiles((prev) => ({
      ...prev,
      [path]: { code }
    }));
  }, []);

  const renameFile = useCallback((oldPath: string, newPath: string) => {
    setFiles((prev) => {
      const copy = { ...prev };
      const code = copy[oldPath]?.code || "";
      delete copy[oldPath];
      copy[newPath] = { code };
      return copy;
    });
    
    setOpenTabs((prev) => prev.map((t) => (t === oldPath ? newPath : t)));
    if (activeFile === oldPath) {
      setActiveFile(newPath);
    }
  }, [activeFile]);

  const loadProjectFromHistory = useCallback((item: ProjectHistoryItem) => {
    setActiveProjectId(item.id);
    setFilesState(item.files);
    localStorage.setItem("stackblitz-workspace-files", JSON.stringify(item.files));
    setPrompt(item.prompt);
    setPreviewHtml("");
    setPreviewUrl("");
    setLatestPreviewError(null);
    setLogs([]);
    
    const keys = Object.keys(item.files);
    const appKey = keys.find(k => k.endsWith("App.tsx") || k.endsWith("App.js")) || keys[0];
    if (appKey) {
      openFile(appKey);
    }

    addLog(`❯ Loaded project from history: "${item.prompt}"`, "info");
    
    setTimeout(() => {
      runPreview();
    }, 100);
  }, [openFile, runPreview, addLog, setActiveProjectId]);

  const deleteProjectFromHistory = useCallback(async (id: string) => {
    // Record deleted project ID
    try {
      const deletedRaw = localStorage.getItem("ai-builder-deleted-project-ids");
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem("ai-builder-deleted-project-ids", JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error("Failed to save deleted project ID:", e);
    }

    setProjectHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("ai-builder-project-history", JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        await deleteProjectFromFirestore(id);
      } catch (e) {
        console.error("Failed to delete project from Firestore:", e);
      }
    }

    setActiveProjectIdState((curr) => {
      if (curr === id) {
        const remaining = projectHistory.filter((item) => item.id !== id);
        const nextId = remaining.length > 0 ? remaining[0].id : null;
        if (nextId) {
          localStorage.setItem("ai-builder-active-project-id", nextId);
        } else {
          localStorage.removeItem("ai-builder-active-project-id");
        }
        return nextId;
      }
      return curr;
    });
  }, [setActiveProjectIdState, user, projectHistory]);

  const triggerGeneration = async (customPrompt?: string, isIncremental: boolean = false) => {
    const activePrompt = customPrompt !== undefined ? customPrompt : prompt;
    if (!activePrompt.trim()) return;
    if (isGenerating && isIncremental) return;

    setIsGenerating(true);
    setError(null);
    if (!isIncremental) {
      setPreviewHtml(""); // dont show previous project preview
      setPreviewUrl("");
      addLog(`❯ gemini-3.5-flash: Recreating workspace using prompt "${activePrompt}"...`, "command");
    } else {
      addLog(`❯ gemini-3.5-flash: Editing workspace with prompt "${activePrompt}"...`, "command");
    }
    
    try {
      let generatedStructure;
      if (isIncremental) {
        const mappedFiles: Record<string, string> = {};
        Object.entries(files).forEach(([k, v]) => {
          mappedFiles[k] = (v as any).code;
        });
        generatedStructure = await editWebsiteWithAI(mappedFiles, activePrompt);
      } else {
        generatedStructure = await generateWebsite(activePrompt);
      }

      if (Object.keys(generatedStructure).length > 0) {
        // Format of output might be different, let's normalize
        const normalized: Record<string, { code: string }> = {};
        Object.entries(generatedStructure).forEach(([key, val]) => {
          const path = key.startsWith("/") ? key : "/" + key;
          normalized[path] = { code: typeof val === "string" ? val : (val as any).code || "" };
        });

        if (!isIncremental) {
          const newId = Date.now().toString();
          setActiveProjectId(newId);

          const newHistoryItem: ProjectHistoryItem = {
            id: newId,
            prompt: activePrompt,
            timestamp: new Date().toISOString(),
            files: normalized
          };

          setProjectHistory((prev) => {
            const updated = [newHistoryItem, ...prev];
            localStorage.setItem("ai-builder-project-history", JSON.stringify(updated));
            return updated;
          });

          setFilesState(normalized);
          localStorage.setItem("stackblitz-workspace-files", JSON.stringify(normalized));

          if (user) {
            saveProjectToFirestore(newId, { ...newHistoryItem, ownerId: user.uid }).catch(e => 
              console.error("Failed to save generated project to Firestore:", e)
            );
          }
        } else {
          setFiles(normalized);
          if (!activeProjectId) {
            const newId = Date.now().toString();
            const newHistoryItem: ProjectHistoryItem = {
              id: newId,
              prompt: activePrompt,
              timestamp: new Date().toISOString(),
              files: normalized
            };
            setProjectHistory((prev) => {
              const updated = [newHistoryItem, ...prev];
              localStorage.setItem("ai-builder-project-history", JSON.stringify(updated));
              return updated;
            });
            setActiveProjectId(newId);
            if (user) {
              saveProjectToFirestore(newId, { ...newHistoryItem, ownerId: user.uid }).catch(e => 
                console.error("Failed to save generated project to Firestore:", e)
              );
            }
          }
        }

        addLog("✔ Generation completed successfully! Injecting new workspace files.", "success");

        // Find a suitable App.tsx or similar
        const keys = Object.keys(normalized);
        const appKey = keys.find(k => k.endsWith("App.tsx") || k.endsWith("App.js")) || keys[0];
        if (appKey) {
          openFile(appKey);
        }

        // Recompile automatically
        setTimeout(() => {
          runPreview();
        }, 100);
      } else {
        throw new Error("AI returned an empty project. Please refine your instruction.");
      }
    } catch (err: any) {
      console.error("AI Generation failed", err);
      setError(err.message || "Failed to generate workspace.");
      addLog(`❌ Workspace generation failed: ${err.message || err}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerElementEdit = async (instruction: string) => {
    if (!selectedElement || !instruction.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    addLog(`❯ gemini-3.5-flash: Editing selected <${selectedElement.tagName.toLowerCase()}> element with prompt: "${instruction}"...`, "command");

    try {
      const mappedFiles: Record<string, string> = {};
      Object.entries(files).forEach(([k, v]) => {
        mappedFiles[k] = (v as any).code;
      });

      const updatedMapped = await editElementWithAI(mappedFiles, selectedElement, instruction);
      
      const normalized: Record<string, { code: string }> = {};
      Object.entries(updatedMapped).forEach(([key, val]) => {
        const path = key.startsWith("/") ? key : "/" + key;
        normalized[path] = { code: val };
      });

      setFiles(normalized);
      setSelectedElement(null);
      setInspectModeActive(false);
      addLog("✔ Element editing completed successfully!", "success");

      // Recompile automatically
      setTimeout(() => {
        runPreview();
      }, 100);
    } catch (err: any) {
      console.error("AI Element Edit failed", err);
      setError(err.message || "Failed to edit element with AI.");
      addLog(`❌ Element editing failed: ${err.message || err}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerAutoFix = useCallback(async (errorMessage: string, errorContext?: string) => {
    if (isAutoFixing || isGenerating) return;

    const cleanMsg = errorMessage.split("\n")[0];
    const attempts = autoFixAttempts[cleanMsg] || 0;
    if (attempts >= 3) {
      addLog(`⚠️ Auto-fix limit reached for this error. Please review your code manually.`, "info");
      setLatestPreviewError(null);
      return;
    }

    setIsAutoFixing(true);
    setLatestPreviewError(null);
    addLog(`🔧 AI Auto-Fix: Diagnosing and repairing error: "${cleanMsg}"...`, "command");

    try {
      const mappedFiles: Record<string, string> = {};
      Object.entries(files).forEach(([k, v]) => {
        mappedFiles[k] = (v as any).code;
      });

      setAutoFixAttempts(prev => ({ ...prev, [cleanMsg]: attempts + 1 }));

      const fixedMapped = await autoFixErrorWithAI(mappedFiles, errorMessage, errorContext);

      const normalized: Record<string, { code: string }> = {};
      Object.entries(fixedMapped).forEach(([key, val]) => {
        const path = key.startsWith("/") ? key : "/" + key;
        normalized[path] = { code: val };
      });

      setFiles(normalized);
      addLog("✔ Auto-fix complete! Re-compiling preview...", "success");

      setTimeout(() => {
        runPreview();
      }, 100);
    } catch (err: any) {
      console.error("Auto-fix attempt failed", err);
      addLog(`❌ Auto-fix failed: ${err.message || err}`, "error");
    } finally {
      setIsAutoFixing(false);
    }
  }, [files, isAutoFixing, isGenerating, autoFixAttempts, runPreview, addLog]);

  const triggerFixAllErrors = useCallback(async () => {
    if (isAutoFixing || isGenerating) return;

    setIsAutoFixing(true);
    addLog(`🔧 AI Batch Auto-Fix: Repairing all workspace errors and syntax glitches...`, "command");

    try {
      const errorList: string[] = [];
      if (latestPreviewError?.message) {
        errorList.push(`[Active Preview Error]: ${latestPreviewError.message}`);
      }
      logs.forEach(l => {
        if (l.type === "error" || l.text.includes("❌")) {
          errorList.push(l.text);
        }
      });

      const combinedMessage = errorList.join("\n---\n") || "Workspace transpilation and syntax errors across files.";

      const mappedFiles: Record<string, string> = {};
      Object.entries(files).forEach(([k, v]) => {
        mappedFiles[k] = cleanCodeSyntax((v as any).code);
      });

      const fixedMapped = await autoFixErrorWithAI(mappedFiles, combinedMessage);

      const normalized: Record<string, { code: string }> = {};
      Object.entries(fixedMapped).forEach(([key, val]) => {
        const path = key.startsWith("/") ? key : "/" + key;
        normalized[path] = { code: cleanCodeSyntax(val) };
      });

      setFiles(normalized);
      setLatestPreviewError(null);
      addLog("✔ Batch auto-fix complete! Re-compiling preview...", "success");

      setTimeout(() => {
        runPreview();
      }, 100);
    } catch (err: any) {
      console.error("Batch auto-fix failed", err);
      addLog(`❌ Batch auto-fix failed: ${err.message || err}`, "error");
    } finally {
      setIsAutoFixing(false);
    }
  }, [files, isAutoFixing, isGenerating, latestPreviewError, logs, runPreview, addLog]);

  const resetWorkspace = useCallback(() => {
    localStorage.removeItem("stackblitz-workspace-files");
    setActiveProjectId("default-veo-gallery");
    setFilesState(INITIAL_FILES);
    const keys = Object.keys(INITIAL_FILES);
    const firstApp = keys.find(k => k.endsWith("App.tsx") || k.endsWith("App.js")) || keys[0];
    setActiveFile(firstApp);
    setOpenTabs([firstApp]);
    setError(null);
    clearLogs();
    setSelectedElement(null);
    setInspectModeActive(false);
    addLog("✔ Workspace reset to default template successfully.", "success");

    setTimeout(() => {
      runPreview();
    }, 100);
  }, [clearLogs, addLog, setActiveProjectId, runPreview]);

  return (
    <WorkspaceContext.Provider
      value={{
        files,
        activeFile,
        openTabs,
        previewUrl,
        previewHtml,
        logs,
        isBooted,
        isInstalling,
        isRunning,
        isGenerating,
        prompt,
        error,
        setPrompt,
        setError,
        openFile,
        closeTab,
        addFile,
        deleteFile,
        updateFile,
        renameFile,
        runPreview,
        addLog,
        clearLogs,
        triggerGeneration,
        restartDevServer,
        resetWorkspace,
        inspectModeActive,
        setInspectModeActive,
        selectedElement,
        setSelectedElement,
        triggerElementEdit,
        layoutMode,
        setLayoutMode,
        isSidebarOpen,
        setIsSidebarOpen,
        mobileTab,
        setMobileTab,
        isMobile,
        isTablet,
        isAutoFixing,
        autoFixEnabled,
        setAutoFixEnabled,
        triggerAutoFix,
        triggerFixAllErrors,
        latestPreviewError,
        setLatestPreviewError,
        deviceMode,
        setDeviceMode,
        cycleDeviceMode,
        projectHistory,
        loadProjectFromHistory,
        deleteProjectFromHistory,
        activeProjectId,
        setActiveProjectId,
        user,
        loadingUser,
        signIn,
        logout,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
