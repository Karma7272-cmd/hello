// Real AI Model & Key Pool Load Balancer Engine for AI Studio Remix IDE

export type LoadBalancerStrategy = "WEIGHTED_ROUND_ROBIN" | "LEAST_LATENCY" | "FAILOVER_PRIMARY" | "KEY_POOL_ROTATION";

export interface AINode {
  id: string;
  name: string;
  provider: "google" | "openai" | "anthropic" | "deepseek";
  modelId: string;
  weight: number; // 1 - 100
  status: "online" | "degraded" | "offline";
  avgLatencyMs: number;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  lastUsedAt?: number;
  lastErrorMsg?: string;
  isCustomKey?: boolean;
  apiKey?: string;
}

export interface LoadBalancerLog {
  id: string;
  timestamp: number;
  nodeId: string;
  nodeName: string;
  strategyUsed: LoadBalancerStrategy;
  latencyMs: number;
  success: boolean;
  error?: string;
  promptSnippet: string;
  failoverFrom?: string;
}

class AILoadBalancerService {
  private nodes: AINode[] = [
    {
      id: "node-gemini-3.6-flash",
      name: "Gemini 3.6 Flash",
      provider: "google",
      modelId: "gemini-3.6-flash",
      weight: 50,
      status: "online",
      avgLatencyMs: 380,
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
    },
    {
      id: "node-gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      provider: "google",
      modelId: "gemini-2.5-flash",
      weight: 30,
      status: "online",
      avgLatencyMs: 290,
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
    },
    {
      id: "node-gemini-2.5-pro",
      name: "Gemini 2.5 Pro (Reasoning)",
      provider: "google",
      modelId: "gemini-2.5-pro",
      weight: 15,
      status: "online",
      avgLatencyMs: 720,
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
    },
    {
      id: "node-gemini-2.0-flash",
      name: "Gemini 2.0 Flash (Backup)",
      provider: "google",
      modelId: "gemini-2.0-flash",
      weight: 5,
      status: "online",
      avgLatencyMs: 310,
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
    }
  ];

  private strategy: LoadBalancerStrategy = "WEIGHTED_ROUND_ROBIN";
  private roundRobinIndex: number = 0;
  private keyPool: string[] = [];
  private currentKeyIndex: number = 0;
  private logs: LoadBalancerLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedStrat = localStorage.getItem("ai_lb_strategy");
      if (savedStrat) {
        this.strategy = savedStrat as LoadBalancerStrategy;
      }
      const savedKeys = localStorage.getItem("ai_lb_key_pool");
      if (savedKeys) {
        this.keyPool = JSON.parse(savedKeys);
      }
      const savedNodes = localStorage.getItem("ai_lb_nodes");
      if (savedNodes) {
        const parsed = JSON.parse(savedNodes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.nodes = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load LoadBalancer state", e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem("ai_lb_strategy", this.strategy);
      localStorage.setItem("ai_lb_key_pool", JSON.stringify(this.keyPool));
      localStorage.setItem("ai_lb_nodes", JSON.stringify(this.nodes));
    } catch (e) {
      console.error("Failed to save LoadBalancer state", e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((l) => l());
  }

  public getNodes(): AINode[] {
    return [...this.nodes];
  }

  public getStrategy(): LoadBalancerStrategy {
    return this.strategy;
  }

  public setStrategy(strategy: LoadBalancerStrategy) {
    this.strategy = strategy;
    this.notify();
  }

  public getKeyPool(): string[] {
    return [...this.keyPool];
  }

  public addKeyToPool(key: string) {
    const trimmed = key.trim();
    if (trimmed && !this.keyPool.includes(trimmed)) {
      this.keyPool.push(trimmed);
      this.notify();
    }
  }

  public removeKeyFromPool(index: number) {
    if (index >= 0 && index < this.keyPool.length) {
      this.keyPool.splice(index, 1);
      this.notify();
    }
  }

  public getLogs(): LoadBalancerLog[] {
    return [...this.logs].slice(-50).reverse();
  }

  public toggleNodeStatus(nodeId: string) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.status = node.status === "online" ? "offline" : "online";
      this.notify();
    }
  }

  public updateNodeWeight(nodeId: string, weight: number) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.weight = Math.max(1, Math.min(100, weight));
      this.notify();
    }
  }

  // Pick next API Key from key pool or fallback to process.env / custom key
  public getNextApiKey(fallbackKey?: string): string {
    if (this.keyPool.length > 0) {
      const key = this.keyPool[this.currentKeyIndex % this.keyPool.length];
      this.currentKeyIndex++;
      return key;
    }
    return fallbackKey || process.env.GEMINI_API_KEY || "";
  }

  // Select node according to active balancing strategy
  public selectNode(): AINode {
    const onlineNodes = this.nodes.filter((n) => n.status !== "offline");
    if (onlineNodes.length === 0) {
      // Fallback to primary even if offline
      return this.nodes[0];
    }

    if (this.strategy === "LEAST_LATENCY") {
      // Sort by avg latency ascending
      const sorted = [...onlineNodes].sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
      return sorted[0];
    }

    if (this.strategy === "FAILOVER_PRIMARY") {
      // Always select primary online node first
      return onlineNodes[0];
    }

    // Default: WEIGHTED_ROUND_ROBIN
    let totalWeight = onlineNodes.reduce((sum, n) => sum + n.weight, 0);
    if (totalWeight <= 0) totalWeight = 1;

    let random = Math.random() * totalWeight;
    for (const node of onlineNodes) {
      if (random < node.weight) {
        return node;
      }
      random -= node.weight;
    }

    return onlineNodes[0];
  }

  // Record metrics after request completion
  public recordResult(
    nodeId: string,
    latencyMs: number,
    success: boolean,
    promptSnippet: string,
    error?: string,
    failoverFrom?: string
  ) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.totalRequests++;
      node.lastUsedAt = Date.now();

      if (success) {
        node.successCount++;
        // Moving average for latency
        node.avgLatencyMs = Math.round(node.avgLatencyMs * 0.7 + latencyMs * 0.3);
        if (node.status === "degraded") {
          node.status = "online";
        }
      } else {
        node.errorCount++;
        node.lastErrorMsg = error;
        if (node.errorCount >= 2 && node.status === "online") {
          node.status = "degraded";
        }
      }
    }

    this.logs.push({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      nodeId,
      nodeName: node ? node.name : nodeId,
      strategyUsed: this.strategy,
      latencyMs,
      success,
      error,
      promptSnippet: promptSnippet.substring(0, 80) + (promptSnippet.length > 80 ? "..." : ""),
      failoverFrom
    });

    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    this.notify();
  }

  // Active Health Ping Prober for all nodes
  public async probeAllNodes(getAIInstance: (apiKey?: string) => any): Promise<Record<string, { latency: number; ok: boolean }>> {
    const results: Record<string, { latency: number; ok: boolean }> = {};

    await Promise.all(
      this.nodes.map(async (node) => {
        const start = Date.now();
        try {
          const key = this.getNextApiKey();
          const ai = getAIInstance(key);
          const res = await ai.models.generateContent({
            model: node.modelId,
            contents: "ping",
            config: { maxOutputTokens: 5 }
          });
          const latency = Date.now() - start;
          const ok = !!res.text;
          
          node.avgLatencyMs = Math.round(node.avgLatencyMs * 0.5 + latency * 0.5);
          node.status = ok ? "online" : "degraded";
          results[node.id] = { latency, ok };
        } catch (err) {
          const latency = Date.now() - start;
          node.status = "degraded";
          results[node.id] = { latency, ok: false };
        }
      })
    );

    this.notify();
    return results;
  }
}

export const aiLoadBalancer = new AILoadBalancerService();
