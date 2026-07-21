import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

const optionalTrim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? (value.trim() === '' ? undefined : value.trim()) : value;

export class UpdateCreatorDto {
  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(300)
  websiteUrl?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

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
  @MaxLength(500)
  avatarUrl?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  coverImageUrl?: string;

  @IsOptional()
  @IsIn(['midnight', 'light', 'sunset'])
  theme?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @IsBoolean()
  isAvailableForChat?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailableForAudioCall?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailableForVideoCall?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailableForBrandDeals?: boolean;
}
