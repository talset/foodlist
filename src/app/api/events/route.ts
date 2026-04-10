import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { subscribe, unsubscribe } from '@/lib/sse'

export const dynamic = 'force-dynamic'

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no', // disable nginx buffering
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  // No household: return a valid SSE response that tells the client to stop
  // reconnecting (retry set to 1 hour). Without this, EventSource would
  // retry every few seconds and flood the console.
  if (!session.user.householdId) {
    const body = 'retry: 3600000\nevent: no-household\ndata: {}\n\n'
    return new Response(body, { headers: SSE_HEADERS })
  }

  const householdId = session.user.householdId
  const enc = new TextEncoder()

  let ctrl: ReadableStreamDefaultController<Uint8Array>
  let keepalive: ReturnType<typeof setInterval>

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller
      subscribe(householdId, ctrl)
      // Flush headers immediately
      controller.enqueue(enc.encode(': connected\n\n'))
      // Send a comment every 30 s to prevent proxy idle-timeout, which would
      // close the connection mid-stream and cause ERR_INCOMPLETE_CHUNKED_ENCODING.
      keepalive = setInterval(() => {
        try {
          controller.enqueue(enc.encode(': keepalive\n\n'))
        } catch {
          clearInterval(keepalive)
        }
      }, 30_000)
    },
    cancel() {
      clearInterval(keepalive)
      unsubscribe(householdId, ctrl)
    },
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
