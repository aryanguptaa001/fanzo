'use client';

import { useAuth } from '@clerk/nextjs';
import {
  ArrowDown,
  ArrowUp,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { ChangeEvent, useState } from 'react';
import { apiUrl, type CreatorPost } from '../../lib/creator';
import { MediaGallery } from './media-gallery';

type SelectedFile = { file: File; preview: string };

export function PostEditor({ initialPost }: { initialPost?: CreatorPost }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [caption, setCaption] = useState(initialPost?.caption ?? '');
  const [visibility, setVisibility] = useState(initialPost?.visibility ?? 'PUBLIC');
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    if ((post?.media.length ?? 0) + files.length + incoming.length > 10) {
      setError('A post can contain at most 10 media items.');
      return;
    }
    const invalid = incoming.find(
      (file) =>
        !['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.type) ||
        file.size > (file.type.startsWith('image/') ? 10 * 1024 * 1024 : 200 * 1024 * 1024),
    );
    if (invalid) {
      setError(`${invalid.name} has an unsupported format or exceeds its size limit.`);
      return;
    }
    setFiles((current) => [
      ...current,
      ...incoming.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    setError(null);
    event.target.value = '';
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    setFiles((current) => {
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function removeSelected(index: number) {
    setFiles((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function request(path: string, init: RequestInit = {}) {
    const token = await getToken();
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    });
    const payload = (await response.json()) as CreatorPost & { message?: string | string[] };
    if (!response.ok)
      throw new Error(
        Array.isArray(payload.message) ? payload.message[0] : (payload.message ?? 'Request failed'),
      );
    return payload;
  }

  async function upload(postId: string, token: string) {
    if (!files.length) return;
    const data = new FormData();
    files.forEach(({ file }) => data.append('files', file));
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiUrl}/v1/posts/${postId}/media`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(
              new Error(
                (JSON.parse(xhr.responseText) as { message?: string }).message ?? 'Upload failed',
              ),
            );
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(data);
    });
  }

  async function save(publishNow: boolean) {
    setBusy(true);
    setSaving(true);
    setError(null);
    setSuccess(null);
    setProgress(0);
    const existingPost = post;
    try {
      let saved = post
        ? await request(`/v1/posts/${post.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ caption, visibility }),
          })
        : await request('/v1/posts', {
            method: 'POST',
            body: JSON.stringify({ caption, visibility }),
          });
      const token = await getToken();
      if (!token) throw new Error('Your session has expired');
      await upload(saved.id, token);
      if (files.length) saved = await request(`/v1/posts/me/${saved.id}`);
      if (publishNow) saved = await request(`/v1/posts/${saved.id}/publish`, { method: 'POST' });
      setPost(saved);
      files.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setFiles([]);
      if (publishNow) {
        router.push('/creator/dashboard');
        router.refresh();
      } else if (!existingPost) {
        router.push(`/creator/posts/${saved.id}/edit` as Route);
      } else {
        setSuccess(
          saved.status === 'PUBLISHED'
            ? 'Changes saved. This post is still published.'
            : 'Draft saved.',
        );
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save post');
    } finally {
      setSaving(false);
      setBusy(false);
    }
  }

  async function changeStatus(action: 'publish' | 'unpublish') {
    if (!post) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await request(`/v1/posts/${post.id}/${action}`, { method: 'POST' });
      setPost(updated);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update post');
    } finally {
      setBusy(false);
    }
  }

  async function removeExisting(mediaId: string) {
    if (!post || !window.confirm('Remove this media item from the post?')) return;
    setBusy(true);
    try {
      setPost(await request(`/v1/posts/${post.id}/media/${mediaId}`, { method: 'DELETE' }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to remove media');
    } finally {
      setBusy(false);
    }
  }

  async function deletePost() {
    if (!post || !window.confirm('Delete this post? It will disappear from your public page.'))
      return;
    setBusy(true);
    try {
      await request(`/v1/posts/${post.id}`, { method: 'DELETE' });
      router.push('/creator/dashboard');
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to delete post');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="caption" className="text-sm font-bold">
          Caption
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={5000}
          rows={7}
          className="mt-2 w-full rounded-2xl border bg-white p-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          placeholder="Share something with your audience…"
        />
        <p className="mt-1 text-right text-xs text-zinc-400">{caption.length}/5000</p>
      </div>
      <label className="block text-sm font-bold">
        Visibility
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as CreatorPost['visibility'])}
          className="mt-2 w-full rounded-xl border bg-white px-4 py-3"
        >
          <option value="PUBLIC">Public</option>
          <option value="FOLLOWERS">Followers · future access control</option>
          <option value="SUBSCRIBERS">Subscribers · future access control</option>
        </select>
      </label>
      {post?.media.length ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Uploaded media</h2>
            <span className="text-xs text-zinc-400">{post.media.length}/10</span>
          </div>
          <MediaGallery media={post.media} />
          <div className="mt-2 flex flex-wrap gap-2">
            {post.media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => removeExisting(item.id)}
                disabled={busy}
                className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold text-red-600"
              >
                <X className="h-3 w-3" />
                Remove item {index + 1}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Add media</h2>
          <span className="text-xs text-zinc-400">
            JPEG, PNG, WebP · 10 MB / MP4, WebM · 200 MB
          </span>
        </div>
        <label className="mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-zinc-50 text-center hover:border-violet-400">
          <UploadCloud className="h-7 w-7 text-violet-600" />
          <span className="mt-2 text-sm font-bold">Choose images or videos</span>
          <span className="text-xs text-zinc-400">Up to 10 items per post</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={selectFiles}
            className="sr-only"
          />
        </label>
      </section>
      {files.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((item, index) => (
            <div key={item.preview} className="overflow-hidden rounded-xl border bg-white">
              <div className="relative aspect-square bg-zinc-100">
                {item.file.type.startsWith('video/') ? (
                  <video src={item.preview} className="h-full w-full object-cover" muted />
                ) : (
                  // Local object URLs are intentionally rendered directly for pre-upload previews.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.preview}
                    alt={`Selected upload ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  {item.file.type.startsWith('video/') ? (
                    <FileVideo className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                </span>
              </div>
              <div className="flex justify-center gap-1 p-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move earlier"
                  className="rounded p-2 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === files.length - 1}
                  aria-label="Move later"
                  className="rounded p-2 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSelected(index)}
                  aria-label="Remove selected file"
                  className="rounded p-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {busy && progress > 0 ? (
        <div>
          <div className="flex justify-between text-xs font-semibold">
            <span>Uploading media</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full bg-violet-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => save(false)}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border bg-white font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? 'Saving…' : post?.status === 'PUBLISHED' ? 'Save changes' : 'Save draft'}
        </button>
        {post?.status === 'PUBLISHED' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => changeStatus('unpublish')}
            className="min-h-12 flex-1 rounded-xl bg-amber-100 font-bold text-amber-900 disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => save(true)}
            className="min-h-12 flex-1 rounded-xl bg-zinc-950 font-bold text-white disabled:opacity-50"
          >
            Publish
          </button>
        )}
      </div>
      {post ? (
        <button
          type="button"
          disabled={busy}
          onClick={deletePost}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete post
        </button>
      ) : null}
    </div>
  );
}
