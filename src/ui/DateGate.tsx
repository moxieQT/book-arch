import { useState } from 'react'
import { useBookStore } from '../store/useBookStore'

function parseDob(value: string): { day: number; month: number; year: number } | null {
  if (!value) return null
  const parts = value.split('-')
  if (parts.length !== 3) return null
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  if (year < 1900 || year > new Date().getFullYear()) return null
  return { day, month, year }
}

export function DateGate() {
  const setBirthDate = useBookStore((s) => s.setBirthDate)
  const openBook = useBookStore((s) => s.openBook)
  const coverState = useBookStore((s) => s.coverState)
  const setCoverState = useBookStore((s) => s.setCoverState)
  const isAnimating = useBookStore((s) => s.isAnimating)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleOpen = () => {
    if (isAnimating) return
    const parsed = parseDob(value)
    if (!parsed) {
      setError('Укажите корректную дату рождения')
      return
    }
    setError('')
    setBirthDate(new Date(parsed.year, parsed.month - 1, parsed.day))
    openBook()
  }

  const handlePreset = (presetDate: string) => {
    setValue(presetDate)
    const parsed = parseDob(presetDate)
    if (parsed) {
      setError('')
      setBirthDate(new Date(parsed.year, parsed.month - 1, parsed.day))
      openBook()
    }
  }

  // В режиме презентации книга полностью свободна от любых баннеров!
  // Текст картуша уже нарисован прямо на 3D текстуре обложки.
  if (coverState === 'presentation') {
    return null
  }

  return (
    <div 
      className="cover-gate-inlaid"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        type="button"
        className="gate-back-link"
        onClick={(e) => {
          e.stopPropagation()
          setCoverState('presentation')
        }}
        title="Вернуть наклон книги"
      >
        ✕ Вернуться к обложке
      </button>

      <div className="gate-input-row">
        <input
          type="date"
          aria-label="Дата рождения"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="gate-date-input"
        />
        <button 
          type="button" 
          className="gate-submit-btn" 
          onClick={handleOpen} 
          disabled={isAnimating}
        >
          ✦ Открыть Врата ✦
        </button>
      </div>

      <div className="gate-preset-row">
        <span className="gate-preset-label">Эталон для проверки:</span>
        <button
          type="button"
          className="gate-preset-pill"
          onClick={() => handlePreset('1994-04-02')}
          disabled={isAnimating}
        >
          02.04.1994 (Эталон v0.3)
        </button>
      </div>

      {error && <div className="gate-err-msg">{error}</div>}
    </div>
  )
}
