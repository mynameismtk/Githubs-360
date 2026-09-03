import { AnkuraLinkButton } from '@/components/ankura/ui/button'
import { AnkuraCard } from '@/components/ankura/ui/card'
import { AnkuraBackdropBlobs, ArtSprout, ArtCluster, ArtMoon, ArtBloom } from '@/components/ankura/ui/illustrations'
import { IconDrop, IconSprout, IconBook, IconWallet, IconUsers, IconHeart } from '@/components/ankura/ui/icons'

const MODULES = [
  {
    icon: IconDrop,
    title: 'Reminders that understand the stakes',
    body: 'Every dose from your own prescription, with the trigger shot treated like the highest-stakes moment it is.',
  },
  {
    icon: IconSprout,
    title: 'Your day, explained gently',
    body: 'From stimulation through the two-week wait — what\'s happening, and what you might be feeling, day by day.',
  },
  {
    icon: IconBook,
    title: 'No more midnight googling',
    body: 'Every term decoded in plain English and Hindi, the moment you tap it — not a forum full of worst cases.',
  },
  {
    icon: IconWallet,
    title: 'Costs, without the guilt',
    body: 'Track what you\'ve spent by category, export it for insurance or EMI — never judgemental, always yours.',
  },
  {
    icon: IconUsers,
    title: 'Room for whoever\'s holding this with you',
    body: 'Link a partner, parent or sibling so the reminders reach them too.',
  },
  {
    icon: IconHeart,
    title: 'A community that isn\'t a stranger\'s forum',
    body: 'Anonymous, moderated, grouped by stage — coming soon, built carefully rather than fast.',
  },
]

export default function AnkuraLandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <ArtSprout size={34} />
          <span className="font-a-serif text-xl text-a-ink">Ankura</span>
        </div>
        <AnkuraLinkButton href="/ankura/login" variant="secondary" size="sm">
          Sign in
        </AnkuraLinkButton>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:pb-24 sm:pt-16">
        <div className="relative mx-auto mb-2 h-40 w-40">
          <AnkuraBackdropBlobs />
          <div className="relative flex h-full items-center justify-center">
            <ArtBloom size={140} />
          </div>
        </div>
        <p className="mb-3 text-overline uppercase tracking-[0.14em] text-a-brand-ink">
          For every IVF · IUI · FET · egg-freezing cycle
        </p>
        <h1 className="font-a-serif text-4xl leading-[1.15] text-a-ink sm:text-5xl">
          With you through every day of your cycle
        </h1>
        <p className="mx-auto mt-5 max-w-md text-body text-a-ink-muted sm:text-lg">
          A gentle companion built for India — reminders that respect the trigger shot,
          your journey explained without the panic, and no more midnight googling.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <AnkuraLinkButton href="/ankura/login" size="lg" className="sm:min-w-[220px]">
            Start your journey
          </AnkuraLinkButton>
          <AnkuraLinkButton href="/ankura/glossary" variant="ghost" size="lg">
            Browse the jargon decoder
          </AnkuraLinkButton>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ icon: Icon, title, body }) => (
            <AnkuraCard key={title} className="text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-a-brand-wash text-a-brand-ink">
                <Icon size={20} />
              </div>
              <h3 className="mb-1.5 font-a-serif text-lg text-a-ink">{title}</h3>
              <p className="text-body-sm text-a-ink-muted">{body}</p>
            </AnkuraCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-24">
        <AnkuraCard className="flex flex-col items-center gap-4 bg-a-brand-wash/60 py-10 text-center">
          <div className="flex gap-3">
            <ArtCluster size={56} />
            <ArtMoon size={56} />
          </div>
          <h2 className="font-a-serif text-2xl text-a-ink">Built with an embryologist, not a template</h2>
          <p className="max-w-md text-body text-a-ink-muted">
            Every day of the journey and every glossary term is written for clinical
            accuracy first, then reviewed for tone — so it never says more than it knows.
          </p>
          <AnkuraLinkButton href="/ankura/login" size="lg">
            Get started — it’s free
          </AnkuraLinkButton>
        </AnkuraCard>
      </section>

      <footer className="relative z-10 mx-auto max-w-5xl px-5 pb-10 text-center text-caption text-a-ink-subtle">
        Ankura is a companion app, not a medical device. Always follow your clinic’s
        instructions over anything shown here.
      </footer>
    </div>
  )
}
