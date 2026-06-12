/*
  Warnings:

  - The `contact_book_type` column on the `schools` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `absence_contact_method` column on the `schools` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plan_type` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `school_type` on the `schools` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `life_burden_level` on the `schools` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `time_burden_level` on the `schools` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `meal_type` on the `schools` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `item_burden_level` on the `schools` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `weekday_events_level` on the `schools` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `parent_association_level` on the `schools` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "burden_level" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "school_type" AS ENUM ('NURSERY', 'KINDERGARTEN', 'CERTIFIED_CHILDCARE_CENTER');

-- CreateEnum
CREATE TYPE "meal_type" AS ENUM ('SCHOOL_LUNCH', 'LUNCH_BOX', 'BOTH');

-- CreateEnum
CREATE TYPE "contact_type" AS ENUM ('APP', 'PHONE', 'PAPER', 'OTHER');

-- CreateEnum
CREATE TYPE "membership_type" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED');

-- AlterTable
ALTER TABLE "schools" DROP COLUMN "school_type",
ADD COLUMN     "school_type" "school_type" NOT NULL,
DROP COLUMN "life_burden_level",
ADD COLUMN     "life_burden_level" "burden_level" NOT NULL,
DROP COLUMN "time_burden_level",
ADD COLUMN     "time_burden_level" "burden_level" NOT NULL,
DROP COLUMN "meal_type",
ADD COLUMN     "meal_type" "meal_type" NOT NULL,
DROP COLUMN "item_burden_level",
ADD COLUMN     "item_burden_level" "burden_level" NOT NULL,
DROP COLUMN "weekday_events_level",
ADD COLUMN     "weekday_events_level" "burden_level" NOT NULL,
DROP COLUMN "parent_association_level",
ADD COLUMN     "parent_association_level" "burden_level" NOT NULL,
DROP COLUMN "contact_book_type",
ADD COLUMN     "contact_book_type" "contact_type",
DROP COLUMN "absence_contact_method",
ADD COLUMN     "absence_contact_method" "contact_type";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "plan_type",
ADD COLUMN     "plan_type" "membership_type" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "favorites" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "school_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_histories" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "school_ids" BIGINT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compare_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_histories" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "school_id" BIGINT,
    "title" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorites_user_id_idx" ON "favorites"("user_id");

-- CreateIndex
CREATE INDEX "favorites_school_id_idx" ON "favorites"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_school_id_key" ON "favorites"("user_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "compare_histories_user_id_idx" ON "compare_histories"("user_id");

-- CreateIndex
CREATE INDEX "report_histories_user_id_idx" ON "report_histories"("user_id");

-- CreateIndex
CREATE INDEX "report_histories_school_id_idx" ON "report_histories"("school_id");

-- CreateIndex
CREATE INDEX "schools_school_type_idx" ON "schools"("school_type");

-- CreateIndex
CREATE INDEX "schools_life_burden_level_idx" ON "schools"("life_burden_level");

-- CreateIndex
CREATE INDEX "schools_time_burden_level_idx" ON "schools"("time_burden_level");

-- CreateIndex
CREATE INDEX "schools_meal_type_idx" ON "schools"("meal_type");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_histories" ADD CONSTRAINT "compare_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_histories" ADD CONSTRAINT "report_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
