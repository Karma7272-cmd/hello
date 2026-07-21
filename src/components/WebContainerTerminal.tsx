import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Terminal, RefreshCw, Square, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

export default function WebContainerTerminal() {
  const { files, logs, addLog, clearLogs, restartDevServer, runPreview } = useWorkspace();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    // Append typed command to logs
    addLog(`projects/webcontainer-app $ ${cmd}`, "command");
    setInput("");

    const parts = cmd.split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    setTimeout(() => {
      switch (command) {
        case "help":
        case "h":
          addLog("Available WebContainer commands:", "info");
          addLog("  npm run dev   - Restarts the Vite development server & previews compilation", "info");
          addLog("  npm run build - Packages & builds the React app for production", "info");
          addLog("  npm install   - Refreshes node_modules dependencies", "info");
          addLog("  ls            - Lists files in the current workspace", "info");
          addLog("  cat <file>    - Displays contents of a specific file", "info");
          addLog("  clear         - Clears the terminal terminal viewport", "info");
          break;

        case "clear":
          clearLogs();
          break;

        case "ls":
          const fileKeys = Object.keys(files);
          const listText = fileKeys
            .map(k => k.startsWith("/") ? k.substring(1) : k)
            .join("    ");
          addLog(listText || "No files found.", "output");
          break;

        case "cat":
          if (args.length === 0) {
            addLog("Error: No file specified. Usage: cat <filename>", "error");
          } else {
            const requestedFile = args[0];
            const matchedKey = Object.keys(files).find(
              k => k === requestedFile || k === `/${requestedFile}` || k.endsWith(requestedFile)
            );
            if (matchedKey && files[matchedKey]) {
              addLog(files[matchedKey].code, "output");
            } else {
              addLog(`Error: File '${requestedFile}' not found in workspace`, "error");
            }
          }
          break;

        case "npm":
          const subcmd = args.join(" ");
          if (subcmd === "run dev") {
            restartDevServer();
          } else if (subcmd === "run build") {
            addLog("vite build", "command");
            addLog("transforming modules...", "info");
            runPreview();
          } else if (subcmd === "install") {
            addLog("npm install --prefer-offline", "command");
            addLog("up to date, audited 148 packages in 420ms", "success");
          } else {
            addLog(`Error: Unknown npm script: '${subcmd}'`, "error");
          }
          break;

        default:
          addLog(`sh: command not found: ${command}. Type 'help' for instructions.`, "error");
      }
    }, 100);
  };

  return (
    <div className="h-44 bg-[#141414] border-t border-[#2d2d2d] flex flex-col font-mono select-text shrink-0">
      {/* Terminal Title Bar */}
      <div className="h-8 px-3 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between text-[11px] font-semibold text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>TERMINAL - WebContainer Shell</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={restartDevServer}
            className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded cursor-pointer transition-colors"
            title="Restart Terminal Dev Server"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button 
            onClick={clearLogs}
            className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded cursor-pointer transition-colors"
            title="Clear Console View"
          >
            <Square className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal logs list */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-xs leading-5 space-y-1 custom-scrollbar text-neutral-300"
      >
        {logs.map((log, idx) => (
          <div 
            key={idx} 
            className={cn(
              log.type === "command" && "text-indigo-300",
              log.type === "success" && "text-emerald-400",
              log.type === "error" && "text-rose-400 font-semibold",
              log.type === "info" && "text-neutral-400",
              "whitespace-pre-wrap"
            )}
          >
            {log.text}
          </div>
        ))}

        {/* Input line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-1.5 pt-1">
          <span className="text-emerald-500 font-bold shrink-0">projects/webcontainer-app $</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 p-0 text-xs font-mono"
            autoFocus
            placeholder="Type 'help' to list commands"
          />
        </form>
      </div>
    </div>
  );
}
