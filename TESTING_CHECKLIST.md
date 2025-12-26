# Comprehensive Testing Checklist

Complete testing checklist for the LaTeX Editor application. Test all three modes thoroughly.

## ✅ Pre-Testing Setup

- [ ] Clean install: `rm -rf node_modules && pnpm install`
- [ ] Build packages: `pnpm build --filter @leafit/shared --filter @leafit/ui`
- [ ] Start dev server: `pnpm --filter @leafit/web dev`
- [ ] Docker is running and accessible
- [ ] TeX Live image available: `docker pull texlive/texlive:latest`

## 📋 Mode 1: Simple Compiler (`/simple`)

### Page Load & UI
- [ ] Page loads without errors
- [ ] Monaco editor renders
- [ ] Dark theme applied by default
- [ ] Title displays: "Simple LaTeX Compiler"
- [ ] Subtitle shows: "No login, no database - just pure LaTeX compilation"

### Editor Functionality
- [ ] Default LaTeX template loads
- [ ] Can type in editor
- [ ] Syntax highlighting works
- [ ] Line numbers display
- [ ] Can scroll editor

### Engine Selection
- [ ] Dropdown shows three engines
- [ ] pdfLaTeX selected by default
- [ ] Can switch to XeLaTeX
- [ ] Can switch to LuaLaTeX
- [ ] Selection persists

### Compilation
- [ ] "Compile" button clickable
- [ ] Button shows "Compiling..." during compilation
- [ ] Compilation completes (with Docker)
- [ ] PDF displays in preview panel
- [ ] Compilation log appears at bottom
- [ ] Error handling works (test with invalid LaTeX)

### Error Handling
- [ ] Invalid LaTeX shows error message
- [ ] Error message is user-friendly
- [ ] Compilation log shows details
- [ ] Can recover from error

## 📋 Mode 2: Full Editor (`/editor`)

### Page Load & UI
- [ ] Page loads without errors
- [ ] Header displays correctly
- [ ] Toolbar visible
- [ ] Default template loads
- [ ] All panels render (editor, preview, log)

### Header Functionality
- [ ] Document name input works
- [ ] Can edit document name
- [ ] "Templates" button clickable
- [ ] "Download .tex" button works
- [ ] "Download PDF" button works (after compilation)
- [ ] "Settings" button opens settings panel
- [ ] "Projects" button opens project manager

### Templates
- [ ] Templates panel opens/closes
- [ ] All 5 templates listed:
  - [ ] Blank Document
  - [ ] Academic Article
  - [ ] Resume/CV
  - [ ] Presentation (Beamer)
  - [ ] Report
- [ ] Clicking template loads content
- [ ] Document name updates with template name
- [ ] Templates panel closes after selection

### Toolbar - Formatting
- [ ] Bold button inserts `\textbf{text}`
- [ ] Italic button inserts `\textit{text}`
- [ ] Section button inserts section
- [ ] Subsection button inserts subsection

### Toolbar - Lists
- [ ] Itemize (bullet list) inserts correctly
- [ ] Enumerate (numbered list) inserts correctly

### Toolbar - Math
- [ ] Inline math ($...$) inserts
- [ ] Equation environment inserts
- [ ] Fraction inserts
- [ ] Square root inserts
- [ ] Summation (Σ) inserts
- [ ] Integral (∫) inserts

### Toolbar - Greek Letters
- [ ] Alpha (α) inserts `\alpha`
- [ ] Beta (β) inserts `\beta`
- [ ] Gamma (γ) inserts `\gamma`
- [ ] Theta (θ) inserts `\theta`
- [ ] Lambda (λ) inserts `\lambda`
- [ ] Pi (π) inserts `\pi`
- [ ] Sigma (σ) inserts `\sigma`

### Toolbar - Insertions
- [ ] Table button inserts table environment
- [ ] Figure button inserts figure environment
- [ ] Matrix button inserts matrix environment

### Settings Panel
- [ ] Settings panel opens/closes
- [ ] Theme dropdown works
  - [ ] Light theme applies
  - [ ] Dark theme applies
  - [ ] Theme persists after reload
- [ ] Font size slider works (10-24px)
  - [ ] Editor font size changes
  - [ ] Value displays correctly
- [ ] Auto-save checkbox toggles
  - [ ] Checked by default
  - [ ] Can disable
  - [ ] Setting persists

### Project Manager
- [ ] Project manager modal opens
- [ ] Shows project count in button
- [ ] "New Project" button works
  - [ ] Clears editor
  - [ ] Sets name to "New Document"
  - [ ] Closes modal
- [ ] "Save Current" button works
  - [ ] Adds project to list
  - [ ] Shows in project grid
- [ ] Project cards display:
  - [ ] Project name
  - [ ] Last updated date
  - [ ] Content preview
  - [ ] "Load Project" button
  - [ ] Delete button (trash icon)
- [ ] "Load Project" works
  - [ ] Loads content to editor
  - [ ] Updates document name
  - [ ] Closes modal
- [ ] Delete project works
  - [ ] Shows confirmation dialog
  - [ ] Removes from list
- [ ] "Export All" button works
  - [ ] Downloads JSON file
  - [ ] Filename: `latex-projects-backup.json`
- [ ] "Import" button works
  - [ ] Opens file picker
  - [ ] Accepts .json files
  - [ ] Imports projects
  - [ ] Shows success message

### Auto-Save
- [ ] Content saves to localStorage after 1 second
- [ ] Reload page preserves content
- [ ] Document name persists
- [ ] Can disable auto-save in settings

### Keyboard Shortcuts
- [ ] Ctrl/Cmd+K opens command palette
- [ ] Ctrl/Cmd+S saves project
- [ ] Ctrl/Cmd+Enter compiles document

### Command Palette
- [ ] Opens with Ctrl/Cmd+K
- [ ] Closes with Esc
- [ ] Search input works
- [ ] Filters commands by name
- [ ] Filters commands by description
- [ ] Filters commands by category
- [ ] Arrow keys navigate (↑↓)
- [ ] Enter selects command
- [ ] Commands grouped by category
- [ ] Keyboard shortcuts displayed
- [ ] Clicking command executes it
- [ ] Modal closes after execution

### Editor Features
- [ ] Monaco editor loads
- [ ] Syntax highlighting (LaTeX)
- [ ] Theme changes with app theme
- [ ] Font size changes with setting
- [ ] Line numbers display
- [ ] Word wrap works
- [ ] Can copy/paste
- [ ] Undo/redo works (Ctrl/Cmd+Z)

### Compilation
- [ ] Compile button works
- [ ] Shows "Compiling..." state
- [ ] Button disabled during compilation
- [ ] PDF preview updates
- [ ] Compilation log displays
- [ ] Success message shows
- [ ] Handles LaTeX errors gracefully

### PDF Preview
- [ ] Empty state shows initially
- [ ] "No PDF yet" message clear
- [ ] PDF renders after compilation
- [ ] iframe displays correctly
- [ ] Can scroll PDF
- [ ] PDF updates on recompile

### Export Functions
- [ ] Download .tex button works
  - [ ] Uses document name
  - [ ] .tex extension added
  - [ ] File downloads correctly
- [ ] Download PDF button works
  - [ ] Only enabled after compilation
  - [ ] Uses document name
  - [ ] .pdf extension added
  - [ ] File downloads correctly

### Error Handling
- [ ] Invalid LaTeX shows error
- [ ] Error message in red box
- [ ] Compilation log shows details
- [ ] Can fix and recompile
- [ ] No crashes on errors

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Toolbar wraps on smaller screens
- [ ] Editor/preview stack on mobile
- [ ] Settings panel responsive
- [ ] Project manager modal responsive

### Performance
- [ ] Page loads quickly (<2s)
- [ ] Editor typing is smooth
- [ ] No lag when inserting snippets
- [ ] Auto-save doesn't freeze UI
- [ ] Compilation doesn't block UI
- [ ] PDF rendering is smooth

## 📋 Mode 3: Collaborative Mode (Original Features)

### Authentication
- [ ] Sign-in page works
- [ ] Email authentication works
- [ ] Google OAuth works (if configured)
- [ ] Session persists
- [ ] Sign-out works

### Projects List
- [ ] Projects page loads
- [ ] Shows user's projects
- [ ] "New Project" button works
- [ ] Can select template
- [ ] Project cards clickable

### Real-time Editing
- [ ] Monaco editor loads in project
- [ ] File tree displays
- [ ] Can create files
- [ ] Can delete files
- [ ] Can rename files
- [ ] Multiple users see changes (with 2+ users)
- [ ] Cursors show for other users
- [ ] Changes sync in real-time

### Compilation (Collaborative)
- [ ] Compile button works
- [ ] Build status shows
- [ ] PDF preview updates
- [ ] Build history available
- [ ] Version snapshots created

### Sharing
- [ ] Can invite collaborators
- [ ] Email invitations work
- [ ] Role selection works (Owner/Editor/Viewer)
- [ ] Permissions enforced
- [ ] Can remove collaborators

## 🔧 Technical Tests

### Build Process
- [ ] `pnpm build` completes without errors
- [ ] No TypeScript errors (in new code)
- [ ] All packages build successfully
- [ ] Production build runs (`pnpm start`)

### Code Quality
- [ ] No console errors on load
- [ ] No console warnings (except known ones)
- [ ] No memory leaks
- [ ] localStorage doesn't overflow
- [ ] Network requests efficient

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Docker Integration
- [ ] Docker commands execute
- [ ] Containers created correctly
- [ ] Containers removed after compilation
- [ ] No orphaned containers
- [ ] TeX Live image pulls successfully
- [ ] Compilation sandboxed (network disabled)
- [ ] Memory limits enforced
- [ ] CPU limits enforced
- [ ] Timeout works (30s)

### localStorage
- [ ] Projects save correctly
- [ ] Settings persist
- [ ] Auto-save works
- [ ] Export creates valid JSON
- [ ] Import restores correctly
- [ ] Handles storage limits gracefully
- [ ] No data corruption

### API Endpoints
- [ ] POST /api/compile-simple responds
- [ ] Returns correct JSON format
- [ ] Handles errors gracefully
- [ ] Returns PDF as base64
- [ ] Returns compilation log
- [ ] Success/failure indicated

### Security
- [ ] Docker runs sandboxed
- [ ] No code injection vulnerabilities
- [ ] XSS protection works
- [ ] localStorage data safe
- [ ] No sensitive data exposed
- [ ] CORS configured correctly

## 🎨 Design & UX

### Visual Design
- [ ] Colors consistent
- [ ] Typography readable
- [ ] Spacing appropriate
- [ ] Icons clear and recognizable
- [ ] Buttons have hover states
- [ ] Active states clear
- [ ] Disabled states obvious
- [ ] Loading indicators present

### User Experience
- [ ] Navigation intuitive
- [ ] Button labels clear
- [ ] Error messages helpful
- [ ] Success feedback obvious
- [ ] Keyboard shortcuts discoverable
- [ ] Help text available
- [ ] Empty states informative
- [ ] Transitions smooth

### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Text scalable
- [ ] Screen reader compatible

## 📊 Performance Benchmarks

### Load Time
- [ ] Initial load < 3s
- [ ] Monaco editor < 2s
- [ ] PDF preview renders < 1s

### Compilation Time
- [ ] Simple document < 5s
- [ ] Complex document < 15s
- [ ] Large document < 25s
- [ ] Timeout at 30s works

### Memory Usage
- [ ] No memory leaks
- [ ] Editor uses < 100MB
- [ ] PDF preview < 50MB
- [ ] Total page < 200MB

### Network
- [ ] Initial bundle < 2MB
- [ ] Monaco chunks lazy-loaded
- [ ] Images optimized
- [ ] Minimal API calls

## 🚀 Deployment Tests

### Vercel Deployment
- [ ] vercel.json valid
- [ ] Build succeeds on Vercel
- [ ] Environment variables set
- [ ] Functions don't timeout
- [ ] Static assets served
- [ ] Routes work correctly

### Production Build
- [ ] Build completes locally
- [ ] No errors in prod mode
- [ ] Performance optimized
- [ ] Code splitting works
- [ ] Lazy loading works
- [ ] CDN assets load

## 📝 Documentation Tests

### Completeness
- [ ] README.md comprehensive
- [ ] SIMPLE_COMPILER.md detailed
- [ ] LATEX_EDITOR.md complete
- [ ] DEPLOYMENT.md thorough
- [ ] All features documented
- [ ] Screenshots/examples included
- [ ] Troubleshooting guides present

### Accuracy
- [ ] Instructions work
- [ ] Code examples correct
- [ ] Links valid
- [ ] Screenshots current
- [ ] Dependencies listed
- [ ] Environment variables documented

## 🐛 Edge Cases

### Error Scenarios
- [ ] No Docker installed
- [ ] Docker not running
- [ ] Invalid LaTeX syntax
- [ ] Very large document
- [ ] Empty document
- [ ] Special characters in filename
- [ ] localStorage full
- [ ] Network offline
- [ ] Browser doesn't support features

### Data Scenarios
- [ ] Empty project list
- [ ] 50+ projects
- [ ] Very long document name
- [ ] Unicode in content
- [ ] Large PDF (>10MB)
- [ ] Rapid saving
- [ ] Concurrent compilations

## ✅ Final Checklist

Before declaring done:
- [ ] All critical bugs fixed
- [ ] All features work as designed
- [ ] All documentation complete
- [ ] Build passes
- [ ] Tests pass
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Ready for users

## 📈 Test Results Summary

**Date:** _____________
**Tester:** _____________
**Version:** _____________

**Simple Compiler:** ___/10 tests passed
**Full Editor:** ___/80 tests passed
**Collaborative Mode:** ___/15 tests passed
**Technical:** ___/30 tests passed
**Overall:** ___/135 tests passed

**Critical Issues:** _____________
**Minor Issues:** _____________
**Ready for Production:** [ ] Yes [ ] No

**Notes:**
_________________________________
_________________________________
_________________________________
