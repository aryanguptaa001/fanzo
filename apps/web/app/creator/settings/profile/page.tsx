import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileForm } from '../../../../components/creator/profile-form';
import { SiteLogo } from '../../../../components/site-logo';
import { fetchMyCreator } from '../../../../lib/creator-server';

export default async function CreatorProfileSettingsPage() {
  const creator = await fetchMyCreator();
  if (!creator) redirect('/creator/onboarding');
  return (
    <main className="min-h-screen bg-[#f7f5ff] px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <SiteLogo />
          <Link href="/creator/dashboard" className="text-sm font-semibold text-zinc-500">
            ← Dashboard
          </Link>
        </header>
        <section className="mt-10 rounded-3xl border bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
            Profile settings
          </p>
          <h1 className="mt-2 text-3xl font-black">Shape your public page.</h1>
          <p className="mt-2 text-zinc-500">
            Your username is fixed for now to protect shared links.
          </p>
          <div className="mt-8">
            <ProfileForm creator={creator} />
          </div>
        </section>
      </div>
    </main>
  );
}
