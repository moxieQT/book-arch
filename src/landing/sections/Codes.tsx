import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { calculateArchetypes, type ArchetypesProfile } from '../../numerology/calculate'
import { CODE_POSITIONS } from '../content'
import { MerkabaMark, SacredIcon } from '../components/Ornaments'
import { gsap, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

interface CodesProps {
  onOpenBookWithDate: (date: Date) => void
}

const FIELDS = [
  { key: 'day', placeholder: 'ДД', max: 2, label: 'День' },
  { key: 'month', placeholder: 'ММ', max: 2, label: 'Месяц' },
  { key: 'year', placeholder: 'ГГГГ', max: 4, label: 'Год' },
] as const

type FieldKey = (typeof FIELDS)[number]['key']

function parseDate(v: Record<FieldKey, string>): Date | string {
  const d = Number(v.day)
  const m = Number(v.month)
  const y = Number(v.year)
  const thisYear = new Date().getFullYear()
  if (!d || !m || !y || v.year.length < 4) return 'Введите дату полностью: день, месяц и год'
  if (m < 1 || m > 12) return 'Месяц — число от 1 до 12'
  if (y < 1900 || y > thisYear) return `Год — от 1900 до ${thisYear}`
  const date = new Date(y, m - 1, d)
  if (date.getDate() !== d) return 'В этом месяце нет такого дня'
  return date
}

export function Codes({ onOpenBookWithDate }: CodesProps) {
  const root = useRef<HTMLElement>(null)
  const inputs = useRef<Record<FieldKey, HTMLInputElement | null>>({ day: null, month: null, year: null })
  const [values, setValues] = useState<Record<FieldKey, string>>({ day: '', month: '', year: '' })
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<ArchetypesProfile | null>(null)

  useGsap(root, ({ motion }) => {
    if (!motion) return
    gsap.from('.lx-codes__head > *, .lx-date', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1.4,
      scrollTrigger: { trigger: '.lx-codes__head', start: 'top 80%', toggleActions: 'play none none reverse' },
    })
    gsap.from('.lx-arcard', {
      y: 90,
      rotate: (i) => (i % 2 ? 4 : -4),
      opacity: 0,
      stagger: 0.08,
      duration: 1.5,
      scrollTrigger: { trigger: '.lx-codes__spread', start: 'top 85%', toggleActions: 'play none none reverse' },
    })
  })

  const setField = (key: FieldKey, raw: string) => {
    // Цифры раскладываются по полям подряд: так работает и набор, и вставка «15.08.1987»
    let digits = raw.replace(/\D/g, '')
    const start = FIELDS.findIndex((f) => f.key === key)
    const patch: Partial<Record<FieldKey, string>> = {}
    let last = start
    for (let i = start; i < FIELDS.length; i++) {
      const f = FIELDS[i]
      patch[f.key] = digits.slice(0, f.max)
      digits = digits.slice(f.max)
      last = i
      if (!digits) break
    }
    setValues((v) => ({ ...v, ...patch }))
    setError('')
    // Автопереход к следующему полю, когда текущее заполнено
    const lastField = FIELDS[last]
    const filled = (patch[lastField.key] ?? '').length === lastField.max
    const target = filled ? FIELDS[last + 1] ?? lastField : lastField
    if (target.key !== key || filled) inputs.current[target.key]?.focus()
  }

  const onKeyDown = (key: FieldKey, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[key]) {
      const idx = FIELDS.findIndex((f) => f.key === key)
      const prev = FIELDS[idx - 1]
      if (prev) inputs.current[prev.key]?.focus()
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseDate(values)
    if (typeof parsed === 'string') {
      setError(parsed)
      return
    }
    const next = calculateArchetypes(parsed)
    const flipping = root.current?.querySelectorAll('.lx-arcard__inner')
    if (flipping && profile) {
      // Уже был расклад: карты закрываются и открываются заново
      gsap.to(flipping, {
        rotateY: 0,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power2.in',
        onComplete: () => setProfile(next),
      })
    } else {
      setProfile(next)
    }
    requestAnimationFrame(() => {
      const spread = root.current?.querySelector<HTMLElement>('.lx-codes__spread')
      if (spread && spread.getBoundingClientRect().top > window.innerHeight * 0.6) scrollToTarget(spread, -120)
    })
  }

  // Карты переворачиваются лицом, когда появляется новый расклад
  useGsap(
    root,
    ({ motion }) => {
      if (!profile) return
      gsap.to('.lx-arcard__inner', {
        rotateY: 180,
        duration: motion ? 1.3 : 0,
        stagger: 0.12,
        ease: 'expo.inOut',
        delay: 0.1,
      })
      gsap.from('.lx-codes__cta', { y: 30, opacity: 0, duration: 1, delay: motion ? 1 : 0 })
    },
    [profile]
  )

  const dateLabel = profile ? profile.birthDate.toLocaleDateString('ru-RU') : ''

  return (
    <section id="codes" className="lx-codes" ref={root}>
      <div className="lx-container">
        <div className="lx-codes__head">
          <p className="lx-eyebrow lx-chapter-mark">
            <SacredIcon id="tree" className="lx-chapter-mark__icon" draw /> Ваши коды
          </p>
          <h2 className="lx-h2">
            Дата рождения —
            <br />
            <em>ключ к вашей книге</em>
          </h2>
          <p className="lx-lead">
            Введите дату, и книга назовёт арканы ваших главных позиций. Полный текст всех тринадцати глав откроется в самой
            книге.
          </p>
        </div>

        <form className="lx-date lx-glass" onSubmit={submit} noValidate>
          <div className="lx-date__fields">
            {FIELDS.map((f, i) => (
              <label key={f.key} className={`lx-date__field lx-date__field--${f.key}`}>
                <span className="lx-visually-hidden">{f.label}</span>
                <input
                  ref={(node) => {
                    inputs.current[f.key] = node
                  }}
                  inputMode="numeric"
                  autoComplete={f.key === 'day' ? 'bday-day' : f.key === 'month' ? 'bday-month' : 'bday-year'}
                  placeholder={f.placeholder}
                  value={values[f.key]}
                  onChange={(e) => setField(f.key, e.target.value)}
                  onKeyDown={(e) => onKeyDown(f.key, e)}
                  aria-invalid={!!error}
                />
                {i < FIELDS.length - 1 && (
                  <span className="lx-date__sep" aria-hidden="true">
                    ·
                  </span>
                )}
              </label>
            ))}
          </div>
          <button type="submit" className="lx-btn lx-btn--gold" data-cursor="Рассчитать">
            <span>Рассчитать</span>
          </button>
          <p className="lx-date__error" role="alert">
            {error}
          </p>
        </form>

        <div className="lx-codes__spread">
          {CODE_POSITIONS.map((pid) => {
            const pos = profile?.positions[pid]
            return (
              <article key={pid} className="lx-arcard">
                <div className="lx-arcard__inner">
                  <div className="lx-arcard__back" aria-hidden={!!pos}>
                    <SacredIcon id="metatron" className="lx-arcard__back-sigil" />
                    <span className="lx-arcard__back-label">{pos?.positionDef.name ?? positionName(pid)}</span>
                  </div>
                  <div className="lx-arcard__face" aria-hidden={!pos}>
                    {pos && (
                      <>
                        <span className="lx-arcard__position">{pos.positionDef.name}</span>
                        <span className="lx-arcard__num">
                          <SacredIcon id="seed" className="lx-arcard__num-ring" />
                          <span>{pos.arcanaId}</span>
                        </span>
                        <span className="lx-arcard__name">{pos.arcana.name}</span>
                        <span className="lx-arcard__title">{pos.arcana.archetypeTitle}</span>
                        <span className="lx-arcard__key">{pos.arcana.lightKey}</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {profile && (
          <div className="lx-codes__cta">
            <p>
              <MerkabaMark size={13} /> Расклад на {dateLabel}. В книге вас ждут ещё десять позиций — Глубинная Тень, Высший
              Вектор, Родовая формула.
            </p>
            <div className="lx-codes__actions">
              <button type="button" className="lx-btn lx-btn--gold" onClick={() => onOpenBookWithDate(profile.birthDate)} data-cursor="Книга">
                <span>Открыть мою книгу · 13 глав</span>
              </button>
              <button type="button" className="lx-link" onClick={() => scrollToTarget('#sessions')}>
                Личный разбор в Alina Tarot Energy <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

const POSITION_NAMES: Record<string, string> = {
  soul: 'Код Души',
  personality: 'Код Личности',
  gift: 'Врождённый Дар',
  destiny: 'Вектор Предназначения',
  shadow: 'Тень',
  integration: 'Точка Интеграции',
}

function positionName(id: string) {
  return POSITION_NAMES[id] ?? id
}
