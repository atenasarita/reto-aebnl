import { useState, useEffect, useCallback } from 'react'
import { getQueue, removeFromQueue, queueSize } from '../utils/offlineQueue'
import { getValidToken } from '../utils/auth'

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(queueSize)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)

  const drainQueue = useCallback(async () => {
    const queue = getQueue()
    if (!queue.length) return

    setSyncing(true)
    setSyncError(null)

    const token = getValidToken()
    if (!token) {
      setSyncing(false)
      return
    }

    let failures = 0
    for (const item of queue) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
        })
        // Remove on success or unrecoverable client errors (4xx)
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          removeFromQueue(item.id)
        } else {
          failures++
        }
      } catch {
        failures++
      }
    }

    setPendingCount(queueSize())
    setSyncing(false)
    if (failures > 0) {
      setSyncError(
        `${failures} cambio${failures !== 1 ? 's' : ''} no pud${failures !== 1 ? 'ieron' : ''} sincronizarse.`
      )
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      drainQueue()
    }
    const handleOffline = () => {
      setIsOnline(false)
      setSyncing(false)
    }
    const handleQueueUpdate = () => setPendingCount(queueSize())

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('aebnl:queue-updated', handleQueueUpdate)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('aebnl:queue-updated', handleQueueUpdate)
    }
  }, [drainQueue])

  return { isOnline, pendingCount, syncing, syncError }
}
