import { z } from 'zod';

// Project Schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  visibility: z.enum(['private', 'link']).optional(),
});

// File Schemas
export const createFileSchema = z.object({
  path: z.string().min(1),
  isDir: z.boolean().default(false),
  content: z.string().optional(),
});

export const updateFileSchema = z.object({
  content: z.string(),
});

export const renameFileSchema = z.object({
  newPath: z.string().min(1),
});

// Build Schemas
export const createBuildSchema = z.object({
  entryFile: z.string().default('main.tex'),
  engine: z.enum(['pdflatex', 'xelatex', 'lualatex']).default('pdflatex'),
});

// Member Schemas
export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']).default('editor'),
});

export const updateMemberSchema = z.object({
  role: z.enum(['editor', 'viewer']),
});

// Compile Service Schemas
export const compileRequestSchema = z.object({
  projectId: z.string(),
  entryFile: z.string(),
  engine: z.enum(['pdflatex', 'xelatex', 'lualatex']),
});
