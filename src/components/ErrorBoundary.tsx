import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Книга Архетипов: ошибка компонента:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 40%, #FAF6EE 0%, #E8DFD0 80%, #DDD2BF 100%)',
            color: '#201C24',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '40px 32px',
              background: 'rgba(255, 253, 248, 0.95)',
              border: '2px solid #C6A76B',
              boxShadow: '0 12px 40px rgba(92, 25, 46, 0.12)',
              borderRadius: '4px',
            }}
          >
            <div style={{ fontSize: '36px', color: '#5C192E', marginBottom: '12px' }}>✦</div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#5C192E',
                margin: '0 0 12px',
                letterSpacing: '2px',
              }}
            >
              ВРАТА ВРЕМЕННО НЕДОСТУПНЫ
            </h1>
            <p
              style={{
                fontSize: '18px',
                fontStyle: 'italic',
                color: '#4A3E38',
                lineHeight: 1.5,
                margin: '0 0 28px',
              }}
            >
              Произошла непредвиденная ошибка при чтении фолианта. Попробуйте обновить страницу для восстановления гармонии.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #7A213D 0%, #5C192E 100%)',
                color: '#F8F5EE',
                border: '1px solid #D4AF37',
                padding: '14px 32px',
                fontSize: '18px',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 700,
                letterSpacing: '2px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(92, 25, 46, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              ✦ ОБНОВИТЬ СТРАНИЦУ ✦
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
