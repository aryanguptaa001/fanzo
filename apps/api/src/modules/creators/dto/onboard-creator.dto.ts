import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CREATOR_USERNAME_PATTERN, normalizeCreatorUsername } from '../creator-username';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const optionalTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : trim({ value });

export class OnboardCreatorDto {
  @Transform(({ value }) => (typeof value === 'string' ? normalizeCreatorUsername(value) : value))
  @IsString()
  @Matches(CREATOR_USERNAME_PATTERN, {
    message:
      'username must be 3-30 characters using lowercase letters, numbers, underscores, or dots',
  })
  username!: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean)
      : value,
  )
  languages?: string[];

  @Transform(optionalTrim)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(300)
  websiteUrl?: string;
}
