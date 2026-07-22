import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { PostMedia } from '../../lib/creator';
import { MediaGallery } from './media-gallery';

const imageOne: PostMedia = {
  id: 'image-1',
  type: 'IMAGE',
  url: 'http://localhost/one.jpg',
  width: null,
  height: null,
  durationSeconds: null,
  sortOrder: 0,
};
const imageTwo: PostMedia = {
  id: 'image-2',
  type: 'IMAGE',
  url: 'http://localhost/two.jpg',
  width: null,
  height: null,
  durationSeconds: null,
  sortOrder: 2,
};
const video: PostMedia = {
  id: 'video-1',
  type: 'VIDEO',
  url: 'http://localhost/video.mp4',
  width: null,
  height: null,
  durationSeconds: null,
  sortOrder: 1,
};

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

describe('MediaGallery image lightbox', () => {
  it('opens a single image and closes with the close button', () => {
    render(<MediaGallery media={[imageOne]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open image 1 of 1' }));
    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeTruthy();
    expect(screen.getByText('1 / 1')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close image viewer' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes with Escape and restores focus to the clicked image', () => {
    render(<MediaGallery media={[imageOne]} />);
    const trigger = screen.getByRole('button', { name: 'Open image 1 of 1' });
    fireEvent.click(trigger);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when the backdrop is clicked', () => {
    render(<MediaGallery media={[imageOne]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open image 1 of 1' }));
    fireEvent.click(screen.getByRole('dialog', { name: 'Image viewer' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('navigates images with controls and displays the counter', () => {
    render(<MediaGallery media={[imageOne, video, imageTwo]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open image 1 of 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByText('2 / 2')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Image 2 of 2' }).getAttribute('src')).toBe(
      imageTwo.url,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(screen.getByText('1 / 2')).toBeTruthy();
  });

  it('supports Left and Right Arrow keyboard navigation', () => {
    render(<MediaGallery media={[imageOne, imageTwo]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open image 1 of 2' }));
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 2')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 2')).toBeTruthy();
  });

  it('leaves videos on native controls and does not open a lightbox', () => {
    const { container } = render(<MediaGallery media={[video]} />);
    const videoElement = container.querySelector('video');
    expect(videoElement?.controls).toBe(true);
    if (videoElement) fireEvent.click(videoElement);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
