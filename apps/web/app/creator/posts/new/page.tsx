import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PostEditor } from '../../../../components/posts/post-editor';
import { SiteLogo } from '../../../../components/site-logo';
import { fetchMyCreator } from '../../../../lib/creator-server';

export default async function NewPostPage() {
  const creator = await fetchMyCreator();
  if (!creator) redirect('/creator/onboarding');
  return (
    <main className="min-h-screen bg-[#f7f5ff] px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <SiteLogo />
          <Link href="/creator/dashboard" className="text-sm font-bold text-zinc-500">
            ← Dashboard
          </Link>
        </header>
        <section className="mt-10 rounded-3xl border bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">New post</p>
          <h1 className="mt-2 text-3xl font-black">Create for your audience.</h1>
          <p className="mt-2 text-zinc-500">
            Start with a draft, then publish when it feels right.
          </p>
          <div className="mt-8">
            <PostEditor />
          </div>
        </section>
      </div>
    </main>
  );
}
