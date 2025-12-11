import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@leafit/ui';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/projects');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">LeafIt</h1>
          <Link href="/api/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-3xl px-4">
          <h2 className="text-5xl font-bold mb-4">Collaborative LaTeX Editor</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create, edit, and compile LaTeX documents in real-time with your team.
            Built for speed, simplicity, and collaboration.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/api/auth/signin">
              <Button size="lg">Get Started</Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-muted-foreground">
                See changes as they happen with multi-cursor editing and presence indicators.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Instant Compilation</h3>
              <p className="text-muted-foreground">
                Compile your LaTeX documents to PDF in seconds with our optimized build system.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Version History</h3>
              <p className="text-muted-foreground">
                Never lose your work with automatic snapshots and version control.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 LeafIt. Built with Next.js, Yjs, and TeX Live.</p>
        </div>
      </footer>
    </div>
  );
}
