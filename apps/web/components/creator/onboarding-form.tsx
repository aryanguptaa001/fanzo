'use client';

import { useAuth } from '@clerk/nextjs';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { apiUrl, siteUrl } from '../../lib/creator';

const reserved = new Set([
  'admin',
  'api',
  'login',
  'sign-in',
  'sign-up',
  'profile',
  'settings',
  'dashboard',
  'creators',
  'explore',
  'messages',
  'calls',
  'live',
  'brand',
  'brands',
  'support',
  'help',
  'terms',
  'privacy',
]);
const usernamePattern = /^[a-z0-9_.]{3,30}$/;

export function OnboardingForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const normalizedUsername = username.trim().toLowerCase();
  const usernameError = useMemo(() => {
    if (!normalizedUsername) return null;
    if (!usernamePattern.test(normalizedUsername))
      return 'Use 3–30 lowercase letters, numbers, dots, or underscores.';
    if (reserved.has(normalizedUsername)) return 'That username is reserved. Try another one.';
    return null;
  }, [normalizedUsername]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (usernameError || !normalizedUsername) return;
    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const languages = String(form.get('languages') ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    try {
      const token = await getToken();
      const response = await fetch(`${apiUrl}/v1/creators/onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: normalizedUsername,
          displayName: form.get('displayName'),
          bio: form.get('bio') || undefined,
          category: form.get('category') || undefined,
          location: form.get('location') || undefined,
          languages,
          websiteUrl: form.get('websiteUrl') || undefined,
        }),
      });
      const payload = (await response.json()) as { message?: string | string[]; username?: string };
      if (!response.ok) {
        const message = Array.isArray(payload.message) ? payload.message[0] : payload.message;
        throw new Error(message ?? 'Unable to create your creator profile');
      }
      router.push(`/${payload.username ?? normalizedUsername}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create your creator profile');
      setSubmitting(false);
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100';
  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="username" className="text-sm font-semibold">
          Username
        </label>
        <div className="mt-2 flex rounded-xl border bg-white focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
          <span className="py-3 pl-4 text-zinc-400">fanzo.in/</span>
          <input
            id="username"
            name="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            className="min-w-0 flex-1 rounded-xl px-1 py-3 outline-none"
            aria-describedby="username-help"
          />
        </div>
        <p
          id="username-help"
          className={`mt-2 text-sm ${usernameError ? 'text-red-600' : 'text-zinc-500'}`}
        >
          {usernameError ??
            (normalizedUsername ? (
              <>
                <Check className="mr-1 inline h-4 w-4" />
                Your page will be {siteUrl.replace(/^https?:\/\//, '')}/{normalizedUsername}
              </>
            ) : (
              'Choose the link you will share with your audience.'
            ))}
        </p>
      </div>
      <div>
        <label htmlFor="displayName" className="text-sm font-semibold">
          Display name
        </label>
        <input id="displayName" name="displayName" required maxLength={80} className={inputClass} />
      </div>
      <div>
        <label htmlFor="bio" className="text-sm font-semibold">
          Bio <span className="font-normal text-zinc-400">optional</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          maxLength={500}
          rows={4}
          className={inputClass}
          placeholder="Tell people what makes your world worth following."
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="text-sm font-semibold">
            Category
          </label>
          <input
            id="category"
            name="category"
            maxLength={80}
            className={inputClass}
            placeholder="Music, fashion, gaming…"
          />
        </div>
        <div>
          <label htmlFor="location" className="text-sm font-semibold">
            Location
          </label>
          <input
            id="location"
            name="location"
            maxLength={100}
            className={inputClass}
            placeholder="Mumbai, India"
          />
        </div>
      </div>
      <div>
        <label htmlFor="languages" className="text-sm font-semibold">
          Languages
        </label>
        <input
          id="languages"
          name="languages"
          className={inputClass}
          placeholder="English, Hindi (comma separated)"
        />
      </div>
      <div>
        <label htmlFor="websiteUrl" className="text-sm font-semibold">
          Website
        </label>
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          className={inputClass}
          placeholder="https://yourwebsite.com"
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        disabled={submitting || Boolean(usernameError) || !normalizedUsername}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Creating your page…
          </>
        ) : (
          <>
            Create my page <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
