import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaType } from '@fanzo/database';
import { randomUUID } from 'node:crypto';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from './media-storage.constants';

type ValidatedMedia = { type: MediaType; mimeType: string; extension: string };

@Injectable()
export class MediaStorageService implements OnModuleInit {
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.getOrThrow<string>('AWS_S3_BUCKET');
    this.endpoint = config.getOrThrow<string>('AWS_S3_ENDPOINT').replace(/\/$/, '');
    this.client = new S3Client({
      region: config.getOrThrow<string>('AWS_REGION'),
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async onModuleInit() {
    if (this.config.get<string>('NODE_ENV') !== 'development') return;
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      }),
    );
  }

  validate(file: Pick<Express.Multer.File, 'buffer' | 'mimetype' | 'size'>): ValidatedMedia {
    const detected = this.detectMimeType(file.buffer);
    if (!detected || detected.mimeType !== file.mimetype) {
      throw new BadRequestException('Unsupported media type or file signature');
    }
    const image = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(detected.mimeType);
    const video = (ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(detected.mimeType);
    if (!image && !video) throw new BadRequestException('Unsupported media type');
    const limit = image ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size > limit) {
      throw new PayloadTooLargeException(
        `${image ? 'Image' : 'Video'} exceeds the ${image ? '10 MB' : '200 MB'} limit`,
      );
    }
    return { type: image ? MediaType.IMAGE : MediaType.VIDEO, ...detected };
  }

  async upload(creatorProfileId: string, postId: string, file: Express.Multer.File) {
    const validated = this.validate(file);
    const storageKey = `creators/${creatorProfileId}/posts/${postId}/${randomUUID()}.${validated.extension}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: file.buffer,
        ContentType: validated.mimeType,
      }),
    );
    const publicBase = this.config
      .get<string>('AWS_S3_PUBLIC_URL', this.endpoint)
      .replace(/\/$/, '');
    return {
      type: validated.type,
      storageKey,
      url: `${publicBase}/${encodeURIComponent(this.bucket)}/${storageKey.split('/').map(encodeURIComponent).join('/')}`,
      mimeType: validated.mimeType,
      sizeBytes: BigInt(file.size),
    };
  }

  private detectMimeType(buffer: Buffer): { mimeType: string; extension: string } | null {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
      return { mimeType: 'image/jpeg', extension: 'jpg' };
    if (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    )
      return { mimeType: 'image/png', extension: 'png' };
    if (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    )
      return { mimeType: 'image/webp', extension: 'webp' };
    if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp')
      return { mimeType: 'video/mp4', extension: 'mp4' };
    if (buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])))
      return { mimeType: 'video/webm', extension: 'webm' };
    return null;
  }
}
