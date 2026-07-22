import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { MediaStorageService } from './media-storage.service';
import { MAX_IMAGE_BYTES } from './media-storage.constants';

function createService() {
  const values: Record<string, string> = {
    AWS_S3_BUCKET: 'test',
    AWS_S3_ENDPOINT: 'http://localhost:9000',
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
  };
  return new MediaStorageService({
    getOrThrow: (key: string) => values[key],
    get: (key: string, fallback?: string) => values[key] ?? fallback,
  } as never);
}

describe('MediaStorageService validation', () => {
  it('rejects an unsupported media type', () => {
    const service = createService();
    expect(() =>
      service.validate({ buffer: Buffer.from('not media'), mimetype: 'application/pdf', size: 9 }),
    ).toThrow(BadRequestException);
  });

  it('rejects an oversized image', () => {
    const service = createService();
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    expect(() =>
      service.validate({ buffer: jpeg, mimetype: 'image/jpeg', size: MAX_IMAGE_BYTES + 1 }),
    ).toThrow(PayloadTooLargeException);
  });
});
