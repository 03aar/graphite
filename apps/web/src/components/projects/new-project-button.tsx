'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@leafit/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@leafit/ui';
import { Plus, Loader2 } from 'lucide-react';

const TEMPLATES = [
  { id: 'article', name: 'Article', description: 'Basic article template' },
  { id: 'ieee', name: 'IEEE Conference', description: 'IEEE conference paper format' },
  { id: 'resume', name: 'Resume', description: 'Professional resume template' },
  { id: 'report', name: 'Report', description: 'Academic report with chapters' },
];

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('article');

  async function handleCreate() {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          templateId: selectedTemplate,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create project');
      }

      const { project } = await res.json();

      setOpen(false);
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My LaTeX Document"
              className="w-full px-3 py-2 border rounded-md"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Template</label>
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium mb-1">{template.name}</div>
                  <div className="text-sm text-muted-foreground">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
