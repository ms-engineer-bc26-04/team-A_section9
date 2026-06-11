-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "plan_type" VARCHAR(20) NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "area" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "school_type" VARCHAR(50) NOT NULL,
    "life_burden_level" VARCHAR(20) NOT NULL,
    "time_burden_level" VARCHAR(20) NOT NULL,
    "meal_type" VARCHAR(50) NOT NULL,
    "item_burden_level" VARCHAR(20) NOT NULL,
    "diaper_support" VARCHAR(50),
    "futon_support" VARCHAR(50),
    "extended_care_usage" VARCHAR(20) NOT NULL,
    "weekday_events_level" VARCHAR(20) NOT NULL,
    "parent_association_level" VARCHAR(20) NOT NULL,
    "contact_book_type" VARCHAR(50),
    "absence_contact_method" VARCHAR(50),
    "lessons" VARCHAR(255),
    "allergy_support" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "schools_area_idx" ON "schools"("area");
