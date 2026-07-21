import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { X, Code, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

export default function CodeEditor() {
  const { files, activeFile, openFile, updateFile, openTabs, closeTab } = useWorkspace();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleCloseTab = (tabToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tabToClose);
  };

  const handleTextareaScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard shortcut or keydown hooks (e.g. Tab insertion)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert two spaces for tab
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      updateFile(activeFile, newValue);

      // Restore cursor position in next tick
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const code = files[activeFile]?.code || "";
  const lines = code.split("\n");

  // Determine line/column of cursor
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });

  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textUpToCursor = textarea.value.substring(0, textarea.selectionStart);
    const linesUpToCursor = textUpToCursor.split("\n");
    const currentLine = linesUpToCursor.length;
    const currentColumn = linesUpToCursor[currentLine - 1].length + 1;

    setCursorPos({ line: currentLine, column: currentColumn });
  };

  const fileExtension = activeFile ? activeFile.split(".").pop()?.toUpperCase() : "";

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] h-full overflow-hidden select-text">
      {/* Tab bar */}
      <div className="h-10 bg-[#181818] border-b border-[#2d2d2d] flex items-center overflow-x-auto custom-scrollbar shrink-0 select-none">
        {openTabs.map((tab) => {
          const isActive = activeFile === tab;
          const fileName = tab.split("/").pop() || "";
          return (
            <div
              key={tab}
              onClick={() => openFile(tab)}
              className={cn(
                "h-full px-4 flex items-center gap-2 border-r border-[#2d2d2d] text-xs font-mono cursor-pointer transition-colors relative group shrink-0",
                isActive 
                  ? "bg-[#1e1e1e] text-white border-t-2 border-indigo-500" 
                  : "text-neutral-500 hover:bg-[#1f1f1f] hover:text-neutral-300"
              )}
            >
              <span>{fileName}</span>
              <button
                onClick={(e) => handleCloseTab(tab, e)}
                className="p-0.5 rounded hover:bg-[#2d2d2d] hover:text-white transition-colors text-neutral-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor Main Section */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {activeFile ? (
          <>
            {/* Line Numbers gutter */}
            <div 
              ref={lineNumbersRef}
              className="w-12 bg-[#1e1e1e] text-right py-4 pr-3 text-neutral-600 font-mono text-xs select-none overflow-hidden shrink-0 border-r border-[#2d2d2d] leading-6"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => updateFile(activeFile, e.target.value)}
              onScroll={handleTextareaScroll}
              onKeyDown={handleKeyDown}
              onKeyUp={handleSelectionChange}
              onMouseUp={handleSelectionChange}
              className="flex-1 h-full bg-[#1e1e1e] text-neutral-200 p-4 font-mono text-xs focus:outline-none resize-none leading-6 whitespace-pre overflow-auto custom-scrollbar selection:bg-indigo-500/30"
              spellCheck={false}
              placeholder="// Write your code here"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Code className="w-12 h-12 text-neutral-700 mb-4 stroke-1 animate-pulse" />
            <h3 className="text-white font-medium mb-1">No Active File</h3>
            <p className="text-xs text-neutral-500 max-w-xs">
              Select or create a file from the workspace explorer to start writing code.
            </p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#181818] border-t border-[#2d2d2d] px-3 flex items-center justify-between text-[10px] font-mono text-neutral-500 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 font-medium">StackBlitz Container Active</span>
          </span>
          <span>•</span>
          <span>Port: 5173</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln {cursorPos.line}, Col {cursorPos.column}</span>
          <span>UTF-8</span>
          <span>{fileExtension || "PLAINTEXT"}</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}
