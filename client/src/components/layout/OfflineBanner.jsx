import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react'
import { useOfflineStatus } from '../../hooks/useOfflineStatus'

export default function OfflineBanner() {
  const { isOnline, pendingCount, syncing, syncError } = useOfflineStatus()

  if (!isOnline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          background: '#78350f',
          color: '#fff',
          padding: '7px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          lineHeight: '1.4',
          borderBottom: '1px solid rgba(0,0,0,0.15)',
        }}
      >
        <WifiOff size={14} aria-hidden style={{ flexShrink: 0 }} />
        <span>
          <strong>Sin conexión</strong>
          {' — Los cambios se guardarán localmente y se sincronizarán al reconectarse.'}
          {pendingCount > 0 && (
            <> &nbsp;({pendingCount} pendiente{pendingCount !== 1 ? 's' : ''})</>
          )}
        </span>
      </div>
    )
  }

  if (syncing) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          background: '#1d4ed8',
          color: '#fff',
          padding: '7px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          borderBottom: '1px solid rgba(0,0,0,0.15)',
        }}
      >
        <RefreshCw
          size={14}
          aria-hidden
          style={{ flexShrink: 0, animation: 'aebnl-spin 1s linear infinite' }}
        />
        <span>
          Conexión restablecida — sincronizando {pendingCount} cambio
          {pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}…
        </span>
        <style>{`@keyframes aebnl-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (syncError) {
    return (
      <div
        role="alert"
        style={{
          background: '#b91c1c',
          color: '#fff',
          padding: '7px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          borderBottom: '1px solid rgba(0,0,0,0.15)',
        }}
      >
        <AlertTriangle size={14} aria-hidden style={{ flexShrink: 0 }} />
        <span>{syncError} Verifique los registros en el historial.</span>
      </div>
    )
  }

  return null
}
