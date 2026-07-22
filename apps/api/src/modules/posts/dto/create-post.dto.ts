import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostVisibility } from '@fanzo/database';

export class CreatePostDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  caption?: string;

  @IsEnum(PostVisibility)
  visibility!: PostVisibility;
}
