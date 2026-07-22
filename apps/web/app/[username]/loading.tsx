export default function CreatorLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f7f7fb] p-5">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white">
        <div className="h-56 bg-zinc-200" />
        <div className="space-y-4 p-7">
          <div className="h-10 w-1/2 rounded bg-zinc-200" />
          <div className="h-4 w-3/4 rounded bg-zinc-100" />
          <div className="mt-10 h-64 rounded-3xl bg-zinc-100" />
        </div>
      </div>
    </main>
  );
}
