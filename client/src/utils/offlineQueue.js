const QUEUE_KEY = 'aebnl_offline_queue'

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

/**
 * Adds an operation to the pending queue and notifies listeners.
 * @param {{ url: string, method: string, body: object, label: string }} item
 * @returns {string} The assigned id for the queued entry
 */
export function enqueue(item) {
  const queue = readQueue()
  const entry = { ...item, id: crypto.randomUUID(), queuedAt: Date.now() }
  queue.push(entry)
  writeQueue(queue)
  window.dispatchEvent(new CustomEvent('aebnl:queue-updated'))
  return entry.id
}

export function getQueue() {
  return readQueue()
}

export function removeFromQueue(id) {
  writeQueue(readQueue().filter((item) => item.id !== id))
  window.dispatchEvent(new CustomEvent('aebnl:queue-updated'))
}

export function queueSize() {
  return readQueue().length
}
