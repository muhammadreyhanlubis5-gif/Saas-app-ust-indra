import test from 'node:test'
import assert from 'node:assert/strict'
import { RealtimeClient, RealtimeState, RealtimeMode } from '../src/core/realtimeClient.js'

// Mock WebSocket implementation for unit testing
class MockWebSocket {
  static instances = []
  static shouldFail = false

  constructor(url) {
    this.url = url
    this.readyState = 0 // CONNECTING
    this.sentMessages = []
    this.onopen = null
    this.onmessage = null
    this.onerror = null
    this.onclose = null
    MockWebSocket.instances.push(this)

    setTimeout(() => {
      if (MockWebSocket.shouldFail) {
        this.readyState = 3 // CLOSED
        if (this.onerror) this.onerror(new Error('Handshake failed'))
        if (this.onclose) this.onclose({ code: 1006, reason: 'Abnormal Closure' })
      } else {
        this.readyState = 1 // OPEN
        if (this.onopen) this.onopen()
      }
    }, 2)
  }

  send(data) {
    this.sentMessages.push(data)
  }

  close() {
    this.readyState = 3
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal Closure' })
  }
}

// Global browser mocks
globalThis.WebSocket = MockWebSocket
globalThis.window = {
  location: {
    host: 'api.guruku.id',
    hostname: 'api.guruku.id',
    protocol: 'https:'
  }
}

test('1. WebSocket lifecycle: Berhasil connect & transisi state ke CONNECTED', async () => {
  MockWebSocket.instances = []
  MockWebSocket.shouldFail = false

  const client = new RealtimeClient()
  try {
    assert.equal(client.getState(), RealtimeState.DISCONNECTED)

    const connectedPromise = new Promise((resolve) => {
      client.on('connect', (payload) => {
        resolve(payload)
      })
    })

    client.connect('school_admin', 'sch-uuid-123')
    assert.equal(client.getState(), RealtimeState.CONNECTING)

    const payload = await connectedPromise
    assert.equal(payload.mode, RealtimeMode.WEBSOCKET)
    assert.equal(client.getState(), RealtimeState.CONNECTED)
  } finally {
    client.disconnect()
    assert.equal(client.getState(), RealtimeState.DISCONNECTED)
  }
})

test('2. WebSocket gagal connect lalu masuk fase reconnecting', async () => {
  MockWebSocket.instances = []
  MockWebSocket.shouldFail = true

  const client = new RealtimeClient()
  client.baseReconnectDelayMs = 5

  try {
    const reconnectingPromise = new Promise((resolve) => {
      client.on('state_change', (evt) => {
        if (evt.state === RealtimeState.RECONNECTING) {
          resolve(true)
        }
      })
    })

    client.connect('school_admin', 'sch-uuid-123')
    const reached = await reconnectingPromise
    assert.equal(reached, true)
  } finally {
    client.disconnect()
  }
})

test('3. Reconnect dibatasi tepat maksimum 5 percobaan dan berhenti setelahnya', async () => {
  MockWebSocket.instances = []
  MockWebSocket.shouldFail = true

  const client = new RealtimeClient()
  client.baseReconnectDelayMs = 2 // Percepat delay test
  client.maxReconnectAttempts = 5

  try {
    const failedPromise = new Promise((resolve) => {
      client.on('state_change', (evt) => {
        if (evt.state === RealtimeState.FAILED) {
          resolve(true)
        }
      })
    })

    client.connect('school_admin', 'sch-uuid-123')

    // Tunggu event FAILED dipicu secara event-driven
    const failedReached = await failedPromise
    assert.equal(failedReached, true)
    assert.equal(client.reconnectAttempts, 5)
  } finally {
    client.disconnect()
  }
})

test('4. Tidak terjadi duplicate connection jika dipanggil berulang kali', async () => {
  MockWebSocket.instances = []
  MockWebSocket.shouldFail = false

  const client = new RealtimeClient()
  try {
    client.connect('school_admin', 'sch-uuid-123')
    client.connect('school_admin', 'sch-uuid-123')
    client.connect('school_admin', 'sch-uuid-123')

    // Socket dibuat hanya 1 kali
    assert.equal(MockWebSocket.instances.length, 1)

    await new Promise(r => setTimeout(r, 20))
    assert.equal(client.getState(), RealtimeState.CONNECTED)

    // Panggilan connect saat sudah CONNECTED juga diabaikan
    client.connect('school_admin', 'sch-uuid-123')
    assert.equal(MockWebSocket.instances.length, 1)
  } finally {
    client.disconnect()
  }
})

test('5. Cleanup saat component unmount (listeners & timers dibersihkan tanpa memory leak)', async () => {
  const client = new RealtimeClient()
  try {
    let callCount = 0
    const handler = () => { callCount++ }

    const unsubscribe = client.on('test_event', handler)
    client.emitInternal('test_event', {})
    assert.equal(callCount, 1)

    // Unmount simulation
    unsubscribe()
    client.emitInternal('test_event', {})
    assert.equal(callCount, 1) // Tidak bertambah lagi

    // Bersihkan semua
    client.removeAllListeners()
    assert.equal(client.listeners.size, 0)
  } finally {
    client.disconnect()
  }
})

test('6. Logout menutup koneksi secara permanen dan mencegah auto-reconnect', async () => {
  MockWebSocket.instances = []
  MockWebSocket.shouldFail = false

  const client = new RealtimeClient()
  try {
    const connectedPromise = new Promise((resolve) => {
      client.on('connect', () => resolve(true))
    })

    client.connect('school_admin', 'sch-uuid-123')
    await connectedPromise
    assert.equal(client.getState(), RealtimeState.CONNECTED)

    // Logout dipicu
    client.disconnect(true /* isLogout */)
    assert.equal(client.isLoggedOut, true)
    assert.equal(client.getState(), RealtimeState.DISCONNECTED)
    assert.equal(client.reconnectTimer, null)

    // Event close socket tidak boleh memicu reconnect
    await new Promise(r => setTimeout(r, 20))
    assert.equal(client.reconnectTimer, null)
    assert.equal(client.getState(), RealtimeState.DISCONNECTED)
  } finally {
    client.disconnect(true)
  }
})

test('7. Deteksi domain Vercel Serverless: Menghindari WebSocket crash dan langsung fallback', async () => {
  MockWebSocket.instances = []
  
  // Simulasikan hostname Vercel
  globalThis.window.location.hostname = 'sistem-sekolah-pintar.vercel.app'
  globalThis.window.location.host = 'sistem-sekolah-pintar.vercel.app'

  const client = new RealtimeClient()
  try {
    assert.equal(client.isVercelServerlessWithoutDedicatedWS(), true)

    client.connect('school_admin', 'sch-uuid-123')

    // Pada domain Vercel tanpa VITE_WS_BASE_URL terpisah, client tidak boleh membuat MockWebSocket
    assert.equal(MockWebSocket.instances.length, 0)
  } finally {
    client.disconnect()
    // Reset hostname
    globalThis.window.location.hostname = 'api.guruku.id'
    globalThis.window.location.host = 'api.guruku.id'
  }
})

test('8. Dashboard tetap tampil & usable meskipun realtime gagal (Non-blocking status)', async () => {
  const client = new RealtimeClient()
  try {
    let statusReported = null

    client.on('realtime:status', (status) => {
      statusReported = status
    })

    // Simulasikan state FAILED
    client.transitionState(RealtimeState.FAILED, 'Koneksi jaringan terputus')

    assert.notEqual(statusReported, null)
    assert.equal(statusReported.state, RealtimeState.FAILED)
    // Aplikasi tidak di-block: UI menampilkan badge/indikator non-fatal
    assert.ok(statusReported.message !== undefined)
  } finally {
    client.disconnect()
  }
})
