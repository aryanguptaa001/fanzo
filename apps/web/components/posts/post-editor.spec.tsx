import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreatorPost } from '../../lib/creator';
import { PostEditor } from './post-editor';

const mocks = vi.hoisted(() => ({ getToken: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock('@clerk/nextjs', () => ({ useAuth: () => ({ getToken: mocks.getToken }) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

function post(status: 'DRAFT' | 'PUBLISHED'): CreatorPost {
  return {
    id: `${status.toLowerCase()}-post`,
    caption: 'Original caption',
    status,
    visibility: 'PUBLIC',
    publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : null,
    media: [],
  };
}

beforeEach(() => {
  mocks.getToken.mockResolvedValue('token');
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PostEditor actions', () => {
  it('shows Save draft and Publish for a draft', () => {
    render(<PostEditor initialPost={post('DRAFT')} />);
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeTruthy();
  });

  it('shows Save changes and Unpublish for a published post', () => {
    render(<PostEditor initialPost={post('PUBLISHED')} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Unpublish' })).toBeTruthy();
  });

  it.each(['DRAFT', 'PUBLISHED'] as const)(
    'saving a %s post preserves its status',
    async (status) => {
      const existing = post(status);
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ ...existing, caption: 'Updated caption' }),
      } as Response);
      render(<PostEditor initialPost={existing} />);
      fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'Updated caption' } });
      fireEvent.click(
        screen.getByRole('button', {
          name: status === 'PUBLISHED' ? 'Save changes' : 'Save draft',
        }),
      );
      expect(screen.getByRole('button', { name: 'Saving…' })).toBeTruthy();
      await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
      const calls = vi.mocked(fetch).mock.calls;
      expect(calls).toHaveLength(1);
      expect(calls[0][0]).toContain(`/v1/posts/${existing.id}`);
      const body = JSON.parse(String(calls[0][1]?.body)) as Record<string, unknown>;
      expect(body).toEqual({ caption: 'Updated caption', visibility: 'PUBLIC' });
      expect(body).not.toHaveProperty('status');
      expect(
        screen.getByRole('button', {
          name: status === 'PUBLISHED' ? 'Save changes' : 'Save draft',
        }),
      ).toBeTruthy();
    },
  );
});
