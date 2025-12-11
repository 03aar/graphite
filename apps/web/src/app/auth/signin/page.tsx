import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Button } from '@leafit/ui';
import Link from 'next/link';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/projects');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">LeafIt</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <Link href="/api/auth/signin/email" className="block">
            <Button className="w-full" size="lg">
              Continue with Email
            </Button>
          </Link>

          {process.env.OAUTH_GOOGLE_CLIENT_ID && (
            <Link href="/api/auth/signin/google" className="block">
              <Button className="w-full" variant="outline" size="lg">
                Continue with Google
              </Button>
            </Link>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
