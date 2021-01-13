/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[requester_id,requestee_id]` on the table `friend_requests`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "friend_requests.requester_id_requestee_id_unique" ON "friend_requests"("requester_id", "requestee_id");
