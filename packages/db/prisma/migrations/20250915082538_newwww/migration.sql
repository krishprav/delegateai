/*
  Warnings:

  - The values [telegram,openai] on the enum `Application` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `userId` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Application_new" AS ENUM ('Telegram', 'whatsapp', 'OpenAi', 'gmail', 'resend');
ALTER TYPE "public"."Application" RENAME TO "Application_old";
ALTER TYPE "public"."Application_new" RENAME TO "Application";
DROP TYPE "public"."Application_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."UserCredentials" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."UserCredentials" ADD CONSTRAINT "UserCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
