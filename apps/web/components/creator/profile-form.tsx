'use client';

import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { apiUrl, type CreatorProfile } from '../../lib/creator';

export function ProfileForm({ creator }: { creator: CreatorProfile }) {
  const { getToken } = useAuth();
  const [preview, setPreview] = useState(creator);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      displayName: form.get('displayName'),
      bio: form.get('bio') || undefined,
      category: form.get('category') || undefined,
      location: form.get('location') || undefined,
      languages: String(form.get('languages') ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      websiteUrl: form.get('websiteUrl') || undefined,
      avatarUrl: form.get('avatarUrl') || undefined,
      coverImageUrl: form.get('coverImageUrl') || undefined,
      theme: form.get('theme'),
      accentColor: form.get('accentColor'),
      isAvailableForChat: form.get('isAvailableForChat') === 'on',
      isAvailableForAudioCall: form.get('isAvailableForAudioCall') === 'on',
      isAvailableForVideoCall: form.get('isAvailableForVideoCall') === 'on',
      isAvailableForBrandDeals: form.get('isAvailableForBrandDeals') === 'on',
    };
    try {
      const token = await getToken();
      const response = await fetch(`${apiUrl}/v1/creators/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as CreatorProfile & { message?: string | string[] };
      if (!response.ok)
        throw new Error(
          Array.isArray(result.message)
            ? result.message[0]
            : (result.message ?? 'Unable to save profile'),
        );
      setPreview(result);
      setMessage('Profile saved. Your public-page preview is up to date.');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  }

  const field =
    'mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100';
  const toggles = [
    ['isAvailableForChat', 'Messages', preview.isAvailableForChat],
    ['isAvailableForAudioCall', 'Audio calls', preview.isAvailableForAudioCall],
    ['isAvailableForVideoCall', 'Video calls', preview.isAvailableForVideoCall],
    ['isAvailableForBrandDeals', 'Brand collaborations', preview.isAvailableForBrandDeals],
  ] as const;
  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Display name
          <input
            name="displayName"
            required
            maxLength={80}
            defaultValue={preview.displayName}
            className={field}
          />
        </label>
        <label className="text-sm font-semibold">
          Category
          <input
            name="category"
            maxLength={80}
            defaultValue={preview.category ?? ''}
            className={field}
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Bio
        <textarea
          name="bio"
          maxLength={500}
          rows={4}
          defaultValue={preview.bio ?? ''}
          className={field}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Location
          <input
            name="location"
            maxLength={100}
            defaultValue={preview.location ?? ''}
            className={field}
          />
        </label>
        <label className="text-sm font-semibold">
          Languages
          <input name="languages" defaultValue={preview.languages.join(', ')} className={field} />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Website
        <input
          name="websiteUrl"
          type="url"
          defaultValue={preview.websiteUrl ?? ''}
          className={field}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Avatar image URL
          <input
            name="avatarUrl"
            type="url"
            defaultValue={preview.avatarUrl ?? ''}
            className={field}
          />
        </label>
        <label className="text-sm font-semibold">
          Cover image URL
          <input
            name="coverImageUrl"
            type="url"
            defaultValue={preview.coverImageUrl ?? ''}
            className={field}
          />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Theme
          <select name="theme" defaultValue={preview.theme} className={field}>
            <option value="midnight">Midnight</option>
            <option value="light">Light</option>
            <option value="sunset">Sunset</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Accent color
          <input
            name="accentColor"
            type="color"
            defaultValue={preview.accentColor}
            className={`${field} h-12 p-2`}
          />
        </label>
      </div>
      <fieldset>
        <legend className="font-bold">Availability</legend>
        <p className="mt-1 text-sm text-zinc-500">
          These settings only control which coming-soon actions appear publicly.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {toggles.map(([name, label, checked]) => (
            <label
              key={name}
              className="flex items-center justify-between rounded-xl border p-4 text-sm font-semibold"
            >
              <span>{label}</span>
              <input
                name={name}
                type="checkbox"
                defaultChecked={checked}
                className="h-5 w-5 accent-violet-600"
              />
            </label>
          ))}
        </div>
      </fieldset>
      {message ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-violet-50 p-4 text-sm text-violet-800"
        >
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </p>
      ) : null}
      <button
        disabled={saving}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 font-bold text-white disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          'Save profile'
        )}
      </button>
    </form>
  );
}
