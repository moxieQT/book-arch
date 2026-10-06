import { useRef } from 'react'
import { MANAGER_INFO } from '../../data/alinaPricing'
import { BOOKING_GREETING, CHAPTERS, LEGAL_DISCLAIMER, telegramLink, whatsappLink } from '../content'
import { MerkabaMark, SacredIcon } from '../components/Ornaments'
import { gsap, SplitText, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

const HELLO = `${BOOKING_GREETING} Хочу записаться в Alina Tarot Energy — помогите, пожалуйста, подобрать формат.`

interface ContactProps {
  onOpenBook: () => void
  onOpenLegal: () => void
}

export function Contact({ onOpenBook, onOpenLegal }: ContactProps) {
  const root = useRef<HTMLElement>(null)

  useGsap(root, ({ motion }) => {
    if (!motion) return
    // aria: 'none' — без aria-label на цитате; текст остаётся доступным скринридерам
    const split = SplitText.create('.lx-contact__quote', { type: 'lines', mask: 'lines', aria: 'none' })
    gsap.from(split.lines, {
      yPercent: 100,
      duration: 1.4,
      stagger: 0.08,
      scrollTrigger: { trigger: '.lx-contact__quote', start: 'top 80%', toggleActions: 'play none none reverse' },
    })
    gsap.from('.lx-contact__channel', {
      y: 60,
      opacity: 0,
      stagger: 0.12,
      duration: 1.4,
      scrollTrigger: { trigger: '.lx-contact__channels', start: 'top 85%', toggleActions: 'play none none reverse' },
    })
    // Гигантское имя в подвале заливается золотом по мере прокрутки
    gsap.fromTo(
      '.lx-footer__word-fill',
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        scrollTrigger: { trigger: '.lx-footer__word', start: 'top 95%', end: 'bottom 85%', scrub: true },
      }
    )
  })

  return (
    <section id="contact" className="lx-contact" ref={root}>
      <div className="lx-container">
        <p className="lx-eyebrow lx-chapter-mark">
          <SacredIcon id="equilibrium" className="lx-chapter-mark__icon" draw /> Запись
        </p>

        <div className="lx-contact__grid">
          <div>
            <h2 className="lx-h2">
              Напишите
              <br />
              <em>Марии</em>
            </h2>
            <p className="lx-lead">
              {MANAGER_INFO.name} — менеджер Alina Tarot Energy. Она ответит на вопросы, подберёт формат и время сессии.
            </p>
          </div>
          <figure className="lx-contact__figure">
            <blockquote className="lx-contact__quote">{MANAGER_INFO.quote}</blockquote>
            <figcaption>
              <MerkabaMark size={14} /> Alina Tarot Energy
            </figcaption>
          </figure>
        </div>

        <div className="lx-contact__channels">
          <a className="lx-contact__channel lx-glass" href={telegramLink(HELLO)} target="_blank" rel="noopener noreferrer" data-cursor="Написать">
            <span className="lx-contact__label">Telegram</span>
            <span className="lx-contact__value">{MANAGER_INFO.telegram}</span>
            <span className="lx-contact__arrow" aria-hidden="true">
              ↗
            </span>
          </a>
          <a className="lx-contact__channel lx-glass" href={whatsappLink(HELLO)} target="_blank" rel="noopener noreferrer" data-cursor="Написать">
            <span className="lx-contact__label">WhatsApp</span>
            <span className="lx-contact__value">{MANAGER_INFO.phone}</span>
            <span className="lx-contact__arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>

      <footer className="lx-footer">
        <div className="lx-container">
          <div className="lx-footer__cols">
            <nav aria-label="Главы">
              <h4>Главы</h4>
              <ul>
                {CHAPTERS.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => scrollToTarget(`#${c.id}`)}>
                      <SacredIcon id={c.icon ?? c.symbol} className="lx-footer__icon" /> {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h4>Книга</h4>
              <ul>
                <li>
                  <button type="button" onClick={onOpenBook}>
                    Открыть «Архетипы и Тени»
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToTarget('#codes')}>
                    Рассчитать коды
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4>Контакты</h4>
              <ul>
                <li>
                  <a href={MANAGER_INFO.telegramUrl} target="_blank" rel="noopener noreferrer">
                    Telegram {MANAGER_INFO.telegram}
                  </a>
                </li>
                <li>
                  <a href={MANAGER_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    WhatsApp {MANAGER_INFO.phone}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="lx-footer__word" aria-hidden="true">
            <span className="lx-footer__word-outline">Alina Tarot Energy</span>
            <span className="lx-footer__word-fill">Alina Tarot Energy</span>
          </div>

          <div className="lx-footer__legal">
            <p>
              <strong>Правовое уведомление · 18+.</strong> {LEGAL_DISCLAIMER}
            </p>
            <div className="lx-footer__bottom">
              <span>© {new Date().getFullYear()} Alina Tarot Energy. Пространство голоса, сознания и трансформации.</span>
              <button type="button" onClick={onOpenLegal}>
                Проверка текстов на юр. риски (РФ)
              </button>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
