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

  return new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || ""
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
      model: "gemini-2.5-flash",
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

export async function generateWebsite(prompt: string): Promise<FileStructure> {
  try {
    const textResponse = await runLlmRequest(
      `Generate a complete multi-page React website based on this prompt: "${prompt}".
      
      TECHNICAL & SYNTAX REQUIREMENTS:
      1. Use React with TypeScript (tsx/ts files).
      2. Use Tailwind CSS for all styling (assume it's configured).
      3. Use 'react-router-dom' for multi-page navigation (prefer 'MemoryRouter' for the preview environment).
      4. Use 'lucide-react' for icons.
      5. The main entry point MUST be "/src/App.tsx".
      6. All imports MUST be valid relative paths (e.g., "./components/Header").
      7. CRITICAL SYNTAX INTEGRITY: Write 100% clean, valid, executable TypeScript and JSX code. Do NOT output invalid syntax such as stray colons (e.g., key:: value or obj = { : }), missing closing tags, unclosed quotes, or incomplete statements.
      
      Ensure the website is modern, responsive, and fully functional with clean styling and at least 3 pages if appropriate.`,
      {
        type: Type.ARRAY,
        description: "An array of generated file descriptors containing path and source content.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "The absolute file path starting with / (e.g. /src/App.tsx, /src/components/Header.tsx)"
            },
            content: {
              type: Type.STRING,
              description: "The complete source code content of the file."
            }
          },
          required: ["path", "content"]
        }
      },
      true
    );

    let text = textResponse || "[]";
    // Clean up potential markdown artifacts
    text = text.replace(/```json\n?|```/g, "").trim();
    
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      console.warn("Standard JSON parse failed, attempting regex-based cleanup...", parseErr);
      // Clean control characters and some unescaped quotes if any
      const cleaned = text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // remove control chars
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
      // Robust fallback if model outputs a standard record mapping
      Object.entries(parsed).forEach(([key, val]) => {
        let cleanPath = key;
        if (!cleanPath.startsWith("/")) {
          cleanPath = "/" + cleanPath;
        }
        files[cleanPath] = typeof val === "string" ? val : (val as any).code || JSON.stringify(val);
      });
    }
    
    // Basic validation: ensure an entry point or App file exists
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
      // Map first available file to App.tsx if missing
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
      // If message itself is JSON (like the SDK can sometimes emit)
      try {
        const parsedErr = JSON.parse(errorMsg);
        if (parsedErr?.error?.message) {
          errorMsg = parsedErr.error.message;
        }
      } catch (_) {}
      
      // Check properties on the error object
      if (e.status === 429 || e.status === "RESOURCE_EXHAUSTED" || e.code === 429) {
        isQuota = true;
      }
    } else {
      errorMsg = String(e);
    }

    // Inspect the error message and serialized representation for signatures of rate limiting/quota issues
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
Your task is to edit an existing React website's code to apply a specific change to a single element that the user selected/clicked on.

Here is the selected element the user wants to edit:
- Tag Name: ${elementInfo.tagName}
- ID: ${elementInfo.id || "None"}
- Tailwind Classes: ${elementInfo.className || "None"}
- Text Content: "${elementInfo.innerText || "None"}"
- Outer HTML representation: \`${elementInfo.outerHTML}\`

The user's instruction for this element is: "${instruction}"

Find the file (usually /src/App.tsx or a component) containing this element and edit the code to apply the requested changes (visual styling, text changes, structure, or simple handlers). Preserve all other parts of the website, its structure, other files, and imports. 

Return the COMPLETE updated file structure. Any files you do not modify MUST be returned completely unchanged.

Current files in the workspace:
${filesList}
`;

  try {
    const textResponse = await runLlmRequest(
      prompt,
      {
        type: Type.ARRAY,
        description: "An array of all files in the workspace (both modified and unmodified) containing path and complete source content.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "The absolute file path starting with / (e.g. /src/App.tsx, /src/components/Header.tsx)"
            },
            content: {
              type: Type.STRING,
              description: "The complete source code content of the file."
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
      // Ensure we keep any current files that the AI might have skipped
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
  
  // Fix string concatenation in import statements like 'react' + '-router-dom'
  cleaned = cleaned.replace(/from\s+['"]react['"]\s*\+\s*['"]-router-dom['"]/g, "from 'react-router-dom'");
  cleaned = cleaned.replace(/from\s+['"]([\w@\.\/-]+)['"]\s*\+\s*['"]([\w@\.\/-]+)['"]/g, (_, p1, p2) => `from '${p1}${p2}'`);
  cleaned = cleaned.replace(/import\(['"]([\w@\.\/-]+)['"]\s*\+\s*['"]([\w@\.\/-]+)['"]\)/g, (_, p1, p2) => `import('${p1}${p2}')`);

  // Fix escaped template literals or invalid quotes inside template strings
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

  const prompt = `You are an expert React, TypeScript, and Babel developer.
The React sandbox preview encountered compiler or runtime errors. Analyze the error message(s), locate ALL buggy or syntax-broken files in the workspace, fix them completely, and return the updated file(s).

ERROR DETAILS:
${errorMessage}

${errorContext ? `STACK TRACE / DETAILS:\n${errorContext}\n` : ""}

CURRENT WORKSPACE FILES:
${filesList}

STRICT CODE SYNTAX & INTEGRITY RULES:
1. Fix all syntax errors, missing semicolons, unclosed brackets/tags, and invalid imports across all files.
2. NEVER split package imports like 'react' + '-router-dom'. Use standard import strings: import { ... } from 'react-router-dom'.
3. Ensure all TypeScript interfaces, functions, JSX elements, and objects are syntactically valid and compile 100% cleanly.
4. Return a JSON array containing ONLY the file(s) that you modified to fix the issue(s).`;

  try {
    const textResponse = await runLlmRequest(
      prompt,
      {
        type: Type.ARRAY,
        description: "An array of ONLY modified files containing path and complete updated source content.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "The absolute file path starting with / (e.g. /src/App.tsx)"
            },
            content: {
              type: Type.STRING,
              description: "The complete updated source code content for this file."
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
    
    // Fallback: also sanitize current files to fix any string concatenation issues automatically
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
Your task is to update and edit the existing multi-page React website based on the user's instructions: "${instruction}".

TECHNICAL & SYNTAX REQUIREMENTS:
1. Use React with TypeScript (tsx/ts files).
2. Use Tailwind CSS for all styling (assume it's configured).
3. Use 'react-router-dom' for multi-page navigation (prefer 'MemoryRouter' for the preview environment).
4. Use 'lucide-react' for icons.
5. All imports should be relative.
6. CRITICAL SYNTAX INTEGRITY: Write 100% clean, valid, executable TypeScript and JSX code. Do NOT output invalid syntax such as stray colons, missing closing tags, unclosed quotes, or malformed object properties.

Return the COMPLETE updated file structure. Any files you do not modify MUST be returned completely unchanged.

Current files in the workspace:
${filesList}
`;

  try {
    const textResponse = await runLlmRequest(
      prompt,
      {
        type: Type.ARRAY,
        description: "An array of all files in the workspace (both modified and unmodified) containing path and complete source content.",
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: "The absolute file path starting with / (e.g. /src/App.tsx, /src/components/Header.tsx)"
            },
            content: {
              type: Type.STRING,
              description: "The complete source code content of the file."
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
