'use client';

export default function CreatorError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-black">This creator page could not load.</h1>
        <p className="mt-2 text-zinc-500">Please check your connection and try again.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-zinc-950 px-5 py-3 font-bold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
