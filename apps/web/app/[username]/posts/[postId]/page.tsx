import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostCard } from '../../../../components/posts/post-card';
import { SiteLogo } from '../../../../components/site-logo';
import { fetchPublicPost, siteUrl } from '../../../../lib/creator';

type PageProps = { params: Promise<{ username: string; postId: string }> };

async function getPost({ params }: PageProps) {
  const { username, postId } = await params;
  const post = await fetchPublicPost(postId);
  if (!post?.creator || post.creator.username !== username.toLowerCase()) return null;
  return post;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const post = await getPost(props);
  if (!post?.creator) return { title: 'Post not found | Fanzo' };
  const title = `${post.creator.displayName} on Fanzo`;
  const description =
    post.caption?.slice(0, 160) || `View @${post.creator.username}'s post on Fanzo.`;
  const url = `${siteUrl}/${post.creator.username}/posts/${post.id}`;
  const image = post.media.find((item) => item.type === 'IMAGE')?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', images: image ? [image] : undefined },
  };
}

export default async function PublicPostPage(props: PageProps) {
  const post = await getPost(props);
  if (!post?.creator) notFound();
  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <SiteLogo />
          <Link href={`/${post.creator.username}`} className="text-sm font-bold text-zinc-500">
            ← Creator page
          </Link>
        </header>
        <PostCard post={post} creator={post.creator} />
      </div>
    </main>
  );
}
