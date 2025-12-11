'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  pdfUrl: string | null;
  onError?: (error: Error) => void;
}

export function PDFViewer({ pdfUrl, onError }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    if (!pdfUrl || !containerRef.current) return;

    setLoading(true);

    const loadingTask = pdfjsLib.getDocument(pdfUrl);

    loadingTask.promise
      .then((pdf) => {
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        renderPage(1);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading PDF:', error);
        setLoading(false);
        if (onError) onError(error);
      });

    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [pdfUrl, onError]);

  useEffect(() => {
    if (pdfDocRef.current && containerRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, scale]);

  async function renderPage(pageNumber: number) {
    if (!pdfDocRef.current || !containerRef.current) return;

    const page = await pdfDocRef.current.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    // Clear previous content
    const container = containerRef.current;
    container.innerHTML = '';

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    container.appendChild(canvas);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  }

  function handleNextPage() {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function handleZoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  }

  function handleZoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }

  if (!pdfUrl) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>No PDF compiled yet. Click &quot;Compile&quot; to generate PDF.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b bg-background">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {numPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === numPages} className="px-3 py-1 border rounded disabled:opacity-50">
          Next
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleZoomOut} disabled={scale <= 0.5} className="px-3 py-1 border rounded disabled:opacity-50">
            -
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} disabled={scale >= 3.0} className="px-3 py-1 border rounded disabled:opacity-50">
            +
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-4 flex justify-center" />
    </div>
  );
}
