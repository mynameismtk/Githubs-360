import 'dotenv/config'
/**
 * Ankura — demo data.
 *
 * ALL DATA HERE IS FICTIONAL. A separate, independent seed from Clinic 360's
 * prisma/seed.ts — it only ever touches Ankura* tables, so it's safe to run without
 * affecting Clinic 360's demo data. Run with: npx tsx prisma/seed-ankura.ts
 *
 * The journey-day and glossary copy below is DRAFT — brief §3.2 requires clinical
 * sign-off (embryologist/REI) before it ships to a real patient. `isReviewed: true`
 * here only unlocks it for this demo seed's own /ankura/journey pages.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set.')
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

function daysAgo(n: number): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

async function main() {
  console.log('Resetting Ankura demo data…')
  await db.$transaction([
    db.ankuraDoseLog.deleteMany(),
    db.ankuraReminder.deleteMany(),
    db.ankuraCostEntry.deleteMany(),
    db.ankuraBudget.deleteMany(),
    db.ankuraSupportLink.deleteMany(),
    db.ankuraSession.deleteMany(),
    db.ankuraOtpChallenge.deleteMany(),
    db.ankuraUser.deleteMany(),
    db.ankuraAnnouncement.deleteMany(),
    db.ankuraProtocolTemplate.deleteMany(),
    db.ankuraClinicPackage.deleteMany(),
    db.ankuraClinic.deleteMany(),
    db.ankuraJourneyDay.deleteMany(),
    db.ankuraGlossaryTerm.deleteMany(),
  ])

  // ─── Clinics — the two design partners named in the build brief §2 ─────────────
  const ivfAccess = await db.ankuraClinic.create({
    data: {
      slug: 'ivf-access',
      name: 'IVF Access',
      tagline: 'Fertility care across Bangalore, Hyderabad and Coimbatore',
      brandPrimary: '#4f6d5a',
      brandAccent: '#cc9a3f',
      city: 'Bangalore',
      supportPhone: '+918041234567',
      supportEmail: 'care@ivfaccess.example',
    },
  })
  const aura = await db.ankuraClinic.create({
    data: {
      slug: 'aura-medical',
      name: 'Aura Medical Center',
      tagline: 'Personalised fertility care in Chennai',
      brandPrimary: '#7a5a63',
      brandAccent: '#cc9a3f',
      city: 'Chennai',
      supportPhone: '+914412345678',
      supportEmail: 'care@auramedical.example',
    },
  })

  await db.ankuraClinicPackage.createMany({
    data: [
      { clinicId: ivfAccess.id, name: 'IVF — Standard', priceFrom: 150000, priceTo: 190000, includes: ['Stimulation monitoring', 'Egg retrieval', 'ICSI', 'One fresh transfer'], displayOrder: 1 },
      { clinicId: ivfAccess.id, name: 'IVF — With PGT-A', priceFrom: 240000, priceTo: 300000, includes: ['Everything in Standard', 'Blastocyst culture', 'PGT-A on all embryos'], displayOrder: 2 },
      { clinicId: ivfAccess.id, name: 'Frozen Embryo Transfer (FET)', priceFrom: 45000, priceTo: 65000, includes: ['Endometrial prep', 'Thaw and transfer', 'Luteal support'], displayOrder: 3 },
    ],
  })

  await db.ankuraAnnouncement.create({
    data: {
      clinicId: ivfAccess.id,
      title: 'Lab closed for maintenance — 14 Sept',
      body: 'Our embryology lab will be closed for scheduled maintenance on 14 September. Retrievals and transfers that day have been rescheduled — your coordinator will call you directly.',
      isPinned: true,
    },
  })

  // ─── Staff account ───────────────────────────────────────────────────────────
  await db.ankuraUser.create({
    data: {
      phone: '+919000000001',
      fullName: 'Priya (Clinic Coordinator)',
      role: 'CLINIC_STAFF',
      clinicId: ivfAccess.id,
      phoneVerifiedAt: new Date(),
      onboardedAt: new Date(),
    },
  })

  // ─── Demo patient ────────────────────────────────────────────────────────────
  const patient = await db.ankuraUser.create({
    data: {
      phone: '+919000000002',
      fullName: 'Aditi',
      role: 'PATIENT',
      clinicId: ivfAccess.id,
      cycleType: 'IVF',
      cycleStage: 'STIMULATION',
      cycleStartedAt: daysAgo(4),
      phoneVerifiedAt: new Date(),
      onboardedAt: new Date(),
    },
  })

  const gonalF = await db.ankuraReminder.create({
    data: {
      userId: patient.id,
      drugName: 'Gonal-F',
      dose: '225 IU',
      route: 'SUBCUTANEOUS',
      isTrigger: false,
      timeOfDay: '21:00',
      startDate: daysAgo(4),
      notes: 'Left side, ice first',
    },
  })
  await db.ankuraReminder.create({
    data: {
      userId: patient.id,
      drugName: 'Cetrotide',
      dose: '0.25 mg',
      route: 'SUBCUTANEOUS',
      isTrigger: false,
      timeOfDay: '08:00',
      startDate: daysAgo(1),
    },
  })
  await db.ankuraReminder.create({
    data: {
      userId: patient.id,
      drugName: 'Ovidrel',
      dose: '250 mcg',
      route: 'SUBCUTANEOUS',
      isTrigger: true,
      timeOfDay: '22:30',
      startDate: daysAgo(0),
      notes: 'Set two alarms — this one cannot be late.',
    },
  })
  // Yesterday's evening dose already logged as taken, so the demo shows real history.
  await db.ankuraDoseLog.create({
    data: { reminderId: gonalF.id, scheduledFor: new Date(daysAgo(1).getTime() + 21 * 3600_000), outcome: 'TAKEN' },
  })

  await db.ankuraBudget.create({ data: { userId: patient.id, amount: 250000 } })
  await db.ankuraCostEntry.createMany({
    data: [
      { userId: patient.id, category: 'CONSULTATION', label: 'Initial consultation', amount: 2000, incurredAt: daysAgo(20) },
      { userId: patient.id, category: 'MONITORING', label: 'Baseline scan', amount: 1500, incurredAt: daysAgo(5) },
      { userId: patient.id, category: 'MEDICATION', label: 'Gonal-F, Cetrotide (pharmacy)', amount: 42000, incurredAt: daysAgo(4) },
      { userId: patient.id, category: 'MONITORING', label: 'Day 6 follicle scan', amount: 1500, incurredAt: daysAgo(1) },
      { userId: patient.id, category: 'TRAVEL', label: 'Train tickets from Coimbatore', amount: 3400, incurredAt: daysAgo(4) },
    ],
  })

  // ─── Day-by-day embryo journey ───────────────────────────────────────────────
  const journeyDays = [
    {
      slug: 'stim-day-1', phase: 'STIMULATION' as const, dayLabel: 'Stimulation · Day 1', displayOrder: 1, illustrationKey: 'sprout',
      title: 'The first injection',
      bodyEn: 'Today your ovaries start listening to the medication — nothing dramatic happens on the outside, but on the inside, several follicles are beginning to wake up together instead of the usual one. Your clinic will scan you every few days from here to watch how they grow, and adjust your dose if needed. There is nothing to do right now except take your medication on time and be gentle with yourself.',
      feelingsEn: 'Some people feel nothing at all yet. Others feel a strange mix of relief ("we\'re finally doing this") and nerves. Both are completely normal — there is no right way to feel on Day 1.',
    },
    {
      slug: 'stim-day-4', phase: 'STIMULATION' as const, dayLabel: 'Stimulation · Day 4', displayOrder: 2, illustrationKey: 'sprout',
      title: 'Watching them grow',
      bodyEn: 'Your follicles are now visibly growing on scan, usually a couple of millimetres a day. Some are ahead, some are behind — that spread is normal and doesn\'t mean anything is wrong. Your team is looking at the group, not any single follicle, and will fine-tune your dose based on today\'s numbers.',
      feelingsEn: 'Bloating, mild pelvic heaviness and tiredness are common around now as your ovaries enlarge. It can feel like a lot in a body that\'s usually predictable — that discomfort is expected, not a warning sign.',
    },
    {
      slug: 'retrieval-day', phase: 'RETRIEVAL' as const, dayLabel: 'Retrieval · Day 0', displayOrder: 3, illustrationKey: 'seed',
      title: 'Egg retrieval',
      bodyEn: 'Under light sedation, your clinician retrieves the eggs from your follicles — it usually takes 15–20 minutes, and you\'ll rest for a couple of hours after. The embryology team examines each egg the same day to see how many are mature and ready to be fertilised. Not every follicle contains a usable egg, and that is completely expected — the number that matters is the one your team confirms today, not the one on yesterday\'s scan.',
      feelingsEn: 'Grogginess, mild cramping and spotting are common for a day or two. It\'s also common to feel a strange anti-climax after weeks of build-up to one procedure — give yourself permission to just rest today.',
    },
    {
      slug: 'day-0-fertilisation', phase: 'FERTILIZATION' as const, dayLabel: 'Day 0 · Evening', displayOrder: 4, illustrationKey: 'cluster',
      title: 'Fertilisation',
      bodyEn: 'A few hours after retrieval, the embryology lab fertilises the mature eggs — either by mixing them with sperm (IVF) or injecting a single sperm directly into each egg (ICSI). You won\'t hear back until tomorrow morning, when the lab checks which eggs show the first sign of successful fertilisation.',
      feelingsEn: 'The wait for the "fert check" call is often one of the hardest of the whole cycle — it\'s the first real unknown. It is completely normal to check your phone constantly today.',
    },
    {
      slug: 'day-1-fert-check', phase: 'FERTILIZATION' as const, dayLabel: 'Day 1 · Fertilisation check', displayOrder: 5, illustrationKey: 'cluster',
      title: 'The fert check call',
      bodyEn: 'Your embryologist looks for two pronuclei in each egg — the first visible sign that fertilisation has worked. Fertilisation rates of roughly 60–80% of mature eggs are typical; it is very normal for not every egg to fertilise, and that doesn\'t reflect on the eggs that did.',
      feelingsEn: 'Whatever number you hear today, it can help to remember it takes only one healthy embryo. It\'s okay to feel disappointed by a lower number and still be moving forward at the same time.',
    },
    {
      slug: 'day-3-cleavage', phase: 'CLEAVAGE' as const, dayLabel: 'Day 3 · Cleavage stage', displayOrder: 6, illustrationKey: 'cluster',
      title: 'Dividing cells',
      bodyEn: 'By Day 3, a healthy embryo has usually divided into around 6–8 cells. Some clinics transfer at this stage; many now prefer to wait and see which embryos keep developing well to Day 5. Your embryologist is watching cell number and how evenly they\'re dividing — not judging any single embryo in isolation yet.',
      feelingsEn: 'Day 3 update calls can feel like a report card. Try to hold the numbers loosely — a slower Day 3 embryo can still become a beautiful blastocyst by Day 5.',
    },
    {
      slug: 'day-5-blastocyst', phase: 'BLASTOCYST' as const, dayLabel: 'Day 5 · Blastocyst', displayOrder: 7, illustrationKey: 'blastocyst',
      title: 'Reaching blastocyst',
      bodyEn: 'The embryos that make it here have formed a fluid-filled cavity and organised into two distinct cell groups — one that will become the baby, one that will become the placenta. This is the stage your grade (like 4AA or 3BB) describes. Use the grading decoder further down this page whenever you get your numbers.',
      feelingsEn: 'It\'s common to want to compare your numbers to someone else\'s WhatsApp group. Every clinic, every lab and every patient\'s biology is different enough that comparison rarely tells you anything useful — try to let your own team\'s read of your embryos be the one that counts.',
    },
    {
      slug: 'transfer-day', phase: 'TRANSFER' as const, dayLabel: 'Transfer day', displayOrder: 8, illustrationKey: 'seed',
      title: 'Transfer day',
      bodyEn: 'A thin, soft catheter places the embryo into your uterus — no anaesthesia needed, and it\'s usually over in a few minutes. There\'s good evidence that bed rest afterwards doesn\'t improve outcomes, so most clinics have you up and about within the hour. From here, the two-week wait begins.',
      feelingsEn: 'A strange calm often follows transfer day — the active part is over, and now it\'s a waiting game. Some people feel hopeful, some feel numb, some feel both within the same hour. All of it is normal.',
    },
    {
      slug: 'tww-day-1', phase: 'TWO_WEEK_WAIT' as const, dayLabel: 'Two-week wait · Day 1', displayOrder: 9, illustrationKey: 'moon',
      title: 'The wait begins',
      bodyEn: 'There is genuinely nothing you can do today to affect the outcome — implantation, if it happens, is a biological process already in motion. Keep taking your luteal support medication exactly as prescribed; that part is within your control, and it matters.',
      feelingsEn: 'Symptom-spotting is almost universal in the 2WW, and almost never reliable this early — progesterone support alone can mimic pregnancy symptoms. Try not to read too much into anything yet; it truly is too early to tell.',
    },
    {
      slug: 'tww-day-7', phase: 'TWO_WEEK_WAIT' as const, dayLabel: 'Two-week wait · Day 7', displayOrder: 10, illustrationKey: 'moon',
      title: 'Halfway',
      bodyEn: 'If implantation is happening, it\'s usually occurring right around now — but there is still no reliable way to know from symptoms alone. Home tests this early carry a real risk of a false result in either direction because of trigger medication still in your system; your clinic\'s beta hCG blood test is the one that counts.',
      feelingsEn: 'The middle of the wait is often the hardest — the initial adrenaline has worn off, and the test date still feels far away. This is a good week to lean on whoever is holding this with you.',
    },
    {
      slug: 'beta-day', phase: 'BETA_DAY' as const, dayLabel: 'Beta hCG day', displayOrder: 11, illustrationKey: 'bloom',
      title: 'Your beta result',
      bodyEn: 'A single blood hCG number is a starting point, not the whole story — your clinic will often ask for a second test 48 hours later to check it\'s doubling appropriately, which tells them far more than one number alone. Whatever the result, you will not be given it without a clear next step from your care team.',
      feelingsEn: 'However today goes, it is enough to just get through it. Be as gentle with yourself as you would be with someone you love going through exactly this.',
    },
  ]

  await db.ankuraJourneyDay.createMany({
    data: journeyDays.map((d) => ({ ...d, isReviewed: true })),
  })

  // ─── Jargon decoder — English + Hindi (brief §3.3, §7) ──────────────────────
  const glossaryTerms = [
    { termEn: 'AMH', termHi: 'एएमएच', category: 'Hormones & tests', definitionEn: 'Anti-Müllerian Hormone — a blood test that estimates your remaining egg supply (ovarian reserve). A lower number doesn\'t mean pregnancy isn\'t possible; it mainly helps your clinic choose your medication dose.', definitionHi: 'यह एक रक्त परीक्षण है जो आपके शेष अंडों की संख्या का अनुमान लगाता है।' },
    { termEn: 'AFC', termHi: 'एएफसी', category: 'Hormones & tests', definitionEn: 'Antral Follicle Count — the number of small follicles your doctor counts on an ultrasound, usually early in your cycle. Used alongside AMH to plan your stimulation protocol.' },
    { termEn: 'ICSI', termHi: 'आईसीएसआई', category: 'Procedures', definitionEn: 'Intracytoplasmic Sperm Injection — a single sperm is injected directly into each mature egg, often used when sperm count or movement is low.' },
    { termEn: 'IMSI', termHi: 'आईएमएसआई', category: 'Procedures', definitionEn: 'A more detailed version of ICSI where the embryologist selects sperm under much higher magnification before injecting it.' },
    { termEn: 'PGT-A', termHi: 'पीजीटी-ए', category: 'Genetics', definitionEn: 'Preimplantation Genetic Testing for Aneuploidy — a few cells from a Day 5/6 embryo are tested for the right number of chromosomes before transfer. It doesn\'t test for specific diseases — that\'s PGT-M.' },
    { termEn: 'PGT-M', termHi: 'पीजीटी-एम', category: 'Genetics', definitionEn: 'Preimplantation Genetic Testing for Monogenic disorders — tests embryos for one specific inherited condition known to run in the family.' },
    { termEn: 'Endometrium', termHi: 'एंडोमेट्रियम', category: 'Hormones & tests', definitionEn: 'The lining of your uterus, where an embryo implants. Your clinic tracks its thickness (in mm) and pattern on ultrasound — a "trilaminar" pattern is generally what they\'re hoping to see before transfer.' },
    { termEn: 'OHSS', termHi: 'ओएचएसएस', category: 'Safety', definitionEn: 'Ovarian Hyperstimulation Syndrome — when the ovaries react strongly to stimulation medication and become swollen and tender. Your clinic monitors for it throughout stimulation and will adjust your plan if your risk rises. Contact your clinic promptly for severe bloating, pain, nausea or reduced urination.' },
    { termEn: 'HSG', termHi: 'एचएसजी', category: 'Procedures', definitionEn: 'Hysterosalpingogram — an X-ray test that checks whether your fallopian tubes are open, usually done before starting treatment.' },
    { termEn: 'TESA/PESA', termHi: 'टीईएसए/पीईएसए', category: 'Procedures', definitionEn: 'Minor procedures to retrieve sperm directly from the testicle (TESA) or epididymis (PESA), used when there is no sperm in the ejaculate.' },
    { termEn: 'Blastocyst grading', termHi: 'ब्लास्टोसिस्ट ग्रेडिंग', category: 'Genetics', definitionEn: 'A description like "4AA" of a Day 5/6 embryo — a number for how expanded it is, then two letters for the two cell groups inside it. Try the grading decoder on the Journey tab for a full plain-language read of your grade.', aliases: ['grade', 'embryo grade', '4aa', '3bb'] },
    { termEn: 'Beta hCG doubling', termHi: 'बीटा एचसीजी डबलिंग', category: 'Hormones & tests', definitionEn: 'In an early, developing pregnancy, hCG typically roughly doubles every 48–72 hours — which is why your clinic often asks for a second blood test two days after your first.' },
    { termEn: 'Luteal phase support', termHi: 'ल्यूटियल फेज सपोर्ट', category: 'Medications', definitionEn: 'Progesterone (and sometimes oestrogen) medication given after retrieval or transfer to help prepare and maintain the uterine lining, because IVF medication affects your body\'s own natural production.' },
    { termEn: 'Trigger shot', termHi: 'ट्रिगर शॉट', category: 'Medications', definitionEn: 'The final injection of your stimulation phase — it tells your eggs to complete their last stage of maturation ahead of retrieval. Its timing is exact; even an hour off can affect the retrieval.' },
    { termEn: 'Two-week wait (2WW)', termHi: 'टू-वीक वेट', category: 'Cycle stages', definitionEn: 'The roughly 9–14 day gap between your embryo transfer (or ovulation, for IUI) and the blood test that can reliably confirm pregnancy.' },
    { termEn: 'BMI-linked protocol', category: 'Medications', definitionEn: 'Some clinics adjust medication dosing based on body mass index, since it can affect how your body absorbs and responds to stimulation medication — this is a routine clinical adjustment, not a judgement.' },
  ]
  await db.ankuraGlossaryTerm.createMany({
    data: glossaryTerms.map((t, i) => ({
      termEn: t.termEn,
      termHi: t.termHi ?? null,
      category: t.category,
      definitionEn: t.definitionEn,
      definitionHi: t.definitionHi ?? null,
      aliases: t.aliases ?? [],
      displayOrder: i,
    })),
  })

  console.log(`Seeded: ${1 + 1} clinics, 1 staff account, 1 demo patient, ${journeyDays.length} journey days, ${glossaryTerms.length} glossary terms.`)
  console.log('Demo patient sign-in: +91 90000 00002 · Clinic staff sign-in: +91 90000 00001')
  void aura
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
