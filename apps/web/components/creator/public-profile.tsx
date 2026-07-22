import {
  BadgeCheck,
  BriefcaseBusiness,
  ExternalLink,
  Headphones,
  Home,
  Image as ImageIcon,
  Languages,
  MapPin,
  MessageCircle,
  Radio,
  UserPlus,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import type { CreatorFeed, CreatorProfile } from '../../lib/creator';
import { SiteLogo } from '../site-logo';
import { CreatorFeedList } from '../posts/creator-feed';

function SoonButton({
  children,
  visible = true,
}: {
  children: React.ReactNode;
  visible?: boolean;
}) {
  if (!visible) return null;
  return (
    <button
      disabled
      title="Coming soon"
      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-500 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {children}
      <span className="sr-only"> (coming soon)</span>
    </button>
  );
}

export function PublicProfile({ creator, feed }: { creator: CreatorProfile; feed: CreatorFeed }) {
  const initials = creator.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="min-h-screen bg-[#f7f7fb] pb-24 text-zinc-950 lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <SiteLogo />
          <Link
            href="/creator/onboarding"
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Create your page
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 lg:grid-cols-[190px_minmax(0,1fr)_300px] lg:px-6 lg:py-8">
        <nav aria-label="Site" className="hidden lg:block">
          <div className="sticky top-24 space-y-2 text-sm font-semibold text-zinc-500">
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white">
              <Home className="h-5 w-5" /> Home
            </Link>
            <span className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-zinc-950 shadow-sm">
              <UserPlus className="h-5 w-5 text-violet-600" /> Creator
            </span>
            <p className="px-3 pt-5 text-xs font-medium leading-relaxed text-zinc-400">
              Fanzo is building direct, meaningful creator communities.
            </p>
          </div>
        </nav>
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm">
          <div
            className="h-48 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-300 sm:h-64"
            style={
              creator.coverImageUrl
                ? {
                    backgroundImage: `linear-gradient(90deg,rgba(20,15,30,.12),rgba(20,15,30,.12)),url(${creator.coverImageUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }
                : undefined
            }
          />
          <section className="px-5 pb-7 sm:px-8">
            <div className="-mt-14 flex items-end justify-between gap-4">
              <div
                className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-4 border-white bg-zinc-900 text-3xl font-black text-white shadow-lg"
                style={
                  creator.avatarUrl
                    ? {
                        backgroundImage: `url(${creator.avatarUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                      }
                    : undefined
                }
              >
                {creator.avatarUrl ? (
                  <span className="sr-only">{creator.displayName}</span>
                ) : (
                  initials
                )}
              </div>
              <div className="mb-2 flex gap-2">
                <SoonButton>
                  <UserPlus className="h-4 w-4" /> Follow
                </SoonButton>
                <button
                  disabled
                  title="Coming soon"
                  className="min-h-11 rounded-xl px-5 text-sm font-bold text-white disabled:cursor-not-allowed"
                  style={{ backgroundColor: creator.accentColor }}
                >
                  Subscribe <span className="sr-only">(coming soon)</span>
                </button>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">{creator.displayName}</h1>
              {creator.verificationStatus === 'VERIFIED' ? (
                <BadgeCheck
                  aria-label="Verified creator"
                  className="h-6 w-6 fill-violet-600 text-white"
                />
              ) : null}
            </div>
            <p className="mt-1 font-medium text-zinc-400">@{creator.username}</p>
            {creator.bio ? (
              <p className="mt-5 max-w-2xl leading-7 text-zinc-700">{creator.bio}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
              {creator.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {creator.location}
                </span>
              ) : null}
              {creator.category ? (
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" />
                  {creator.category}
                </span>
              ) : null}
              {creator.languages.length ? (
                <span className="flex items-center gap-1.5">
                  <Languages className="h-4 w-4" />
                  {creator.languages.join(', ')}
                </span>
              ) : null}
              {creator.websiteUrl ? (
                <a
                  href={creator.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 font-semibold text-violet-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Website
                </a>
              ) : null}
            </div>
            <dl className="mt-7 grid grid-cols-3 divide-x rounded-2xl bg-zinc-50 py-4 text-center">
              <div>
                <dt className="text-xs text-zinc-400">Followers</dt>
                <dd className="mt-1 text-lg font-black">{creator.followersCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">Posts</dt>
                <dd className="mt-1 text-lg font-black">{creator.postsCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">Subscribers</dt>
                <dd className="mt-1 text-lg font-black">{creator.subscribersCount}</dd>
              </div>
            </dl>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <SoonButton visible={creator.capabilities.messaging}>
                <MessageCircle className="h-4 w-4" /> Message
              </SoonButton>
              <SoonButton visible={creator.capabilities.audioCall}>
                <Headphones className="h-4 w-4" /> Audio call
              </SoonButton>
              <SoonButton visible={creator.capabilities.videoCall}>
                <Video className="h-4 w-4" /> Video call
              </SoonButton>
              <SoonButton>
                <Radio className="h-4 w-4" /> Live
              </SoonButton>
              <SoonButton visible={creator.capabilities.brandProposals}>
                <BriefcaseBusiness className="h-4 w-4" /> Brand proposal
              </SoonButton>
            </div>
          </section>
          <section className="border-t px-5 py-7 sm:px-8">
            <div className="flex gap-6 overflow-x-auto border-b text-sm font-semibold text-zinc-400">
              {['Posts', 'Photos', 'Videos', 'Products'].map((tab, index) => (
                <span
                  key={tab}
                  className={`whitespace-nowrap pb-3 ${index === 0 ? 'border-b-2 border-zinc-950 text-zinc-950' : ''}`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <CreatorFeedList creator={creator} initialFeed={feed} />
            </div>
          </section>
          {creator.isAvailableForBrandDeals ? (
            <section className="m-5 rounded-2xl bg-zinc-950 p-6 text-white sm:m-8">
              <BriefcaseBusiness className="h-7 w-7 text-violet-400" />
              <h2 className="mt-4 text-xl font-bold">Available for brand collaborations</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Brand proposals launch in a later milestone. Soon, brands will be able to connect
                directly and securely.
              </p>
              <button
                disabled
                title="Coming soon"
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Send proposal · Coming soon
              </button>
            </section>
          ) : null}
        </main>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                Membership
              </p>
              <h2 className="mt-3 text-xl font-black">
                Get closer to {creator.displayName.split(' ')[0]}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Exclusive membership plans are coming soon.
              </p>
              <button
                disabled
                className="mt-5 w-full rounded-xl bg-zinc-100 py-3 text-sm font-bold text-zinc-400 disabled:cursor-not-allowed"
              >
                Memberships coming soon
              </button>
            </section>
            <p className="px-4 text-center text-xs text-zinc-400">
              All interactive features are clearly disabled until their dedicated milestone.
            </p>
          </div>
        </aside>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-white/95 px-3 py-3 backdrop-blur lg:hidden"
      >
        <Link href="/" className="flex min-w-16 flex-col items-center gap-1 text-xs text-zinc-500">
          <Home className="h-5 w-5" />
          Home
        </Link>
        <span className="flex min-w-16 flex-col items-center gap-1 text-xs font-semibold text-violet-600">
          <UserPlus className="h-5 w-5" />
          Creator
        </span>
        <button
          disabled
          className="flex min-w-16 flex-col items-center gap-1 text-xs text-zinc-400 disabled:cursor-not-allowed"
        >
          <MessageCircle className="h-5 w-5" />
          Soon
        </button>
      </nav>
    </div>
  );
}
