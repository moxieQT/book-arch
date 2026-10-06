import { useRef } from 'react'
import { MARQUEE_ROWS, PILLARS, STATS } from '../content'
import { MerkabaMark, SacredIcon } from '../components/Ornaments'
import { gsap, ScrollTrigger, SplitText } from '../motion'
import { useGsap } from '../useGsap'

export function Philosophy() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, ({ motion }, el) => {
    if (!motion) return

    // Манифест: слова по очереди загораются золотым светом по мере прокрутки
    // aria: 'none' — по умолчанию SplitText вешает на <p> aria-label, а на абзаце он запрещён (axe);
    // 'hidden' не подходит: абзац пропал бы для скринридеров. tag: 'span' — слова внутри <p> без <div>
    // (display у слов всё равно inline-block, вид не меняется)
    const split = SplitText.create('.lx-manifesto__text', { type: 'words', wordsClass: 'lx-word', aria: 'none', tag: 'span' })
    gsap.fromTo(
      split.words,
      { opacity: 0.13 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: '.lx-manifesto__pin', start: 'top top', end: '+=150%', scrub: 0.6, pin: true },
      }
    )
    gsap.from('.lx-manifesto__sign', {
      opacity: 0,
      y: 20,
      scrollTrigger: { trigger: '.lx-manifesto__pin', start: 'top top-=110%', toggleActions: 'play none none reverse' },
    })

    // Четыре столпа: карточки поднимаются, символ прорисовывается сам
    gsap.from('.lx-pillar', {
      y: 70,
      opacity: 0,
      stagger: 0.12,
      duration: 1.5,
      scrollTrigger: { trigger: '.lx-pillars', start: 'top 80%', toggleActions: 'play none none reverse' },
    })

    // Счётчики
    el.querySelectorAll<HTMLElement>('.lx-stat__value').forEach((node) => {
      const target = Number(node.dataset.value)
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 2.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: node, start: 'top 88%', toggleActions: 'play none none none' },
        onUpdate: () => (node.textContent = String(Math.round(obj.v))),
      })
    })

    // Бегущие строки: скорость и наклон зависят от скорости прокрутки
    const rows = gsap.utils.toArray<HTMLElement>('.lx-marquee__row')
    const loops = rows.map((row, i) =>
      gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 46, ease: 'none', repeat: -1 })
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
          <SacredIcon id="vesica" className="lx-chapter-mark__icon" draw /> Философия
        </p>
        <p className="lx-manifesto__text">
          <em>Тень</em> — не враг и не ошибка. Это <em>спящая сила.</em> Я не привязываю к себе: я учу слышать{' '}
          <em>своё сердце,</em> доверять своей системе и однажды идти дальше — без внешних мастеров.
        </p>
        <p className="lx-manifesto__sign">
          <MerkabaMark size={14} /> Alina Tarot Energy
        </p>
      </div>

      <div className="lx-container">
        <div className="lx-pillars">
          {PILLARS.map((p) => (
            <article key={p.title} className="lx-pillar lx-glass">
              <SacredIcon id={p.symbol} className="lx-pillar__icon" draw />
              <h2 className="lx-pillar__title">{p.title}</h2>
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
                  <SacredIcon id={j % 2 ? 'seed' : 'merkaba'} className="lx-marquee__icon" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
