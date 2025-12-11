# LeafIt - Windows Setup Guide

Quick setup guide for running LeafIt on Windows without Docker.

## 🚀 Quick Start

### Option 1: Using Setup Script (Easiest)

**Using PowerShell:**
```powershell
.\setup.ps1
```

**Using Command Prompt:**
```cmd
setup.bat
```

Then start the app:
```powershell
pnpm dev
```

---

### Option 2: Manual Setup

Run these commands one by one in PowerShell:

```powershell
# 1. Install dependencies
pnpm install

# 2. Build packages
cd packages/shared
pnpm build
cd ../..

cd packages/ui
pnpm build
cd ../..

# 3. Setup database
cd apps/web
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
cd ../..

# 4. Start dev server
pnpm dev
```

---

## 🌐 Access the App

Open your browser to: **http://localhost:3000**

---

## 🔐 Sign In

Use the demo account:
- Email: `demo@leafit.dev`
- Check your PowerShell terminal for the magic link
- Click the link to authenticate

---

## ✨ What Works

✅ Full LaTeX editor with Monaco
✅ File management (create, edit, delete)
✅ Project templates
✅ Auto-save functionality
✅ Beautiful 3-pane interface

## ⚠️ What's Disabled

❌ PDF Compilation (requires Docker + TeX Live)
❌ Real-time collaboration (requires WebSocket server)

---

## 🎯 Common Commands

```powershell
pnpm dev          # Start development server
pnpm db:studio    # Open database viewer (in apps/web folder)
pnpm build        # Build for production
```

---

## 🐛 Troubleshooting

### Port 3000 already in use
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Permission Issues
Run PowerShell as Administrator

### Script Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📦 What's Included

- Next.js 15 frontend
- SQLite database (no setup needed!)
- Monaco editor with LaTeX syntax
- 4 LaTeX templates (Article, IEEE, Resume, Report)
- Project and file management
- Modern UI with Tailwind CSS

---

## 🚀 Next Steps

1. Create a new project
2. Choose a template
3. Start writing LaTeX!
4. Edit files in the Monaco editor
5. Enjoy the beautiful interface

---

## 💡 Want Full Features?

To enable PDF compilation and real-time collaboration:

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Uncomment services in `.env` file
3. Run `docker compose up -d`
4. Switch to PostgreSQL in `prisma/schema.prisma`

---

## 📧 Support

If you encounter issues, check:
- Node.js version (should be >= 20)
- pnpm is installed (`npm install -g pnpm`)
- You're in the project root directory

Enjoy building LaTeX documents! 🎉
