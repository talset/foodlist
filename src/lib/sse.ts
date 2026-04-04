/**
 * Server-Sent Events — household broadcast registry
 * Module-level Map works in self-hosted single-process Next.js (Docker).
 */

type Ctrl = ReadableStreamDefaultController<Uint8Array>

const clients = new Map<number, Set<Ctrl>>()
const enc = new TextEncoder()

export function subscribe(householdId: number, ctrl: Ctrl) {
  if (!clients.has(householdId)) clients.set(householdId, new Set())
  clients.get(householdId)!.add(ctrl)
}

export function unsubscribe(householdId: number, ctrl: Ctrl) {
  const set = clients.get(householdId)
  if (!set) return
  set.delete(ctrl)
  if (set.size === 0) clients.delete(householdId)
}

export function broadcast(householdId: number, event: string) {
  const set = clients.get(householdId)
  if (!set || set.size === 0) return
  const msg = enc.encode(`event: ${event}\ndata: {}\n\n`)
  for (const ctrl of set) {
    try {
      ctrl.enqueue(msg)
    } catch {
      // client already disconnected — will be cleaned up on stream cancel
    }
  }
}
