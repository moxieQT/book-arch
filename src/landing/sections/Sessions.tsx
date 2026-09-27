import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CLIENT_QUERY_NAVIGATOR,
  INDIVIDUAL_SESSIONS,
  PRICING_BLOCKS,
  TAROT_QUESTIONS,
  type IndividualSession,
} from '../../data/alinaPricing'
import { BLOCK_SYMBOLS, BOOKING_GREETING, sessionBookingMessage, telegramLink, whatsappLink } from '../content'
import { MerkabaMark, SacredIcon } from '../components/Ornaments'
import { gsap, lockScroll, refreshScroll, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

function priceFrom(s: IndividualSession) {
  const min = Math.min(...s.options.map((o) => o.priceNumber))
  const prefix = s.options.length > 1 || s.options[0].price.startsWith('от') ? 'от ' : ''
  return `${prefix}${rub(min)}`
}

export function Sessions() {
  const root = useRef<HTMLElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [hint, setHint] = useState<{ label: string; hint: string; target: string } | null>(null)
  const [bankOpen, setBankOpen] = useState(false)
  const closeBank = useCallback(() => setBankOpen(false), [])

  const byBlock = useMemo(
    () => PRICING_BLOCKS.map((b) => ({ block: b, sessions: INDIVIDUAL_SESSIONS.filter((s) => s.blockId === b.id) })),
    []
  )

  useGsap(root, ({ motion }) => {
    if (!motion) return
    gsap.from('.lx-sessions__head > *', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1.4,
      scrollTrigger: { trigger: '.lx-sessions__head', start: 'top 80%', toggleActions: 'play none none reverse' },
    })
    gsap.from('.lx-chip', {
      y: 20,
      opacity: 0,
      stagger: 0.03,
      duration: 1,
      scrollTrigger: { trigger: '.lx-navigator', start: 'top 85%', toggleActions: 'play none none reverse' },
    })
    gsap.utils.toArray<HTMLElement>('.lx-menu-block').forEach((block) => {
      gsap.from(block.querySelectorAll('.lx-menu-block__aside > *'), {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        scrollTrigger: { trigger: block, start: 'top 78%', toggleActions: 'play none none reverse' },
      })
      gsap.from(block.querySelectorAll('.lx-session'), {
        y: 40,
        opacity: 0,
        stagger: 0.07,
        scrollTrigger: { trigger: block, start: 'top 72%', toggleActions: 'play none none reverse' },
      })
      gsap.from(block.querySelectorAll('.lx-session__rule'), {
        scaleX: 0,
        transformOrigin: 'left',
        stagger: 0.07,
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: block, start: 'top 72%', toggleActions: 'play none none reverse' },
      })
    })
  })

  const pickQuery = (q: (typeof CLIENT_QUERY_NAVIGATOR)[number]) => {
    const target = INDIVIDUAL_SESSIONS.find((s) => s.id === q.targetSessionId)
    setHint({ label: q.label, hint: q.hint, target: target?.title ?? '' })
    setOpenId(q.targetSessionId)
    window.setTimeout(() => scrollToTarget(`#session-${q.targetSessionId}`, -140), 80)
  }

  return (
    <section id="sessions" className="lx-sessions" ref={root}>
      <div className="lx-container">
        <div className="lx-sessions__head">
          <p className="lx-eyebrow lx-chapter-mark">
            <SacredIcon id="metatron" className="lx-chapter-mark__icon" draw /> Личная работа
          </p>
          <h2 className="lx-h2">
            Сессии
            <br />
            <em>Alina Tarot Energy</em>
          </h2>
          <p className="lx-lead">
            Шестнадцать форматов в трёх разделах. Выберите тариф — и сообщение для Марии, менеджера Alina Tarot Energy, уже будет
            готово.
          </p>
        </div>

        <div className="lx-navigator lx-glass">
          <p className="lx-navigator__title">С чем вы пришли?</p>
          <div className="lx-navigator__chips">
            {CLIENT_QUERY_NAVIGATOR.map((q) => (
              <button
                key={q.label}
                type="button"
                className={`lx-chip ${hint?.label === q.label ? 'is-active' : ''}`}
                onClick={() => pickQuery(q)}
              >
                {q.label}
              </button>
            ))}
          </div>
          <p className={`lx-navigator__hint ${hint ? 'is-visible' : ''}`} aria-live="polite">
            {hint && (
              <>
                <MerkabaMark size={12} /> {hint.hint} — <strong>{hint.target}</strong>
              </>
            )}
          </p>
        </div>

        {byBlock.map(({ block, sessions }, bi) => (
          <div key={block.id} className="lx-menu-block">
            <aside className="lx-menu-block__aside">
              <SacredIcon id={BLOCK_SYMBOLS[bi] ?? 'seed'} className="lx-menu-block__icon" draw />
              <h3 className="lx-menu-block__title">
                {block.title.split('•').map((part, i) => (
                  <span key={i}>{part.trim()}</span>
                ))}
              </h3>
              <p className="lx-menu-block__tagline">{block.tagline}</p>
              {block.id === 'taro-matrix' && (
                <button type="button" className="lx-link" onClick={() => setBankOpen(true)}>
                  Банк вопросов для Таро <span aria-hidden="true">→</span>
                </button>
              )}
            </aside>

            <ul className="lx-menu-block__list">
              {sessions.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  open={openId === s.id}
                  onToggle={() => setOpenId((cur) => (cur === s.id ? null : s.id))}
                  onOpenBank={() => setBankOpen(true)}
                />
              ))}
            </ul>
          </div>
        ))}

        <p className="lx-sessions__note">
          Онлайн-формат на 3 000 ₽ дороже записи. Если есть выраженные физические или психологические симптомы — сначала к
          профильному врачу: сессии не заменяют медицинскую помощь.
        </p>
      </div>

      <TarotBank open={bankOpen} onClose={closeBank} />
    </section>
  )
}

function SessionRow({
  session: s,
  open,
  onToggle,
  onOpenBank,
}: {
  session: IndividualSession
  open: boolean
  onToggle: () => void
  onOpenBank: () => void
}) {
  const [opt, setOpt] = useState(0)
  const option = s.options[opt] ?? s.options[0]
  const panelId = `session-panel-${s.id}`

  // Высота страницы меняется — триггеры ниже нужно пересчитать после анимации
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const t = window.setTimeout(refreshScroll, 700)
    return () => window.clearTimeout(t)
  }, [open])

  return (
    <li id={`session-${s.id}`} className={`lx-session ${open ? 'is-open' : ''} ${s.isFeatured ? 'is-featured' : ''}`}>
      <span className="lx-session__rule" aria-hidden="true" />
      <button type="button" className="lx-session__row" onClick={onToggle} aria-expanded={open} aria-controls={panelId}>
        <span className="lx-session__name">
          <span className="lx-session__title">
            {s.title}
            {s.isFeatured && <span className="lx-session__flag">Флагман</span>}
          </span>
          <span className="lx-session__subtitle">{s.subtitle}</span>
        </span>
        <span className="lx-session__leader" aria-hidden="true" />
        <span className="lx-session__price">{priceFrom(s)}</span>
        <span className="lx-session__toggle" aria-hidden="true">
          <i /><i />
        </span>
      </button>

      <div className="lx-session__panel" id={panelId} role="region" aria-label={s.title}>
        <div className="lx-session__panel-inner">
          <div className="lx-session__about">
            <p>{s.description}</p>
            {s.note && <p className="lx-session__note">{s.note}</p>}
            {s.onlineUpgradeNote && <p className="lx-session__note">{s.onlineUpgradeNote}</p>}
            {s.specialDiscount && (
              <div className="lx-session__gift">
                <span className="lx-badge">{s.specialDiscount.badge}</span>
                <p>{s.specialDiscount.description}</p>
                {s.specialDiscount.discountedOptions?.map((d) => (
                  <p key={d.label} className="lx-session__gift-line">
                    {d.label}: <s>{d.originalPrice}</s> <strong>{d.discountedPrice}</strong>
                  </p>
                ))}
                {s.specialDiscount.subtext && <p className="lx-session__note">{s.specialDiscount.subtext}</p>}
              </div>
            )}
            {!s.specialDiscount && s.bonus && (
              <p className="lx-session__note">
                <MerkabaMark size={11} /> {s.bonus}
              </p>
            )}
            {s.id === 'taro-session' && (
              <button type="button" className="lx-link" onClick={onOpenBank}>
                Подобрать вопросы из банка <span aria-hidden="true">→</span>
              </button>
            )}
          </div>

          <div className="lx-session__book">
            <div className="lx-options" role="radiogroup" aria-label="Формат и тариф">
              {s.options.map((o, i) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={i === opt}
                  className={`lx-option ${i === opt ? 'is-active' : ''}`}
                  onClick={() => setOpt(i)}
                  tabIndex={open ? 0 : -1}
                >
                  <span>{o.label}</span>
                  <span>{o.price}</span>
                </button>
              ))}
            </div>
            <p className="lx-session__total">
              <span>Итого</span>
              <strong key={option.price}>{option.price}</strong>
            </p>
            <div className="lx-session__cta">
              <a
                className="lx-btn lx-btn--gold"
                href={telegramLink(sessionBookingMessage(s, opt))}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
              >
                <span>Записаться · Telegram</span>
              </a>
              <a
                className="lx-link"
                href={whatsappLink(sessionBookingMessage(s, opt))}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
              >
                WhatsApp <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

const BANK_GROUPS = [
  { id: 'relationships', title: 'Отношения', questions: TAROT_QUESTIONS.relationships },
  { id: 'money', title: 'Деньги и реализация', questions: TAROT_QUESTIONS.moneyAndRealization },
]

function TarotBank({ open, onClose }: { open: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    lockScroll(open)
    if (open) {
      gsap.set(el, { visibility: 'visible' })
      gsap.fromTo(el.querySelector('.lx-drawer__veil'), { opacity: 0 }, { opacity: 1, duration: 0.6 })
      gsap.fromTo(el.querySelector('.lx-drawer__panel'), { xPercent: 100 }, { xPercent: 0, duration: 1.1, ease: 'expo.out' })
      const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    gsap.to(el.querySelector('.lx-drawer__veil'), { opacity: 0, duration: 0.5 })
    gsap.to(el.querySelector('.lx-drawer__panel'), {
      xPercent: 100,
      duration: 0.7,
      ease: 'expo.in',
      onComplete: () => {
        gsap.set(el, { visibility: 'hidden' })
      },
    })
  }, [open, onClose])

  const toggle = (q: string) => setPicked((p) => (p.includes(q) ? p.filter((x) => x !== q) : [...p, q]))
  const message = `${BOOKING_GREETING} Хочу записаться на Таро. Мои вопросы:\n\n${picked.map((q, i) => `${i + 1}. ${q}`).join('\n')}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(picked.join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // буфер обмена недоступен (например, без HTTPS) — просто ничего не делаем
    }
  }

  return createPortal(
    <div className="lx-drawer lx-bank" ref={root} role="dialog" aria-modal="true" aria-label="Банк вопросов для Таро" style={{ visibility: 'hidden' }}>
      <div className="lx-drawer__veil" onClick={onClose} />
      <div className="lx-drawer__panel" data-lenis-prevent>
        <div className="lx-drawer__head">
          <span className="lx-eyebrow">Таро · банк вопросов</span>
          <button type="button" className="lx-close" onClick={onClose} aria-label="Закрыть">
            <i /><i />
          </button>
        </div>
        <h3 className="lx-drawer__title">Отметьте вопросы, которые откликаются</h3>
        <p className="lx-drawer__subtitle">5 вопросов — аудиоразбор ≈20–25 минут, 10 вопросов — ≈30–40 минут.</p>

        {BANK_GROUPS.map((g) => (
          <div key={g.id} className="lx-bank__group">
            <h4>{g.title}</h4>
            <ul>
              {g.questions.map((q) => (
                <li key={q}>
                  <label className={`lx-bank__q ${picked.includes(q) ? 'is-picked' : ''}`}>
                    <input type="checkbox" checked={picked.includes(q)} onChange={() => toggle(q)} />
                    <span className="lx-bank__box" aria-hidden="true" />
                    <span>{q}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={`lx-bank__bar ${picked.length ? 'is-visible' : ''}`}>
          <span>
            Выбрано: <strong>{picked.length}</strong>
          </span>
          <button type="button" className="lx-link" onClick={copy} disabled={!picked.length}>
            {copied ? 'Скопировано' : 'Скопировать'}
          </button>
          <a
            className="lx-btn lx-btn--gold lx-btn--small"
            href={picked.length ? telegramLink(message) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!picked.length}
          >
            Отправить Марии
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
