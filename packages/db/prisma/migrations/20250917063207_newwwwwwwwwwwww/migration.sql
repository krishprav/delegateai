-- AlterTable
ALTER TABLE "public"."UserCredentials" ADD COLUMN     "application" TEXT;

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_id_key" ON "public"."Project"("id");
