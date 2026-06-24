/*
  Warnings:

  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "current_period_end" TIMESTAMP(3),
ADD COLUMN     "stripe_customer_id" VARCHAR(255),
ADD COLUMN     "stripe_subscription_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");
