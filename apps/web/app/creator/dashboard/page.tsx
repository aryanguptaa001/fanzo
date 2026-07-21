import {
  BarChart3,
  BriefcaseBusiness,
  Headphones,
  MessageCircle,
  Radio,
  Settings2,
  Users,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteLogo } from '../../../components/site-logo';
import { siteUrl } from '../../../lib/creator';
import { fetchMyCreator } from '../../../lib/creator-server';

export default async function CreatorDashboardPage() {
  const creator = await fetchMyCreator();
  if (!creator) redirect('/creator/onboarding');
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
