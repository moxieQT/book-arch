import { useRef } from 'react'
import { MARQUEE_ROWS, PILLARS, STATS } from '../content'
import { StarMark } from '../components/Ornaments'
import { gsap, ScrollTrigger, SplitText } from '../motion'
import { useGsap } from '../useGsap'

export function Philosophy() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, ({ motion }, el) => {
    if (!motion) return

    // Манифест: слова «загораются» по мере прокрутки, как проявляющиеся чернила
    const split = SplitText.create('.lx-manifesto__text', { type: 'words', wordsClass: 'lx-word' })
    gsap.fromTo(
      split.words,
      { opacity: 0.13 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: '.lx-manifesto__pin', start: 'top top', end: '+=140%', scrub: 0.6, pin: true },
      }
    )
    gsap.from('.lx-manifesto__sign', {
      opacity: 0,
      y: 20,
      scrollTrigger: { trigger: '.lx-manifesto__pin', start: 'top top-=100%', toggleActions: 'play none none reverse' },
    })

    // Четыре столпа: линия прочерчивается, затем проявляется текст
    el.querySelectorAll('.lx-pillar').forEach((p, i) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.lx-pillars', start: 'top 78%', toggleActions: 'play none none reverse' },
        delay: i * 0.12,
      })
      tl.from(p.querySelector('.lx-pillar__rule'), { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.inOut' })
        .from(p.querySelectorAll('.lx-pillar__roman, .lx-pillar__title, .lx-pillar__text'), { y: 36, opacity: 0, stagger: 0.08 }, 0.35)
    })

    // Счётчики
    el.querySelectorAll<HTMLElement>('.lx-stat__value').forEach((node) => {
      const target = Number(node.dataset.value)
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 2.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: node, start: 'top 88%', toggleActions: 'play none none none' },
        onUpdate: () => (node.textContent = String(Math.round(obj.v))),
      })
    })

    // Бегущие строки: бесконечная лента, скорость и наклон зависят от скорости прокрутки
    const rows = gsap.utils.toArray<HTMLElement>('.lx-marquee__row')
    const loops = rows.map((row, i) =>
      gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 38, ease: 'none', repeat: -1 })
    )
    const skew = gsap.quickTo(rows, 'skewX', { duration: 0.6, ease: 'power3' })
    ScrollTrigger.create({
      trigger: '.lx-marquee',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity()
        const boost = 1 + Math.min(Math.abs(v) / 300, 6)
        loops.forEach((l) => gsap.to(l, { timeScale: boost * (self.direction || 1), duration: 0.4, overwrite: true }))
        skew(gsap.utils.clamp(-8, 8, v / -220))
      },
      onLeave: () => loops.forEach((l) => gsap.to(l, { timeScale: 1, duration: 1 })),
    })
  })

  return (
    <section id="philosophy" className="lx-philosophy" ref={root}>
      <div className="lx-manifesto__pin">
        <p className="lx-eyebrow lx-chapter-mark">
          <span className="lx-chapter-mark__roman">II</span> Философия
        </p>
        <p className="lx-manifesto__text">
          <em>Тень</em> — не враг и не ошибка. Это <em>спящая сила.</em> Я не привязываю к себе: я учу слышать{' '}
          <em>своё сердце,</em> доверять своей системе и однажды идти дальше — без внешних мастеров.
        </p>
        <p className="lx-manifesto__sign">
          <StarMark size={12} /> Алина
        </p>
      </div>

      <div className="lx-container">
        <div className="lx-pillars">
          {PILLARS.map((p) => (
            <article key={p.roman} className="lx-pillar">
              <span className="lx-pillar__rule" aria-hidden="true" />
              <span className="lx-pillar__roman">{p.roman}</span>
              <h3 className="lx-pillar__title">{p.title}</h3>
              <p className="lx-pillar__text">{p.text}</p>
            </article>
          ))}
        </div>

        <dl className="lx-stats">
          {STATS.map((s) => (
            <div key={s.label} className="lx-stat">
              <dt className="lx-stat__value" data-value={s.value}>
                {s.value}
              </dt>
              <dd className="lx-stat__label">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="lx-marquee" aria-hidden="true">
        {MARQUEE_ROWS.map((row, i) => (
          <div key={i} className={`lx-marquee__line ${i % 2 ? 'is-outline' : ''}`}>
            <div className="lx-marquee__row">
              {[...row, ...row].map((word, j) => (
                <span key={j} className="lx-marquee__item">
                  {word}
                  <StarMark size={22} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
