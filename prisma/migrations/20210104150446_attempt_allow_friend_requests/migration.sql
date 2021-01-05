/*
  Warnings:

  - You are about to drop the column `userId` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FriendshipType" AS ENUM ('REQUESTED', 'CANCELLED', 'ACCEPTED', 'UNFRIENDED_BY_REQUESTER', 'UNFRIENDED_BY_REQUESTEE');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "friend_requests" (
    "requester_id" INTEGER NOT NULL,
    "requestee_id" INTEGER NOT NULL,
    "friendship_type" "FriendshipType" NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "unfriended_at" TIMESTAMP(3),

    PRIMARY KEY ("requester_id","requestee_id")
);

-- CreateIndex
CREATE INDEX "friend_requests.friendship_type_index" ON "friend_requests"("friendship_type") WHERE "friendship_type" IS NOT NULL;

-- CreateIndex
CREATE INDEX "friend_requests.accepted_at_index" ON "friend_requests"("accepted_at") WHERE "accepted_at" IS NOT NULL;

-- CreateIndex
CREATE INDEX "friend_requests.cancelled_at_index" ON "friend_requests"("cancelled_at") WHERE "cancelled_at" IS NOT NULL;

-- CreateIndex
CREATE INDEX "friend_requests.unfriended_at_index" ON "friend_requests"("unfriended_at") WHERE "unfriended_at" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD FOREIGN KEY("requester_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD FOREIGN KEY("requestee_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
