-- CreateEnum
CREATE TYPE "AnkuraCycleType" AS ENUM ('IUI', 'IVF', 'FET', 'EGG_FREEZING');

-- CreateEnum
CREATE TYPE "AnkuraCycleStage" AS ENUM ('STIMULATION', 'RETRIEVAL', 'TRANSFER', 'TWO_WEEK_WAIT', 'BETA_RESULT', 'PREGNANT', 'NOT_PREGNANT', 'PAUSED');

-- CreateEnum
CREATE TYPE "AnkuraJourneyPhase" AS ENUM ('STIMULATION', 'RETRIEVAL', 'FERTILIZATION', 'CLEAVAGE', 'MORULA', 'BLASTOCYST', 'TRANSFER', 'TWO_WEEK_WAIT', 'BETA_DAY');

-- CreateEnum
CREATE TYPE "AnkuraRoute" AS ENUM ('SUBCUTANEOUS', 'INTRAMUSCULAR', 'ORAL', 'VAGINAL');

-- CreateEnum
CREATE TYPE "AnkuraDoseOutcome" AS ENUM ('TAKEN', 'SKIPPED', 'MISSED');

-- CreateEnum
CREATE TYPE "AnkuraCostCategory" AS ENUM ('CONSULTATION', 'MEDICATION', 'MONITORING', 'RETRIEVAL', 'ICSI', 'FREEZING', 'STORAGE', 'FET', 'TRAVEL', 'OTHER');

-- CreateEnum
CREATE TYPE "AnkuraRole" AS ENUM ('PATIENT', 'SUPPORT', 'CLINIC_STAFF');

-- CreateEnum
CREATE TYPE "AnkuraSupportStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "ankura_clinics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "logoUrl" TEXT,
    "brandPrimary" TEXT NOT NULL DEFAULT '#4f6d5a',
    "brandAccent" TEXT NOT NULL DEFAULT '#cc9a3f',
    "city" TEXT,
    "supportPhone" TEXT,
    "supportEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_users" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "role" "AnkuraRole" NOT NULL DEFAULT 'PATIENT',
    "cycleType" "AnkuraCycleType",
    "cycleStage" "AnkuraCycleStage",
    "cycleStartedAt" DATE,
    "transferAt" DATE,
    "betaTestAt" DATE,
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ankura_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_otp_challenges" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "userId" TEXT,
    "codeHash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ankura_otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_support_links" (
    "id" TEXT NOT NULL,
    "primaryId" TEXT NOT NULL,
    "supportId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "status" "AnkuraSupportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "ankura_support_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "route" "AnkuraRoute" NOT NULL DEFAULT 'SUBCUTANEOUS',
    "isTrigger" BOOLEAN NOT NULL DEFAULT false,
    "timeOfDay" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_dose_logs" (
    "id" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "outcome" "AnkuraDoseOutcome" NOT NULL,
    "markedById" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ankura_dose_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_journey_days" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phase" "AnkuraJourneyPhase" NOT NULL,
    "dayLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "feelingsEn" TEXT NOT NULL,
    "illustrationKey" TEXT NOT NULL DEFAULT 'sprout',
    "displayOrder" INTEGER NOT NULL,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_journey_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_glossary_terms" (
    "id" TEXT NOT NULL,
    "termEn" TEXT NOT NULL,
    "termHi" TEXT,
    "definitionEn" TEXT NOT NULL,
    "definitionHi" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_cost_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "AnkuraCostCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "incurredAt" DATE NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ankura_cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_budgets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_clinic_packages" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceFrom" INTEGER NOT NULL,
    "priceTo" INTEGER,
    "includes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_clinic_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_announcements" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ankura_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ankura_protocol_templates" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ankura_protocol_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ankura_clinics_slug_key" ON "ankura_clinics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ankura_users_phone_key" ON "ankura_users"("phone");

-- CreateIndex
CREATE INDEX "ankura_users_clinicId_idx" ON "ankura_users"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "ankura_sessions_tokenHash_key" ON "ankura_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "ankura_sessions_userId_revokedAt_idx" ON "ankura_sessions"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "ankura_sessions_expiresAt_idx" ON "ankura_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "ankura_otp_challenges_phone_createdAt_idx" ON "ankura_otp_challenges"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "ankura_otp_challenges_expiresAt_idx" ON "ankura_otp_challenges"("expiresAt");

-- CreateIndex
CREATE INDEX "ankura_support_links_supportId_status_idx" ON "ankura_support_links"("supportId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ankura_support_links_primaryId_supportId_key" ON "ankura_support_links"("primaryId", "supportId");

-- CreateIndex
CREATE INDEX "ankura_reminders_userId_isActive_idx" ON "ankura_reminders"("userId", "isActive");

-- CreateIndex
CREATE INDEX "ankura_dose_logs_reminderId_scheduledFor_idx" ON "ankura_dose_logs"("reminderId", "scheduledFor" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ankura_dose_logs_reminderId_scheduledFor_key" ON "ankura_dose_logs"("reminderId", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "ankura_journey_days_slug_key" ON "ankura_journey_days"("slug");

-- CreateIndex
CREATE INDEX "ankura_journey_days_displayOrder_idx" ON "ankura_journey_days"("displayOrder");

-- CreateIndex
CREATE INDEX "ankura_glossary_terms_category_idx" ON "ankura_glossary_terms"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ankura_glossary_terms_termEn_key" ON "ankura_glossary_terms"("termEn");

-- CreateIndex
CREATE INDEX "ankura_cost_entries_userId_incurredAt_idx" ON "ankura_cost_entries"("userId", "incurredAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ankura_budgets_userId_key" ON "ankura_budgets"("userId");

-- CreateIndex
CREATE INDEX "ankura_clinic_packages_clinicId_isActive_idx" ON "ankura_clinic_packages"("clinicId", "isActive");

-- CreateIndex
CREATE INDEX "ankura_announcements_clinicId_publishedAt_idx" ON "ankura_announcements"("clinicId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "ankura_protocol_templates_clinicId_isActive_idx" ON "ankura_protocol_templates"("clinicId", "isActive");

-- AddForeignKey
ALTER TABLE "ankura_users" ADD CONSTRAINT "ankura_users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "ankura_clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_sessions" ADD CONSTRAINT "ankura_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ankura_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_otp_challenges" ADD CONSTRAINT "ankura_otp_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ankura_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_support_links" ADD CONSTRAINT "ankura_support_links_primaryId_fkey" FOREIGN KEY ("primaryId") REFERENCES "ankura_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_support_links" ADD CONSTRAINT "ankura_support_links_supportId_fkey" FOREIGN KEY ("supportId") REFERENCES "ankura_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_reminders" ADD CONSTRAINT "ankura_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ankura_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_dose_logs" ADD CONSTRAINT "ankura_dose_logs_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "ankura_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_cost_entries" ADD CONSTRAINT "ankura_cost_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ankura_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_budgets" ADD CONSTRAINT "ankura_budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ankura_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_clinic_packages" ADD CONSTRAINT "ankura_clinic_packages_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "ankura_clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_announcements" ADD CONSTRAINT "ankura_announcements_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "ankura_clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ankura_protocol_templates" ADD CONSTRAINT "ankura_protocol_templates_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "ankura_clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
