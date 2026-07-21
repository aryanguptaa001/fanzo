import Link from 'next/link';
import { SiteLogo } from '../components/site-logo';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ff] p-6 text-center">
      <div>
        <SiteLogo />
        <p className="mt-10 text-sm font-bold uppercase tracking-widest text-violet-600">404</p>
        <h1 className="mt-3 text-4xl font-black">This page has not landed yet.</h1>
        <p className="mt-3 text-zinc-500">
          The creator may not exist, or this link is no longer available.
        </p>
        <Link
          href="/"
          className="mt-7 inline-block rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white"
        >
          Back to Fanzo
        </Link>
      </div>
    </main>
  );
}
