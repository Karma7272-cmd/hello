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
  ChevronDown 
} from "lucide-react";
import { cn } from "../lib/utils";
import { useWorkspace } from "../context/WorkspaceContext";

export default function StackBlitzWorkspace() {
  const { isRunning, isInstalling, isBooted, layoutMode, setLayoutMode, isMobile } = useWorkspace();

  // On mobile screens, force split view to default to live preview layout for readability
  const effectiveLayoutMode = isMobile && layoutMode === "split" ? "preview" : layoutMode;

  return (
    <div className="flex-1 flex flex-col bg-[#141414] h-full overflow-hidden min-h-0 relative">
      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative bg-[#0c0c0c]">
        {/* Show FileTree if Code is part of the current layout */}
        {effectiveLayoutMode !== "preview" && (
          <FileTree />
        )}

        {/* Switch layout views based on effectiveLayoutMode */}
        {effectiveLayoutMode === "split" && (
          <div className="flex-1 flex h-full min-w-0">
            {/* Editor + Terminal Section (Left half) */}
            <div className="flex-1 flex flex-col h-full border-r border-[#2d2d2d] min-w-0">
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

      {/* Bottom status bar of the Workspace matching the screenshot */}
      <footer className="h-8 bg-[#141414] border-t border-[#222] flex items-center justify-between px-3 select-none shrink-0 text-[10px] font-mono text-neutral-500">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isRunning ? "bg-emerald-500 animate-pulse" : isInstalling ? "bg-amber-500 animate-pulse" : "bg-blue-400"
          )} />
          <span>
            {isRunning ? "Vite Dev Server Active" : isInstalling ? "npm install..." : isBooted ? "Booted" : "Booting..."}
          </span>
        </div>
        
        {!isMobile && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2d2d2d] text-[10px] text-neutral-400">
              <Info className="w-3 h-3 text-cyan-400" />
              <span>4</span>
            </div>
            <div className="flex flex-col text-neutral-500">
              <ChevronUp className="w-3 h-2" />
              <ChevronDown className="w-3 h-2" />
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
