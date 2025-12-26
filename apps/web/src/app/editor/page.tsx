'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@leafit/ui';
import {
  Bold, Italic, List, Table, Image as ImageIcon,
  FileDown, FileText, Settings, Save, FolderOpen,
  Plus, Minus, X, Divide, Equal, ChevronDown
} from 'lucide-react';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}

\\title{My LaTeX Document}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

Write your content here. Use the toolbar above to insert LaTeX commands quickly!

\\section{Mathematics}

Here's an equation:
\\begin{equation}
    E = mc^2
\\end{equation}

Inline math: $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

\\section{Conclusion}

Great work!

\\end{document}`;

// Templates
const TEMPLATES = {
  blank: {
    name: 'Blank Document',
    content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}

\\title{My Document}
\\author{Author Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}

Your content here.

\\end{document}`
  },
  article: {
    name: 'Academic Article',
    content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{cite}

\\title{Article Title}
\\author{Author Name\\\\
  Institution\\\\
  \\texttt{email@example.com}}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\section{Introduction}
\\section{Methods}
\\section{Results}
\\section{Discussion}
\\section{Conclusion}

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`
  },
  resume: {
    name: 'Resume/CV',
    content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}

\\usepackage{enumitem}
\\setlist{noitemsep}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{Your Name}}\\\\
\\vspace{2mm}
Email: your@email.com | Phone: (123) 456-7890\\\\
LinkedIn: linkedin.com/in/yourname | GitHub: github.com/yourname
\\end{center}

\\section*{Education}
\\textbf{University Name} \\hfill Year - Year\\\\
Degree in Major

\\section*{Experience}
\\textbf{Job Title} \\hfill Company Name, Location\\\\
\\textit{Month Year - Month Year}
\\begin{itemize}
  \\item Accomplishment or responsibility
  \\item Another achievement
\\end{itemize}

\\section*{Skills}
\\textbf{Technical:} Skill 1, Skill 2, Skill 3\\\\
\\textbf{Languages:} Language 1, Language 2

\\end{document}`
  },
  beamer: {
    name: 'Presentation (Beamer)',
    content: `\\documentclass{beamer}
\\usetheme{Madrid}
\\usecolortheme{default}

\\title{Presentation Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\frame{\\titlepage}

\\begin{frame}
\\frametitle{Outline}
\\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}
\\frametitle{Introduction}
\\begin{itemize}
  \\item Point 1
  \\item Point 2
  \\item Point 3
\\end{itemize}
\\end{frame}

\\section{Main Content}
\\begin{frame}
\\frametitle{Key Points}
Content goes here.
\\end{frame}

\\section{Conclusion}
\\begin{frame}
\\frametitle{Conclusion}
Summary and takeaways.
\\end{frame}

\\end{document}`
  },
  report: {
    name: 'Report',
    content: `\\documentclass[12pt]{report}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{amsmath}

\\title{Report Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle
\\tableofcontents

\\chapter{Introduction}
Introduction text.

\\chapter{Background}
Background information.

\\chapter{Methodology}
Methods used.

\\chapter{Results}
Results and findings.

\\chapter{Conclusion}
Conclusions and future work.

\\end{document}`
  }
};

// LaTeX snippets for toolbar
const LATEX_SNIPPETS = {
  bold: '\\textbf{text}',
  italic: '\\textit{text}',
  underline: '\\underline{text}',
  section: '\\section{Section Title}',
  subsection: '\\subsection{Subsection}',
  itemize: '\\begin{itemize}\n  \\item Item 1\n  \\item Item 2\n\\end{itemize}',
  enumerate: '\\begin{enumerate}\n  \\item Item 1\n  \\item Item 2\n\\end{enumerate}',
  equation: '\\begin{equation}\n  E = mc^2\n\\end{equation}',
  inlinemath: '$x^2 + y^2 = z^2$',
  fraction: '\\frac{numerator}{denominator}',
  sqrt: '\\sqrt{x}',
  sum: '\\sum_{i=1}^{n} x_i',
  integral: '\\int_{a}^{b} f(x) dx',
  matrix: '\\begin{matrix}\n  a & b \\\\\n  c & d\n\\end{matrix}',
  table: '\\begin{table}[h]\n\\centering\n\\begin{tabular}{|c|c|}\n\\hline\nCell 1 & Cell 2 \\\\\n\\hline\nCell 3 & Cell 4 \\\\\n\\hline\n\\end{tabular}\n\\caption{Table caption}\n\\end{table}',
  figure: '\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.5\\textwidth]{image.png}\n\\caption{Figure caption}\n\\label{fig:label}\n\\end{figure}',
  alpha: '\\alpha',
  beta: '\\beta',
  gamma: '\\gamma',
  delta: '\\delta',
  theta: '\\theta',
  lambda: '\\lambda',
  mu: '\\mu',
  pi: '\\pi',
  sigma: '\\sigma',
  omega: '\\omega'
};

type Engine = 'pdflatex' | 'xelatex' | 'lualatex';

export default function LatexEditor() {
  const [content, setContent] = useState(DEFAULT_LATEX);
  const [engine, setEngine] = useState<Engine>('pdflatex');
  const [compiling, setCompiling] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [log, setLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [documentName, setDocumentName] = useState('Untitled');

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        localStorage.setItem('latex-editor-content', content);
        localStorage.setItem('latex-editor-name', documentName);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content, documentName, autoSave]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('latex-editor-content');
    const savedName = localStorage.getItem('latex-editor-name');
    if (saved) setContent(saved);
    if (savedName) setDocumentName(savedName);
  }, []);

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

  const insertSnippet = (snippet: string) => {
    setContent(prev => prev + '\n' + snippet + '\n');
  };

  const loadTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey as keyof typeof TEMPLATES];
    if (template) {
      setContent(template.content);
      setDocumentName(template.name);
      setShowTemplates(false);
    }
  };

  const downloadTeX = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!pdfData) return;
    const blob = new Blob([Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              LaTeX Editor
            </h1>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className={`px-3 py-1 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="Document name"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowTemplates(!showTemplates)} className="text-sm">
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button onClick={downloadTeX} className="text-sm">
              <FileDown className="w-4 h-4 mr-2" />
              Download .tex
            </Button>
            {pdfData && (
              <Button onClick={downloadPDF} className="text-sm">
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
            <Button onClick={() => setShowSettings(!showSettings)} className="text-sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className={`border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
          <div className="container mx-auto">
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Choose a Template:</h3>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key)}
                  className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className={`border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4`}>
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autosave"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autosave" className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Auto-save
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={`border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-2`}>
        <div className="container mx-auto flex flex-wrap gap-1">
          {/* Formatting */}
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.bold)} className={`p-2 rounded hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.italic)} className={`p-2 rounded hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title="Italic">
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Structure */}
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.section)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Section
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.subsection)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Subsection
          </button>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Lists */}
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.itemize)} className={`p-2 rounded hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title="Bullet List">
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.enumerate)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title="Numbered List">
            1-2-3
          </button>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Math */}
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.inlinemath)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            $math$
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.equation)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Equation
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.fraction)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Fraction
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.sqrt)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            √
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.sum)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Σ
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.integral)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            ∫
          </button>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Greek Letters */}
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.alpha)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            α
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.beta)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            β
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.gamma)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            γ
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.theta)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            θ
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.lambda)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            λ
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.pi)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            π
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.sigma)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            σ
          </button>

          <div className="w-px bg-gray-600 mx-1"></div>

          {/* Insert */}
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.table)} className={`p-2 rounded hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title="Table">
            <Table className="w-4 h-4" />
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.figure)} className={`p-2 rounded hover:bg-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title="Figure">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button onClick={() => insertSnippet(LATEX_SNIPPETS.matrix)} className={`px-2 py-1 rounded hover:bg-gray-700 text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Matrix
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Editor Panel */}
          <div className={`flex flex-col rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>LaTeX Editor</h2>
              <div className="flex items-center gap-2">
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value as Engine)}
                  className={`px-3 py-1.5 border rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
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
            <div className="flex-1 p-0">
              <div className="h-[600px]">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="latex"
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: fontSize,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`flex flex-col rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>PDF Preview</h2>
            </div>
            <div className="flex-1 p-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-800 dark:text-red-200 font-semibold">Error</p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              {pdfData ? (
                <div className={`h-[600px] border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                  <iframe
                    src={`data:application/pdf;base64,${pdfData}`}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className={`h-[600px] border rounded-lg flex items-center justify-center ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
                  <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Compilation Log</h2>
            </div>
            <div className="p-4">
              <pre className={`p-4 rounded-lg text-xs overflow-auto max-h-64 ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                {log}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
