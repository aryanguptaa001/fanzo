import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicProfile } from '../../components/creator/public-profile';
import { fetchPublicCreator, siteUrl } from '../../lib/creator';

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const creator = await fetchPublicCreator(username);
  if (!creator) return { title: 'Creator not found | Fanzo' };
  const title = `${creator.displayName} (@${creator.username}) | Fanzo`;
  const description = creator.bio || `Follow ${creator.displayName} on Fanzo.`;
  const image = creator.coverImageUrl ?? creator.avatarUrl ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/${creator.username}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${creator.username}`,
      type: 'profile',
      images: image ? [image] : undefined,
    },
  };
}

export default async function CreatorPublicPage({ params }: PageProps) {
  const { username } = await params;
  const creator = await fetchPublicCreator(username);
  if (!creator) notFound();
  return <PublicProfile creator={creator} />;
}
