'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@leafit/ui';

interface Project {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface ProjectManagerProps {
  onLoadProject: (content: string, name: string) => void;
  currentContent: string;
  currentName: string;
}

export default function ProjectManager({ onLoadProject, currentContent, currentName }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showManager, setShowManager] = useState(false);

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('latex-projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('latex-projects', JSON.stringify(projects));
    }
  }, [projects]);

  const saveCurrentProject = () => {
    const existingIndex = projects.findIndex(p => p.name === currentName);
    const now = Date.now();

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...projects];
      updated[existingIndex] = {
        ...updated[existingIndex],
        content: currentContent,
        updatedAt: now,
      };
      setProjects(updated);
    } else {
      // Create new
      const newProject: Project = {
        id: `project-${now}`,
        name: currentName,
        content: currentContent,
        createdAt: now,
        updatedAt: now,
      };
      setProjects([...projects, newProject]);
    }
  };

  const loadProject = (project: Project) => {
    onLoadProject(project.content, project.name);
    setShowManager(false);
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const createNewProject = () => {
    onLoadProject('', 'New Document');
    setShowManager(false);
  };

  const exportAllProjects = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'latex-projects-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setProjects([...projects, ...imported]);
          alert(`Imported ${imported.length} projects!`);
        }
      } catch (error) {
        alert('Failed to import projects. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button onClick={() => setShowManager(!showManager)} className="text-sm">
        <FolderOpen className="w-4 h-4 mr-2" />
        Projects ({projects.length})
      </Button>

      {showManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Manager</h2>
                <button
                  onClick={() => setShowManager(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <Button onClick={createNewProject} className="text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
                <Button onClick={saveCurrentProject} className="text-sm">
                  Save Current
                </Button>
                <Button onClick={exportAllProjects} className="text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
                <label className="cursor-pointer">
                  <Button className="text-sm" onClick={() => document.getElementById('import-input')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <input
                    id="import-input"
                    type="file"
                    accept=".json"
                    onChange={importProjects}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto p-6">
              {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No projects yet</p>
                  <p className="text-sm">Create a new project or save the current document</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                          {project.name}
                        </h3>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Updated: {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 mb-3 max-h-32 overflow-hidden">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 line-clamp-6">
                          {project.content.substring(0, 200)}...
                        </pre>
                      </div>
                      <Button
                        onClick={() => loadProject(project)}
                        className="w-full text-sm"
                      >
                        Load Project
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
