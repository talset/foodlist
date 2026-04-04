import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { subscribe, unsubscribe } from '@/lib/sse'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (!session.user.householdId) return new Response('No household', { status: 400 })

  const householdId = session.user.householdId
  const enc = new TextEncoder()

  let ctrl: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller
      subscribe(householdId, ctrl)
      // Initial keepalive comment to flush headers
      controller.enqueue(enc.encode(': connected\n\n'))
    },
    cancel() {
      unsubscribe(householdId, ctrl)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  })
}
