/*
  Warnings:

  - You are about to drop the column `media` on the `meetings` table. All the data in the column will be lost.
  - Added the required column `tmdb` to the `meetings` table without a default value. This is not possible if the table is not empty.
  - Made the column `suggested_date` on table `meetings` required. The migration will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MediaLikeState" AS ENUM ('LIKED', 'UNLIKED');

-- CreateEnum
CREATE TYPE "MeetingState" AS ENUM ('PROPOSED', 'CANCELLED_INVITER', 'CANCELLED_INVITEE', 'READ_INVITEE', 'READ_INVITER', 'EDITED_INVITER', 'EDITED_INVITEE', 'ACCEPTED_INVITEE', 'ACCEPTED_INVITER', 'DECLINED_INVITEE', 'DECLINED_INVITER', 'WATCHED');

-- AlterTable
ALTER TABLE "media_liked" ADD COLUMN     "state" "MediaLikeState" NOT NULL DEFAULT E'LIKED',
ADD COLUMN     "unliked_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "meetings" DROP COLUMN "media",
ADD COLUMN     "tmdb" INTEGER NOT NULL,
ADD COLUMN     "tmdb_media_type" "TmdbMediaType" NOT NULL DEFAULT E'SHOW',
ADD COLUMN     "state" "MeetingState" NOT NULL DEFAULT E'PROPOSED',
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "declined_at" TIMESTAMP(3),
ALTER COLUMN "suggested_date" SET NOT NULL;
