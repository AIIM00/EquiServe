/*
  Warnings:

  - Made the column `completedAt` on table `TaskCompletion` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WarningLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Craftsman" ADD COLUMN     "warningLevel" "WarningLevel" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "TaskCompletion" ALTER COLUMN "completedAt" SET NOT NULL,
ALTER COLUMN "completedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "craftsmanId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_craftsmanId_fkey" FOREIGN KEY ("craftsmanId") REFERENCES "Craftsman"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
