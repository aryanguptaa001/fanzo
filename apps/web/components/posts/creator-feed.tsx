'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { apiUrl, type CreatorFeed, type CreatorProfile } from '../../lib/creator';
import { PostCard } from './post-card';

export function CreatorFeedList({
  creator,
  initialFeed,
}: {
  creator: CreatorProfile;
  initialFeed: CreatorFeed;
}) {
  const [feed, setFeed] = useState(initialFeed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function loadMore() {
    if (!feed.nextCursor) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiUrl}/v1/creators/${encodeURIComponent(creator.username)}/posts?page=${feed.nextCursor}&limit=6`,
      );
      if (!response.ok) throw new Error('Could not load more posts');
      const next = (await response.json()) as CreatorFeed;
      setFeed({ items: [...feed.items, ...next.items], nextCursor: next.nextCursor });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load more posts');
    } finally {
      setLoading(false);
    }
  }
  if (!feed.items.length)
    return (
      <div className="grid min-h-56 place-items-center text-center">
        <div>
          <h2 className="font-bold">Nothing published yet.</h2>
          <p className="mt-1 text-sm text-zinc-500">
            When {creator.displayName} shares something, it will appear here.
          </p>
        </div>
      </div>
    );
  return (
    <div className="space-y-4">
      {feed.items.map((post) => (
        <PostCard key={post.id} post={post} creator={post.creator ?? creator} />
      ))}
      {error ? (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {feed.nextCursor ? (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mx-auto flex min-h-11 items-center gap-2 rounded-xl border bg-white px-5 text-sm font-bold disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Load more
        </button>
      ) : null}
    </div>
  );
}
