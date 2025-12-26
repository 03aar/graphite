'use client';

import { X, Keyboard } from 'lucide-react';
import { Button } from '@leafit/ui';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: ['Ctrl/Cmd', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl/Cmd', 'S'], description: 'Save project' },
      { keys: ['Ctrl/Cmd', 'Enter'], description: 'Compile document' },
      { keys: ['Ctrl/Cmd', '/'], description: 'Toggle comment' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modals' },
    ],
  },
  {
    category: 'Editor',
    items: [
      { keys: ['Ctrl/Cmd', 'Z'], description: 'Undo' },
      { keys: ['Ctrl/Cmd', 'Y'], description: 'Redo' },
      { keys: ['Ctrl/Cmd', 'F'], description: 'Find' },
      { keys: ['Ctrl/Cmd', 'H'], description: 'Replace' },
      { keys: ['Ctrl/Cmd', 'D'], description: 'Add selection to next find match' },
      { keys: ['Alt', '↑/↓'], description: 'Move line up/down' },
      { keys: ['Ctrl/Cmd', 'B'], description: 'Insert bold' },
      { keys: ['Ctrl/Cmd', 'I'], description: 'Insert italic' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['Ctrl/Cmd', '1'], description: 'Focus editor' },
      { keys: ['Ctrl/Cmd', '2'], description: 'Focus preview' },
      { keys: ['Ctrl/Cmd', 'P'], description: 'Open projects' },
      { keys: ['Ctrl/Cmd', 'T'], description: 'Open templates' },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Power user tips to boost your productivity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {section.category}
                </h3>
                <div className="space-y-3">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={i}>
                            <kbd className="px-2.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-gray-500 dark:text-gray-400 mx-1">
                                +
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Pro Tips
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Most shortcuts work in both the editor and throughout the app</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded">?</kbd> anytime to see this help</li>
              <li>• The command palette (<kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded">Ctrl/Cmd+K</kbd>) lets you search all actions</li>
              <li>• Use Tab to navigate between toolbar buttons for keyboard-only workflow</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </div>
    </div>
  );
}
