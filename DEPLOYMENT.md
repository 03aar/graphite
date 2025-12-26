# Deployment Guide - LaTeX Editor

Complete guide to deploying the LaTeX Editor application.

## 🚀 Quick Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/03aar/graphite)

### Manual Deploy

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure** (optional)
   - Root Directory: `apps/web`
   - Build Command: `pnpm run build`
   - Install Command: `pnpm install`

4. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live!

## ⚙️ Environment Variables

### Required: NONE! ✨
The LaTeX editor works out of the box with zero configuration.

### Optional Variables

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=LaTeX Editor
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Docker Configuration (for server with Docker)
DOCKER_HOST=unix:///var/run/docker.sock

# Telemetry
NEXT_TELEMETRY_DISABLED=1
```

## 🐳 Docker Requirements

### Important Note
LaTeX compilation requires Docker. This affects deployment:

### Option 1: Client-Side Only (Recommended for Vercel)
- Deploy to Vercel normally
- Users install Docker Desktop locally
- Compilation happens on user's machine
- **Best for:** Free Vercel deployment

### Option 2: Server-Side Compilation
- Deploy to server with Docker installed
- VPS (DigitalOcean, Linode, AWS EC2)
- Docker container with Docker-in-Docker
- **Best for:** Shared/team use

### Option 3: Hybrid Approach
- Frontend on Vercel
- Compilation API on separate Docker server
- Update `NEXT_PUBLIC_API_URL`
- **Best for:** Production apps

## 📦 Build Configuration

### Next.js Config
Already configured in `apps/web/next.config.js`:
```js
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@leafit/shared', '@leafit/ui'],
  experimental: {
    serverActions: true,
  },
}
```

### Vercel Config
See `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "framework": "nextjs",
  "functions": {
    "apps/web/src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

## 🌐 Platform-Specific Guides

### Vercel (Recommended)

**Pros:**
- Easiest deployment
- Automatic HTTPS
- Global CDN
- Free tier available

**Cons:**
- No Docker support (users need local Docker)
- 60s function timeout limit

**Steps:**
1. Connect GitHub repo
2. Deploy!
3. Users install Docker locally

### Netlify

**Pros:**
- Easy deployment
- Free tier

**Cons:**
- Same Docker limitations as Vercel
- Slightly more complex Next.js setup

**Steps:**
1. `netlify.toml`:
   ```toml
   [build]
     command = "pnpm run build"
     publish = "apps/web/.next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Deploy via Netlify CLI or GitHub integration

### DigitalOcean App Platform

**Pros:**
- Can use Docker
- Affordable
- Managed platform

**Cons:**
- Not free
- More complex setup

**Steps:**
1. Create App Platform app
2. Connect repository
3. Enable Docker support
4. Set build command: `pnpm build`
5. Deploy

### Self-Hosted (VPS)

**Pros:**
- Full control
- Docker support
- Cheapest at scale

**Cons:**
- Manual setup
- You manage infrastructure

**Setup:**
```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone and build
git clone https://github.com/03aar/graphite.git
cd graphite
pnpm install
pnpm build

# Start with PM2
npm install -g pm2
cd apps/web
pm2 start "pnpm start" --name latex-editor

# Nginx reverse proxy
sudo apt install nginx
```

Nginx config (`/etc/nginx/sites-available/latex`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

**Run entire app in Docker:**

`Dockerfile`:
```dockerfile
FROM node:20-alpine

# Install Docker CLI (for LaTeX compilation)
RUN apk add --no-cache docker-cli

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "--filter", "@leafit/web", "start"]
```

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - NODE_ENV=production
```

Run:
```bash
docker-compose up -d
```

## 🔒 Security Considerations

### Docker Compilation
- Sandboxed in containers
- Memory limited to 512MB
- CPU limited to 1 core
- Network disabled
- 30-second timeout
- Read-only filesystem

### Environment Variables
- Never commit .env files
- Use Vercel/platform secrets
- Rotate keys regularly

### CORS
Already configured in API routes:
```ts
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
```

## 📊 Performance Optimization

### Already Implemented
- ✅ Code splitting
- ✅ Lazy loading (Monaco editor)
- ✅ Debounced auto-save
- ✅ localStorage caching
- ✅ Optimized images

### Recommendations
1. **Enable CDN** - Vercel does this automatically
2. **Compress assets** - Use `next/image` (already used)
3. **Monitor performance** - Vercel Analytics
4. **Cache PDF.js** - Service worker (future enhancement)

## 🧪 Testing Before Deploy

### Local Production Build
```bash
# Build
pnpm build

# Test production build
pnpm --filter @leafit/web start

# Visit http://localhost:3000
```

### Manual Test Checklist
- [ ] Simple compiler (`/simple`) loads
- [ ] Full editor (`/editor`) loads
- [ ] Compilation works
- [ ] Templates load
- [ ] Project save/load works
- [ ] Export functions work
- [ ] All toolbar buttons work
- [ ] Command palette opens (Ctrl+K)
- [ ] Settings persist
- [ ] Theme switching works

## 🐛 Troubleshooting

### Build Fails

**Error: Out of memory**
```bash
# Increase Node memory
export NODE_OPTIONS="--max_old_space_size=4096"
pnpm build
```

**Error: Module not found**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Runtime Issues

**Compilation fails**
- Ensure Docker is accessible
- Check Docker socket permissions
- Verify TeX Live image exists

**Projects not saving**
- Check localStorage is enabled
- Check available storage (5-10MB limit)
- Clear old projects

## 📈 Monitoring

### Vercel Analytics
Enable in Vercel dashboard for:
- Page views
- Performance metrics
- Error tracking

### Custom Monitoring
Add to `_app.tsx`:
```ts
useEffect(() => {
  // Track compilation success rate
  if (typeof window !== 'undefined') {
    window.addEventListener('compile-success', () => {
      // Send to analytics
    });
  }
}, []);
```

## 🔄 Updates & Maintenance

### Update Dependencies
```bash
pnpm update --latest
```

### Update Docker Image
```bash
docker pull texlive/texlive:latest
```

### Deploy Updates
```bash
git push origin main
# Vercel auto-deploys
```

## 💰 Cost Estimates

### Vercel (Hobby - Free)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth
- ✅ Automatic HTTPS
- ⚠️ No Docker (client-side only)

### Vercel (Pro - $20/month)
- Everything in Hobby
- More bandwidth
- Analytics
- Still no Docker

### DigitalOcean ($6/month)
- Basic Droplet with Docker
- 1GB RAM, 1 vCPU
- 25GB SSD
- 1TB transfer
- Full LaTeX compilation

### AWS/GCP (Variable)
- Pay for what you use
- EC2 t3.micro: ~$8/month
- Full Docker support
- Scalable

## ✅ Production Checklist

Before going live:
- [ ] Build passes locally
- [ ] All features tested
- [ ] Environment variables set
- [ ] Docker accessible (if server-side)
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Documentation updated
- [ ] User testing completed
- [ ] Mobile responsive verified

## 🎉 Go Live!

Once deployed:
1. Test all routes (`/simple`, `/editor`)
2. Verify compilation works
3. Check all features
4. Monitor for errors
5. Share with users!

---

**Need help?** Check:
- Main README
- LATEX_EDITOR.md
- SIMPLE_COMPILER.md
- Or open an issue on GitHub
