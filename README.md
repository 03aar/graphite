# LeafIt - Collaborative LaTeX Editor

An Overleaf-style MVP with real-time LaTeX editing, PDF compilation, and collaborative features.

## Features

- **Real-time Collaboration**: Multi-cursor editing with Yjs and WebSocket
- **Instant Compilation**: LaTeX to PDF compilation using TeX Live in Docker
- **File Management**: Create, edit, rename, and delete files and folders
- **Templates**: Starter templates for articles, IEEE papers, resumes, and reports
- **Version History**: Automatic snapshots on successful compilation
- **Share & Collaborate**: Invite collaborators with editor or viewer roles
- **Modern Stack**: Built with Next.js 15, TypeScript, Prisma, and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Monaco Editor** for code editing
- **Yjs** for real-time collaboration
- **pdf.js** for PDF preview

### Backend
- **PostgreSQL** (Prisma ORM)
- **Redis** (BullMQ for job queues)
- **S3-compatible storage** (MinIO for development)
- **NextAuth** for authentication

### Services
- **Compile Service**: Node.js worker that runs LaTeX compilation in Docker
- **Y-WebSocket Server**: Real-time collaboration server
- **TeX Live**: LaTeX distribution in Docker for PDF generation

## Project Structure

```
leafit/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/         # App router pages
│       │   ├── components/  # React components
│       │   └── lib/         # Utilities and helpers
│       └── prisma/          # Database schema and migrations
├── packages/
│   ├── shared/              # Shared types and schemas
│   └── ui/                  # Reusable UI components (shadcn)
├── services/
│   ├── compile/             # LaTeX compilation worker
│   └── yjs-server/          # Y-WebSocket collaboration server
└── docker-compose.yml       # Development environment
```

## Quick Start

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Docker** and **Docker Compose**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd leafit
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration (defaults work for local development).

4. **Start services with Docker Compose**

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO on port 9000 (console on 9001)
- Y-WebSocket server on port 1234
- Compile service (background worker)

5. **Run database migrations and seed**

```bash
pnpm db:migrate
pnpm db:seed
```

6. **Start the development server**

```bash
pnpm dev
```

7. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000)

Default demo account:
- Email: `demo@leafit.dev`
- Use magic link authentication (check console for dev link)

## Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# Database
DATABASE_URL=postgresql://leafit:leafit@localhost:5432/leafit

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this

# Storage (MinIO)
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=leafit
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# Redis
REDIS_URL=redis://localhost:6379

# Services
COMPILE_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_Y_WEBSOCKET_URL=ws://localhost:1234
```

## Development

### Available Scripts

```bash
# Root commands
pnpm dev                 # Start all services in dev mode
pnpm build               # Build all packages
pnpm lint                # Lint all packages
pnpm test                # Run tests

# Database commands
pnpm db:migrate          # Run database migrations
pnpm db:seed             # Seed database with demo data
pnpm db:studio           # Open Prisma Studio

# Docker commands
pnpm docker:up           # Start Docker services
pnpm docker:down         # Stop Docker services
pnpm docker:logs         # View Docker logs
```

### Individual Services

Run services separately:

```bash
# Web app
cd apps/web
pnpm dev

# Compile worker
cd services/compile
pnpm dev

# Y-WebSocket server
cd services/yjs-server
pnpm dev
```

## Adding Templates

Templates are defined in `/apps/web/src/app/api/projects/route.ts`.

To add a new template:

1. Add template definition to `getTemplateContent()` function
2. Add template metadata to the `TEMPLATES` array in `new-project-button.tsx`
3. Template should include valid LaTeX content with document class and begin/end document

Example:

```typescript
book: `\\documentclass{book}
\\begin{document}
\\chapter{Introduction}
Your content here.
\\end{document}
`
```

## Architecture

### Real-time Collaboration

- **Yjs** CRDT for conflict-free text editing
- **y-websocket** for real-time synchronization
- **Monaco bindings** for editor integration
- Each file has its own Yjs document: `{projectId}:{filePath}`

### Compilation Pipeline

1. User clicks "Compile"
2. Build record created in database
3. Job enqueued to Redis (BullMQ)
4. Compile worker picks up job
5. Worker fetches project files from database
6. Worker runs `latexmk` in isolated Docker container
7. PDF and logs uploaded to S3
8. Build status updated in database
9. Frontend polls for completion and displays PDF

### Security

- **Authentication**: NextAuth with email/Google OAuth
- **Authorization**: Role-based access control (Owner/Editor/Viewer)
- **Sandboxing**: LaTeX runs in isolated Docker with:
  - No network access
  - Memory limit (512MB)
  - CPU limit (1 core)
  - Read-only filesystem (except /tmp)
  - 30-second timeout
- **File validation**: Path sanitization and size limits
- **Rate limiting**: 1 concurrent build per project

## Production Deployment

### Build for Production

```bash
pnpm build
```

### Environment Setup

1. Set up PostgreSQL database
2. Set up Redis instance
3. Set up S3-compatible storage (AWS S3, MinIO, etc.)
4. Configure environment variables
5. Run database migrations: `pnpm db:migrate:deploy`

### Docker Deployment

Build and deploy with Docker:

```bash
# Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Required Services

- **PostgreSQL**: Database
- **Redis**: Job queue and caching
- **S3**: File storage
- **Docker**: For running LaTeX compilation (requires Docker socket access)

## Troubleshooting

### LaTeX Compilation Fails

- Check Docker is running: `docker ps`
- Pull TeX Live image: `docker pull texlive/texlive:latest`
- Check worker logs: `docker compose logs compile`
- Verify Docker socket is mounted: `/var/run/docker.sock`

### Real-time Collaboration Not Working

- Check Y-WebSocket server is running on port 1234
- Verify `NEXT_PUBLIC_Y_WEBSOCKET_URL` environment variable
- Check browser console for WebSocket errors
- Ensure firewall allows WebSocket connections

### PDF Not Displaying

- Check build status in database or logs
- Verify S3/MinIO is accessible
- Check browser console for fetch errors
- Ensure signed URLs are generated correctly

### Database Connection Issues

- Verify PostgreSQL is running: `docker compose ps postgres`
- Check `DATABASE_URL` environment variable
- Run migrations: `pnpm db:migrate`
- Check database logs: `docker compose logs postgres`

## Testing

Run tests:

```bash
pnpm test
```

Test coverage includes:
- API endpoint tests (project CRUD, file operations)
- Compilation queue tests
- Authentication tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time collaboration powered by [Yjs](https://yjs.dev/)
- LaTeX compilation using [TeX Live](https://www.tug.org/texlive/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- PDF rendering with [pdf.js](https://mozilla.github.io/pdf.js/)

---

**LeafIt** - Making LaTeX collaboration simple and fast.
