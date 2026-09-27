import { useEffect, useRef, useState } from 'react'
import { soundscape } from '../../audio/soundscape'
import { CHAPTERS, NAV_LINKS, type ChapterId } from '../content'
import { gsap, lockScroll, ScrollTrigger, scrollToTarget } from '../motion'
import { MerkabaMark, SacredIcon } from './Ornaments'

interface HeaderProps {
  onOpenBook: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function go(id: string) {
  scrollToTarget(`#${id}`, id === 'prologue' ? 0 : -10)
}

export function Header({ onOpenBook, theme, onToggleTheme }: HeaderProps) {
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(() => soundscape.getIsEnabled())
  const bar = useRef<HTMLSpanElement>(null)
  const hiddenRef = useRef(false)

  useEffect(() => {
    // Шапка прячется при прокрутке вниз и возвращается при движении вверх
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const next = self.direction === 1 && self.scroll() > 240
        document.documentElement.classList.toggle('lx-scrolled', self.scroll() > 40)
        if (next !== hiddenRef.current) {
          hiddenRef.current = next
          setHidden(next)
        }
        if (bar.current) gsap.set(bar.current, { scaleX: self.progress })
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    lockScroll(menuOpen)
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const toggleSound = () => setSoundOn(soundscape.toggle())

  const navTo = (id: ChapterId) => {
    setMenuOpen(false)
    // меню закрывается 0,5 с — прокручиваем после снятия блокировки
    window.setTimeout(() => go(id), menuOpen ? 350 : 0)
  }

  return (
    <>
      <header className={`lx-header ${hidden && !menuOpen ? 'is-hidden' : ''}`}>
        <button type="button" className="lx-brand" onClick={() => navTo('prologue')} aria-label="Alina Tarot Energy — в начало">
          <MerkabaMark size={24} />
          <span className="lx-brand__name">Alina</span>
          <span className="lx-brand__sub">Tarot Energy</span>
        </button>

        <nav className="lx-nav" aria-label="Разделы">
          {NAV_LINKS.map((l) => (
            <button key={l.id} type="button" className="lx-nav__link" onClick={() => navTo(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>

        <div className="lx-header__actions">
          <button
            type="button"
            className="lx-theme"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            title={theme === 'light' ? 'Ночь' : 'День'}
          >
            <span className={`lx-theme__orb ${theme === 'dark' ? 'is-night' : ''}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`lx-sound ${soundOn ? 'is-on' : ''}`}
            onClick={toggleSound}
            aria-pressed={soundOn}
            title={soundOn ? 'Выключить звуковой фон' : 'Включить звуковой фон 432 Гц'}
          >
            <span className="lx-sound__bars" aria-hidden="true">
              <i /><i /><i /><i />
            </span>
            <span className="lx-sound__label">432 Гц</span>
          </button>
          <button type="button" className="lx-btn lx-btn--wine lx-btn--small lx-header__cta" onClick={() => navTo('sessions')}>
            Записаться
          </button>
          <button
            type="button"
            className={`lx-burger ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            <i /><i />
          </button>
        </div>
        <span className="lx-progress" ref={bar} aria-hidden="true" />
      </header>

      <div className={`lx-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen} data-lenis-prevent>
        <ol className="lx-menu__list">
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => navTo(c.id)} tabIndex={menuOpen ? 0 : -1}>
                <SacredIcon id={c.icon ?? c.symbol} className="lx-menu__icon" />
                <span className="lx-menu__label">{c.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="lx-btn lx-btn--gold lx-menu__book"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => {
            setMenuOpen(false)
            onOpenBook()
          }}
        >
          Открыть книгу «Архетипы и Тени»
        </button>
      </div>
    </>
  )
}

/** Оглавление-«закладка» слева: символы глав, активный светится */
export function ChapterRail() {
  const [active, setActive] = useState<ChapterId>('prologue')

  useEffect(() => {
    const triggers = CHAPTERS.map((c) =>
      ScrollTrigger.create({
        trigger: `#${c.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(c.id),
      })
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return (
    <nav className="lx-rail" aria-label="Главы">
      {CHAPTERS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`lx-rail__item ${active === c.id ? 'is-active' : ''}`}
          onClick={() => go(c.id)}
          aria-current={active === c.id ? 'true' : undefined}
        >
          <SacredIcon id={c.icon ?? c.symbol} className="lx-rail__icon" />
          <span className="lx-rail__label">{c.label}</span>
        </button>
      ))}
    </nav>
  )
}
