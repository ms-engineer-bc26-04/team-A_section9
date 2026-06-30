-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "contact_person" VARCHAR(100),
ADD COLUMN     "manager_name" VARCHAR(100);

-- CreateTable
CREATE TABLE "school_admins" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "school_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_inquiries" (
    "id" UUID NOT NULL,
    "school_id" BIGINT NOT NULL,
    "user_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_visit_reservations" (
    "id" UUID NOT NULL,
    "school_id" BIGINT NOT NULL,
    "user_id" UUID NOT NULL,
    "preferred_date" DATE NOT NULL,
    "preferred_time" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_visit_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_admins_user_id_idx" ON "school_admins"("user_id");

-- CreateIndex
CREATE INDEX "school_admins_school_id_idx" ON "school_admins"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_admins_user_id_key" ON "school_admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_admins_user_id_school_id_key" ON "school_admins"("user_id", "school_id");

-- CreateIndex
CREATE INDEX "school_inquiries_user_id_idx" ON "school_inquiries"("user_id");

-- CreateIndex
CREATE INDEX "school_inquiries_school_id_idx" ON "school_inquiries"("school_id");

-- CreateIndex
CREATE INDEX "school_visit_reservations_user_id_idx" ON "school_visit_reservations"("user_id");

-- CreateIndex
CREATE INDEX "school_visit_reservations_school_id_idx" ON "school_visit_reservations"("school_id");

-- AddForeignKey
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_inquiries" ADD CONSTRAINT "school_inquiries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_inquiries" ADD CONSTRAINT "school_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_visit_reservations" ADD CONSTRAINT "school_visit_reservations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_visit_reservations" ADD CONSTRAINT "school_visit_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
