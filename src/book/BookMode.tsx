import { BookNavbarOverlay } from '../components/BookNavbarOverlay'
import { ContinuousStage } from '../three/ContinuousStage'
import '../App.css'

interface BookModeProps {
  onBack: () => void
}

/** Полноэкранная 3D-книга. Загружается отдельным чанком только при переходе в книгу. */
export default function BookMode({ onBack }: BookModeProps) {
  return (
    <>
      <ContinuousStage viewMode="book" />
      {/* без класса .app: у него непрозрачный фон на весь экран, он закрыл бы холст книги */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <BookNavbarOverlay onBackToPortal={onBack} />
      </div>
    </>
  )
}
