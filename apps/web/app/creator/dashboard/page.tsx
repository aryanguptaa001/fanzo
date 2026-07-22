import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  Headphones,
  MessageCircle,
  Radio,
  Plus,
  Settings2,
  Users,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { SiteLogo } from '../../../components/site-logo';
import { siteUrl } from '../../../lib/creator';
import { fetchMyCreator, fetchMyPosts } from '../../../lib/creator-server';

export default async function CreatorDashboardPage() {
  const creator = await fetchMyCreator();
  if (!creator) redirect('/creator/onboarding');
  const posts = await fetchMyPosts();
  const draftCount = posts.items.filter((post) => post.status === 'DRAFT').length;
  const publishedCount = posts.items.filter((post) => post.status === 'PUBLISHED').length;
  const completionFields = [
    creator.displayName,
    creator.bio,
    creator.avatarUrl,
    creator.coverImageUrl,
    creator.category,
    creator.location,
    creator.websiteUrl,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  );
  const cards = [
    [MessageCircle, 'Messages'],
    [Headphones, 'Audio calls'],
    [Video, 'Video calls'],
    [Radio, 'Livestreams'],
    [BriefcaseBusiness, 'Brand proposals'],
    [Users, 'Followers'],
    [BarChart3, 'Subscriptions'],
  ] as const;
  return (
    <main className="min-h-screen bg-[#f7f7fb] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <SiteLogo />
          <Link
            href={`/${creator.username}`}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-bold"
          >
            View public page ↗
          </Link>
        </header>
        <div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Creator dashboard
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Welcome, {creator.displayName}.
            </h1>
            <a
              href={`${siteUrl}/${creator.username}`}
              className="mt-2 block text-sm text-zinc-500 hover:text-violet-600"
            >
              {siteUrl}/{creator.username}
            </a>
          </div>
          <Link
            href="/creator/settings/profile"
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white"
          >
            <Settings2 className="h-4 w-4" /> Edit profile
          </Link>
        </div>
        <section className="mt-8 rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-950 p-6 text-white sm:p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-violet-200">Profile completion</p>
              <p className="mt-1 text-4xl font-black">{completion}%</p>
            </div>
            <span className="text-sm text-violet-200">
              {completion === 100 ? 'Looking sharp' : 'Keep building'}
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${completion}%` }} />
          </div>
        </section>
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-black">Content</h2>
              <p className="mt-1 text-sm text-zinc-500">Create, refine, and publish your posts.</p>
            </div>
            <Link
              href={'/creator/posts/new' as Route}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Create post
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-white p-5">
              <p className="text-sm text-zinc-500">Drafts</p>
              <p className="mt-1 text-3xl font-black">{draftCount}</p>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <p className="text-sm text-zinc-500">Published</p>
              <p className="mt-1 text-3xl font-black">{publishedCount}</p>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
            {posts.items.length ? (
              posts.items.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  href={`/creator/posts/${post.id}/edit` as Route}
                  className="flex items-center gap-4 border-b p-4 last:border-0 hover:bg-zinc-50"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {post.caption ||
                        `${post.media.length} media item${post.media.length === 1 ? '' : 's'}`}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {post.status?.toLowerCase()} · {post.visibility.toLowerCase()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-violet-600">Edit</span>
                </Link>
              ))
            ) : (
              <div className="grid min-h-48 place-items-center p-6 text-center">
                <div>
                  <FileText className="mx-auto h-9 w-9 text-zinc-300" />
                  <h3 className="mt-3 font-bold">Your first post starts here.</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Share a thought, image, or video with your audience.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
        <h2 className="mt-10 text-xl font-black">Your creator tools</h2>
        <p className="mt-1 text-sm text-zinc-500">
          The foundation is ready. These workflows arrive in future milestones.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([Icon, title]) => (
            <section key={title} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-400">
                  Coming soon
                </span>
              </div>
              <h3 className="mt-5 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-zinc-400">No activity yet.</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
