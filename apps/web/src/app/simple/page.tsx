'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@leafit/ui';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}

\\title{My LaTeX Document}
\\author{Anonymous}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

This is a simple LaTeX document. You can write your content here.

\\section{Mathematics}

Here's an equation:
\\begin{equation}
    E = mc^2
\\end{equation}

And some inline math: $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

\\section{Lists}

\\begin{itemize}
    \\item First item
    \\item Second item
    \\item Third item
\\end{itemize}

\\section{Conclusion}

This is a real LaTeX compiler with no database or login required!

\\end{document}`;

type Engine = 'pdflatex' | 'xelatex' | 'lualatex';

export default function SimpleLaTeXCompiler() {
  const [content, setContent] = useState(DEFAULT_LATEX);
  const [engine, setEngine] = useState<Engine>('pdflatex');
  const [compiling, setCompiling] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [log, setLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCompile = async () => {
    setCompiling(true);
    setError(null);
    setLog('');

    try {
      const response = await fetch('/api/compile-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          engine,
          entryFile: 'main.tex',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Compilation failed');
      }

      setLog(data.log || '');

      if (data.success && data.pdf) {
        setPdfData(data.pdf);
      } else {
        setError('Compilation failed. Check the log for details.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Simple LaTeX Compiler
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No login, no database - just pure LaTeX compilation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Editor Panel */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">LaTeX Editor</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value as Engine)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="pdflatex">pdfLaTeX</option>
                    <option value="xelatex">XeLaTeX</option>
                    <option value="lualatex">LuaLaTeX</option>
                  </select>
                  <Button onClick={handleCompile} disabled={compiling}>
                    {compiling ? 'Compiling...' : 'Compile'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-0">
              <div className="h-[600px]">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="latex"
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">PDF Preview</h2>
            </div>
            <div className="flex-1 p-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-800 dark:text-red-200 font-semibold">Error</p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              {pdfData ? (
                <div className="h-[600px] border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <iframe
                    src={`data:application/pdf;base64,${pdfData}`}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="h-[600px] border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No PDF yet</p>
                    <p className="text-sm">Click &quot;Compile&quot; to generate a PDF</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Log Panel */}
        {log && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compilation Log</h2>
            </div>
            <div className="p-4">
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-xs overflow-auto max-h-64 text-gray-800 dark:text-gray-200">
                {log}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
