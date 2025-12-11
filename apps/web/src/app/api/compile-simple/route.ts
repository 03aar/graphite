import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

interface CompileRequest {
  content: string;
  engine?: 'pdflatex' | 'xelatex' | 'lualatex';
  entryFile?: string;
}

async function compileLatex(
  content: string,
  engine: 'pdflatex' | 'xelatex' | 'lualatex' = 'pdflatex',
  entryFile: string = 'main.tex'
): Promise<{ pdf: Buffer; log: string; success: boolean }> {
  // Create temporary directory
  const tempDir = join(tmpdir(), `leafit-simple-${randomUUID()}`);
  mkdirSync(tempDir, { recursive: true });

  try {
    // Write LaTeX file to temp directory
    const filePath = join(tempDir, entryFile);
    writeFileSync(filePath, content);

    // Map engine to latexmk option
    const engineMap = {
      pdflatex: '-pdf',
      xelatex: '-xelatex',
      lualatex: '-lualatex',
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

    console.log('[Simple Compiler] Running:', command);

    try {
      execSync(command, {
        cwd: tempDir,
        timeout: 30000, // 30 seconds
        stdio: 'pipe',
      });
    } catch (error: any) {
      // LaTeX might fail but still produce output
      console.error('[Simple Compiler] LaTeX error (continuing):', error.message);
    }

    // Read output PDF
    const pdfPath = join(tempDir, entryFile.replace('.tex', '.pdf'));
    let pdf: Buffer;
    try {
      pdf = readFileSync(pdfPath);
    } catch (error) {
      return {
        pdf: Buffer.from([]),
        log: 'Failed to generate PDF. Check your LaTeX syntax.',
        success: false,
      };
    }

    // Read log file
    const logPath = join(tempDir, entryFile.replace('.tex', '.log'));
    let log = 'Compilation completed successfully.';
    try {
      log = readFileSync(logPath, 'utf-8');
    } catch (error) {
      console.warn('[Simple Compiler] No log file found');
    }

    return { pdf, log, success: true };
  } catch (error) {
    console.error('Compilation error:', error);
    return {
      pdf: Buffer.from([]),
      log: `Error: ${error instanceof Error ? error.message : String(error)}`,
      success: false,
    };
  } finally {
    // Clean up temp directory
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('[Simple Compiler] Failed to clean up temp directory:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompileRequest;

    if (!body.content) {
      return NextResponse.json(
        { error: 'LaTeX content is required' },
        { status: 400 }
      );
    }

    const result = await compileLatex(
      body.content,
      body.engine || 'pdflatex',
      body.entryFile || 'main.tex'
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          log: result.log,
        },
        { status: 200 }
      );
    }

    // Return PDF as base64 along with log
    return NextResponse.json({
      success: true,
      pdf: result.pdf.toString('base64'),
      log: result.log,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compile LaTeX',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
