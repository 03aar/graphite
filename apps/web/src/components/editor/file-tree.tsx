'use client';

import { useState } from 'react';
import { File as FileType, FileTree as FileTreeType } from '@leafit/shared';
import { FileText, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';

interface FileTreeProps {
  files: FileType[];
  currentFile: string | null;
  onFileSelect: (path: string) => void;
  onFileCreate?: (path: string, isDir: boolean) => void;
  onFileDelete?: (path: string) => void;
  readOnly?: boolean;
}

export function FileTree({ files, currentFile, onFileSelect, onFileCreate, onFileDelete, readOnly = false }: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']));

  // Build tree structure
  const tree = buildTree(files);

  function buildTree(files: FileType[]): FileTreeType[] {
    const root: FileTreeType[] = [];
    const map: Map<string, FileTreeType> = new Map();

    // Sort files by path
    const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

    for (const file of sorted) {
      const parts = file.path.split('/');
      const name = parts[parts.length - 1];

      const node: FileTreeType = {
        name,
        path: file.path,
        isDir: file.isDir,
        children: [],
      };

      if (parts.length === 1) {
        root.push(node);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        const parent = map.get(parentPath);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }

      map.set(file.path, node);
    }

    return root;
  }

  function toggleDir(path: string) {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  function renderNode(node: FileTreeType, depth: number = 0) {
    const isExpanded = expandedDirs.has(node.path);
    const isActive = currentFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-accent cursor-pointer ${isActive ? 'bg-accent' : ''}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.isDir) {
              toggleDir(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.isDir ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-500" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500" />
            )
          ) : (
            <FileText className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm flex-1">{node.name}</span>
          {!readOnly && !node.isDir && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onFileDelete) onFileDelete(node.path);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        {node.isDir && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold text-sm">Files</h3>
        {!readOnly && (
          <button
            onClick={() => {
              const name = prompt('File name:');
              if (name && onFileCreate) {
                onFileCreate(name, false);
              }
            }}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto group">
        {tree.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
