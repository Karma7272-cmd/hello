import React, { useState, useEffect } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  FileJson, 
  FileText, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

export default function FileTree() {
  const { files, activeFile, openFile, deleteFile, addFile, renameFile } = useWorkspace();

  // Toggle state for directories
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "/src": true,
    "/public": true,
  });

  // Adding file / directory state
  const [isAdding, setIsAdding] = useState<{ type: "file" | "directory"; parentPath: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");

  // Renaming state
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Parse files into tree
  const buildTree = (): TreeNode[] => {
    const root: TreeNode = { name: "Root", path: "", type: "directory", children: [] };
    
    Object.keys(files).forEach((filePath) => {
      // Clean leading slash for split, but retain absolute path logic
      const parts = filePath.split("/").filter(Boolean);
      let current = root;
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = "/" + parts.slice(0, index + 1).join("/");
        
        let child = current.children?.find((c) => c.name === part);
        if (!child) {
          child = {
            name: part,
            path: currentPath,
            type: isLast ? "file" : "directory",
            children: isLast ? undefined : []
          };
          current.children?.push(child);
        }
        current = child;
      });
    });

    // Sort: Folders first, then files
    const sortTree = (node: TreeNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "directory" ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortTree);
      }
    };
    
    sortTree(root);
    return root.children || [];
  };

  const treeData = buildTree();

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !isAdding) return;

    let path = isAdding.parentPath === "/" 
      ? `/${newItemName.trim()}` 
      : `${isAdding.parentPath}/${newItemName.trim()}`;

    // Ensure double slashes are avoided
    path = path.replace(/\/+/g, "/");

    if (isAdding.type === "file") {
      let defaultContent = "";
      if (path.endsWith(".tsx") || path.endsWith(".ts")) {
        defaultContent = `import React from 'react';\n\nexport default function ${newItemName.split(".")[0]}() {\n  return (\n    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">\n      <h3 className="text-white font-medium">${newItemName.split(".")[0]}</h3>\n    </div>\n  );\n}`;
      } else if (path.endsWith(".css")) {
        defaultContent = `/* Styles for ${newItemName} */`;
      } else if (path.endsWith(".json")) {
        defaultContent = `{\n  "name": "${newItemName.split(".")[0]}"\n}`;
      }
      
      addFile(path, defaultContent);
      openFile(path);
    } else {
      // WebContainers simulate folder by creating a placeholder or just tracking expanding
      // In Sandpack, directories don't exist without a file, so we can create a dummy file
      const placeholderPath = `${path}/.keep`.replace(/\/+/g, "/");
      addFile(placeholderPath, "");
      setExpandedFolders(prev => ({ ...prev, [path]: true }));
    }

    setIsAdding(null);
    setNewItemName("");
  };

  const handleRenameSubmit = (oldPath: string) => {
    if (!renameValue.trim() || oldPath === renameValue) {
      setRenamingPath(null);
      return;
    }

    const parentParts = oldPath.split("/").slice(0, -1);
    let newPath = [...parentParts, renameValue.trim()].join("/");
    if (!newPath.startsWith("/")) newPath = "/" + newPath;

    renameFile(oldPath, newPath);

    setRenamingPath(null);
    setRenameValue("");
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".tsx") || fileName.endsWith(".jsx")) {
      return <FileCode className="w-4 h-4 text-indigo-400" />;
    }
    if (fileName.endsWith(".ts") || fileName.endsWith(".js")) {
      return <FileCode className="w-4 h-4 text-blue-400" />;
    }
    if (fileName.endsWith(".json")) {
      return <FileJson className="w-4 h-4 text-yellow-500" />;
    }
    if (fileName.endsWith(".css")) {
      return <FileText className="w-4 h-4 text-teal-400" />;
    }
    return <File className="w-4 h-4 text-neutral-400" />;
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = node.type === "directory";
    const isExpanded = expandedFolders[node.path];
    const isActive = activeFile === node.path;

    return (
      <div key={node.path} className="flex flex-col select-none">
        {/* Node Label */}
        <div 
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={cn(
            "group flex items-center justify-between py-1.5 pr-2 rounded-md text-xs cursor-pointer transition-colors relative",
            isActive && !isFolder ? "bg-[#252526] text-white" : "text-neutral-400 hover:bg-[#1a1a1a] hover:text-neutral-200"
          )}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              openFile(node.path);
            }
          }}
        >
          <div className="flex items-center gap-1.5 overflow-hidden flex-1">
            {isFolder ? (
              <span className="text-neutral-500">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ) : (
              <span className="w-3.5" /> // Spacer to align with directory chevrons
            )}
            
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-yellow-600/80 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-600/80 shrink-0" />
              )
            ) : (
              getFileIcon(node.name)
            )}

            {renamingPath === node.path ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(node.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(node.path);
                  if (e.key === "Escape") setRenamingPath(null);
                }}
                className="bg-[#2d2d2d] text-white text-xs px-1 border border-indigo-500 rounded focus:outline-none flex-1 py-0.5"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>

          {/* Actions Hover Overlays */}
          {!renamingPath && (
            <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
              {isFolder && (
                <>
                  <button 
                    onClick={() => setIsAdding({ type: "file", parentPath: node.path })}
                    className="p-1 hover:bg-[#2d2d2d] rounded text-neutral-400 hover:text-white"
                    title="New File"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsAdding({ type: "directory", parentPath: node.path })}
                    className="p-1 hover:bg-[#2d2d2d] rounded text-neutral-400 hover:text-white"
                    title="New Folder"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button 
                onClick={() => {
                  setRenamingPath(node.path);
                  setRenameValue(node.name);
                }}
                className="p-1 hover:bg-[#2d2d2d] rounded text-neutral-400 hover:text-white"
                title="Rename"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {/* Do not allow deleting root entry files like App.tsx or package.json easily without confirmation */}
              <button 
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${node.name}?`)) {
                    deleteFile(node.path);
                  }
                }}
                className="p-1 hover:bg-[#2d2d2d] rounded text-neutral-400 hover:text-red-400"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Children Render */}
        {isFolder && isExpanded && (
          <div className="flex flex-col">
            {/* Inline creation input */}
            {isAdding?.parentPath === node.path && (
              <form 
                onSubmit={handleCreateItem} 
                className="flex items-center gap-1.5 py-1 pr-2 rounded-md"
                style={{ paddingLeft: `${(depth + 1) * 12 + 20}px` }}
              >
                {isAdding.type === "file" ? (
                  <File className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                )}
                <input
                  type="text"
                  placeholder={isAdding.type === "file" ? "file.tsx" : "folder"}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onBlur={() => setIsAdding(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsAdding(null);
                  }}
                  className="bg-[#2d2d2d] text-white text-xs px-1 border border-indigo-500 rounded focus:outline-none w-full py-0.5"
                  autoFocus
                />
              </form>
            )}

            {node.children?.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[240px] shrink-0 bg-[#181818] border-r border-[#2d2d2d] flex flex-col h-full font-mono select-none">
      {/* Workspace Header */}
      <div className="h-10 px-3 border-b border-[#2d2d2d] flex items-center justify-between text-[11px] font-semibold text-neutral-400 tracking-wider">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>WORKSPACE</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsAdding({ type: "file", parentPath: "/" })}
            className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded transition-colors"
            title="New File at Root"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsAdding({ type: "directory", parentPath: "/" })}
            className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded transition-colors"
            title="New Folder at Root"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Workspace Files */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-0.5">
        {/* Root level inline creation input */}
        {isAdding?.parentPath === "/" && (
          <form 
            onSubmit={handleCreateItem} 
            className="flex items-center gap-1.5 py-1 pr-2 rounded-md pl-6"
          >
            {isAdding.type === "file" ? (
              <File className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            )}
            <input
              type="text"
              placeholder={isAdding.type === "file" ? "file.tsx" : "folder"}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => setIsAdding(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsAdding(null);
              }}
              className="bg-[#2d2d2d] text-white text-xs px-1 border border-indigo-500 rounded focus:outline-none w-full py-0.5"
              autoFocus
            />
          </form>
        )}

        {treeData.map(node => renderNode(node, 0))}
      </div>
    </div>
  );
}
