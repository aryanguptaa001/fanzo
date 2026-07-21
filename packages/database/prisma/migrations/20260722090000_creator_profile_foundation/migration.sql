ALTER TABLE "creator_profiles"
ADD COLUMN "location" TEXT,
ADD COLUMN "category" TEXT,
ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'midnight',
ADD COLUMN "accent_color" TEXT NOT NULL DEFAULT '#7c3aed',
ADD COLUMN "is_available_for_chat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_available_for_audio_call" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_available_for_video_call" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_available_for_brand_deals" BOOLEAN NOT NULL DEFAULT false;
