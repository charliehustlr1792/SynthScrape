-- AlterTable
ALTER TABLE "public"."Workflow" ADD COLUMN     "creditsCost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "executionPlan" TEXT;
