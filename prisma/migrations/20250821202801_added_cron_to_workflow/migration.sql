-- AlterTable
ALTER TABLE "public"."Workflow" ADD COLUMN     "cron" TEXT,
ADD COLUMN     "nextRunAt" TIMESTAMP(3);
