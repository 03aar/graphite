import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_TEX = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}

\\title{Sample LaTeX Document}
\\author{LeafIt User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Welcome to LeafIt! This is a sample LaTeX document to get you started.

\\section{Mathematics}
Here's a sample equation:
\\begin{equation}
    E = mc^2
\\end{equation}

\\section{Lists}
Here's a list:
\\begin{itemize}
    \\item First item
    \\item Second item
    \\item Third item
\\end{itemize}

\\end{document}
`;

async function main() {
  console.log('Seeding database...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@leafit.dev' },
    update: {},
    create: {
      email: 'demo@leafit.dev',
      name: 'Demo User',
      image: null,
    },
  });

  console.log('Created demo user:', user.email);

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      name: 'My First Document',
      ownerId: user.id,
      visibility: 'PRIVATE',
    },
  });

  console.log('Created sample project:', project.name);

  // Create sample files
  await prisma.file.upsert({
    where: { projectId_path: { projectId: project.id, path: 'main.tex' } },
    update: {},
    create: {
      projectId: project.id,
      path: 'main.tex',
      isDir: false,
      content: SAMPLE_TEX,
      size: SAMPLE_TEX.length,
    },
  });

  console.log('Created sample file: main.tex');

  // Create a build
  await prisma.build.create({
    data: {
      projectId: project.id,
      status: 'QUEUED',
      engine: 'PDFLATEX',
      entryFile: 'main.tex',
    },
  });

  console.log('Created sample build');

  console.log('✅ Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
