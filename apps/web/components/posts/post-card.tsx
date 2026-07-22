import { BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import type { CreatorPost, CreatorSummary } from '../../lib/creator';
import { MediaGallery } from './media-gallery';

export function PostCard({ post, creator }: { post: CreatorPost; creator: CreatorSummary }) {
  const date = post.publishedAt
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(post.publishedAt))
    : null;
  return (
    <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <Link
        href={`/${creator.username}/posts/${post.id}` as Route}
        className="flex items-center gap-3"
      >
        <div
          className="grid h-11 w-11 place-items-center rounded-full bg-zinc-900 text-sm font-black text-white"
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
            creator.displayName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold">
            {creator.displayName}
            {creator.verificationStatus === 'VERIFIED' ? (
              <BadgeCheck className="h-4 w-4 fill-violet-600 text-white" aria-label="Verified" />
            ) : null}
          </div>
          <p className="text-xs text-zinc-400">
            @{creator.username}
            {date ? ` · ${date}` : ''}
          </p>
        </div>
      </Link>
      {post.caption ? (
        <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-700">{post.caption}</p>
      ) : null}
      <MediaGallery media={post.media} />
    </article>
  );
}
