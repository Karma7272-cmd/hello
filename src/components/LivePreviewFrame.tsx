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
  RotateCw
} from "lucide-react";
import { cn } from "../lib/utils";

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
    setLatestPreviewError
  } = useWorkspace();
  
  const [reloadKey, setReloadKey] = useState(0);
  const [editPrompt, setEditPrompt] = useState("");
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

  return (
    <div className="flex-1 flex flex-col bg-[#141414] h-full overflow-hidden select-none relative">
      {/* Preview Action Header */}
      <div className="hidden md:flex h-9 bg-[#111] border-b border-[#222] px-3 items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider font-sans">Live Preview</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* AI Auto-Fix Toggle Control */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#18181c] px-2 py-0.5 rounded-lg border border-[#2d2d2d] hover:border-neutral-700 transition-colors">
            <Sparkles className={cn(
              "w-3 h-3 transition-all",
              autoFixEnabled ? "text-indigo-400 animate-pulse" : "text-neutral-500"
            )} />
            <span className="text-[9px] text-neutral-400 font-medium font-sans">Auto-Fix Errors</span>
            <button
              onClick={() => setAutoFixEnabled(!autoFixEnabled)}
              className={cn(
                "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                autoFixEnabled ? "bg-indigo-600" : "bg-neutral-850"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  autoFixEnabled ? "translate-x-3" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Refresh / Inspect toggle controls */}
          <div className="flex items-center gap-1 bg-[#18181c] p-0.5 rounded-md border border-[#2d2d2d]">
            <button
              onClick={() => setInspectModeActive(!inspectModeActive)}
              title="Toggle Element Inspector mode"
              className={cn(
                "p-1 rounded cursor-pointer transition-colors text-[9px] font-semibold flex items-center gap-1",
                inspectModeActive 
                  ? "bg-indigo-500/20 text-indigo-300 font-bold" 
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <MousePointerClick className="w-3 h-3" />
              <span>Inspect</span>
            </button>
            <div className="w-[1px] h-3 bg-neutral-800" />
            <button
              onClick={handleReload}
              title="Reload preview screen"
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Frame Body Preview container */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#0c0c0c] relative flex flex-col min-h-0"
      >
        {previewHtml ? (
          <iframe
            key={reloadKey}
            ref={iframeRef}
            srcDoc={previewHtml}
            className="w-full h-full border-none bg-[#0c0c0c]"
            title="Live Preview"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0c0c0c] text-neutral-500 text-sm gap-2 h-full">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span>Vite server compiling...</span>
          </div>
        )}

        {/* AI Auto-Fixing Loading Overlay Layer */}
        {isAutoFixing && (
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
        {!isAutoFixing && latestPreviewError && (
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
