-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'DOCTOR', 'NURSE', 'LAB_TECH', 'PHARMACIST', 'RECEPTIONIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('SELF', 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('FULL', 'VIEW_ONLY');

-- CreateEnum
CREATE TYPE "GrantStatus" AS ENUM ('ACTIVE', 'PENDING_CONFIRMATION', 'PENDING_REVIEW', 'REVOKED');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('IN_PERSON', 'VIDEO', 'PHONE');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('PATIENT', 'CLINIC', 'DOCTOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'VITALS', 'READY', 'IN_CONSULTATION', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('DRAFT', 'SIGNED', 'AMENDED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "DispenseStatus" AS ENUM ('PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'NOT_AVAILABLE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('ORDERED', 'SAMPLE_PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'RESULTS_UPLOADED', 'VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResultFlag" AS ENUM ('NORMAL', 'LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH', 'ABNORMAL', 'INCONCLUSIVE');

-- CreateEnum
CREATE TYPE "ImagingStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'ACQUIRED', 'REPORTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecordKind" AS ENUM ('CONSULTATION', 'PRESCRIPTION', 'LAB_REPORT', 'IMAGING', 'PROCEDURE', 'VITALS', 'DOCUMENT', 'VACCINATION', 'ADMISSION', 'NOTE');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('LAB_REPORT', 'IMAGING_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'INSURANCE', 'IDENTITY', 'CONSENT', 'REFERRAL', 'INVOICE', 'OTHER');

-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "InvoiceCategory" AS ENUM ('CONSULTATION', 'LABORATORY', 'PHARMACY', 'IMAGING', 'PROCEDURE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NETBANKING', 'CASH', 'INSURANCE', 'WALLET', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('APPOINTMENT_CONFIRMED', 'APPOINTMENT_REMINDER', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'DOCTOR_DELAYED', 'QUEUE_APPROACHING', 'QUEUE_YOUR_TURN', 'LAB_REPORT_READY', 'PRESCRIPTION_READY', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'FOLLOW_UP_DUE', 'MEDICATION_REMINDER', 'ANNOUNCEMENT', 'MESSAGE_RECEIVED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "ThreadCategory" AS ENUM ('GENERAL', 'APPOINTMENT', 'PRESCRIPTION_CLARIFICATION', 'REPORT_QUERY', 'BILLING');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('PATIENT', 'STAFF', 'SYSTEM', 'AI_ASSISTANT');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "logoUrl" TEXT,
    "brandPrimary" TEXT NOT NULL DEFAULT '#0E7C6B',
    "brandAccent" TEXT NOT NULL DEFAULT '#C2703D',
    "supportPhone" TEXT NOT NULL,
    "supportEmail" TEXT,
    "emergencyPhone" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "registrationNo" TEXT,
    "gstin" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "mapsUrl" TEXT,
    "openingHours" JSONB NOT NULL DEFAULT '[]',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconKey" TEXT NOT NULL DEFAULT 'stethoscope',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialities" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "patientBlurb" TEXT,
    "iconKey" TEXT NOT NULL DEFAULT 'stethoscope',
    "preparationNotes" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "specialities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "activePatientId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_challenges" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "userId" TEXT,
    "codeHash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'LOGIN',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "bloodGroup" "BloodGroup" NOT NULL DEFAULT 'UNKNOWN',
    "avatarUrl" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "abhaAddress" TEXT,
    "abhaNumber" TEXT,
    "notableHistory" TEXT,
    "isDependent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_access_grants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "level" "AccessLevel" NOT NULL DEFAULT 'FULL',
    "status" "GrantStatus" NOT NULL DEFAULT 'ACTIVE',
    "isGuardian" BOOLEAN NOT NULL DEFAULT false,
    "reviewDueAt" TIMESTAMP(3),
    "grantedById" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,

    CONSTRAINT "patient_access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "substance" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MODERATE',
    "notedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notedById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "holderName" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "documentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialityId" TEXT NOT NULL,
    "qualifications" TEXT NOT NULL,
    "registrationNo" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "photoUrl" TEXT,
    "consultationFee" INTEGER NOT NULL DEFAULT 0,
    "followUpFee" INTEGER,
    "slotDurationMins" INTEGER NOT NULL DEFAULT 20,
    "bookingHorizonDays" INTEGER NOT NULL DEFAULT 30,
    "acceptsNewPatients" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "departmentName" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_schedule_rules" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "consultationType" "ConsultationType" NOT NULL DEFAULT 'IN_PERSON',
    "maxAppointments" INTEGER,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_schedule_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_exceptions" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "specialityId" TEXT NOT NULL,
    "locationId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "consultationType" "ConsultationType" NOT NULL DEFAULT 'IN_PERSON',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reasonForVisit" TEXT,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpId" TEXT,
    "slotLock" TEXT,
    "bookedById" TEXT,
    "bookedByRole" "Role",
    "checkedInAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" "CancelledBy",
    "cancellationReason" TEXT,
    "rescheduledFromId" TEXT,
    "joinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_entries" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "queueDate" DATE NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "estimatedWaitMins" INTEGER,
    "calledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "approachNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "kind" "RecordKind" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "authorName" TEXT,
    "specialityName" TEXT,
    "isProvisional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "chiefComplaint" TEXT,
    "historyOfPresentIllness" TEXT,
    "pastHistory" TEXT,
    "examination" JSONB NOT NULL DEFAULT '{}',
    "assessment" TEXT,
    "plan" TEXT,
    "advice" TEXT,
    "patientInstructions" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedById" TEXT,
    "amendsId" TEXT,
    "amendmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "consultationId" TEXT,
    "code" TEXT,
    "codeSystem" TEXT NOT NULL DEFAULT 'ICD10',
    "label" TEXT NOT NULL,
    "certainty" TEXT NOT NULL DEFAULT 'PROVISIONAL',
    "isChronic" BOOLEAN NOT NULL DEFAULT false,
    "onsetDate" TIMESTAMP(3),
    "resolvedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "recordedById" TEXT,
    "recordedByName" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systolicBp" INTEGER,
    "diastolicBp" INTEGER,
    "pulse" INTEGER,
    "spo2" INTEGER,
    "temperatureC10" INTEGER,
    "weightGrams" INTEGER,
    "heightMm" INTEGER,
    "respiratoryRate" INTEGER,
    "bloodSugarMgDl" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vitals_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "form" TEXT NOT NULL DEFAULT 'TABLET',
    "strength" TEXT,
    "manufacturer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "consultationId" TEXT,
    "number" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "diagnosisSummary" TEXT,
    "generalInstructions" TEXT,
    "validUntil" TIMESTAMP(3),
    "dispenseStatus" "DispenseStatus" NOT NULL DEFAULT 'PENDING',
    "dispensedAt" TIMESTAMP(3),
    "dispensedById" TEXT,
    "supersededById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicationId" TEXT,
    "medicineName" TEXT NOT NULL,
    "strength" TEXT,
    "form" TEXT,
    "morning" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "afternoon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evening" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "night" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timing" TEXT NOT NULL DEFAULT 'AFTER_FOOD',
    "durationDays" INTEGER,
    "quantity" INTEGER,
    "instructions" TEXT,
    "isSos" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_reminders" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "prescriptionItemId" TEXT,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT,
    "times" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_dose_logs" (
    "id" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "outcome" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_dose_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_tests" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'HAEMATOLOGY',
    "preparationNotes" TEXT,
    "sampleType" TEXT,
    "turnaroundHours" INTEGER NOT NULL DEFAULT 24,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isPanel" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_analytes" (
    "id" TEXT NOT NULL,
    "labTestId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "refLow" DOUBLE PRECISION,
    "refHigh" DOUBLE PRECISION,
    "refText" TEXT,
    "refVariants" JSONB NOT NULL DEFAULT '[]',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lab_analytes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "consultationId" TEXT,
    "number" TEXT NOT NULL,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "clinicalNotes" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleCollectedAt" TIMESTAMP(3),
    "sampleCollectedById" TEXT,
    "resultsUploadedAt" TIMESTAMP(3),
    "resultsUploadedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "verifiedByName" TEXT,
    "patientNotifiedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_order_items" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "labTestId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "labAnalyteId" TEXT,
    "analyteName" TEXT NOT NULL,
    "unit" TEXT,
    "valueNumeric" DOUBLE PRECISION,
    "valueText" TEXT,
    "refLow" DOUBLE PRECISION,
    "refHigh" DOUBLE PRECISION,
    "refText" TEXT,
    "flag" "ResultFlag" NOT NULL DEFAULT 'NORMAL',
    "comment" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_studies" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "consultationId" TEXT,
    "number" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "bodyPart" TEXT,
    "clinicalNotes" TEXT,
    "status" "ImagingStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),
    "reportedByName" TEXT,
    "findings" TEXT,
    "impression" TEXT,
    "studyInstanceUid" TEXT,
    "pacsAccessionNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imaging_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "labOrderId" TEXT,
    "imagingStudyId" TEXT,
    "uploadedById" TEXT,
    "uploadedByName" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedToPatientAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_shares" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "recipientHint" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxViews" INTEGER NOT NULL DEFAULT 5,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_journey_templates" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "specialityId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconKey" TEXT NOT NULL DEFAULT 'route',
    "durationLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_journey_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_journey_step_templates" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "patientGuidance" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "offsetDays" INTEGER,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "care_journey_step_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_journeys" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "templateId" TEXT,
    "doctorId" TEXT,
    "name" TEXT NOT NULL,
    "status" "JourneyStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_journey_steps" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "patientGuidance" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_journey_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "specialityId" TEXT NOT NULL,
    "consultationId" TEXT,
    "dueFrom" DATE NOT NULL,
    "dueTo" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "instructions" TEXT,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "remindedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InvoiceCategory" NOT NULL DEFAULT 'OTHER',
    "price" INTEGER NOT NULL DEFAULT 0,
    "taxPercent" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "number" TEXT NOT NULL,
    "category" "InvoiceCategory" NOT NULL DEFAULT 'CONSULTATION',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "amountDue" INTEGER NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "serviceId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "taxPercent" INTEGER NOT NULL DEFAULT 0,
    "lineTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "providerName" TEXT,
    "providerRef" TEXT,
    "idempotencyKey" TEXT,
    "failureReason" TEXT,
    "receiptNumber" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" INTEGER,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "kind" "NotificationKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "actionUrl" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "DeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "providerRef" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "category" "ThreadCategory" NOT NULL DEFAULT 'GENERAL',
    "subject" TEXT NOT NULL,
    "assignedToId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "citations" JSONB NOT NULL DEFAULT '[]',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "specialityId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" "Role",
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "patientId" TEXT,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'NORMAL',
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinics_slug_key" ON "clinics"("slug");

-- CreateIndex
CREATE INDEX "locations_clinicId_isActive_idx" ON "locations"("clinicId", "isActive");

-- CreateIndex
CREATE INDEX "departments_clinicId_isActive_displayOrder_idx" ON "departments"("clinicId", "isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "departments_clinicId_slug_key" ON "departments"("clinicId", "slug");

-- CreateIndex
CREATE INDEX "specialities_clinicId_isActive_displayOrder_idx" ON "specialities"("clinicId", "isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "specialities_departmentId_idx" ON "specialities"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "specialities_clinicId_slug_key" ON "specialities"("clinicId", "slug");

-- CreateIndex
CREATE INDEX "users_clinicId_role_isActive_idx" ON "users"("clinicId", "role", "isActive");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_clinicId_phone_key" ON "users"("clinicId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_revokedAt_idx" ON "sessions"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "otp_challenges_clinicId_phone_createdAt_idx" ON "otp_challenges"("clinicId", "phone", "createdAt");

-- CreateIndex
CREATE INDEX "otp_challenges_expiresAt_idx" ON "otp_challenges"("expiresAt");

-- CreateIndex
CREATE INDEX "patients_clinicId_isActive_idx" ON "patients"("clinicId", "isActive");

-- CreateIndex
CREATE INDEX "patients_clinicId_phone_idx" ON "patients"("clinicId", "phone");

-- CreateIndex
CREATE INDEX "patients_clinicId_fullName_idx" ON "patients"("clinicId", "fullName");

-- CreateIndex
CREATE UNIQUE INDEX "patients_clinicId_mrn_key" ON "patients"("clinicId", "mrn");

-- CreateIndex
CREATE INDEX "patient_access_grants_userId_status_idx" ON "patient_access_grants"("userId", "status");

-- CreateIndex
CREATE INDEX "patient_access_grants_patientId_status_idx" ON "patient_access_grants"("patientId", "status");

-- CreateIndex
CREATE INDEX "patient_access_grants_reviewDueAt_idx" ON "patient_access_grants"("reviewDueAt");

-- CreateIndex
CREATE UNIQUE INDEX "patient_access_grants_userId_patientId_key" ON "patient_access_grants"("userId", "patientId");

-- CreateIndex
CREATE INDEX "allergies_patientId_isActive_idx" ON "allergies"("patientId", "isActive");

-- CreateIndex
CREATE INDEX "insurance_policies_patientId_isActive_idx" ON "insurance_policies"("patientId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");

-- CreateIndex
CREATE INDEX "doctors_clinicId_isActive_displayOrder_idx" ON "doctors"("clinicId", "isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "doctors_specialityId_isActive_idx" ON "doctors"("specialityId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_userId_key" ON "staff_profiles"("userId");

-- CreateIndex
CREATE INDEX "staff_profiles_clinicId_isActive_idx" ON "staff_profiles"("clinicId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_clinicId_employeeCode_key" ON "staff_profiles"("clinicId", "employeeCode");

-- CreateIndex
CREATE INDEX "doctor_schedule_rules_doctorId_dayOfWeek_isActive_idx" ON "doctor_schedule_rules"("doctorId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "schedule_exceptions_doctorId_date_idx" ON "schedule_exceptions"("doctorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_exceptions_doctorId_date_startTime_key" ON "schedule_exceptions"("doctorId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_followUpId_key" ON "appointments"("followUpId");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_slotLock_key" ON "appointments"("slotLock");

-- CreateIndex
CREATE INDEX "appointments_clinicId_startAt_idx" ON "appointments"("clinicId", "startAt");

-- CreateIndex
CREATE INDEX "appointments_doctorId_startAt_status_idx" ON "appointments"("doctorId", "startAt", "status");

-- CreateIndex
CREATE INDEX "appointments_patientId_startAt_idx" ON "appointments"("patientId", "startAt");

-- CreateIndex
CREATE INDEX "appointments_clinicId_status_startAt_idx" ON "appointments"("clinicId", "status", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "queue_entries_appointmentId_key" ON "queue_entries"("appointmentId");

-- CreateIndex
CREATE INDEX "queue_entries_clinicId_queueDate_status_idx" ON "queue_entries"("clinicId", "queueDate", "status");

-- CreateIndex
CREATE INDEX "queue_entries_doctorId_queueDate_status_idx" ON "queue_entries"("doctorId", "queueDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "queue_entries_doctorId_queueDate_position_key" ON "queue_entries"("doctorId", "queueDate", "position");

-- CreateIndex
CREATE INDEX "medical_records_patientId_occurredAt_idx" ON "medical_records"("patientId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "medical_records_patientId_kind_occurredAt_idx" ON "medical_records"("patientId", "kind", "occurredAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_sourceType_sourceId_key" ON "medical_records"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "consultations_appointmentId_key" ON "consultations"("appointmentId");

-- CreateIndex
CREATE INDEX "consultations_patientId_startedAt_idx" ON "consultations"("patientId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "consultations_doctorId_startedAt_idx" ON "consultations"("doctorId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "diagnoses_patientId_isChronic_idx" ON "diagnoses"("patientId", "isChronic");

-- CreateIndex
CREATE INDEX "diagnoses_consultationId_idx" ON "diagnoses"("consultationId");

-- CreateIndex
CREATE INDEX "vitals_records_patientId_recordedAt_idx" ON "vitals_records"("patientId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "vitals_records_appointmentId_idx" ON "vitals_records"("appointmentId");

-- CreateIndex
CREATE INDEX "medications_clinicId_name_idx" ON "medications"("clinicId", "name");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_issuedAt_idx" ON "prescriptions"("patientId", "issuedAt" DESC);

-- CreateIndex
CREATE INDEX "prescriptions_clinicId_dispenseStatus_idx" ON "prescriptions"("clinicId", "dispenseStatus");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_clinicId_number_key" ON "prescriptions"("clinicId", "number");

-- CreateIndex
CREATE INDEX "prescription_items_prescriptionId_displayOrder_idx" ON "prescription_items"("prescriptionId", "displayOrder");

-- CreateIndex
CREATE INDEX "medication_reminders_patientId_isActive_idx" ON "medication_reminders"("patientId", "isActive");

-- CreateIndex
CREATE INDEX "medication_dose_logs_reminderId_scheduledAt_idx" ON "medication_dose_logs"("reminderId", "scheduledAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "medication_dose_logs_reminderId_scheduledAt_key" ON "medication_dose_logs"("reminderId", "scheduledAt");

-- CreateIndex
CREATE INDEX "lab_tests_clinicId_isActive_category_idx" ON "lab_tests"("clinicId", "isActive", "category");

-- CreateIndex
CREATE UNIQUE INDEX "lab_tests_clinicId_code_key" ON "lab_tests"("clinicId", "code");

-- CreateIndex
CREATE INDEX "lab_analytes_labTestId_displayOrder_idx" ON "lab_analytes"("labTestId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "lab_analytes_labTestId_code_key" ON "lab_analytes"("labTestId", "code");

-- CreateIndex
CREATE INDEX "lab_orders_patientId_orderedAt_idx" ON "lab_orders"("patientId", "orderedAt" DESC);

-- CreateIndex
CREATE INDEX "lab_orders_clinicId_status_orderedAt_idx" ON "lab_orders"("clinicId", "status", "orderedAt");

-- CreateIndex
CREATE UNIQUE INDEX "lab_orders_clinicId_number_key" ON "lab_orders"("clinicId", "number");

-- CreateIndex
CREATE INDEX "lab_order_items_labOrderId_idx" ON "lab_order_items"("labOrderId");

-- CreateIndex
CREATE INDEX "lab_results_labOrderId_displayOrder_idx" ON "lab_results"("labOrderId", "displayOrder");

-- CreateIndex
CREATE INDEX "lab_results_labAnalyteId_measuredAt_idx" ON "lab_results"("labAnalyteId", "measuredAt");

-- CreateIndex
CREATE INDEX "imaging_studies_patientId_requestedAt_idx" ON "imaging_studies"("patientId", "requestedAt" DESC);

-- CreateIndex
CREATE INDEX "imaging_studies_clinicId_status_idx" ON "imaging_studies"("clinicId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_clinicId_number_key" ON "imaging_studies"("clinicId", "number");

-- CreateIndex
CREATE INDEX "documents_patientId_uploadedAt_idx" ON "documents"("patientId", "uploadedAt" DESC);

-- CreateIndex
CREATE INDEX "documents_patientId_kind_idx" ON "documents"("patientId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "document_shares_tokenHash_key" ON "document_shares"("tokenHash");

-- CreateIndex
CREATE INDEX "document_shares_documentId_idx" ON "document_shares"("documentId");

-- CreateIndex
CREATE INDEX "document_shares_expiresAt_idx" ON "document_shares"("expiresAt");

-- CreateIndex
CREATE INDEX "care_journey_templates_clinicId_isActive_idx" ON "care_journey_templates"("clinicId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "care_journey_templates_clinicId_slug_key" ON "care_journey_templates"("clinicId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "care_journey_step_templates_templateId_displayOrder_key" ON "care_journey_step_templates"("templateId", "displayOrder");

-- CreateIndex
CREATE INDEX "care_journeys_patientId_status_idx" ON "care_journeys"("patientId", "status");

-- CreateIndex
CREATE INDEX "care_journeys_clinicId_status_idx" ON "care_journeys"("clinicId", "status");

-- CreateIndex
CREATE INDEX "care_journey_steps_journeyId_status_idx" ON "care_journey_steps"("journeyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "care_journey_steps_journeyId_displayOrder_key" ON "care_journey_steps"("journeyId", "displayOrder");

-- CreateIndex
CREATE INDEX "follow_ups_patientId_status_dueFrom_idx" ON "follow_ups"("patientId", "status", "dueFrom");

-- CreateIndex
CREATE INDEX "follow_ups_clinicId_status_dueFrom_idx" ON "follow_ups"("clinicId", "status", "dueFrom");

-- CreateIndex
CREATE INDEX "services_clinicId_isActive_category_idx" ON "services"("clinicId", "isActive", "category");

-- CreateIndex
CREATE UNIQUE INDEX "services_clinicId_code_key" ON "services"("clinicId", "code");

-- CreateIndex
CREATE INDEX "invoices_patientId_issuedAt_idx" ON "invoices"("patientId", "issuedAt" DESC);

-- CreateIndex
CREATE INDEX "invoices_clinicId_status_issuedAt_idx" ON "invoices"("clinicId", "status", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_clinicId_number_key" ON "invoices"("clinicId", "number");

-- CreateIndex
CREATE INDEX "invoice_lines_invoiceId_idx" ON "invoice_lines"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_clinicId_status_createdAt_idx" ON "payments"("clinicId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_status_scheduledFor_idx" ON "notifications"("status", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_kind_key" ON "notification_preferences"("userId", "kind");

-- CreateIndex
CREATE INDEX "message_threads_patientId_lastMessageAt_idx" ON "message_threads"("patientId", "lastMessageAt" DESC);

-- CreateIndex
CREATE INDEX "message_threads_clinicId_isResolved_lastMessageAt_idx" ON "message_threads"("clinicId", "isResolved", "lastMessageAt");

-- CreateIndex
CREATE INDEX "messages_threadId_createdAt_idx" ON "messages"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "announcements_clinicId_publishedAt_idx" ON "announcements"("clinicId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_clinicId_createdAt_idx" ON "audit_logs"("clinicId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_patientId_createdAt_idx" ON "audit_logs"("patientId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_severity_createdAt_idx" ON "audit_logs"("severity", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialities" ADD CONSTRAINT "specialities_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialities" ADD CONSTRAINT "specialities_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_challenges" ADD CONSTRAINT "otp_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_access_grants" ADD CONSTRAINT "patient_access_grants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_access_grants" ADD CONSTRAINT "patient_access_grants_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_access_grants" ADD CONSTRAINT "patient_access_grants_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedule_rules" ADD CONSTRAINT "doctor_schedule_rules_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedule_rules" ADD CONSTRAINT "doctor_schedule_rules_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "follow_ups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_clinic_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_amendsId_fkey" FOREIGN KEY ("amendsId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals_records" ADD CONSTRAINT "vitals_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals_records" ADD CONSTRAINT "vitals_records_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_prescriptionItemId_fkey" FOREIGN KEY ("prescriptionItemId") REFERENCES "prescription_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_dose_logs" ADD CONSTRAINT "medication_dose_logs_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "medication_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_analytes" ADD CONSTRAINT "lab_analytes_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "lab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_clinic_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "lab_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_labAnalyteId_fkey" FOREIGN KEY ("labAnalyteId") REFERENCES "lab_analytes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "lab_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_imagingStudyId_fkey" FOREIGN KEY ("imagingStudyId") REFERENCES "imaging_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journey_templates" ADD CONSTRAINT "care_journey_templates_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journey_templates" ADD CONSTRAINT "care_journey_templates_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journey_step_templates" ADD CONSTRAINT "care_journey_step_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "care_journey_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journeys" ADD CONSTRAINT "care_journeys_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journeys" ADD CONSTRAINT "care_journeys_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "care_journey_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journeys" ADD CONSTRAINT "care_journeys_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journey_steps" ADD CONSTRAINT "care_journey_steps_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
