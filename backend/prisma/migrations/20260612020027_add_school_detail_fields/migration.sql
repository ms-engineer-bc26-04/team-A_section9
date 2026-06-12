-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "extended_care_hours" VARCHAR(50),
ADD COLUMN     "image_url" VARCHAR(255),
ADD COLUMN     "item_burden_detail" VARCHAR(255),
ADD COLUMN     "parent_association_frequency" VARCHAR(100),
ADD COLUMN     "phone_number" VARCHAR(20),
ADD COLUMN     "weekday_events" VARCHAR(100),
ALTER COLUMN "extended_care_usage" SET DATA TYPE VARCHAR(50);
