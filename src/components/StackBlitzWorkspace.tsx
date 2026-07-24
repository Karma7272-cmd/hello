import React, { useState } from "react";
import FileTree from "./FileTree";
import CodeEditor from "./CodeEditor";
import WebContainerTerminal from "./WebContainerTerminal";
import LivePreviewFrame from "./LivePreviewFrame";
import { 
  Columns, 
  Code, 
  LayoutGrid, 
  RotateCw, 
  Maximize2, 
  Info, 
  ChevronUp, 
  ChevronDown,
  Cpu,
  Activity,
  Zap,
  ShieldCheck,
  Terminal as TerminalIcon,
  Layers
} from "lucide-react";
import { cn } from "../lib/utils";
import { useWorkspace } from "../context/WorkspaceContext";

export default function StackBlitzWorkspace() {
  const { isRunning, isInstalling, isBooted, layoutMode, setLayoutMode, isMobile } = useWorkspace();

  // On mobile screens, force split view to default to live preview layout for readability
  const effectiveLayoutMode = isMobile && layoutMode === "split" ? "preview" : layoutMode;

  return (
    <div className="flex-1 flex flex-col bg-[#121215] h-full overflow-hidden min-h-0 relative rounded-2xl sm:rounded-3xl border border-[#2d2d35]/80 shadow-2xl m-1 sm:m-1.5 transition-all duration-300">
      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative bg-[#0c0c0e] rounded-t-2xl sm:rounded-t-3xl">
        {/* Show FileTree if Code is part of the current layout */}
        {effectiveLayoutMode !== "preview" && (
          <FileTree />
        )}

        {/* Switch layout views based on effectiveLayoutMode */}
        {effectiveLayoutMode === "split" && (
          <div className="flex-1 flex h-full min-w-0">
            {/* Editor + Terminal Section (Left half) */}
            <div className="flex-1 flex flex-col h-full border-r border-[#2a2a30] min-w-0">
              <CodeEditor />
              <WebContainerTerminal />
            </div>
            
            {/* Live Preview Section (Right half) */}
            <div className="flex-1 h-full min-w-0">
              <LivePreviewFrame />
            </div>
          </div>
        )}

        {effectiveLayoutMode === "code" && (
          <div className="flex-1 flex flex-col h-full min-w-0">
            <CodeEditor />
            <WebContainerTerminal />
          </div>
        )}

        {effectiveLayoutMode === "preview" && (
          <div className="flex-1 h-full min-w-0">
            <LivePreviewFrame />
          </div>
        )}
      </div>

      {/* Bottom status bar of the Workspace with curved bottom edges & modern icons */}
      <footer className="h-8 bg-[#141418] border-t border-[#24242c] flex items-center justify-between px-4 select-none shrink-0 text-[10px] font-mono text-neutral-400 rounded-b-2xl sm:rounded-b-3xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1c1c22] border border-[#2d2d38]">
            <div className={cn(
              "w-2 h-2 rounded-full shadow-sm",
              isRunning ? "bg-emerald-400 shadow-emerald-500/50 animate-pulse" : isInstalling ? "bg-amber-400 shadow-amber-500/50 animate-pulse" : "bg-blue-400"
            )} />
            <span className="font-semibold text-neutral-200 text-[9.5px]">
              {isRunning ? "Vite Dev Server Active" : isInstalling ? "npm install..." : isBooted ? "Booted" : "Booting..."}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-neutral-500 text-[9.5px]">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>Node.js v18</span>
            <span className="text-neutral-700">•</span>
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Port 3000</span>
          </div>
        </div>
        
        {!isMobile && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#1c1c22] px-2.5 py-0.5 rounded-full border border-[#2d2d38] text-[9.5px] text-neutral-300 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <Info className="w-3 h-3 text-cyan-400" />
              <span>4 Issues</span>
            </div>
            <div className="flex flex-col text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">
              <ChevronUp className="w-3 h-2" />
              <ChevronDown className="w-3 h-2" />
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
