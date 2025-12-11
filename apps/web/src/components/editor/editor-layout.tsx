'use client';

import { useState, useEffect } from 'react';
import { Project, File, Build } from '@leafit/shared';
import { FileTree } from './file-tree';
import { MonacoEditor } from './monaco-editor';
import { PDFViewer } from './pdf-viewer';
import { Button } from '@leafit/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@leafit/ui';
import { Play, Save, Loader2 } from 'lucide-react';

interface EditorLayoutProps {
  project: Project & { files: File[] };
  readOnly?: boolean;
}

export function EditorLayout({ project, readOnly = false }: EditorLayoutProps) {
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>(project.files);
  const [isCompiling, setIsCompiling] = useState(false);
  const [currentBuild, setCurrentBuild] = useState<Build | null>(null);
  const [buildLog, setBuildLog] = useState<string>('');
  const [rightTab, setRightTab] = useState<'pdf' | 'log'>('pdf');

  // Select first file by default
  useEffect(() => {
    if (files.length > 0 && !currentFile) {
      const firstTexFile = files.find((f) => f.path.endsWith('.tex'));
      setCurrentFile(firstTexFile?.path || files[0].path);
    }
  }, [files, currentFile]);

  async function handleFileSelect(path: string) {
    setCurrentFile(path);
  }

  async function handleFileSave(path: string, content: string) {
    try {
      const res = await fetch(`/api/projects/${project.id}/files/${encodeURIComponent(path)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error('Failed to save file');

      // Update local state
      setFiles((prev) =>
        prev.map((f) =>
          f.path === path
            ? { ...f, content, size: content.length, updatedAt: new Date() }
            : f
        )
      );
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    }
  }

  async function handleFileCreate(path: string, isDir: boolean) {
    try {
      const res = await fetch(`/api/projects/${project.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, isDir, content: isDir ? undefined : '' }),
      });

      if (!res.ok) throw new Error('Failed to create file');

      const { file } = await res.json();
      setFiles((prev) => [...prev, file]);
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file');
    }
  }

  async function handleFileDelete(path: string) {
    if (!confirm(`Delete ${path}?`)) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/files?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete file');

      setFiles((prev) => prev.filter((f) => f.path !== path));
      if (currentFile === path) {
        setCurrentFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  }

  async function handleCompile() {
    setIsCompiling(true);
    setRightTab('log');
    setBuildLog('Starting compilation...\n');

    try {
      const res = await fetch(`/api/projects/${project.id}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryFile: 'main.tex', engine: 'pdflatex' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to start compilation');
      }

      const { build } = await res.json();
      setCurrentBuild(build);

      // Poll for build status
      pollBuildStatus(build.id);
    } catch (error: any) {
      console.error('Error compiling:', error);
      setBuildLog((prev) => prev + `\nError: ${error.message}`);
      setIsCompiling(false);
    }
  }

  async function pollBuildStatus(buildId: string) {
    const maxAttempts = 60; // 60 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await fetch(`/api/builds/${buildId}`);
        if (!res.ok) throw new Error('Failed to fetch build status');

        const { build } = await res.json();
        setCurrentBuild(build);

        if (build.status === 'SUCCEEDED') {
          setBuildLog((prev) => prev + '\n✅ Compilation succeeded!');
          setIsCompiling(false);
          setRightTab('pdf');
          return;
        }

        if (build.status === 'FAILED') {
          setBuildLog((prev) => prev + '\n❌ Compilation failed. Check logs for details.');
          setIsCompiling(false);
          return;
        }

        if (build.status === 'RUNNING') {
          setBuildLog((prev) => prev + '.');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setBuildLog((prev) => prev + '\n⏱️ Build timeout');
          setIsCompiling(false);
        }
      } catch (error) {
        console.error('Error polling build:', error);
        setIsCompiling(false);
      }
    };

    poll();
  }

  const currentFileObj = files.find((f) => f.path === currentFile);

  return (
    <div className="flex h-screen">
      {/* Left panel - File tree */}
      <div className="w-64 border-r bg-background">
        <FileTree
          files={files}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          onFileDelete={handleFileDelete}
          readOnly={readOnly}
        />
      </div>

      {/* Center panel - Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="text-sm font-medium">{currentFile || 'No file selected'}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => currentFileObj && handleFileSave(currentFile!, currentFileObj.content || '')} disabled={readOnly}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" onClick={handleCompile} disabled={isCompiling || readOnly}>
              {isCompiling ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
              Compile
            </Button>
          </div>
        </div>
        <div className="flex-1">
          {currentFile && currentFileObj && !currentFileObj.isDir ? (
            <MonacoEditor
              projectId={project.id}
              filePath={currentFile}
              initialValue={currentFileObj.content || ''}
              onSave={(content) => handleFileSave(currentFile, content)}
              readOnly={readOnly}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select a file to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel - PDF and logs */}
      <div className="w-96 border-l bg-background flex flex-col">
        <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as 'pdf' | 'log')} className="flex-1 flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="pdf" className="flex-1">
              PDF
            </TabsTrigger>
            <TabsTrigger value="log" className="flex-1">
              Logs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pdf" className="flex-1 mt-0">
            <PDFViewer pdfUrl={currentBuild?.pdfUrl || null} />
          </TabsContent>
          <TabsContent value="log" className="flex-1 mt-0">
            <div className="h-full overflow-auto p-4 font-mono text-xs whitespace-pre-wrap bg-black text-green-400">
              {buildLog || 'No build logs yet'}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
