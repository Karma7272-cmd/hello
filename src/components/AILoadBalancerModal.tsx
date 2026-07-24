import React, { useState, useEffect } from "react";
import { 
  X, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Key, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Trash2,
  BarChart2,
  Clock,
  Radio,
  ArrowRight
} from "lucide-react";
import { aiLoadBalancer, AINode, LoadBalancerStrategy, LoadBalancerLog } from "../lib/aiLoadBalancer";
import { getAI } from "../lib/gemini";

interface AILoadBalancerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AILoadBalancerModal: React.FC<AILoadBalancerModalProps> = ({ isOpen, onClose }) => {
  const [nodes, setNodes] = useState<AINode[]>([]);
  const [strategy, setStrategy] = useState<LoadBalancerStrategy>("WEIGHTED_ROUND_ROBIN");
  const [keyPool, setKeyPool] = useState<string[]>([]);
  const [newKey, setNewKey] = useState("");
  const [logs, setLogs] = useState<LoadBalancerLog[]>([]);
  const [isProbing, setIsProbing] = useState(false);
  const [probeStatusText, setProbeStatusText] = useState("");

  useEffect(() => {
    const refresh = () => {
      setNodes(aiLoadBalancer.getNodes());
      setStrategy(aiLoadBalancer.getStrategy());
      setKeyPool(aiLoadBalancer.getKeyPool());
      setLogs(aiLoadBalancer.getLogs());
    };

    refresh();
    const unsubscribe = aiLoadBalancer.subscribe(refresh);
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStrategyChange = (newStrat: LoadBalancerStrategy) => {
    aiLoadBalancer.setStrategy(newStrat);
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKey.trim()) {
      aiLoadBalancer.addKeyToPool(newKey.trim());
      setNewKey("");
    }
  };

  const handleRunHealthProbe = async () => {
    setIsProbing(true);
    setProbeStatusText("Pinging all AI nodes in parallel...");
    try {
      await aiLoadBalancer.probeAllNodes((key) => getAI(key));
      setProbeStatusText("Probe complete! Node latencies updated.");
    } catch (e) {
      setProbeStatusText("Health probe error: " + String(e));
    } finally {
      setIsProbing(false);
      setTimeout(() => setProbeStatusText(""), 4000);
    }
  };

  const totalReqs = nodes.reduce((sum, n) => sum + n.totalRequests, 0);
  const totalSuccess = nodes.reduce((sum, n) => sum + n.successCount, 0);
  const overallSuccessRate = totalReqs > 0 ? Math.round((totalSuccess / totalReqs) * 100) : 100;
  const onlineCount = nodes.filter((n) => n.status === "online").length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#121215] border border-neutral-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800/80 flex items-center justify-between bg-[#16161a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">AI Model Load Balancer Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active Real-Time
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Automatic multi-node traffic distribution, latency routing, and zero-downtime failover for AI code generation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-neutral-300 flex-1">
          {/* Real-time Overview Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#18181c] border border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">Active Nodes</p>
                <p className="text-sm font-bold text-white">{onlineCount} / {nodes.length} Online</p>
              </div>
            </div>

            <div className="bg-[#18181c] border border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">Success Rate</p>
                <p className="text-sm font-bold text-emerald-400">{overallSuccessRate}%</p>
              </div>
            </div>

            <div className="bg-[#18181c] border border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">Total Requests</p>
                <p className="text-sm font-bold text-white">{totalReqs} Served</p>
              </div>
            </div>

            <div className="bg-[#18181c] border border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">Avg Latency</p>
                <p className="text-sm font-bold text-white">
                  {nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.avgLatencyMs, 0) / nodes.length) : 0} ms
                </p>
              </div>
            </div>
          </div>

          {/* Load Balancing Strategy Picker */}
          <div className="bg-[#18181c] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Load Balancing Algorithm</h3>
              </div>
              <button
                onClick={handleRunHealthProbe}
                disabled={isProbing}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? "animate-spin" : ""}`} />
                <span>{isProbing ? "Probing..." : "Run Health Probe"}</span>
              </button>
            </div>

            {probeStatusText && (
              <p className="text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-2 font-mono">
                {probeStatusText}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                {
                  id: "WEIGHTED_ROUND_ROBIN",
                  title: "Weighted Round Robin",
                  desc: "Distributes requests across models proportionally based on assigned weights."
                },
                {
                  id: "LEAST_LATENCY",
                  title: "Least Latency (Fastest)",
                  desc: "Dynamically picks the model node with the lowest measured response latency."
                },
                {
                  id: "FAILOVER_PRIMARY",
                  title: "Failover Primary First",
                  desc: "Always sends to primary node; automatically fails over to backup on error/rate-limit."
                }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleStrategyChange(opt.id as LoadBalancerStrategy)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    strategy === opt.id
                      ? "bg-indigo-950/50 border-indigo-500/80 text-white shadow-md shadow-indigo-500/10"
                      : "bg-[#131316] border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{opt.title}</span>
                      {strategy === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] leading-relaxed text-neutral-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Node Pool Table */}
          <div className="bg-[#18181c] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Model Pool & Weight Nodes</h3>
              </div>
              <span className="text-[11px] text-neutral-400">4 Active Models in Pool</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] uppercase text-neutral-500 font-bold tracking-wider">
                    <th className="py-2.5 px-3">Node Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Avg Latency</th>
                    <th className="py-2.5 px-3">Requests / Success</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{node.name}</span>
                          <span className="text-[10px] font-mono text-neutral-500 font-normal">({node.modelId})</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          node.status === "online" 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                            : node.status === "degraded" 
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" 
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            node.status === "online" ? "bg-emerald-400" : node.status === "degraded" ? "bg-amber-400 animate-pulse" : "bg-red-400"
                          }`} />
                          <span className="capitalize">{node.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-neutral-200">
                        {node.avgLatencyMs} ms
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-white font-bold">{node.totalRequests}</span>
                          <span className="text-neutral-500">|</span>
                          <span className="text-emerald-400 font-bold">{node.successCount} ok</span>
                          {node.errorCount > 0 && (
                            <span className="text-red-400 font-bold">({node.errorCount} err)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={node.weight}
                            onChange={(e) => aiLoadBalancer.updateNodeWeight(node.id, parseInt(e.target.value))}
                            className="w-20 accent-indigo-500 cursor-pointer"
                          />
                          <span className="font-mono text-indigo-300 font-bold w-6">{node.weight}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => aiLoadBalancer.toggleNodeStatus(node.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            node.status === "offline"
                              ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40"
                              : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
                          }`}
                        >
                          {node.status === "offline" ? "Enable" : "Disable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API Key Pool Manager */}
          <div className="bg-[#18181c] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Backup API Key Pool (Quota Load Balancing)</h3>
            </div>
            <p className="text-[11px] text-neutral-400">
              Add multiple Gemini API keys to automatically rotate requests and prevent quota rate limits (429).
            </p>

            <form onSubmit={handleAddKey} className="flex gap-2">
              <input
                type="password"
                placeholder="Enter secondary Gemini API key (AIzaSy...)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 bg-[#121215] border border-neutral-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Key</span>
              </button>
            </form>

            {keyPool.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {keyPool.map((k, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#131316] border border-neutral-800 rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 font-mono text-neutral-300">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Key #{idx + 1}: {k.substring(0, 8)}...{k.substring(k.length - 4)}</span>
                    </div>
                    <button
                      onClick={() => aiLoadBalancer.removeKeyFromPool(idx)}
                      className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500 italic bg-[#121215] p-2.5 rounded-lg border border-neutral-800/50">
                Using default environment key. Add backup keys above for key rotation.
              </p>
            )}
          </div>

          {/* Traffic Logs & Failover Events */}
          <div className="bg-[#18181c] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">Real-Time Load Balancer Traffic Logs</h3>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Last {logs.length} Requests</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="bg-[#131316] border border-neutral-800/80 rounded-lg p-2.5 text-[11px] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {log.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{log.nodeName}</span>
                          {log.failoverFrom && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold">
                              Failed over from {log.failoverFrom}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 truncate font-mono">{log.promptSnippet}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono">
                      <span className="text-neutral-400">{log.latencyMs} ms</span>
                      <span className="text-neutral-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-[11px] italic text-center py-4">
                  No load-balanced AI traffic recorded yet. Generate website code or edit prompts to see live routing.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-[#16161a] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Load Balancer Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
