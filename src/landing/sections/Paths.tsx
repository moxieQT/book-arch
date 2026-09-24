import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AlinaService } from '../../data/alinaServices'
import { PATHS, ROMANS, pathBookingMessage, telegramLink, whatsappLink } from '../content'
import { Sigil, StarMark } from '../components/Ornaments'
import { gsap, lockScroll, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

export function Paths() {
  const root = useRef<HTMLElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState<AlinaService | null>(null)
  const close = useCallback(() => setOpen(null), [])

  useGsap(root, ({ motion, desktop }, el) => {
    const track = el.querySelector<HTMLElement>('.lx-paths__track')!
    const cards = gsap.utils.toArray<HTMLElement>('.lx-card', el)

    if (!motion) return

    if (!desktop) {
      // Мобильный: карты поднимаются по одной по мере прокрутки
      cards.forEach((card) =>
        gsap.from(card, { y: 80, opacity: 0, duration: 1.2, scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' } })
      )
      return
    }

    // Десктоп: вертикальная прокрутка превращается в горизонтальный проход по галерее
    const distance = () => track.scrollWidth - window.innerWidth
    const scrollTween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(PATHS.length, Math.max(1, Math.round(self.progress * (PATHS.length - 1)) + 1))
          if (counter.current) counter.current.textContent = String(idx).padStart(2, '0')
          gsap.set('.lx-paths__bar i', { scaleX: self.progress })
        },
      },
    })

    // Внутри каждой карты — свой параллакс: номер и сигил плывут медленнее рамки
    cards.forEach((card) => {
      const numeral = card.querySelector('.lx-card__numeral')
      const sigil = card.querySelector('.lx-card__sigil')
      gsap.fromTo(
        [numeral, sigil],
        { xPercent: 26 },
        {
          xPercent: -26,
          ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true },
        }
      )
      gsap.from(card, {
        rotate: 3,
        y: 60,
        opacity: 0.2,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: 'left 105%', end: 'left 60%', scrub: true },
      })
    })
  })

  return (
    <section id="paths" className="lx-paths" ref={root}>
      <div className="lx-paths__track">
        <div className="lx-paths__intro">
          <p className="lx-eyebrow lx-chapter-mark">
            <span className="lx-chapter-mark__roman">III</span> Направления
          </p>
          <h2 className="lx-h2">
            Семь путей
            <br />
            <em>к себе</em>
          </h2>
          <p className="lx-lead">
            Групповые программы и курсы Алины: от голоса и тела до ченнелинга и мастерства. Выберите карту — она расскажет
            больше.
          </p>
          <div className="lx-paths__meta" aria-hidden="true">
            <span className="lx-paths__count">
              <span ref={counter}>01</span> / {String(PATHS.length).padStart(2, '0')}
            </span>
            <span className="lx-paths__bar">
              <i />
            </span>
          </div>
        </div>

        {PATHS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="lx-card"
            onClick={() => setOpen(p)}
            data-cursor="Открыть"
            aria-label={`${p.title} — подробнее`}
          >
            <span className="lx-card__frame" aria-hidden="true" />
            <span className="lx-card__top">
              <span>{p.number}</span>
              <span>{p.categoryLabel}</span>
            </span>
            <span className="lx-card__numeral" aria-hidden="true">
              {ROMANS[i]}
            </span>
            <Sigil id={p.id} className="lx-card__sigil" />
            <span className="lx-card__body">
              <span className="lx-card__title">{p.title}</span>
              <span className="lx-card__subtitle">{p.subtitle}</span>
            </span>
            <span className="lx-card__foot">
              <span>{p.badge}</span>
              <span className="lx-card__more" aria-hidden="true">
                →
              </span>
            </span>
          </button>
        ))}

        <div className="lx-paths__outro">
          <StarMark size={22} />
          <p className="lx-paths__outro-title">
            Не знаете,
            <br />
            <em>с чего начать?</em>
          </p>
          <p className="lx-lead">Начните с личной сессии — Мария поможет подобрать формат под ваш запрос.</p>
          <button type="button" className="lx-btn lx-btn--line" onClick={() => scrollToTarget('#sessions')}>
            К личным сессиям
          </button>
        </div>
      </div>

      <PathDrawer service={open} onClose={close} />
    </section>
  )
}

function PathDrawer({ service, onClose }: { service: AlinaService | null; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [shown, setShown] = useState<AlinaService | null>(null)

  // Держим контент на экране во время анимации закрытия
  if (service && service !== shown) setShown(service)

  useEffect(() => {
    const el = root.current
    if (!el || !shown) return
    const isOpen = !!service
    lockScroll(isOpen)
    const panel = el.querySelector('.lx-drawer__panel')
    const items = el.querySelectorAll('.lx-drawer__reveal')

    if (isOpen) {
      gsap.set(el, { visibility: 'visible' })
      gsap.fromTo(el.querySelector('.lx-drawer__veil'), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      gsap.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 1.1, ease: 'expo.out' })
      gsap.fromTo(items, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.05, delay: 0.25 })
      closeBtn.current?.focus({ preventScroll: true })
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }

    gsap.to(el.querySelector('.lx-drawer__veil'), { opacity: 0, duration: 0.5 })
    gsap.to(panel, {
      xPercent: 100,
      duration: 0.7,
      ease: 'expo.in',
      onComplete: () => {
        gsap.set(el, { visibility: 'hidden' })
        setShown(null)
      },
    })
  }, [service, shown, onClose])

  const s = shown
  const idx = s ? PATHS.findIndex((p) => p.id === s.id) : 0

  // Портал в body: внутри закреплённой (pin) секции position: fixed ведёт себя непредсказуемо
  return createPortal(
    <div className="lx-drawer" ref={root} role="dialog" aria-modal="true" aria-label={s?.title} style={{ visibility: 'hidden' }}>
      <div className="lx-drawer__veil" onClick={onClose} />
      <div className="lx-drawer__panel" data-lenis-prevent>
        {s && (
          <>
            <div className="lx-drawer__head">
              <span className="lx-eyebrow">
                {ROMANS[idx]} · {s.categoryLabel}
              </span>
              <button type="button" className="lx-close" onClick={onClose} ref={closeBtn} aria-label="Закрыть">
                <i /><i />
              </button>
            </div>
            <Sigil id={s.id} className="lx-drawer__sigil lx-drawer__reveal" />
            <h3 className="lx-drawer__title lx-drawer__reveal">{s.title}</h3>
            <p className="lx-drawer__subtitle lx-drawer__reveal">{s.subtitle}</p>
            <span className="lx-badge lx-drawer__reveal">{s.badge}</span>

            <div className="lx-drawer__text lx-drawer__reveal">
              {s.fullDescription.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>

            <div className="lx-drawer__cols lx-drawer__reveal">
              <div>
                <h4>Что внутри</h4>
                <ul className="lx-list">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>С чем вы уходите</h4>
                <ul className="lx-list">
                  {s.outcomes.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {s.quote && <blockquote className="lx-drawer__quote lx-drawer__reveal">{s.quote}</blockquote>}

            <div className="lx-drawer__cta lx-drawer__reveal">
              <a className="lx-btn lx-btn--wine" href={telegramLink(pathBookingMessage(s))} target="_blank" rel="noopener noreferrer">
                Записаться через Марию · Telegram
              </a>
              <a className="lx-link" href={whatsappLink(pathBookingMessage(s))} target="_blank" rel="noopener noreferrer">
                или WhatsApp <span aria-hidden="true">→</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
