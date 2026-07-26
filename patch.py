def process_file():
    with open("src/context/WorkspaceContext.tsx", "r", encoding="utf-8") as f:
        content = f.read()
    
    start_str = "  const runPreview = useCallback("
    next_func_str = "  const restartDevServer = useCallback("
    
    start_idx = content.find(start_str)
    end_idx = content.find(next_func_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find start or end")
        return
        
    new_runPreview = """  const runPreview = useCallback(async () => {
    addLog("⚡ Booting WebContainer...", "command");
    setIsBooted(false);
    setIsInstalling(true);
    
    try {
      const { getWebContainer } = await import("../lib/webcontainer");
      const wc = await getWebContainer();
      
      // Convert files map to WebContainer file system tree
      const tree = {};
      
      const addFileToTree = (path, contents) => {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const parts = cleanPath.split('/').filter(Boolean);
        let current = tree;
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = { directory: {} };
          }
          current = current[part].directory;
        }
        
        const fileName = parts[parts.length - 1];
        if (fileName) {
          current[fileName] = {
            file: {
              contents: contents
            }
          };
        }
      };

      for (const [path, data] of Object.entries(files)) {
        addFileToTree(path, data.code);
      }
      
      addLog("Mounting files to virtual filesystem...", "info");
      await wc.mount(tree);
      
      setIsBooted(true);
      
      // Install dependencies
      addLog("npm install", "command");
      const installProcess = await wc.spawn("npm", ["install"]);
      
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            addLog(data, "output");
          }
        })
      );
      
      const installExitCode = await installProcess.exit;
      setIsInstalling(false);
      
      if (installExitCode !== 0) {
        addLog("❌ npm install failed", "error");
        return;
      }
      
      // Start dev server
      addLog("npm run dev", "command");
      const devProcess = await wc.spawn("npm", ["run", "dev"]);
      
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            addLog(data, "output");
          }
        })
      );
      
      // Listen for server ready
      wc.on('server-ready', (port, url) => {
        addLog(`Server ready on port ${port}: ${url}`, "success");
        setPreviewUrl(url);
        setPreviewHtml(""); // Clear old iframe doc
        setIsRunning(true);
      });
      
      wc.on('error', (err) => {
        addLog(`WebContainer error: ${err.message}`, "error");
      });
      
    } catch (err) {
      addLog(`❌ Boot error: ${err.message}`, "error");
      setLatestPreviewError({ projectId: activeProjectId || "default", message: err.message });
      setIsInstalling(false);
      setIsBooted(false);
    }
  }, [files, activeProjectId, addLog]);

"""
    
    new_content = content[:start_idx] + new_runPreview + content[end_idx:]
    
    with open("src/context/WorkspaceContext.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("Successfully replaced runPreview")

process_file()
