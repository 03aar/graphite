// User Types
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
}

// Project Types
export type ProjectVisibility = 'private' | 'link';
export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  visibility: ProjectVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  createdAt: Date;
}

export interface ProjectWithMembers extends Project {
  members: (Member & { user: User })[];
  owner: User;
}

// File Types
export interface File {
  id: string;
  projectId: string;
  path: string;
  isDir: boolean;
  content: string | null;
  size: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface FileTree {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileTree[];
}

// Build Types
export type BuildStatus = 'queued' | 'running' | 'succeeded' | 'failed';
export type BuildEngine = 'pdflatex' | 'xelatex' | 'lualatex';

export interface Build {
  id: string;
  projectId: string;
  status: BuildStatus;
  engine: BuildEngine;
  pdfUrl: string | null;
  logUrl: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}

// Snapshot Types
export interface Snapshot {
  id: string;
  projectId: string;
  buildId: string | null;
  meta: string | null;
  createdAt: Date;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  files: TemplateFile[];
}

export interface TemplateFile {
  path: string;
  content: string;
}

// Collaboration Types
export interface Presence {
  user: {
    id: string;
    name: string;
    email: string;
    color: string;
  };
  cursor: {
    line: number;
    column: number;
  } | null;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Compile Service Types
export interface CompileRequest {
  projectId: string;
  entryFile: string;
  engine: BuildEngine;
}

export interface CompileResult {
  success: boolean;
  pdfUrl?: string;
  logUrl?: string;
  warnings?: string[];
  errors?: string[];
}
