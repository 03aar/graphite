import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { createProjectSchema } from '@leafit/shared';

// GET /api/projects - List user's projects
export async function GET() {
  try {
    const user = await requireAuth();

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            builds: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validated = createProjectSchema.parse(body);

    // Create project
    const project = await prisma.project.create({
      data: {
        name: validated.name,
        ownerId: user.id,
      },
      include: {
        owner: true,
      },
    });

    // If templateId is provided, copy template files
    if (validated.templateId) {
      // This would fetch template files and create them
      // For now, we'll create a default main.tex
      await prisma.file.create({
        data: {
          projectId: project.id,
          path: 'main.tex',
          content: getTemplateContent(validated.templateId),
          size: 0,
        },
      });
    } else {
      // Create default main.tex
      const defaultContent = `\\documentclass{article}
\\begin{document}
Hello, LaTeX!
\\end{document}
`;
      await prisma.file.create({
        data: {
          projectId: project.id,
          path: 'main.tex',
          content: defaultContent,
          size: defaultContent.length,
        },
      });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

function getTemplateContent(templateId: string): string {
  const templates: Record<string, string> = {
    article: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}

\\title{Article Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Your introduction here.

\\end{document}
`,
    ieee: `\\documentclass[conference]{IEEEtran}
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}

\\begin{document}

\\title{Your Paper Title}

\\author{
\\IEEEauthorblockN{Author Name}
\\IEEEauthorblockA{\\textit{Department} \\\\
\\textit{University}\\\\
City, Country \\\\
email@example.com}
}

\\maketitle

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\section{Introduction}
Your introduction here.

\\end{document}
`,
    resume: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{enumitem}

\\begin{document}

\\begin{center}
{\\Huge \\textbf{Your Name}} \\\\
\\vspace{5pt}
email@example.com | (123) 456-7890 | City, State
\\end{center}

\\section*{Education}
\\textbf{University Name} \\hfill Graduation Date \\\\
Degree in Major

\\section*{Experience}
\\textbf{Job Title} | Company Name \\hfill Dates \\\\
\\begin{itemize}[leftmargin=*]
    \\item Achievement or responsibility
    \\item Another achievement
\\end{itemize}

\\end{document}
`,
    report: `\\documentclass[12pt]{report}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Report Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle
\\tableofcontents

\\chapter{Introduction}
Your introduction here.

\\chapter{Background}
Background information.

\\chapter{Conclusion}
Your conclusion here.

\\end{document}
`,
  };

  return templates[templateId] || templates.article;
}
