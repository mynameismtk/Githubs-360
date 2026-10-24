import 'dotenv/config'
/**
 * Clinic 360 — demo data.
 *
 * ALL DATA HERE IS FICTIONAL. Names, numbers, conditions and results are invented for
 * demonstration. No real person's medical information appears anywhere in this file (§43).
 *
 * The dataset is built to be *demonstrable*, not merely present: the demo patient has a
 * next appointment, an outstanding bill, an active prescription, a ready lab report, a
 * due follow-up and a live care journey — so the home screen shows every state it can.
 */
import { PrismaClient, type Gender, type Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set.')
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const TZ_OFFSET_MIN = 330 // Asia/Kolkata, no DST

/** Build a UTC instant from a clinic-local wall time. */
function ist(dayOffset: number, hh: number, mm = 0): Date {
  const base = new Date()
  base.setUTCHours(0, 0, 0, 0)
  const d = new Date(base.getTime() + dayOffset * 86_400_000)
  return new Date(d.getTime() + (hh * 60 + mm - TZ_OFFSET_MIN) * 60_000)
}

function dateOnlyOffset(dayOffset: number): Date {
  const base = new Date()
  base.setUTCHours(0, 0, 0, 0)
  return new Date(base.getTime() + dayOffset * 86_400_000)
}

function dob(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

/** Deterministic pseudo-random so reseeding produces the same demo every time. */
let seedState = 42
function rand(): number {
  seedState = (seedState * 1103515245 + 12345) % 2147483648
  return seedState / 2147483648
}
function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]!
}

async function main() {
  console.log('Resetting demo data…')
  // Order matters: children before parents.
  await db.$transaction([
    db.auditLog.deleteMany(),
    db.message.deleteMany(),
    db.messageThread.deleteMany(),
    db.notification.deleteMany(),
    db.notificationPreference.deleteMany(),
    db.payment.deleteMany(),
    db.invoiceLine.deleteMany(),
    db.invoice.deleteMany(),
    db.medicationDoseLog.deleteMany(),
    db.medicationReminder.deleteMany(),
    db.prescriptionItem.deleteMany(),
    db.prescription.deleteMany(),
    db.labResult.deleteMany(),
    db.labOrderItem.deleteMany(),
    db.labOrder.deleteMany(),
    db.labAnalyte.deleteMany(),
    db.labTest.deleteMany(),
    db.documentShare.deleteMany(),
    db.document.deleteMany(),
    db.imagingStudy.deleteMany(),
    db.careJourneyStep.deleteMany(),
    db.careJourney.deleteMany(),
    db.careJourneyStepTemplate.deleteMany(),
    db.careJourneyTemplate.deleteMany(),
    db.followUp.deleteMany(),
    db.diagnosis.deleteMany(),
    db.vitalsRecord.deleteMany(),
    db.consultation.deleteMany(),
    db.medicalRecord.deleteMany(),
    db.queueEntry.deleteMany(),
    db.appointment.deleteMany(),
    db.scheduleException.deleteMany(),
    db.doctorScheduleRule.deleteMany(),
    db.allergy.deleteMany(),
    db.insurancePolicy.deleteMany(),
    db.patientAccessGrant.deleteMany(),
    db.patient.deleteMany(),
    db.doctor.deleteMany(),
    db.staffProfile.deleteMany(),
    db.session.deleteMany(),
    db.otpChallenge.deleteMany(),
    db.user.deleteMany(),
    db.medication.deleteMany(),
    db.service.deleteMany(),
    db.announcement.deleteMany(),
    db.speciality.deleteMany(),
    db.department.deleteMany(),
    db.location.deleteMany(),
    db.clinic.deleteMany(),
  ])
  await db.$executeRawUnsafe(`ALTER SEQUENCE mrn_seq RESTART WITH 1001`)

  // ── Clinic ────────────────────────────────────────────────────────────────
  console.log('Creating clinic…')
  const clinic = await db.clinic.create({
    data: {
      slug: 'meriva-medical-centre',
      name: 'Meriva Medical Centre',
      tagline: 'A place where care meets life.',
      logoUrl: '/brand/meriva-mark.png',
      // Proposed from the logo palette (docs/10 §2.3); confirm with the clinic.
      brandPrimary: '#0E56A0',
      brandAccent: '#F07F1A',
      // PLACEHOLDER: replace with the clinic's real front-desk number before launch.
      supportPhone: '+914220000000',
      supportEmail: 'care@meriva.example',
      emergencyPhone: '108',
      registrationNo: null,
      timezone: 'Asia/Kolkata',
      settings: {
        twoPersonLabRelease: false,
        allowOverbooking: true,
        theme: { brandHover: '#0B4787', brandInk: '#0B3A6E', brandWash: '#E7EFF8', accentWash: '#FEF1E3' },
        // PLACEHOLDER: confirm the MRN prefix with the clinic.
        mrnPrefix: 'MMC-',
      },
    },
  })

  const mainLocation = await db.location.create({
    data: {
      clinicId: clinic.id,
      name: 'Meriva Medical Centre, Coimbatore',
      // PLACEHOLDER address and coordinates: replace with the clinic's real ones.
      addressLine1: 'Address to be confirmed',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641001',
      phone: '+914220000000',
      latitude: 11.0168,
      longitude: 76.9558,
      isPrimary: true,
      openingHours: [
        { day: 1, opensAt: '08:00', closesAt: '20:00' },
        { day: 2, opensAt: '08:00', closesAt: '20:00' },
        { day: 3, opensAt: '08:00', closesAt: '20:00' },
        { day: 4, opensAt: '08:00', closesAt: '20:00' },
        { day: 5, opensAt: '08:00', closesAt: '20:00' },
        { day: 6, opensAt: '08:00', closesAt: '14:00' },
      ],
    },
  })

  // ── Departments & specialities ────────────────────────────────────────────
  console.log('Creating departments and specialities…')
  const deptSpecs: Array<{
    dept: string
    slug: string
    icon: string
    specs: Array<{ name: string; slug: string; blurb: string; icon: string; prep?: string }>
  }> = [
    {
      dept: 'Medicine',
      slug: 'medicine',
      icon: 'stethoscope',
      specs: [
        {
          name: 'General Medicine',
          slug: 'general-medicine',
          blurb: 'Fevers, infections, blood pressure, diabetes and general health concerns',
          icon: 'stethoscope',
        },
        {
          name: 'Cardiology',
          slug: 'cardiology',
          blurb: 'Heart, blood pressure and circulation',
          icon: 'heart',
          prep: 'Bring any previous ECG or echo reports. Avoid a heavy meal in the two hours before your visit.',
        },
        {
          name: 'Endocrinology',
          slug: 'endocrinology',
          blurb: 'Diabetes, thyroid and hormone-related concerns',
          icon: 'flask',
          prep: 'If a blood sugar test is likely, come fasting for 8 hours. Water is fine.',
        },
      ],
    },
    {
      dept: "Women's Health",
      slug: 'womens-health',
      icon: 'users',
      specs: [
        {
          name: 'Obstetrics & Gynaecology',
          slug: 'obstetrics-gynaecology',
          blurb: "Pregnancy, women's health and reproductive care",
          icon: 'users',
        },
        {
          name: 'Fertility',
          slug: 'fertility',
          blurb: 'Support and treatment for couples trying to conceive',
          icon: 'route',
          prep: 'Please bring reports from any previous fertility investigations, for both partners.',
        },
      ],
    },
    {
      dept: 'Child Health',
      slug: 'child-health',
      icon: 'users',
      specs: [
        {
          name: 'Paediatrics',
          slug: 'paediatrics',
          blurb: 'Care for infants, children and teenagers',
          icon: 'users',
          prep: "Bring your child's immunisation card if you have it.",
        },
      ],
    },
    {
      dept: 'Surgery & Bones',
      slug: 'surgery-bones',
      icon: 'scan',
      specs: [
        {
          name: 'Orthopaedics',
          slug: 'orthopaedics',
          blurb: 'Bones, joints, back pain and sports injuries',
          icon: 'scan',
          prep: 'Bring any existing X-rays or scan films.',
        },
        {
          name: 'Dermatology',
          slug: 'dermatology',
          blurb: 'Skin, hair and nail concerns',
          icon: 'scan',
        },
      ],
    },
  ]

  const specialities: Record<string, { id: string; name: string }> = {}
  let deptOrder = 0
  for (const group of deptSpecs) {
    const department = await db.department.create({
      data: {
        clinicId: clinic.id,
        name: group.dept,
        slug: group.slug,
        iconKey: group.icon,
        displayOrder: deptOrder++,
      },
    })
    let specOrder = 0
    for (const s of group.specs) {
      const speciality = await db.speciality.create({
        data: {
          clinicId: clinic.id,
          departmentId: department.id,
          name: s.name,
          slug: s.slug,
          patientBlurb: s.blurb,
          iconKey: s.icon,
          preparationNotes: s.prep ?? null,
          displayOrder: specOrder++,
        },
      })
      specialities[s.slug] = { id: speciality.id, name: speciality.name }
    }
  }

  // ── Doctors ───────────────────────────────────────────────────────────────
  console.log('Creating doctors…')
  const doctorSeeds = [
    { name: 'Anil Kumar', phone: '+919400100001', spec: 'cardiology', quals: 'MBBS, MD (General Medicine), DM (Cardiology)', exp: 18, fee: 90000, langs: ['en', 'ml', 'hi'], slot: 20 },
    { name: 'Meera Raghavan', phone: '+919400100002', spec: 'obstetrics-gynaecology', quals: 'MBBS, MS (Obstetrics & Gynaecology)', exp: 14, fee: 80000, langs: ['en', 'ml', 'ta'], slot: 20 },
    { name: 'Sanjay Pillai', phone: '+919400100003', spec: 'general-medicine', quals: 'MBBS, MD (General Medicine)', exp: 11, fee: 60000, langs: ['en', 'ml'], slot: 15 },
    { name: 'Fathima Rasheed', phone: '+919400100004', spec: 'paediatrics', quals: 'MBBS, MD (Paediatrics)', exp: 9, fee: 65000, langs: ['en', 'ml', 'hi'], slot: 15 },
    { name: 'Rajesh Menon', phone: '+919400100005', spec: 'orthopaedics', quals: 'MBBS, MS (Orthopaedics)', exp: 16, fee: 85000, langs: ['en', 'ml'], slot: 20 },
    { name: 'Divya Krishnan', phone: '+919400100006', spec: 'endocrinology', quals: 'MBBS, MD (General Medicine), DM (Endocrinology)', exp: 12, fee: 95000, langs: ['en', 'ml', 'ta'], slot: 25 },
    { name: 'Thomas Varghese', phone: '+919400100007', spec: 'general-medicine', quals: 'MBBS, MD (General Medicine)', exp: 22, fee: 70000, langs: ['en', 'ml'], slot: 20 },
    { name: 'Priya Nambiar', phone: '+919400100008', spec: 'dermatology', quals: 'MBBS, MD (Dermatology, Venereology & Leprosy)', exp: 8, fee: 75000, langs: ['en', 'ml', 'hi'], slot: 15 },
    { name: 'Vikram Shetty', phone: '+919400100009', spec: 'fertility', quals: 'MBBS, MS (Obstetrics & Gynaecology), Fellowship in Reproductive Medicine', exp: 15, fee: 120000, langs: ['en', 'kn', 'hi'], slot: 30 },
    { name: 'Lakshmi Iyer', phone: '+919400100010', spec: 'cardiology', quals: 'MBBS, MD (General Medicine), DNB (Cardiology)', exp: 10, fee: 88000, langs: ['en', 'ta', 'ml'], slot: 20 },
  ] as const

  const doctors: Array<{ id: string; userId: string; name: string; spec: string; slot: number }> = []
  for (const [index, d] of doctorSeeds.entries()) {
    const user = await db.user.create({
      data: {
        clinicId: clinic.id,
        phone: d.phone,
        fullName: d.name,
        email: `${d.name.toLowerCase().replace(/\s+/g, '.')}@meriva.example`,
        role: 'DOCTOR',
        phoneVerifiedAt: new Date(),
      },
    })
    const doctor = await db.doctor.create({
      data: {
        clinicId: clinic.id,
        userId: user.id,
        specialityId: specialities[d.spec]!.id,
        qualifications: d.quals,
        registrationNo: `DEMO-${52000 + index * 137}`,
        yearsExperience: d.exp,
        languages: [...d.langs],
        consultationFee: d.fee,
        followUpFee: Math.round(d.fee * 0.6),
        slotDurationMins: d.slot,
        displayOrder: index,
        bio: `Dr. ${d.name} has ${d.exp} years of experience in ${specialities[d.spec]!.name.toLowerCase()} and consults at ${clinic.name}.`,
      },
    })
    doctors.push({ id: doctor.id, userId: user.id, name: d.name, spec: d.spec, slot: d.slot })

    // Weekly availability. Morning clinics for everyone; a few also run evenings so the
    // booking screen has genuinely different shapes to show.
    const weekdays = index % 2 === 0 ? [1, 2, 3, 4, 5] : [1, 3, 5, 6]
    for (const day of weekdays) {
      await db.doctorScheduleRule.create({
        data: {
          doctorId: doctor.id,
          locationId: mainLocation.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: day === 6 ? '13:00' : '13:00',
        },
      })
      if (index % 3 === 0 && day !== 6) {
        await db.doctorScheduleRule.create({
          data: {
            doctorId: doctor.id,
            locationId: mainLocation.id,
            dayOfWeek: day,
            startTime: '16:00',
            endTime: '19:00',
          },
        })
      }
    }
  }

  // A doctor on leave, so the availability engine has an exception to honour.
  await db.scheduleException.create({
    data: {
      doctorId: doctors[4]!.id,
      date: dateOnlyOffset(3),
      isAvailable: false,
      reason: 'Conference leave',
    },
  })

  // ── Staff ─────────────────────────────────────────────────────────────────
  console.log('Creating staff…')
  const staffSeeds = [
    { name: 'Reception Desk', phone: '+919400200001', role: 'RECEPTIONIST' as const, code: 'REC-001', designation: 'Front Office Executive' },
    { name: 'Sreeja Nair', phone: '+919400200002', role: 'NURSE' as const, code: 'NUR-001', designation: 'Staff Nurse' },
    { name: 'Arun Dev', phone: '+919400200003', role: 'LAB_TECH' as const, code: 'LAB-001', designation: 'Laboratory Technician' },
    { name: 'Nisha Joseph', phone: '+919400200004', role: 'PHARMACIST' as const, code: 'PHA-001', designation: 'Pharmacist' },
    { name: 'Clinic Administrator', phone: '+919400200005', role: 'ADMIN' as const, code: 'ADM-001', designation: 'Clinic Manager' },
  ]
  for (const s of staffSeeds) {
    const user = await db.user.create({
      data: { clinicId: clinic.id, phone: s.phone, fullName: s.name, role: s.role, phoneVerifiedAt: new Date() },
    })
    await db.staffProfile.create({
      data: {
        clinicId: clinic.id,
        userId: user.id,
        employeeCode: s.code,
        designation: s.designation,
        permissions: s.role === 'LAB_TECH' ? { canVerifyResults: true } : {},
      },
    })
  }

  // ── Catalogue: services, medications, lab tests ───────────────────────────
  console.log('Creating catalogue…')
  await db.service.createMany({
    data: [
      { clinicId: clinic.id, code: 'CONS-NEW', name: 'New consultation', category: 'CONSULTATION', price: 70000 },
      { clinicId: clinic.id, code: 'CONS-FU', name: 'Follow-up consultation', category: 'CONSULTATION', price: 40000 },
      { clinicId: clinic.id, code: 'DRESS', name: 'Dressing', category: 'PROCEDURE', price: 30000 },
      { clinicId: clinic.id, code: 'ECG', name: 'ECG', category: 'IMAGING', price: 45000 },
      { clinicId: clinic.id, code: 'USG-ABD', name: 'Ultrasound — abdomen', category: 'IMAGING', price: 130000 },
    ],
  })

  const medicationSeeds = [
    { name: 'Metformin', generic: 'Metformin hydrochloride', form: 'TABLET', strength: '500 mg' },
    { name: 'Amlodipine', generic: 'Amlodipine besylate', form: 'TABLET', strength: '5 mg' },
    { name: 'Atorvastatin', generic: 'Atorvastatin calcium', form: 'TABLET', strength: '10 mg' },
    { name: 'Paracetamol', generic: 'Paracetamol', form: 'TABLET', strength: '650 mg' },
    { name: 'Pantoprazole', generic: 'Pantoprazole sodium', form: 'TABLET', strength: '40 mg' },
    { name: 'Folic Acid', generic: 'Folic acid', form: 'TABLET', strength: '5 mg' },
    { name: 'Cetirizine', generic: 'Cetirizine hydrochloride', form: 'TABLET', strength: '10 mg' },
    { name: 'Thyroxine', generic: 'Levothyroxine sodium', form: 'TABLET', strength: '50 mcg' },
  ]
  const medications: Record<string, string> = {}
  for (const m of medicationSeeds) {
    const created = await db.medication.create({
      data: { clinicId: clinic.id, name: m.name, genericName: m.generic, form: m.form, strength: m.strength },
    })
    medications[m.name] = created.id
  }

  const labTestSeeds = [
    {
      code: 'CBC',
      name: 'Complete Blood Count',
      category: 'HAEMATOLOGY',
      sample: 'BLOOD',
      price: 45000,
      isPanel: true,
      analytes: [
        { code: 'HB', name: 'Haemoglobin', unit: 'g/dL', low: 12, high: 16 },
        { code: 'WBC', name: 'Total WBC count', unit: '10³/µL', low: 4, high: 11 },
        { code: 'PLT', name: 'Platelet count', unit: '10³/µL', low: 150, high: 410 },
        { code: 'RBC', name: 'RBC count', unit: '10⁶/µL', low: 4.2, high: 5.4 },
      ],
    },
    {
      code: 'HBA1C',
      name: 'HbA1c (Glycated Haemoglobin)',
      category: 'BIOCHEMISTRY',
      sample: 'BLOOD',
      price: 65000,
      prep: 'No fasting required.',
      analytes: [{ code: 'HBA1C', name: 'HbA1c', unit: '%', low: 4.0, high: 5.6 }],
    },
    {
      code: 'LIPID',
      name: 'Lipid Profile',
      category: 'BIOCHEMISTRY',
      sample: 'BLOOD',
      price: 75000,
      isPanel: true,
      prep: 'Fasting for 9–12 hours is required. Water is fine.',
      analytes: [
        { code: 'CHOL', name: 'Total cholesterol', unit: 'mg/dL', low: 0, high: 200 },
        { code: 'LDL', name: 'LDL cholesterol', unit: 'mg/dL', low: 0, high: 100 },
        { code: 'HDL', name: 'HDL cholesterol', unit: 'mg/dL', low: 40, high: 100 },
        { code: 'TG', name: 'Triglycerides', unit: 'mg/dL', low: 0, high: 150 },
      ],
    },
    {
      code: 'TSH',
      name: 'Thyroid Stimulating Hormone',
      category: 'BIOCHEMISTRY',
      sample: 'BLOOD',
      price: 40000,
      analytes: [{ code: 'TSH', name: 'TSH', unit: 'µIU/mL', low: 0.4, high: 4.0 }],
    },
    {
      code: 'FBS',
      name: 'Fasting Blood Sugar',
      category: 'BIOCHEMISTRY',
      sample: 'BLOOD',
      price: 15000,
      prep: 'Fasting for 8 hours is required.',
      analytes: [{ code: 'FBS', name: 'Fasting glucose', unit: 'mg/dL', low: 70, high: 100 }],
    },
  ]
  const labTests: Record<string, { id: string; analytes: Record<string, string> }> = {}
  for (const t of labTestSeeds) {
    const test = await db.labTest.create({
      data: {
        clinicId: clinic.id,
        code: t.code,
        name: t.name,
        category: t.category,
        sampleType: t.sample,
        price: t.price,
        isPanel: t.isPanel ?? false,
        preparationNotes: t.prep ?? null,
      },
    })
    const analytes: Record<string, string> = {}
    for (const [i, a] of t.analytes.entries()) {
      const created = await db.labAnalyte.create({
        data: {
          labTestId: test.id,
          code: a.code,
          name: a.name,
          unit: a.unit,
          refLow: a.low,
          refHigh: a.high,
          displayOrder: i,
        },
      })
      analytes[a.code] = created.id
    }
    labTests[t.code] = { id: test.id, analytes }
  }

  // ── Care journey templates ────────────────────────────────────────────────
  console.log('Creating care journey templates…')
  const journeyTemplates = [
    {
      name: 'Pregnancy Care',
      slug: 'pregnancy-care',
      spec: 'obstetrics-gynaecology',
      duration: 'About 9 months',
      steps: [
        ['First consultation', 'Confirming the pregnancy and planning your care', 0],
        ['Initial investigations', 'Blood tests and baseline checks', 7],
        ['First ultrasound', 'Dating scan to confirm how far along you are', 14],
        ['Second trimester review', 'Anomaly scan and routine checks', 90],
        ['Third trimester review', 'Growth scan and delivery planning', 180],
        ['Delivery planning', 'Agreeing where and how you would like to deliver', 240],
      ] as const,
    },
    {
      name: 'Fertility Care',
      slug: 'fertility-care',
      spec: 'fertility',
      duration: '3–6 months',
      steps: [
        ['Consultation', 'Understanding your history, for both partners', 0],
        ['Investigations', 'Hormone tests, scans and semen analysis', 7],
        ['Treatment planning', 'Discussing the options that suit you', 21],
        ['Medication', 'Starting the agreed treatment', 30],
        ['Monitoring', 'Scans and blood tests to track your response', 45],
        ['Procedure', 'The planned procedure, if part of your treatment', 60],
        ['Follow-up', 'Reviewing how things went and next steps', 75],
      ] as const,
    },
    {
      name: 'Diabetes Care',
      slug: 'diabetes-care',
      spec: 'endocrinology',
      duration: 'Ongoing',
      steps: [
        ['Initial consultation', 'Understanding your diabetes and your goals', 0],
        ['Blood investigations', 'HbA1c, sugars, kidney and lipid checks', 3],
        ['Medication', 'Starting or adjusting your medicines', 7],
        ['Lifestyle plan', 'Food and activity that fit your routine', 14],
        ['Repeat HbA1c', 'Checking how the plan is working', 90],
        ['Follow-up', 'Reviewing and adjusting together', 100],
      ] as const,
    },
  ]
  const templates: Record<string, string> = {}
  for (const tmpl of journeyTemplates) {
    const created = await db.careJourneyTemplate.create({
      data: {
        clinicId: clinic.id,
        specialityId: specialities[tmpl.spec]!.id,
        name: tmpl.name,
        slug: tmpl.slug,
        durationLabel: tmpl.duration,
        iconKey: 'route',
        steps: {
          create: tmpl.steps.map(([name, guidance, offset], i) => ({
            name,
            patientGuidance: guidance,
            displayOrder: i,
            offsetDays: offset,
          })),
        },
      },
    })
    templates[tmpl.slug] = created.id
  }

  // ── Patients ──────────────────────────────────────────────────────────────
  console.log('Creating patients and families…')
  const firstNames = ['Arjun', 'Kavya', 'Rahul', 'Anjali', 'Vishnu', 'Deepa', 'Nikhil', 'Reshma', 'Manoj', 'Sneha', 'Harish', 'Gayathri', 'Suresh', 'Anita', 'Jomon', 'Bindu', 'Praveen', 'Shalini', 'Ravi', 'Maya', 'Ajith', 'Neethu', 'Sunil', 'Remya', 'Bijoy', 'Asha', 'Vineeth', 'Jaya']
  const lastNames = ['Nair', 'Menon', 'Pillai', 'Kurian', 'Thomas', 'Raj', 'Warrier', 'Panicker', 'Das', 'Mathew']

  interface SeededPatient { id: string; name: string; userId?: string }
  const patients: SeededPatient[] = []

  /** Create a patient plus a login and a SELF grant. */
  async function createAccountHolder(opts: {
    name: string
    phone: string
    dobDate: Date
    gender: Gender
    blood?: Prisma.PatientCreateInput['bloodGroup']
    address?: string
  }): Promise<SeededPatient> {
    const user = await db.user.create({
      data: { clinicId: clinic.id, phone: opts.phone, fullName: opts.name, role: 'PATIENT', phoneVerifiedAt: new Date() },
    })
    const mrnRow = await db.$queryRaw<Array<{ nextval: bigint }>>`SELECT nextval('mrn_seq') AS nextval`
    const patient = await db.patient.create({
      data: {
        clinicId: clinic.id,
        mrn: `MMC-${String(mrnRow[0]!.nextval).padStart(5, '0')}`,
        fullName: opts.name,
        dateOfBirth: opts.dobDate,
        gender: opts.gender,
        phone: opts.phone,
        bloodGroup: opts.blood ?? 'UNKNOWN',
        addressLine1: opts.address ?? '12/A, Sea View Apartments',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641001',
      },
    })
    await db.patientAccessGrant.create({
      data: { userId: user.id, patientId: patient.id, relationship: 'SELF', level: 'FULL', status: 'ACTIVE', confirmedAt: new Date() },
    })
    return { id: patient.id, name: opts.name, userId: user.id }
  }

  /** Create a dependent patient under an existing account holder. */
  async function createDependent(opts: {
    userId: string
    name: string
    dobDate: Date
    gender: Gender
    relationship: 'SPOUSE' | 'CHILD' | 'PARENT'
  }): Promise<SeededPatient> {
    const mrnRow = await db.$queryRaw<Array<{ nextval: bigint }>>`SELECT nextval('mrn_seq') AS nextval`
    const patient = await db.patient.create({
      data: {
        clinicId: clinic.id,
        mrn: `MMC-${String(mrnRow[0]!.nextval).padStart(5, '0')}`,
        fullName: opts.name,
        dateOfBirth: opts.dobDate,
        gender: opts.gender,
        isDependent: true,
        city: 'Coimbatore',
        state: 'Tamil Nadu',
      },
    })
    const isMinor = Date.now() - opts.dobDate.getTime() < 18 * 365.25 * 86_400_000
    await db.patientAccessGrant.create({
      data: {
        userId: opts.userId,
        patientId: patient.id,
        relationship: opts.relationship,
        level: 'FULL',
        status: 'ACTIVE',
        isGuardian: isMinor,
        confirmedAt: new Date(),
        grantedById: opts.userId,
      },
    })
    return { id: patient.id, name: opts.name }
  }

  // The demo family — a complete household so the family switcher is meaningful.
  const demoPatient = await createAccountHolder({
    name: 'Arun Menon',
    phone: '+919400000001',
    dobDate: dob(1986, 4, 12),
    gender: 'MALE',
    blood: 'O_POS',
  })
  patients.push(demoPatient)

  const spouse = await createDependent({ userId: demoPatient.userId!, name: 'Divya Menon', dobDate: dob(1989, 9, 3), gender: 'FEMALE', relationship: 'SPOUSE' })
  const child = await createDependent({ userId: demoPatient.userId!, name: 'Ishaan Menon', dobDate: dob(2019, 2, 18), gender: 'MALE', relationship: 'CHILD' })
  const mother = await createDependent({ userId: demoPatient.userId!, name: 'Lakshmi Menon', dobDate: dob(1958, 7, 22), gender: 'FEMALE', relationship: 'PARENT' })
  patients.push(spouse, child, mother)

  await db.allergy.createMany({
    data: [
      { patientId: demoPatient.id, substance: 'Penicillin', reaction: 'Rash and itching', severity: 'MODERATE' },
      { patientId: mother.id, substance: 'Sulfa drugs', reaction: 'Swelling', severity: 'SEVERE' },
    ],
  })

  await db.insurancePolicy.create({
    data: {
      patientId: demoPatient.id,
      insurerName: 'Coastal General Insurance',
      policyNumber: 'CGI-FAM-8841207',
      holderName: 'Arun Menon',
      validFrom: dob(2026, 1, 1),
      validTo: dob(2026, 12, 31),
    },
  })

  // Remaining patients, to reach 30 total.
  for (let i = 0; patients.length < 30; i++) {
    const first = firstNames[i % firstNames.length]!
    const last = pick(lastNames)
    const year = 1950 + Math.floor(rand() * 55)
    const p = await createAccountHolder({
      name: `${first} ${last}`,
      phone: `+9194001${String(10000 + i).slice(-5)}`,
      dobDate: dob(year, 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      gender: pick(['MALE', 'FEMALE'] as const),
      blood: pick(['O_POS', 'A_POS', 'B_POS', 'AB_POS', 'O_NEG', 'UNKNOWN'] as const),
      address: `${1 + Math.floor(rand() * 98)}, ${pick(['Race Course Road', 'Avinashi Road', 'Trichy Road', 'Mettupalayam Road', 'DB Road', 'Sathy Road'] as const)}`,
    })
    patients.push(p)
  }

  // ── Appointments ──────────────────────────────────────────────────────────
  console.log('Creating appointments…')
  const reasons = [
    'Persistent cough for two weeks',
    'Routine blood pressure review',
    'Follow-up on blood sugar',
    'Knee pain while climbing stairs',
    'Skin rash on both arms',
    'Fever and body ache since Monday',
    'Antenatal check-up',
    'Child has been off food',
    'Chest discomfort on exertion',
    'Thyroid medication review',
  ]

  let created = 0
  const bookedLocks = new Set<string>()

  async function book(patientId: string, doctorIdx: number, dayOffset: number, hh: number, mm: number, status: Prisma.AppointmentCreateInput['status'] = 'CONFIRMED', reason?: string) {
    const doctor = doctors[doctorIdx]!
    const startAt = ist(dayOffset, hh, mm)
    const lock = `${doctor.id}|${startAt.toISOString()}`
    if (bookedLocks.has(lock)) return null
    bookedLocks.add(lock)
    const releases = status === 'CANCELLED' || status === 'NO_SHOW'
    const doctorRow = await db.doctor.findUniqueOrThrow({ where: { id: doctor.id }, select: { specialityId: true, slotDurationMins: true } })
    created++
    return db.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId,
        doctorId: doctor.id,
        specialityId: doctorRow.specialityId,
        locationId: mainLocation.id,
        startAt,
        endAt: new Date(startAt.getTime() + doctorRow.slotDurationMins * 60_000),
        consultationType: 'IN_PERSON',
        status,
        reasonForVisit: reason ?? pick(reasons),
        slotLock: releases ? null : lock,
        checkedInAt: status === 'CHECKED_IN' ? new Date() : null,
        cancelledAt: status === 'CANCELLED' ? new Date() : null,
        cancelledBy: status === 'CANCELLED' ? 'PATIENT' : null,
      },
    })
  }

  // The demo patient's upcoming appointment — the hero card on the home screen.
  const demoUpcoming = await book(demoPatient.id, 0, 1, 10, 20, 'CONFIRMED', 'Chest discomfort while walking uphill')

  // Today's clinic, so the doctor dashboard and reception board are populated.
  await book(patients[5]!.id, 0, 0, 9, 0, 'COMPLETED')
  await book(patients[6]!.id, 0, 0, 9, 20, 'COMPLETED')
  await book(patients[7]!.id, 0, 0, 9, 40, 'CHECKED_IN')
  await book(patients[8]!.id, 0, 0, 10, 0, 'CONFIRMED')
  await book(patients[9]!.id, 0, 0, 10, 20, 'CONFIRMED')
  await book(spouse.id, 1, 0, 11, 0, 'CHECKED_IN', 'Antenatal check-up')
  await book(patients[10]!.id, 2, 0, 9, 15, 'COMPLETED')
  await book(patients[11]!.id, 2, 0, 9, 30, 'CONFIRMED')
  await book(child.id, 3, 0, 10, 0, 'CONFIRMED', 'Not eating well for three days')

  // Spread the rest across the past fortnight and the coming fortnight.
  for (let i = 12; i < patients.length && created < 34; i++) {
    const dayOffset = Math.floor(rand() * 24) - 12
    const doctorIdx = Math.floor(rand() * doctors.length)
    const hh = 9 + Math.floor(rand() * 4)
    const mm = pick([0, 20, 40])
    const status: Prisma.AppointmentCreateInput['status'] =
      dayOffset < 0 ? (rand() < 0.12 ? (rand() < 0.5 ? 'CANCELLED' : 'NO_SHOW') : 'COMPLETED') : 'CONFIRMED'
    await book(patients[i]!.id, doctorIdx, dayOffset, hh, mm, status)
  }

  // Future appointments for the demo family, so Appointments has content.
  await book(mother.id, 5, 4, 9, 40, 'CONFIRMED', 'Diabetes review and repeat HbA1c')
  await book(demoPatient.id, 2, 9, 11, 20, 'CONFIRMED', 'General health check')

  // ── Clinical history for the demo patient ─────────────────────────────────
  console.log('Creating clinical history…')
  const pastVisit = await book(demoPatient.id, 0, -14, 10, 0, 'COMPLETED', 'Chest discomfort on exertion')

  const consultation = await db.consultation.create({
    data: {
      clinicId: clinic.id,
      patientId: demoPatient.id,
      doctorId: doctors[0]!.id,
      appointmentId: pastVisit?.id ?? null,
      status: 'SIGNED',
      startedAt: ist(-14, 10, 0),
      endedAt: ist(-14, 10, 22),
      chiefComplaint: 'Chest discomfort on exertion for about three weeks',
      historyOfPresentIllness:
        'Tightness across the chest when climbing two flights of stairs, settling within a few minutes of rest. No pain at rest, no breathlessness at night, no palpitations.',
      pastHistory: 'Hypertension for 4 years, on Amlodipine 5 mg. Father had a myocardial infarction at 58.',
      examination: { generalCondition: 'Comfortable at rest', bp: '148/92 mmHg', pulse: '84/min regular', heartSounds: 'S1 S2 normal, no murmur', chest: 'Clear' },
      assessment: 'Exertional chest discomfort on a background of hypertension and a family history. Needs assessment for ischaemic heart disease.',
      plan: 'ECG and lipid profile today. Continue Amlodipine. Add Atorvastatin 10 mg at night. Review with reports in two weeks.',
      patientInstructions:
        'Take the new tablet at night after food. Avoid heavy exertion until we review. If you get chest pain at rest, or pain lasting more than a few minutes, come to the clinic or call 108 straight away.',
      signedAt: ist(-14, 10, 25),
      signedById: doctors[0]!.userId,
    },
  })

  await db.diagnosis.create({
    data: {
      patientId: demoPatient.id,
      consultationId: consultation.id,
      code: 'I10',
      label: 'Essential hypertension',
      certainty: 'CONFIRMED',
      isChronic: true,
      onsetDate: dob(2022, 3, 1),
    },
  })

  await db.medicalRecord.create({
    data: {
      clinicId: clinic.id,
      patientId: demoPatient.id,
      kind: 'CONSULTATION',
      occurredAt: ist(-14, 10, 0),
      title: 'Cardiology consultation',
      summary: 'Exertional chest discomfort — investigations ordered',
      sourceType: 'Consultation',
      sourceId: consultation.id,
      authorName: 'Dr. Anil Kumar',
      specialityName: 'Cardiology',
    },
  })

  await db.vitalsRecord.create({
    data: {
      patientId: demoPatient.id,
      appointmentId: pastVisit?.id ?? null,
      recordedByName: 'Sreeja Nair',
      recordedAt: ist(-14, 9, 52),
      systolicBp: 148,
      diastolicBp: 92,
      pulse: 84,
      spo2: 98,
      temperatureC10: 367,
      weightGrams: 78400,
      heightMm: 1721,
    },
  })

  // Prescription
  const prescription = await db.prescription.create({
    data: {
      clinicId: clinic.id,
      patientId: demoPatient.id,
      doctorId: doctors[0]!.id,
      consultationId: consultation.id,
      number: 'RX-2026-000418',
      issuedAt: ist(-14, 10, 25),
      status: 'ACTIVE',
      diagnosisSummary: 'Hypertension; exertional chest discomfort under evaluation',
      generalInstructions: 'Take both tablets regularly. Do not stop without speaking to your doctor.',
      validUntil: ist(30, 23, 59),
      dispenseStatus: 'DISPENSED',
      dispensedAt: ist(-14, 11, 5),
      items: {
        create: [
          { medicationId: medications['Amlodipine']!, medicineName: 'Amlodipine', strength: '5 mg', form: 'TABLET', morning: 1, night: 0, timing: 'AFTER_FOOD', durationDays: 30, quantity: 30, instructions: 'Take in the morning after breakfast', displayOrder: 0 },
          { medicationId: medications['Atorvastatin']!, medicineName: 'Atorvastatin', strength: '10 mg', form: 'TABLET', morning: 0, night: 1, timing: 'AFTER_FOOD', durationDays: 30, quantity: 30, instructions: 'Take at night after dinner', displayOrder: 1 },
        ],
      },
    },
  })

  await db.medicalRecord.create({
    data: {
      clinicId: clinic.id, patientId: demoPatient.id, kind: 'PRESCRIPTION', occurredAt: ist(-14, 10, 25),
      title: 'Prescription — 2 medicines', summary: 'Amlodipine 5 mg, Atorvastatin 10 mg',
      sourceType: 'Prescription', sourceId: prescription.id, authorName: 'Dr. Anil Kumar', specialityName: 'Cardiology',
    },
  })

  // Lab order with verified results, including one out-of-range value so the
  // non-diagnostic reference-range language has something to render against.
  const labOrder = await db.labOrder.create({
    data: {
      clinicId: clinic.id,
      patientId: demoPatient.id,
      doctorId: doctors[0]!.id,
      consultationId: consultation.id,
      number: 'LAB-2026-001902',
      status: 'VERIFIED',
      clinicalNotes: 'Exertional chest discomfort; assess cardiovascular risk',
      orderedAt: ist(-14, 10, 26),
      sampleCollectedAt: ist(-13, 8, 15),
      resultsUploadedAt: ist(-13, 16, 40),
      verifiedAt: ist(-13, 17, 10),
      verifiedByName: 'Arun Dev',
      items: {
        create: [
          { labTestId: labTests['LIPID']!.id, testName: 'Lipid Profile', price: 75000 },
          { labTestId: labTests['CBC']!.id, testName: 'Complete Blood Count', price: 45000 },
        ],
      },
    },
  })

  const lipidResults = [
    { code: 'CHOL', name: 'Total cholesterol', unit: 'mg/dL', value: 232, low: 0, high: 200, flag: 'HIGH' as const },
    { code: 'LDL', name: 'LDL cholesterol', unit: 'mg/dL', value: 158, low: 0, high: 100, flag: 'HIGH' as const },
    { code: 'HDL', name: 'HDL cholesterol', unit: 'mg/dL', value: 38, low: 40, high: 100, flag: 'LOW' as const },
    { code: 'TG', name: 'Triglycerides', unit: 'mg/dL', value: 186, low: 0, high: 150, flag: 'HIGH' as const },
  ]
  for (const [i, r] of lipidResults.entries()) {
    await db.labResult.create({
      data: {
        labOrderId: labOrder.id,
        labAnalyteId: labTests['LIPID']!.analytes[r.code]!,
        analyteName: r.name, unit: r.unit, valueNumeric: r.value,
        refLow: r.low, refHigh: r.high, flag: r.flag, displayOrder: i, measuredAt: ist(-13, 16, 40),
      },
    })
  }
  const cbcResults = [
    { code: 'HB', name: 'Haemoglobin', unit: 'g/dL', value: 14.2, low: 12, high: 16 },
    { code: 'WBC', name: 'Total WBC count', unit: '10³/µL', value: 7.4, low: 4, high: 11 },
    { code: 'PLT', name: 'Platelet count', unit: '10³/µL', value: 268, low: 150, high: 410 },
    { code: 'RBC', name: 'RBC count', unit: '10⁶/µL', value: 4.8, low: 4.2, high: 5.4 },
  ]
  for (const [i, r] of cbcResults.entries()) {
    await db.labResult.create({
      data: {
        labOrderId: labOrder.id, labAnalyteId: labTests['CBC']!.analytes[r.code]!,
        analyteName: r.name, unit: r.unit, valueNumeric: r.value,
        refLow: r.low, refHigh: r.high, flag: 'NORMAL', displayOrder: i + 10, measuredAt: ist(-13, 16, 40),
      },
    })
  }

  await db.medicalRecord.create({
    data: {
      clinicId: clinic.id, patientId: demoPatient.id, kind: 'LAB_REPORT', occurredAt: ist(-13, 17, 10),
      title: 'Lipid Profile, Complete Blood Count', summary: 'Report available',
      sourceType: 'LabOrder', sourceId: labOrder.id, authorName: `${clinic.name} Laboratory`, specialityName: 'Laboratory',
    },
  })

  // An earlier lipid profile so the trend view has two points to draw.
  const olderLab = await db.labOrder.create({
    data: {
      clinicId: clinic.id, patientId: demoPatient.id, doctorId: doctors[0]!.id,
      number: 'LAB-2025-004471', status: 'VERIFIED',
      orderedAt: ist(-190, 9, 0), sampleCollectedAt: ist(-190, 9, 30),
      resultsUploadedAt: ist(-189, 15, 0), verifiedAt: ist(-189, 15, 20), verifiedByName: 'Arun Dev',
      items: { create: [{ labTestId: labTests['LIPID']!.id, testName: 'Lipid Profile', price: 75000 }] },
    },
  })
  for (const [i, r] of [
    { code: 'CHOL', name: 'Total cholesterol', unit: 'mg/dL', value: 214, low: 0, high: 200, flag: 'HIGH' as const },
    { code: 'LDL', name: 'LDL cholesterol', unit: 'mg/dL', value: 141, low: 0, high: 100, flag: 'HIGH' as const },
    { code: 'HDL', name: 'HDL cholesterol', unit: 'mg/dL', value: 41, low: 40, high: 100, flag: 'NORMAL' as const },
    { code: 'TG', name: 'Triglycerides', unit: 'mg/dL', value: 168, low: 0, high: 150, flag: 'HIGH' as const },
  ].entries()) {
    await db.labResult.create({
      data: {
        labOrderId: olderLab.id, labAnalyteId: labTests['LIPID']!.analytes[r.code]!,
        analyteName: r.name, unit: r.unit, valueNumeric: r.value, refLow: r.low, refHigh: r.high,
        flag: r.flag, displayOrder: i, measuredAt: ist(-189, 15, 0),
      },
    })
  }

  // A newly verified report the patient has not seen — drives the home "New lab report" card.
  const freshLab = await db.labOrder.create({
    data: {
      clinicId: clinic.id, patientId: demoPatient.id, doctorId: doctors[0]!.id,
      number: 'LAB-2026-002140', status: 'VERIFIED',
      orderedAt: ist(-2, 11, 0), sampleCollectedAt: ist(-1, 8, 20),
      resultsUploadedAt: ist(-1, 14, 10), verifiedAt: ist(-1, 14, 45), verifiedByName: 'Arun Dev',
      patientNotifiedAt: null,
      items: { create: [{ labTestId: labTests['HBA1C']!.id, testName: 'HbA1c (Glycated Haemoglobin)', price: 65000 }] },
    },
  })
  await db.labResult.create({
    data: {
      labOrderId: freshLab.id, labAnalyteId: labTests['HBA1C']!.analytes['HBA1C']!,
      analyteName: 'HbA1c', unit: '%', valueNumeric: 5.9, refLow: 4.0, refHigh: 5.6, flag: 'HIGH',
      displayOrder: 0, measuredAt: ist(-1, 14, 10),
    },
  })

  // Follow-up due — drives the follow-up card and the one-tap rebooking flow.
  await db.followUp.create({
    data: {
      clinicId: clinic.id, patientId: demoPatient.id, doctorId: doctors[0]!.id,
      specialityId: specialities['cardiology']!.id, consultationId: consultation.id,
      dueFrom: dateOnlyOffset(-2), dueTo: dateOnlyOffset(12),
      reason: 'Review lipid profile and blood pressure',
      instructions: 'Bring the lipid report. Continue both tablets until we review.',
      status: 'PENDING',
    },
  })

  // Care journey for the mother, so the journey component has live data.
  const diabetesTemplate = await db.careJourneyTemplate.findUniqueOrThrow({
    where: { clinicId_slug: { clinicId: clinic.id, slug: 'diabetes-care' } },
    include: { steps: { orderBy: { displayOrder: 'asc' } } },
  })
  await db.careJourney.create({
    data: {
      clinicId: clinic.id, patientId: mother.id, templateId: diabetesTemplate.id, doctorId: doctors[5]!.id,
      name: diabetesTemplate.name, status: 'ACTIVE', startedAt: ist(-60, 9, 0),
      steps: {
        create: diabetesTemplate.steps.map((s, i) => ({
          name: s.name, description: s.description, patientGuidance: s.patientGuidance, displayOrder: i,
          status: i < 2 ? 'COMPLETED' : i === 2 ? 'IN_PROGRESS' : 'PENDING',
          completedAt: i < 2 ? ist(-60 + i * 5, 10, 0) : null,
        })),
      },
    },
  })

  // A journey on the demo patient too, so their own home screen shows one.
  const cardiacSteps = [
    { name: 'Consultation', guidance: 'Understanding your symptoms and risk', status: 'COMPLETED' as const },
    { name: 'Investigations', guidance: 'ECG and blood tests', status: 'COMPLETED' as const },
    { name: 'Treatment', guidance: 'Starting and adjusting your medicines', status: 'IN_PROGRESS' as const },
    { name: 'Follow-up', guidance: 'Reviewing your response with your doctor', status: 'PENDING' as const },
  ]
  await db.careJourney.create({
    data: {
      clinicId: clinic.id, patientId: demoPatient.id, doctorId: doctors[0]!.id,
      name: 'Heart Health', status: 'ACTIVE', startedAt: ist(-14, 10, 0),
      steps: {
        create: cardiacSteps.map((s, i) => ({
          name: s.name, patientGuidance: s.guidance, displayOrder: i, status: s.status,
          completedAt: s.status === 'COMPLETED' ? ist(-14 + i, 11, 0) : null,
        })),
      },
    },
  })

  // Live work for the laboratory and pharmacy consoles, so every role has something
  // real to do in the demo (§44).
  console.log('Creating in-flight lab and pharmacy work…')
  const pendingLabSpecs = [
    { patient: patients[5]!, doctorIdx: 0, test: 'LIPID', status: 'ORDERED' as const, priority: 'ROUTINE', notes: 'Routine cardiovascular risk assessment' },
    { patient: patients[7]!, doctorIdx: 2, test: 'CBC', status: 'SAMPLE_COLLECTED' as const, priority: 'URGENT', notes: 'Fever for five days, rule out infection' },
    { patient: patients[10]!, doctorIdx: 5, test: 'HBA1C', status: 'IN_PROGRESS' as const, priority: 'ROUTINE', notes: 'Three-month diabetes review' },
    { patient: mother, doctorIdx: 5, test: 'FBS', status: 'RESULTS_UPLOADED' as const, priority: 'ROUTINE', notes: 'Fasting sugar before medication review' },
  ]
  for (const [i, spec] of pendingLabSpecs.entries()) {
    await db.labOrder.create({
      data: {
        clinicId: clinic.id,
        patientId: spec.patient.id,
        doctorId: doctors[spec.doctorIdx]!.id,
        number: `LAB-2026-0030${String(10 + i).padStart(2, '0')}`,
        status: spec.status,
        priority: spec.priority,
        clinicalNotes: spec.notes,
        orderedAt: ist(0, 9 + i, 15),
        sampleCollectedAt: spec.status === 'ORDERED' ? null : ist(0, 9 + i, 40),
        resultsUploadedAt: spec.status === 'RESULTS_UPLOADED' ? ist(0, 11 + i, 0) : null,
        items: { create: [{ labTestId: labTests[spec.test]!.id, testName: labTestSeeds.find((t) => t.code === spec.test)!.name, price: labTestSeeds.find((t) => t.code === spec.test)!.price }] },
      },
    })
  }

  const pendingRxSpecs = [
    {
      patient: patients[7]!, doctorIdx: 2, number: 'RX-2026-000502',
      diagnosis: 'Acute viral fever',
      items: [
        { name: 'Paracetamol', strength: '650 mg', m: 1, a: 1, n: 1, days: 3, qty: 9, instr: 'Take after food; stop when the fever settles' },
        { name: 'Pantoprazole', strength: '40 mg', m: 1, a: 0, n: 0, days: 5, qty: 5, instr: 'Take before breakfast' },
      ],
    },
    {
      patient: mother, doctorIdx: 5, number: 'RX-2026-000503',
      diagnosis: 'Type 2 diabetes mellitus — ongoing management',
      items: [
        { name: 'Metformin', strength: '500 mg', m: 1, a: 0, n: 1, days: 30, qty: 60, instr: 'Take after food' },
        { name: 'Thyroxine', strength: '50 mcg', m: 1, a: 0, n: 0, days: 30, qty: 30, instr: 'Take on an empty stomach, 30 minutes before breakfast' },
      ],
    },
  ]
  for (const spec of pendingRxSpecs) {
    await db.prescription.create({
      data: {
        clinicId: clinic.id,
        patientId: spec.patient.id,
        doctorId: doctors[spec.doctorIdx]!.id,
        number: spec.number,
        issuedAt: ist(0, 10, 30),
        status: 'ACTIVE',
        diagnosisSummary: spec.diagnosis,
        dispenseStatus: 'PENDING',
        items: {
          create: spec.items.map((it, i) => ({
            medicationId: medications[it.name]!,
            medicineName: it.name,
            strength: it.strength,
            form: 'TABLET',
            morning: it.m,
            afternoon: it.a,
            night: it.n,
            timing: 'AFTER_FOOD',
            durationDays: it.days,
            quantity: it.qty,
            instructions: it.instr,
            displayOrder: i,
          })),
        },
      },
    })
  }

  // ── Billing ───────────────────────────────────────────────────────────────
  console.log('Creating invoices…')
  async function invoice(patientId: string, number: string, category: Prisma.InvoiceCreateInput['category'], lines: Array<{ description: string; amount: number }>, paid: boolean, issuedAt: Date) {
    const subtotal = lines.reduce((s, l) => s + l.amount, 0)
    return db.invoice.create({
      data: {
        clinicId: clinic.id, patientId, number, category,
        status: paid ? 'PAID' : 'ISSUED',
        subtotal, total: subtotal,
        amountPaid: paid ? subtotal : 0,
        amountDue: paid ? 0 : subtotal,
        issuedAt, paidAt: paid ? issuedAt : null,
        dueAt: paid ? null : new Date(issuedAt.getTime() + 7 * 86_400_000),
        lines: { create: lines.map((l) => ({ description: l.description, quantity: 1, unitPrice: l.amount, lineTotal: l.amount })) },
        ...(paid
          ? { payments: { create: { clinicId: clinic.id, amount: subtotal, method: 'UPI', status: 'SUCCEEDED', paidAt: issuedAt, receiptNumber: `RCP-${number.slice(-6)}` } } }
          : {}),
      },
    })
  }

  // Outstanding total of ₹1,850 across three bills — matching the brief's example (§12).
  await invoice(demoPatient.id, 'INV-2026-004410', 'CONSULTATION', [{ description: 'Cardiology consultation — Dr. Anil Kumar', amount: 80000 }], false, ist(-14, 10, 30))
  await invoice(demoPatient.id, 'INV-2026-004411', 'LABORATORY', [{ description: 'Lipid Profile', amount: 40000 }, { description: 'Complete Blood Count', amount: 25000 }], false, ist(-13, 9, 0))
  await invoice(demoPatient.id, 'INV-2026-004412', 'PHARMACY', [{ description: 'Amlodipine 5 mg × 30', amount: 18000 }, { description: 'Atorvastatin 10 mg × 30', amount: 22000 }], false, ist(-14, 11, 10))
  await invoice(demoPatient.id, 'INV-2025-009120', 'CONSULTATION', [{ description: 'General Medicine consultation', amount: 60000 }], true, ist(-190, 9, 30))
  await invoice(mother.id, 'INV-2026-004390', 'CONSULTATION', [{ description: 'Endocrinology consultation — Dr. Divya Krishnan', amount: 95000 }], true, ist(-60, 9, 30))

  // ── Announcements & notifications ─────────────────────────────────────────
  console.log('Creating announcements and notifications…')
  await db.announcement.createMany({
    data: [
      {
        clinicId: clinic.id,
        title: 'Extended evening clinic hours',
        body: 'General Medicine and Paediatrics now run evening clinics until 7 PM on Mondays, Wednesdays and Fridays.',
        publishedAt: ist(-3, 9, 0),
        isPinned: true,
      },
      {
        clinicId: clinic.id,
        title: 'Laboratory reports now in the app',
        body: 'Your lab reports appear under Records as soon as they are verified. You no longer need to collect a printout.',
        publishedAt: ist(-9, 9, 0),
      },
    ],
  })

  await db.notification.createMany({
    data: [
      {
        clinicId: clinic.id, userId: demoPatient.userId!, patientId: demoPatient.id,
        kind: 'LAB_REPORT_READY', title: 'Your report is ready',
        body: 'Your HbA1c report is now available under Records → Lab Reports.',
        actionUrl: `/app/records/lab-reports/${freshLab.id}`, channel: 'IN_APP', status: 'SENT', sentAt: ist(-1, 14, 50),
      },
      {
        clinicId: clinic.id, userId: demoPatient.userId!, patientId: demoPatient.id,
        kind: 'APPOINTMENT_REMINDER', title: 'Appointment tomorrow',
        body: 'Dr. Anil Kumar, Cardiology — tomorrow at 10:20 AM at ' + mainLocation.name + '.',
        actionUrl: demoUpcoming ? `/app/appointments/${demoUpcoming.id}` : '/app/appointments',
        channel: 'IN_APP', status: 'SENT', sentAt: ist(0, 8, 0),
      },
      {
        clinicId: clinic.id, userId: demoPatient.userId!, patientId: demoPatient.id,
        kind: 'PAYMENT_DUE', title: 'Payment pending',
        body: 'You have ₹1,850 outstanding across three bills.',
        actionUrl: '/app/records/bills', channel: 'IN_APP', status: 'SENT', sentAt: ist(-1, 10, 0),
      },
    ],
  })

  const counts = {
    doctors: await db.doctor.count(),
    patients: await db.patient.count(),
    specialities: await db.speciality.count(),
    appointments: await db.appointment.count(),
    labOrders: await db.labOrder.count(),
    prescriptions: await db.prescription.count(),
    invoices: await db.invoice.count(),
    journeys: await db.careJourney.count(),
    notifications: await db.notification.count(),
    pendingLabOrders: await db.labOrder.count({ where: { status: { notIn: ['VERIFIED', 'CANCELLED'] } } }),
    pendingDispense: await db.prescription.count({ where: { dispenseStatus: 'PENDING' } }),
  }

  console.log('\nSeed complete:', counts)
  console.log(`
  Demo accounts — sign in at /login with any of these numbers.
  In development the OTP is shown on screen; no SMS gateway is needed.

    Patient        9400000001   Arun Menon (family of 4)
    Doctor         9400100001   Dr. Anil Kumar, Cardiology
    Reception      9400200001   Reception Desk
    Nurse          9400200002   Sreeja Nair
    Lab            9400200003   Arun Dev
    Pharmacy       9400200004   Nisha Joseph
    Admin          9400200005   Clinic Administrator
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
