'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { AnkuraCard } from '@/components/ankura/ui/card'
import { AnkuraInput } from '@/components/ankura/ui/input'
import { AnkuraBadge } from '@/components/ankura/ui/badge'
import { AnkuraEmptyState } from '@/components/ankura/ui/states'
import { IconSearch, IconMic, IconClose, IconBook } from '@/components/ankura/ui/icons'
import { cn } from '@/lib/cn'

interface Term {
  id: string
  termEn: string
  termHi: string | null
  definitionEn: string
  definitionHi: string | null
  category: string
}

// Minimal ambient shape for the Web Speech API — not in lib.dom by default, and only a
// handful of fields are used here.
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

export function GlossarySearch({ initialTerms }: { initialTerms: Term[] }) {
  const [query, setQuery] = useState('')
  const [terms, setTerms] = useState(initialTerms)
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    const w = window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike; SpeechRecognition?: new () => SpeechRecognitionLike }
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    setVoiceSupported(Boolean(Ctor))
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTerms(initialTerms)
      return
    }
    try {
      const res = await fetch(`/api/ankura/glossary?q=${encodeURIComponent(q)}`)
      if (!res.ok) return
      setTerms((await res.json()).data)
    } catch {
      // Search failing quietly is preferable to an error state for a low-stakes lookup —
      // the user's already-loaded list stays usable.
    }
  }, [initialTerms])

  useEffect(() => {
    const id = setTimeout(() => void search(query), 220)
    return () => clearTimeout(id)
  }, [query, search])

  function startVoice() {
    const w = window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike; SpeechRecognition?: new () => SpeechRecognitionLike }
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) setQuery(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Term[]>()
    for (const t of terms) {
      const list = map.get(t.category) ?? []
      list.push(t)
      map.set(t.category, list)
    }
    return map
  }, [terms])

  return (
    <div className="space-y-5">
      <div className="relative">
        <IconSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-a-ink-subtle" />
        <AnkuraInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search AMH, ICSI, endometrium…"
          className="pl-10 pr-11"
          aria-label="Search the glossary"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-a-ink-subtle hover:bg-a-surface-sunken"
          >
            <IconClose size={16} />
          </button>
        ) : voiceSupported ? (
          <button
            type="button"
            onClick={startVoice}
            aria-label="Search by voice"
            className={cn(
              'absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-a-ink-subtle hover:bg-a-surface-sunken',
              listening && 'text-a-accent',
            )}
          >
            <IconMic size={18} />
          </button>
        ) : null}
      </div>

      {terms.length === 0 ? (
        <AnkuraEmptyState icon={<IconBook size={28} />} title="No matches yet" body="Try a shorter word, or its Hindi name." />
      ) : (
        Array.from(grouped.entries()).map(([category, list]) => (
          <section key={category}>
            <p className="mb-2 text-overline uppercase tracking-[0.08em] text-a-ink-subtle">{category}</p>
            <div className="space-y-2.5">
              {list.map((t) => (
                <AnkuraCard key={t.id}>
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="font-a-serif text-base text-a-ink">{t.termEn}</p>
                    {t.termHi ? <AnkuraBadge tone="brand">{t.termHi}</AnkuraBadge> : null}
                  </div>
                  <p className="text-body-sm leading-relaxed text-a-ink-muted">{t.definitionEn}</p>
                  {t.definitionHi ? <p className="mt-1 text-body-sm leading-relaxed text-a-ink-subtle">{t.definitionHi}</p> : null}
                </AnkuraCard>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
