'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

interface MonacoEditorProps {
  projectId: string;
  filePath: string;
  initialValue?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
}

export function MonacoEditor({ projectId, filePath, initialValue = '', onSave, readOnly = false }: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    // Initialize Yjs provider
    const wsUrl = process.env.NEXT_PUBLIC_Y_WEBSOCKET_URL || 'ws://localhost:1234';
    const roomName = `${projectId}:${filePath}`;

    const provider = new WebsocketProvider(wsUrl, roomName, ydoc, {
      connect: true,
    });

    providerRef.current = provider;

    const ytext = ydoc.getText('monaco');

    // Initialize with content if empty
    if (ytext.length === 0 && initialValue) {
      ytext.insert(0, initialValue);
    }

    // Create Monaco binding
    const model = editorRef.current.getModel();
    if (model) {
      const binding = new MonacoBinding(ytext, model, new Set([editorRef.current]), provider.awareness);
      bindingRef.current = binding;
    }

    // Autosave every 2 seconds
    let saveTimeout: NodeJS.Timeout;
    const handleChange = () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const content = editorRef.current?.getValue();
        if (content !== undefined && onSave) {
          onSave(content);
        }
      }, 2000);
    };

    editorRef.current.onDidChangeModelContent(handleChange);

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      bindingRef.current?.destroy();
      provider.disconnect();
      provider.destroy();
    };
  }, [projectId, filePath, ydoc, initialValue, onSave]);

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure LaTeX language
    monaco.languages.register({ id: 'latex' });

    // Add basic LaTeX syntax highlighting
    monaco.languages.setMonarchTokensProvider('latex', {
      tokenizer: {
        root: [
          [/\\[a-zA-Z@]+/, 'keyword'],
          [/\\[^a-zA-Z@]/, 'keyword'],
          [/%.*$/, 'comment'],
          [/\{/, 'delimiter.curly'],
          [/\}/, 'delimiter.curly'],
          [/\[/, 'delimiter.square'],
          [/\]/, 'delimiter.square'],
          [/\$\$/, 'string.escape'],
          [/\$/, 'string.escape'],
        ],
      },
    });

    // Save on Ctrl+S / Cmd+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const content = editor.getValue();
      if (onSave) {
        onSave(content);
      }
    });
  }

  return (
    <Editor
      height="100%"
      language="latex"
      theme="vs-dark"
      value={initialValue}
      onMount={handleEditorDidMount}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
}
