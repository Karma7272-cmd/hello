import { GoogleGenAI, Type } from "@google/genai";

export function getAI(overrideApiKey?: string): GoogleGenAI {
  if (overrideApiKey && overrideApiKey.trim()) {
    return new GoogleGenAI({ apiKey: overrideApiKey.trim() });
  }

  try {
    const savedConnectors = localStorage.getItem("ai-builder-connectors-v1");
    if (savedConnectors) {
      const parsed = JSON.parse(savedConnectors);
      const geminiConnector = parsed.find((c: any) => c.id === "gemini");
      if (geminiConnector && geminiConnector.enabled && geminiConnector.apiKey && geminiConnector.apiKey.trim()) {
        return new GoogleGenAI({ 
          apiKey: geminiConnector.apiKey.trim()
        });
      }
    }
  } catch (e) {
    console.error("Error reading custom Gemini key from cache", e);
  }

  const keyToUse = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  return new GoogleGenAI({ 
    apiKey: keyToUse
  });
}

export async function runLlmRequest(
  prompt: string,
  responseSchema?: any,
  isJson: boolean = true
): Promise<string> {
  const selectedModelId = localStorage.getItem("ai-builder-selected-model-v1") || "gemini";
  const savedConnectors = localStorage.getItem("ai-builder-connectors-v1");
  let selectedConnector: any = null;

  if (savedConnectors) {
    try {
      const parsed = JSON.parse(savedConnectors);
      selectedConnector = parsed.find((c: any) => c.id === selectedModelId);
    } catch (e) {
      console.error("Error parsing connectors in runLlmRequest", e);
    }
  }

  const customKey = (selectedConnector && selectedConnector.enabled) ? selectedConnector.apiKey?.trim() : undefined;

  // 1. Standard Gemini AI
  if (selectedModelId === "gemini" || !customKey) {
    const ai = getAI(customKey);
    const config: any = {};
    if (isJson) {
      config.responseMimeType = "application/json";
      if (responseSchema) {
        config.responseSchema = responseSchema;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config
    });

    return response.text || "";
  }

  // Helper system instruction extension to enforce JSON structure in non-native schema providers
  const finalPrompt = prompt + (isJson ? "\n\nIMPORTANT: Return ONLY raw, valid JSON. Do not write any markdown code blocks, explanations, or leading/trailing text. Response must strictly be a JSON object or array." : "");

  // 2. ChatGPT (OpenAI)
  if (selectedModelId === "chatgpt") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${customKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: finalPrompt }],
        response_format: isJson ? { type: "json_object" } : undefined
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // 3. Claude (Anthropic)
  if (selectedModelId === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": customKey,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true"
      } as any,
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8000,
        messages: [{ role: "user", content: finalPrompt }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || "";
  }

  // 4. DeepSeek
  if (selectedModelId === "deepseek") {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${customKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: finalPrompt }],
        response_format: isJson ? { type: "json_object" } : undefined
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DeepSeek API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // 5. Mistral AI
  if (selectedModelId === "mistral") {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${customKey}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: finalPrompt }],
        response_format: isJson ? { type: "json_object" } : undefined
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Mistral AI API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // 6. Qwen (Alibaba)
  if (selectedModelId === "qwen") {
    const res = await fetch("https://api.dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${customKey}`
      },
      body: JSON.stringify({
        model: "qwen-max",
        messages: [{ role: "user", content: finalPrompt }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Qwen API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // Standard Fallback to default Gemini
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt
  });
  return response.text || "";
}

export interface FileStructure {
  [path: string]: string;
}

// ============================================================================
// OPTIMIZED PROMPT TEMPLATES
// ============================================================================

const CORE_TECH_REQUIREMENTS = `CORE TECHNICAL REQUIREMENTS:
- Language: React + TypeScript (tsx/ts)
- Styling: Tailwind CSS only (no inline styles)
- Routing: react-router-dom with MemoryRouter
- Icons: lucide-react
- Entry point: /src/App.tsx (required)
- Import paths: Always use relative paths (e.g., "./components/Header")`;

const CRITICAL_SYNTAX_RULES = `CRITICAL SYNTAX RULES (NON-NEGOTIABLE):
- Generate 100% valid, executable TypeScript/JSX
- NO stray colons, unclosed tags, unmatched braces, or unescaped quotes
- NO string concatenation in imports (e.g., 'react' + '-router-dom' is FORBIDDEN)
- NO split module names across lines or expressions
- All closing tags and parentheses must match opening ones
- All JSX elements must be properly closed (<Component /> or <Component></Component>)
- No trailing/leading spaces in JSON output`;

const SCHEMA_INSTRUCTIONS = `OUTPUT FORMAT:
Return a JSON array with objects containing "path" (absolute, starting with /) and "content" (full file code).
Example: [{"path": "/src/App.tsx", "content": "import React from 'react'; ..."}]`;

export async function generateWebsite(prompt: string): Promise<FileStructure> {
  try {
    const textResponse = await runLlmRequest(
      `Generate a complete, multi-page React website based on this requirement: "${prompt}"
      
${CORE_TECH_REQUIREMENTS}

DESIGN PRINCIPLES:
- Modern, responsive, and accessible
- At least 3 pages if appropriate for the requirement
- Clean component structure with proper separation of concerns
- Use Tailwind for consistent, professional styling
- Ensure smooth routing between pages

${CRITICAL_SYNTAX_RULES}

${SCHEMA_INSTRUCTIONS}`,
      {
        type: Type.ARRAY,
        description: "An array of generated file descriptors containing path and source content.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "Absolute file path starting with / (e.g., /src/App.tsx)"
            },
            content: {
              type: Type.STRING,
              description: "Complete, valid source code for this file"
            }
          },
          required: ["path", "content"]
        }
      },
      true
    );

    let text = textResponse || "[]";
    text = text.replace(/```json\n?|```/g, "").trim();
    
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      console.warn("Standard JSON parse failed, attempting cleanup...", parseErr);
      const cleaned = text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    }

    const files: FileStructure = {};

    if (Array.isArray(parsed)) {
      parsed.forEach((item: any) => {
        if (item && typeof item.path === "string" && typeof item.content === "string") {
          let cleanPath = item.path;
          if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
          }
          files[cleanPath] = item.content;
        }
      });
    } else if (typeof parsed === "object" && parsed !== null) {
      Object.entries(parsed).forEach(([key, val]) => {
        let cleanPath = key;
        if (!cleanPath.startsWith("/")) {
          cleanPath = "/" + cleanPath;
        }
        files[cleanPath] = typeof val === "string" ? val : (val as any).code || JSON.stringify(val);
      });
    }
    
    const hasEntryPoint = Object.keys(files).some(path => {
      const p = path.toLowerCase();
      return p.endsWith("app.tsx") || 
             p.endsWith("app.jsx") || 
             p.endsWith("app.js") || 
             p.endsWith("main.tsx") || 
             p.endsWith("index.tsx") || 
             p.endsWith("index.js") || 
             p.endsWith("index.jsx");
    });

    if (!hasEntryPoint && Object.keys(files).length > 0) {
      const firstPath = Object.keys(files)[0];
      files["/src/App.tsx"] = files[firstPath];
    }
    
    return files;
  } catch (e: any) {
    console.error("Generation error:", e);
    
    let errorMsg = "";
    let isQuota = false;
    
    if (e && typeof e === "object") {
      errorMsg = e.message || "";
      try {
        const parsedErr = JSON.parse(errorMsg);
        if (parsedErr?.error?.message) {
          errorMsg = parsedErr.error.message;
        }
      } catch (_) {}
      
      if (e.status === 429 || e.status === "RESOURCE_EXHAUSTED" || e.code === 429) {
        isQuota = true;
      }
    } else {
      errorMsg = String(e);
    }

    const serialized = JSON.stringify(e);
    if (
      errorMsg.includes("429") || 
      errorMsg.toLowerCase().includes("quota") || 
      errorMsg.includes("RESOURCE_EXHAUSTED") ||
      serialized.includes("RESOURCE_EXHAUSTED") ||
      serialized.includes("429") ||
      serialized.toLowerCase().includes("quota")
    ) {
      isQuota = true;
    }

    if (isQuota) {
      throw new Error(
        "Gemini API Quota/Rate Limit Exceeded (HTTP 429). You have exceeded your current Google AI Studio free-tier quota or rate limit. " +
        "Please check your API key, plan, and billing details in Google AI Studio (https://aistudio.google.com/), or wait a short moment and try again."
      );
    }

    if (
      errorMsg.includes("403") ||
      errorMsg.includes("PERMISSION_DENIED") ||
      serialized.includes("PERMISSION_DENIED") ||
      serialized.includes("403")
    ) {
      throw new Error(
        "Gemini API Permission Denied (HTTP 403). Please verify your API Key permissions or configure a custom API Key in the Cloud Connectors menu."
      );
    }
    
    throw new Error(errorMsg || "An unexpected error occurred during synthesis.");
  }
}

export async function editElementWithAI(
  currentFiles: FileStructure,
  elementInfo: {
    tagName: string;
    id: string;
    className: string;
    innerText: string;
    outerHTML: string;
    parentTag?: string | null;
  },
  instruction: string
): Promise<FileStructure> {
  const filesList = Object.entries(currentFiles)
    .map(([path, data]) => `--- FILE: ${path} ---\n${data}\n`)
    .join("\n");

  const prompt = `You are an expert React and Tailwind developer.
Your task: Edit the selected HTML element in the existing React website to apply the user's changes.

SELECTED ELEMENT:
- Tag: ${elementInfo.tagName}
- ID: ${elementInfo.id || "none"}
- Classes: ${elementInfo.className || "none"}
- Content: "${elementInfo.innerText || "none"}"
- Parent Tag: ${elementInfo.parentTag || "none"}

USER INSTRUCTION: "${instruction}"

REQUIREMENTS:
- Locate and modify ONLY the target element
- Preserve all other code, structure, and files unchanged
- Return the COMPLETE updated workspace

${CORE_TECH_REQUIREMENTS}
${CRITICAL_SYNTAX_RULES}
${SCHEMA_INSTRUCTIONS}

CURRENT FILES:
${filesList}`;

  try {
    const textResponse = await runLlmRequest(
      prompt,
      {
        type: Type.ARRAY,
        description: "Array of all files (modified and unmodified) with complete source content.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "Absolute file path starting with /"
            },
            content: {
              type: Type.STRING,
              description: "Complete file source code"
            }
          },
          required: ["path", "content"]
        }
      },
      true
    );

    let text = textResponse || "[]";
    text = text.replace(/```json\n?|```/g, "").trim();
    
    const parsed = JSON.parse(text);
    const files: FileStructure = {};

    if (Array.isArray(parsed)) {
      parsed.forEach((item: any) => {
        if (item && typeof item.path === "string" && typeof item.content === "string") {
          let cleanPath = item.path;
          if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
          }
          files[cleanPath] = item.content;
        }
      });
    }

    if (Object.keys(files).length > 0) {
      const merged: FileStructure = { ...currentFiles };
      Object.entries(files).forEach(([path, content]) => {
        merged[path] = content;
      });
      return merged;
    }
    return currentFiles;
  } catch (e: any) {
    console.error("AI Element edit error:", e);
    let errorMsg = e.message || String(e);
    if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(
        "Gemini API Quota/Rate Limit Exceeded (HTTP 429). Please wait a short moment and try again, or configure your own key."
      );
    }
    throw e;
  }
}

export function cleanCodeSyntax(code: string): string {
  if (!code) return "";
  let cleaned = code;
  
  cleaned = cleaned.replace(/from\s+['"]react['"]\s*\+\s*['"]-router-dom['"]/g, "from 'react-router-dom'");
  cleaned = cleaned.replace(/from\s+['"]([\w@\.\/-]+)['"]\s*\+\s*['"]([\w@\.\/-]+)['"]/g, (_, p1, p2) => `from '${p1}${p2}'`);
  cleaned = cleaned.replace(/import\(['"]([\w@\.\/-]+)['"]\s*\+\s*['"]([\w@\.\/-]+)['"]\)/g, (_, p1, p2) => `import('${p1}${p2}')`);
  cleaned = cleaned.replace(/\\`hsla\(\\ \${/g, "`hsla(${");
  
  return cleaned;
}

export async function autoFixErrorWithAI(
  currentFiles: FileStructure,
  errorMessage: string,
  errorContext?: string
): Promise<FileStructure> {
  const filesList = Object.entries(currentFiles)
    .map(([path, data]) => `--- FILE: ${path} ---\n${cleanCodeSyntax(data)}\n`)
    .join("\n");

  const prompt = `You are an expert React, TypeScript, and module system specialist.
TASK: Fix all compiler and runtime errors in the React workspace.

ERROR INFORMATION:
${errorMessage}
${errorContext ? `\nDETAILS:\n${errorContext}` : ""}

DEBUGGING APPROACH:
1. Identify the root cause(s) of the error(s)
2. Fix ALL syntax errors, broken imports, and logic issues
3. Validate that fixes don't introduce new errors
4. Return ONLY modified files

${CRITICAL_SYNTAX_RULES}

RETURN FORMAT:
JSON array containing ONLY the corrected files:
[{"path": "/src/App.tsx", "content": "fixed code..."}]

CURRENT WORKSPACE:
${filesList}`;

  try {
    const textResponse = await runLlmRequest(
      prompt,
      {
        type: Type.ARRAY,
        description: "Array of ONLY modified files with corrected source code.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "Absolute file path"
            },
            content: {
              type: Type.STRING,
              description: "Corrected source code"
            }
          },
          required: ["path", "content"]
        }
      },
      true
    );

    let text = textResponse || "[]";
    text = text.replace(/```json\n?|```/g, "").trim();
    
    let parsed: any = [];
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      const cleaned = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      const merged: FileStructure = { ...currentFiles };
      parsed.forEach((item: any) => {
        if (item && typeof item.path === "string" && typeof item.content === "string") {
          let cleanPath = item.path.trim();
          if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
          }
          merged[cleanPath] = cleanCodeSyntax(item.content);
        }
      });
      return merged;
    }
    
    const cleanedCurrent: FileStructure = {};
    Object.entries(currentFiles).forEach(([p, c]) => {
      cleanedCurrent[p] = cleanCodeSyntax(c);
    });
    return cleanedCurrent;
  } catch (e: any) {
    console.error("AI Auto Fix execution error:", e);
    let errorMsg = e.message || String(e);
    if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(
        "Gemini API Quota/Rate Limit Exceeded (HTTP 429). Please wait a short moment and try again, or configure your own key."
      );
    }
    throw e;
  }
}

export async function editWebsiteWithAI(
  currentFiles: FileStructure,
  instruction: string
): Promise<FileStructure> {
  const filesList = Object.entries(currentFiles)
    .map(([path, data]) => `--- FILE: ${path} ---\n${data}\n`)
    .join("\n");

  const prompt = `You are an expert React and Tailwind developer.
TASK: Update the existing React website based on the user's instruction: "${instruction}"

REQUIREMENTS:
- Implement the requested changes
- Preserve all unmodified files completely unchanged
- Return the COMPLETE updated workspace

${CORE_TECH_REQUIREMENTS}

DESIGN & QUALITY:
- Maintain existing design language and component patterns
- Use Tailwind for any new styling
- Ensure responsive design
- Follow the existing code structure

${CRITICAL_SYNTAX_RULES}

${SCHEMA_INSTRUCTIONS}

CURRENT WORKSPACE:
${filesList}`;

  try {
    const textResponse = await runLlmRequest(
      prompt,
      {
        type: Type.ARRAY,
        description: "Array of all files (modified and unmodified) with complete source content.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "Absolute file path starting with /"
            },
            content: {
              type: Type.STRING,
              description: "Complete file source code"
            }
          },
          required: ["path", "content"]
        }
      },
      true
    );

    let text = textResponse || "[]";
    text = text.replace(/```json\n?|```/g, "").trim();
    
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      const cleaned = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    const files: FileStructure = {};
    if (Array.isArray(parsed)) {
      parsed.forEach((item: any) => {
        if (item && typeof item.path === "string" && typeof item.content === "string") {
          let cleanPath = item.path;
          if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
          }
          files[cleanPath] = item.content;
        }
      });
    }

    if (Object.keys(files).length > 0) {
      const merged: FileStructure = { ...currentFiles };
      Object.entries(files).forEach(([path, content]) => {
        merged[path] = content;
      });
      return merged;
    }
    return currentFiles;
  } catch (e: any) {
    console.error("AI Website Edit execution error:", e);
    let errorMsg = e.message || String(e);
    if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(
        "Gemini API Quota/Rate Limit Exceeded (HTTP 429). Please wait a short moment and try again, or configure your own key."
      );
    }
    throw e;
  }
}