/*
  Warnings:

  - You are about to drop the column `isActive` on the `Workflow` table. All the data in the column will be lost.
  - Added the required column `active` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Workflow" DROP COLUMN "isActive",
ADD COLUMN     "active" BOOLEAN NOT NULL,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
