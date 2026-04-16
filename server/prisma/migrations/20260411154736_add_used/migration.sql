/*
  Warnings:

  - A unique constraint covering the columns `[taskId,userId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AdminInvite" ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Review_taskId_userId_key" ON "Review"("taskId", "userId");
