import { execSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { BuildEngine } from '@leafit/shared';

interface CompileOptions {
  files: Array<{ path: string; content: string }>;
  entryFile: string;
  engine: BuildEngine;
}

interface CompileResult {
  pdf: Buffer;
  log: string;
}

export async function compileLatex(options: CompileOptions): Promise<CompileResult> {
  const { files, entryFile, engine } = options;

  // Create temporary directory
  const tempDir = join(tmpdir(), `leafit-${randomUUID()}`);
  mkdirSync(tempDir, { recursive: true });

  try {
    // Write files to temp directory
    for (const file of files) {
      const filePath = join(tempDir, file.path);
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      if (dir !== tempDir) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(filePath, file.content);
    }

    // Map engine to latexmk option
    const engineMap: Record<BuildEngine, string> = {
      PDFLATEX: '-pdf',
      XELATEX: '-xelatex',
      LUALATEX: '-lualatex',
    };

    const latexmkEngine = engineMap[engine] || '-pdf';

    // Run LaTeX compilation in Docker
    const command = `docker run --rm \
      -v "${tempDir}:/workspace" \
      -w /workspace \
      --memory=512m \
      --cpus=1 \
      --network=none \
      --read-only \
      --tmpfs /tmp \
      texlive/texlive:latest \
      latexmk ${latexmkEngine} -interaction=nonstopmode -file-line-error "${entryFile}"`;

    console.log('[Compiler] Running:', command);

    try {
      execSync(command, {
        cwd: tempDir,
        timeout: 30000, // 30 seconds
        stdio: 'pipe',
      });
    } catch (error: any) {
      // LaTeX might fail but still produce output
      console.error('[Compiler] LaTeX error (continuing):', error.message);
    }

    // Read output PDF
    const pdfPath = join(tempDir, entryFile.replace('.tex', '.pdf'));
    let pdf: Buffer;
    try {
      pdf = readFileSync(pdfPath);
    } catch (error) {
      throw new Error('Failed to generate PDF. Check your LaTeX syntax.');
    }

    // Read log file
    const logPath = join(tempDir, entryFile.replace('.tex', '.log'));
    let log = 'Compilation completed.';
    try {
      log = readFileSync(logPath, 'utf-8');
    } catch (error) {
      console.warn('[Compiler] No log file found');
    }

    return { pdf, log };
  } finally {
    // Clean up temp directory
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('[Compiler] Failed to clean up temp directory:', error);
    }
  }
}
