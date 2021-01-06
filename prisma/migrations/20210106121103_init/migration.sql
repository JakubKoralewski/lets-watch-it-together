-- CreateEnum
CREATE TYPE "TmdbMediaType" AS ENUM ('MOVIE', 'SHOW', 'SEASON', 'EPISODE', 'COLLECTION');

-- CreateEnum
CREATE TYPE "FriendshipType" AS ENUM ('REQUESTED', 'CANCELLED', 'ACCEPTED', 'UNFRIENDED_BY_REQUESTER', 'UNFRIENDED_BY_REQUESTEE', 'DENIED');

-- CreateTable
CREATE TABLE "media_liked" (
"id" SERIAL,
    "tmdb_id" INTEGER NOT NULL,
    "type" "TmdbMediaType" NOT NULL DEFAULT E'SHOW',
    "user_id" INTEGER NOT NULL,
    "liked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER NOT NULL DEFAULT 100,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
"id" SERIAL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "meetings" (
"id" SERIAL,
    "media" INTEGER NOT NULL,
    "inviter_id" INTEGER NOT NULL,
    "invitee_id" INTEGER NOT NULL,
    "suggested_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
"id" SERIAL,
    "compound_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider_type" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "access_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
"id" SERIAL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "session_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
"id" SERIAL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_liked.tmdb_id_type_user_id_unique" ON "media_liked"("tmdb_id", "type", "user_id");

-- CreateIndex
CREATE INDEX "media_liked.tmdb_id_type_index" ON "media_liked"("tmdb_id", "type");

-- CreateIndex
CREATE INDEX "media_liked.tmdb_id_index" ON "media_liked"("tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- CreateIndex
CREATE INDEX "friend_requests.friendship_type_index" ON "friend_requests"("friendship_type");

-- CreateIndex
CREATE INDEX "inviteeId" ON "meetings"("invitee_id");

-- CreateIndex
CREATE INDEX "inviterId" ON "meetings"("inviter_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts.compound_id_unique" ON "accounts"("compound_id");

-- CreateIndex
CREATE INDEX "providerAccountId" ON "accounts"("provider_account_id");

-- CreateIndex
CREATE INDEX "providerId" ON "accounts"("provider_id");

-- CreateIndex
CREATE INDEX "userId" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions.session_token_unique" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions.access_token_unique" ON "sessions"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_requests.token_unique" ON "verification_requests"("token");

-- AddForeignKey
ALTER TABLE "media_liked" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD FOREIGN KEY("requester_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD FOREIGN KEY("requestee_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD FOREIGN KEY("inviter_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD FOREIGN KEY("invitee_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
