import Link from 'next/link';

export function SiteLogo() {
  return (
    <Link href="/" className="text-xl font-black tracking-tight">
      fanzo<span className="text-violet-500">.</span>
    </Link>
  );
}
