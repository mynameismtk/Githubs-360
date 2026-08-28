import Link from 'next/link'
import { SiteNav } from './site-nav'
import { Reveal } from './reveal'
import {
  IconAuraMark,
  IconBaby,
  IconBone,
  IconBrain,
  IconCalendarCheck,
  IconChevronRight,
  IconClock,
  IconDroplet,
  IconEar,
  IconEye,
  IconFlask,
  IconHeartPulse,
  IconPhone,
  IconPin,
  IconQuote,
  IconShieldCheck,
  IconSparkles,
  IconStethoscope,
  IconTooth,
} from './icons'

const SPECIALITIES = [
  { icon: IconHeartPulse, name: 'Cardiology', blurb: 'Heart health, from screening to long-term rhythm care.' },
  { icon: IconBone, name: 'Orthopaedics', blurb: 'Joints, sports injuries and bone health at every age.' },
  { icon: IconBaby, name: 'Obstetrics & Gynaecology', blurb: 'Pregnancy, women’s health and family planning.' },
  { icon: IconStethoscope, name: 'General Medicine', blurb: 'Your first call for everyday illness and check-ups.' },
  { icon: IconDroplet, name: 'Dermatology', blurb: 'Skin, hair and nail care with a gentle, modern approach.' },
  { icon: IconEar, name: 'ENT', blurb: 'Ear, nose and throat care for all ages.' },
  { icon: IconTooth, name: 'Dental Care', blurb: 'Preventive and restorative dentistry, done comfortably.' },
  { icon: IconEye, name: 'Ophthalmology', blurb: 'Eye exams, vision correction and surgical care.' },
  { icon: IconBrain, name: 'Neurology', blurb: 'Headaches, nerve and movement disorders, expertly managed.' },
  { icon: IconFlask, name: 'Diagnostics & Lab', blurb: 'On-site imaging and labs, reports on your phone.' },
]

const FEATURES = [
  {
    tag: 'Consultations',
    title: 'Every visit, unhurried',
    body: 'Appointments are timed so your doctor has room to listen — not just to prescribe. No waiting room crush, no five-minute checkout.',
    icon: IconStethoscope,
  },
  {
    tag: 'Booking',
    title: 'Book in seconds, not phone calls',
    body: 'See real, live availability for every specialist and confirm a slot in a few taps. A reminder lands before you’ve forgotten.',
    icon: IconCalendarCheck,
  },
  {
    tag: 'Records',
    title: 'Your records, always with you',
    body: 'Prescriptions, lab reports and scans are on your phone the moment they’re ready — never a folder you have to remember to bring.',
    icon: IconShieldCheck,
  },
  {
    tag: 'Emergency care',
    title: 'Care that doesn’t stop at 6 p.m.',
    body: 'Our emergency desk and duty doctors are on through the night, every night — because health doesn’t keep office hours.',
    icon: IconClock,
  },
]

const STATS = [
  { value: '18', label: 'specialities under one roof' },
  { value: '40+', label: 'consultants & specialists' },
  { value: '1L+', label: 'consultations delivered' },
  { value: '24/7', label: 'emergency care' },
]

const DOCTORS = [
  { name: 'Dr. Priya Raghavan', role: 'Cardiology', creds: 'MD, DM (Cardiology)' },
  { name: 'Dr. Karthik Subramaniam', role: 'Orthopaedics', creds: 'MS (Ortho)' },
  { name: 'Dr. Meera Nair', role: 'Obstetrics & Gynaecology', creds: 'MD (OBG)' },
  { name: 'Dr. Arjun Krishnan', role: 'Paediatrics', creds: 'MD (Paediatrics)' },
  { name: 'Dr. Divya Chandrasekaran', role: 'Dermatology', creds: 'MD (Dermatology)' },
  { name: 'Dr. Suresh Bhaskaran', role: 'General Medicine', creds: 'MD (Internal Medicine)' },
]

const TESTIMONIALS = [
  {
    quote: 'The reception staff remembered my father’s usual doctor from three years back, without looking it up. That kind of care isn’t taught — it’s culture.',
    name: 'Lakshmi V.',
    meta: 'Patient since 2019',
  },
  {
    quote: 'Booked a next-morning slot for my daughter at 11 at night and had the exact time confirmed before I put the phone down.',
    name: 'Ramesh K.',
    meta: 'Paediatrics',
  },
  {
    quote: 'Every report was explained in plain language before we left the room — no jargon, no feeling rushed out the door.',
    name: 'Anitha S.',
    meta: 'General Medicine',
  },
]

function DoctorAvatar({ name }: { name: string }) {
  const initials = name
    .replace('Dr. ', '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  // Deterministic hue from the name, same spirit as the app's Avatar component.
  const hue = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full text-title font-semibold text-white"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 45% 42%), hsl(${hue + 35} 45% 32%))` }}
    >
      {initials}
    </div>
  )
}

export function MarketingHome() {
  return (
    <div id="top" className="bg-bg">
      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand/15 blur-[110px]" />
          <div className="absolute top-40 right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-accent/15 blur-[110px]" />
        </div>

        <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
          <Reveal className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-caption font-medium text-ink-muted backdrop-blur">
            <IconSparkles className="text-brand" size={16} />
            Multi-speciality care in Coimbatore
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3.75rem] md:text-[5rem]">
              Care that feels
              <br />
              <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                like Coimbatore.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-body text-ink-muted md:text-heading">
              Aura Medical Centre brings specialist doctors, a modern lab and unhurried
              consultations together — close to home, easy to reach, easy to trust.
            </p>
          </Reveal>

          <Reveal delay={240} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-brand px-7 text-body font-semibold text-white shadow-overlay transition-transform duration-fast ease-smooth hover:scale-[1.02] hover:bg-brand-hover active:scale-[0.99]"
            >
              Book an appointment
              <IconChevronRight size={18} />
            </Link>
            <a
              href="#specialities"
              className="inline-flex h-[52px] items-center justify-center rounded-full border border-border-strong bg-surface/70 px-7 text-body font-semibold text-ink backdrop-blur transition-colors duration-fast hover:bg-surface-sunken"
            >
              Explore specialities
            </a>
          </Reveal>
        </div>

        <Reveal delay={320} className="mx-auto mt-20 max-w-5xl px-5 md:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface/80 px-4 py-7 text-center backdrop-blur">
                <div className="tabular text-title font-semibold text-ink md:text-display">{s.value}</div>
                <div className="mt-1 text-caption text-ink-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Specialities ─────────────────────────────────────────────────── */}
      <section id="specialities" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-overline uppercase text-brand-ink">Specialities</p>
          <h2 className="mt-3 text-title font-semibold tracking-tight text-ink md:text-display">
            One centre, every specialist your family needs
          </h2>
          <p className="mt-3 text-body text-ink-muted">
            From a first check-up to a second opinion, our departments work from the same
            record — so nothing gets lost between doctors.
          </p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALITIES.map((s, i) => (
            <Reveal as="li" key={s.name} delay={(i % 3) * 90}>
              <div className="group h-full rounded-2xl border border-border bg-surface p-6 shadow-raised transition-all duration-base ease-smooth hover:-translate-y-1 hover:border-border-strong hover:shadow-overlay">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-wash text-brand-ink transition-colors duration-base group-hover:bg-brand group-hover:text-white">
                  <s.icon size={22} />
                </div>
                <h3 className="mt-4 text-heading text-ink">{s.name}</h3>
                <p className="mt-1.5 text-body-sm text-ink-muted">{s.blurb}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ── Why Aura (alternating feature rows) ─────────────────────────── */}
      <section id="why-aura" className="scroll-mt-20 border-y border-border bg-surface-sunken/50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-overline uppercase text-brand-ink">Why Aura</p>
            <h2 className="mt-3 text-title font-semibold tracking-tight text-ink md:text-display">
              Designed around the patient, not the paperwork
            </h2>
          </Reveal>

          <div className="mt-16 space-y-16 md:space-y-24">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title}>
                <div
                  className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
                    i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div>
                    <p className="text-overline uppercase text-accent">{f.tag}</p>
                    <h3 className="mt-3 text-title font-semibold tracking-tight text-ink md:text-[2rem] md:leading-tight">
                      {f.title}
                    </h3>
                    <p className="mt-4 max-w-md text-body text-ink-muted">{f.body}</p>
                  </div>
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-wash via-surface to-accent-wash">
                    <div aria-hidden="true" className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand/20 blur-2xl" />
                    <div aria-hidden="true" className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-surface/80 text-brand shadow-overlay backdrop-blur">
                      <f.icon size={40} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ──────────────────────────────────────────────────────── */}
      <section id="doctors" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-overline uppercase text-brand-ink">Our doctors</p>
            <h2 className="mt-3 text-title font-semibold tracking-tight text-ink md:text-display">
              Meet a few of our specialists
            </h2>
          </div>
          <Link href="/onboarding" className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-ink">
            See full team & book
            <IconChevronRight size={16} />
          </Link>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOCTORS.map((d, i) => (
            <Reveal as="li" key={d.name} delay={(i % 3) * 90}>
              <div className="flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-raised transition-all duration-base ease-smooth hover:-translate-y-1 hover:shadow-overlay">
                <DoctorAvatar name={d.name} />
                <div className="min-w-0">
                  <p className="truncate text-subheading text-ink">{d.name}</p>
                  <p className="text-body-sm text-brand-ink">{d.role}</p>
                  <p className="text-caption text-ink-subtle">{d.creds}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ── Stats band ───────────────────────────────────────────────────── */}
      <section className="bg-ink py-20 text-ink-inverse md:py-28">
        <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
          <Reveal>
            <p className="text-overline uppercase text-white/60">Trusted across the city</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-title font-semibold tracking-tight md:text-display">
              A decade of care, built one unhurried visit at a time
            </h2>
          </Reveal>
          <Reveal delay={120} className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="tabular text-display font-semibold md:text-[2.75rem]">{s.value}</div>
                <div className="mt-2 text-caption text-white/60">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-overline uppercase text-brand-ink">Patients tell it best</p>
          <h2 className="mt-3 text-title font-semibold tracking-tight text-ink md:text-display">
            What it feels like to be seen here
          </h2>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 100} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7 shadow-raised">
                <IconQuote className="text-brand/70" size={28} />
                <blockquote className="mt-4 flex-1 text-body text-ink">{t.quote}</blockquote>
                <figcaption className="mt-6 text-body-sm font-semibold text-ink">
                  {t.name}
                  <span className="block text-caption font-normal text-ink-subtle">{t.meta}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ── Appointment CTA banner ───────────────────────────────────────── */}
      <section className="px-5 md:px-8">
        <Reveal className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-hover px-8 py-16 text-center text-white md:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <h2 className="mx-auto max-w-xl text-title font-semibold tracking-tight md:text-display">
              Your next appointment is a few taps away
            </h2>
            <p className="mx-auto mt-3 max-w-md text-body text-white/85">
              Pick a speciality, see a real slot, and walk in knowing exactly when you’ll be seen.
            </p>
            <Link
              href="/onboarding"
              className="mt-8 inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-white px-8 text-body font-semibold text-brand-ink shadow-overlay transition-transform duration-fast ease-smooth hover:scale-[1.02] active:scale-[0.99]"
            >
              Book an appointment
              <IconChevronRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Visit us ─────────────────────────────────────────────────────── */}
      <section id="visit" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="text-overline uppercase text-brand-ink">Visit us</p>
            <h2 className="mt-3 text-title font-semibold tracking-tight text-ink md:text-display">
              Find us in the heart of Coimbatore
            </h2>
            <dl className="mt-8 space-y-6">
              <div className="flex gap-4">
                <IconPin className="mt-0.5 shrink-0 text-brand" size={22} />
                <div>
                  <dt className="text-subheading text-ink">Address</dt>
                  <dd className="mt-1 text-body text-ink-muted">
                    Aura Medical Centre, 100 Feet Road,
                    <br />
                    Gandhipuram, Coimbatore, Tamil Nadu 641012
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <IconPhone className="mt-0.5 shrink-0 text-brand" size={22} />
                <div>
                  <dt className="text-subheading text-ink">Phone</dt>
                  <dd className="mt-1 text-body text-ink-muted">
                    +91 422 435 0100 &middot; Emergency: 108
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <IconClock className="mt-0.5 shrink-0 text-brand" size={22} />
                <div>
                  <dt className="text-subheading text-ink">Hours</dt>
                  <dd className="mt-1 text-body text-ink-muted">
                    Mon&ndash;Sat: 8:00 AM &ndash; 9:00 PM
                    <br />
                    Sun: 9:00 AM &ndash; 1:00 PM &middot; Emergency desk open 24/7
                  </dd>
                </div>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={120}>
            <div className="h-full min-h-[22rem] overflow-hidden rounded-3xl border border-border shadow-raised">
              <iframe
                title="Aura Medical Centre location in Coimbatore"
                className="h-full w-full grayscale-[15%]"
                loading="lazy"
                src="https://www.openstreetmap.org/export/embed.html?bbox=76.9358%2C10.9968%2C76.9758%2C11.0368&layer=mapnik&marker=11.0168%2C76.9558"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface-sunken/50">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <IconAuraMark className="text-brand" size={24} />
                <span>Aura Medical Centre</span>
              </div>
              <p className="mt-3 text-body-sm text-ink-muted">
                Multi-speciality care for Coimbatore families, with the record-keeping and
                follow-up of a much bigger hospital.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <p className="text-overline uppercase text-ink-subtle">Explore</p>
                <ul className="mt-3 space-y-2 text-body-sm text-ink-muted">
                  <li><a href="#specialities" className="hover:text-ink">Specialities</a></li>
                  <li><a href="#doctors" className="hover:text-ink">Doctors</a></li>
                  <li><a href="#testimonials" className="hover:text-ink">Patient stories</a></li>
                </ul>
              </div>
              <div>
                <p className="text-overline uppercase text-ink-subtle">Patients</p>
                <ul className="mt-3 space-y-2 text-body-sm text-ink-muted">
                  <li><Link href="/onboarding" className="hover:text-ink">Book appointment</Link></li>
                  <li><Link href="/onboarding" className="hover:text-ink">Patient login</Link></li>
                  <li><a href="#visit" className="hover:text-ink">Visit us</a></li>
                </ul>
              </div>
              <div>
                <p className="text-overline uppercase text-ink-subtle">Contact</p>
                <ul className="mt-3 space-y-2 text-body-sm text-ink-muted">
                  <li>+91 422 435 0100</li>
                  <li>care@auramedicalcentre.example</li>
                  <li>Emergency: 108</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-caption text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Aura Medical Centre, Coimbatore. All rights reserved.</p>
            <p>In a medical emergency, call 108 or go to your nearest emergency room.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
