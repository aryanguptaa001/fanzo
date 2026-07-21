import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from '../../../components/creator/onboarding-form';
import { SiteLogo } from '../../../components/site-logo';
import { fetchMyCreator } from '../../../lib/creator-server';

export default async function CreatorOnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/creator/onboarding');
  const creator = await fetchMyCreator();
  if (creator) redirect('/creator/dashboard');

  return (
    <main className="min-h-screen bg-[#f7f5ff] px-5 py-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <SiteLogo />
        <div className="mt-10 rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_24px_80px_rgba(74,45,130,0.10)] sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
            Creator onboarding
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Build your corner of the internet.
          </h1>
          <p className="mt-3 text-zinc-500">
            Set up your identity now. Content, memberships, calls, and collaborations arrive in
            future milestones.
          </p>
          <div className="mt-8">
            <OnboardingForm />
          </div>
        </div>
      </div>
    </main>
  );
}
