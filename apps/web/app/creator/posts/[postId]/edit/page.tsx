import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PostEditor } from '../../../../../components/posts/post-editor';
import { SiteLogo } from '../../../../../components/site-logo';
import { fetchMyCreator, fetchOwnedPost } from '../../../../../lib/creator-server';

export default async function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const creator = await fetchMyCreator();
  if (!creator) redirect('/creator/onboarding');
  const { postId } = await params;
  const post = await fetchOwnedPost(postId);
  if (!post) notFound();
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Edit post
              </p>
              <h1 className="mt-2 text-3xl font-black">Keep shaping it.</h1>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
            >
              {post.status}
            </span>
          </div>
          <div className="mt-8">
            <PostEditor initialPost={post} />
          </div>
        </section>
      </div>
    </main>
  );
}
