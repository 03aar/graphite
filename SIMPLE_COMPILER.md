# Simple LaTeX Compiler

A standalone LaTeX compiler with **no database** and **no login required**.

## Features

- ✅ Pure LaTeX compilation (no authentication needed)
- ✅ No database dependencies
- ✅ Monaco editor for LaTeX editing
- ✅ Real-time PDF preview
- ✅ Support for multiple LaTeX engines (pdfLaTeX, XeLaTeX, LuaLaTeX)
- ✅ Compilation logs display
- ✅ Secure Docker-based sandboxed compilation

## Requirements

1. **Node.js 20+**
2. **pnpm** (package manager)
3. **Docker** (for LaTeX compilation)
   - The compiler uses `texlive/texlive:latest` Docker image
   - First compilation will automatically pull the image (~4GB)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Packages

```bash
pnpm build --filter @leafit/shared --filter @leafit/ui
```

### 3. Start Development Server

```bash
pnpm --filter @leafit/web dev
```

### 4. Open the Simple Compiler

Navigate to: **http://localhost:3000/simple**

## How It Works

### Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (Next.js App)  │
└────────┬────────┘
         │
         │ POST /api/compile-simple
         │ { content, engine }
         ▼
┌─────────────────┐
│   Next.js API   │
│  compile-simple │
└────────┬────────┘
         │
         │ execSync
         ▼
┌─────────────────┐
│     Docker      │
│  texlive/       │
│  texlive:latest │
└────────┬────────┘
         │
         │ latexmk
         ▼
    PDF Output
```

### Compilation Process

1. User writes LaTeX code in Monaco editor
2. Clicks "Compile" button
3. Frontend sends LaTeX source to `/api/compile-simple`
4. API creates temporary directory with source file
5. Runs Docker container with TeX Live:
   - Memory limit: 512MB
   - CPU limit: 1 core
   - Network: disabled (security)
   - Read-only filesystem with /tmp for output
   - 30-second timeout
6. Runs `latexmk` with selected engine
7. Extracts PDF and log files
8. Returns base64-encoded PDF to frontend
9. Frontend displays PDF in iframe
10. Cleans up temporary files

## API Endpoint

### POST `/api/compile-simple`

Compiles LaTeX source code to PDF.

**Request:**
```json
{
  "content": "\\documentclass{article}\\begin{document}Hello World\\end{document}",
  "engine": "pdflatex",
  "entryFile": "main.tex"
}
```

**Response:**
```json
{
  "success": true,
  "pdf": "base64-encoded-pdf-data...",
  "log": "LaTeX compilation log..."
}
```

**Parameters:**
- `content` (required): LaTeX source code
- `engine` (optional): `pdflatex` | `xelatex` | `lualatex` (default: `pdflatex`)
- `entryFile` (optional): Entry file name (default: `main.tex`)

## Security

The compiler runs in a secure Docker sandbox with:

- ✅ **Memory limit**: 512MB
- ✅ **CPU limit**: 1 core
- ✅ **Network disabled**: No internet access
- ✅ **Read-only filesystem**: Except /tmp
- ✅ **Timeout**: 30 seconds maximum
- ✅ **Isolated environment**: Each compilation in fresh container
- ✅ **Automatic cleanup**: Temp files removed after compilation

## Files Created

### `/apps/web/src/app/api/compile-simple/route.ts`
Next.js API route that handles compilation requests. Uses Node.js `child_process` to run Docker commands, creates temporary directories, and manages the LaTeX compilation lifecycle.

### `/apps/web/src/app/simple/page.tsx`
React component with Monaco editor for LaTeX editing and iframe for PDF preview. Simple, clean UI with no authentication required.

## Differences from Main Application

| Feature | Simple Compiler | Main Application |
|---------|----------------|------------------|
| Authentication | ❌ None | ✅ NextAuth (Email + Google) |
| Database | ❌ None | ✅ PostgreSQL + Prisma |
| Storage | ❌ In-memory | ✅ S3/MinIO |
| Job Queue | ❌ Direct execution | ✅ Redis + BullMQ |
| Collaboration | ❌ Single user | ✅ Real-time (Yjs) |
| Version History | ❌ None | ✅ Snapshots |
| Projects | ❌ None | ✅ Full project management |
| File Management | ❌ Single file | ✅ Multiple files/folders |

## Troubleshooting

### Docker Not Found
```
Error: docker: command not found
```
**Solution:** Install Docker Desktop or Docker Engine

### Permission Denied
```
Error: permission denied while trying to connect to the Docker daemon
```
**Solution:** Add your user to docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Image Pull Failed
```
Error: Failed to pull texlive/texlive:latest
```
**Solution:** Check internet connection and Docker Hub access

### Compilation Timeout
```
Error: Compilation timeout
```
**Solution:**
- Simplify your LaTeX document
- Remove large packages
- Optimize images

### PDF Not Generated
```
Error: Failed to generate PDF
```
**Solution:**
- Check compilation log for LaTeX errors
- Verify LaTeX syntax
- Ensure all required packages are available in TeX Live

## Example LaTeX Documents

### Minimal Example
```latex
\\documentclass{article}
\\begin{document}
Hello, World!
\\end{document}
```

### With Math
```latex
\\documentclass{article}
\\usepackage{amsmath}
\\begin{document}
Einstein's equation: $E = mc^2$

\\begin{equation}
    \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
\\end{equation}
\\end{document}
```

### With Sections
```latex
\\documentclass{article}
\\usepackage[utf8]{inputenc}

\\title{My Document}
\\author{Anonymous}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}
This is the introduction.

\\section{Main Content}
This is the main content.

\\section{Conclusion}
This is the conclusion.

\\end{document}
```

## Development

The simple compiler is completely standalone and doesn't require any of the main application's services:

- ❌ No PostgreSQL
- ❌ No Redis
- ❌ No MinIO/S3
- ❌ No Yjs WebSocket server
- ❌ No Compile service worker

Just the Next.js web server and Docker are required.

## License

Same as main project.
