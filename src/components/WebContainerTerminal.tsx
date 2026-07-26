import React, { useEffect, useRef } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Terminal as TerminalIcon, RefreshCw, Square } from "lucide-react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function WebContainerTerminal() {
  const { logs, clearLogs, restartDevServer } = useWorkspace();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;
    
    const term = new Terminal({
      theme: {
        background: '#141414',
        foreground: '#d4d4d4',
        cursor: '#4285f4'
      },
      fontFamily: 'monospace',
      fontSize: 12,
      convertEol: true
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;
    
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // Sync logs
  useEffect(() => {
    if (!xtermRef.current) return;
    xtermRef.current.clear();
    logs.forEach(log => {
      let prefix = "";
      if (log.type === 'error') prefix = "\\x1b[31m";
      else if (log.type === 'success') prefix = "\\x1b[32m";
      else if (log.type === 'command') prefix = "\\x1b[34m";
      else if (log.type === 'info') prefix = "\\x1b[36m";
      
      xtermRef.current?.writeln(prefix + log.text + "\\x1b[0m");
    });
  }, [logs]);

  return (
    <div className="h-44 bg-[#141414] border-t border-[#2d2d2d] flex flex-col shrink-0">
      <div className="h-8 px-3 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between text-[11px] font-semibold text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
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
      <div 
        ref={terminalRef}
        className="flex-1 overflow-hidden p-2"
      />
    </div>
  );
}
