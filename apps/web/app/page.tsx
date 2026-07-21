import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Fanzo</h1>
        <p className="text-muted-foreground">Creator monetization, built to scale.</p>
        <div className="flex justify-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="rounded-md border px-4 py-2">Log in</button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-primary text-primary-foreground rounded-md px-4 py-2">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <a className="rounded-md border px-4 py-2" href="/profile">
              Profile
            </a>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </main>
  );
}
