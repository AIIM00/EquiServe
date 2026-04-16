/*
  Warnings:

  - You are about to drop the column `apartment` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "apartment",
DROP COLUMN "city";
