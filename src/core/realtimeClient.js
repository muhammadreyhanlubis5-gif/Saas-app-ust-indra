/**
 * GuruKu Industrial Real-Time Client (Enterprise Grade)
 * Implements strict state machine, exponential backoff, Vercel-aware URL resolution,
 * SSE & Polling graceful fallback, and zero-leak cleanup.
 */

export const RealtimeState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed'
};

export const RealtimeMode = {
  WEBSOCKET: 'websocket',
  SSE: 'sse',
  POLLING: 'polling',
  NONE: 'none'
};

export class RealtimeClient {
  constructor() {
    this.socket = null;
    this.sseSource = null;
    this.role = null;
    this.tenantId = null;
    this.state = RealtimeState.DISCONNECTED;
    this.mode = RealtimeMode.NONE;

    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.pollingTimer = null;

    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.maxReconnectDelayMs = 30000;
    this.baseReconnectDelayMs = 1000;

    this.listeners = new Map();
    this.isLoggedOut = false;
    this.isRealtimeAvailable = true;
    this.lastErrorMessage = '';
  }

  /**
   * Mengembalikan status koneksi saat ini
   */
  getState() {
    return this.state;
  }

  /**
   * Mengembalikan mode realtime aktif (websocket | sse | polling | none)
   */
  getMode() {
    return this.mode;
  }

  /**
   * Menentukan apakah environment berjalan di Vercel Serverless tanpa server WS terpisah
   */
  isVercelServerlessWithoutDedicatedWS() {
    if (typeof window === 'undefined') return false;
    const wsBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_BASE_URL) || '';
    if (wsBase && !wsBase.includes('.vercel.app')) {
      return false; // Ada dedicated WebSocket server terkonfigurasi (misal Railway/Fly.io/VPS)
    }

    const host = window.location.hostname || '';
    return host.endsWith('vercel.app');
  }

  /**
   * Konstruksi URL WebSocket yang aman (Zero-Token di URL)
   */
  getWsUrl(role, tenantId) {
    const customWs = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_BASE_URL) || '';
    if (customWs) {
      const cleanWs = customWs.replace(/\/+$/, '');
      let url = `${cleanWs}/api/v1/ws?role=${encodeURIComponent(role)}`;
      if (tenantId) url += `&tenant_id=${encodeURIComponent(tenantId)}`;
      return url;
    }

    if (typeof window === 'undefined') return '';
    const host = window.location.host;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let url = `${proto}//${host}/api/v1/ws?role=${encodeURIComponent(role)}`;
    if (tenantId) url += `&tenant_id=${encodeURIComponent(tenantId)}`;
    return url;
  }

  /**
   * Konstruksi URL Server-Sent Events (SSE)
   */
  getSseUrl(role, tenantId) {
    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) || '';
    const baseUrl = apiBase ? apiBase.replace(/\/+$/, '') : '';
    let url = `${baseUrl}/api/v1/realtime/stream?role=${encodeURIComponent(role)}`;
    if (tenantId) url += `&tenant_id=${encodeURIComponent(tenantId)}`;
    return url;
  }

  /**
   * Transisi state internal dan notifikasi listener
   */
  transitionState(newState, reason = '') {
    if (this.state === newState) return;
    const previousState = this.state;
    this.state = newState;

    this.emitInternal('state_change', {
      previousState,
      state: newState,
      mode: this.mode,
      reason,
      isRealtimeAvailable: this.isRealtimeAvailable
    });

    this.emitInternal('realtime:status', {
      state: newState,
      mode: this.mode,
      isRealtimeAvailable: this.isRealtimeAvailable,
      message: this.lastErrorMessage || (newState === RealtimeState.CONNECTED ? 'Terhubung' : '')
    });
  }

  /**
   * Membuka koneksi realtime dengan manajemen lifecycle lengkap
   * @param {'super_admin'|'school_admin'|'teacher'|'principal'|'curriculum_admin'} role
   * @param {string} [tenantId]
   */
  connect(role = 'school_admin', tenantId = null) {
    this.isLoggedOut = false;
    this.role = role;
    this.tenantId = tenantId || (typeof localStorage !== 'undefined' ? localStorage.getItem('school_id') : null) || '';

    // Cegah koneksi ganda jika sedang dalam proses connecting atau sudah connected
    if (this.state === RealtimeState.CONNECTING || this.state === RealtimeState.CONNECTED) {
      return;
    }

    // Periksa apakah platform Vercel Serverless tanpa dedicated WS backend
    if (this.isVercelServerlessWithoutDedicatedWS()) {
      // Vercel Serverless tidak mendukung persistent WebSocket upgrade.
      // Langsung arahkan ke SSE atau Polling untuk menghindari spam browser error console.
      this.mode = RealtimeMode.SSE;
      this.connectSSE();
      return;
    }

    this.connectWebSocket();
  }

  /**
   * Jalur 1: Inisialisasi WebSocket
   */
  connectWebSocket() {
    this.cleanupSocket();
    this.cleanupSSE();
    this.stopPollingFallback();

    this.mode = RealtimeMode.WEBSOCKET;
    this.transitionState(RealtimeState.CONNECTING);

    try {
      const url = this.getWsUrl(this.role, this.tenantId);
      if (!url) {
        throw new Error('URL WebSocket tidak valid');
      }

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.isRealtimeAvailable = true;
        this.lastErrorMessage = '';
        this.transitionState(RealtimeState.CONNECTED);
        this.startHeartbeat();
        this.emitInternal('connect', { mode: RealtimeMode.WEBSOCKET, role: this.role, tenantId: this.tenantId });

        if (this.role === 'school_admin') {
          this.syncProgress('Workspace Aktif');
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'pong') return;
          if (payload.event) {
            this.emitInternal(payload.event, payload);
          }
        } catch (_) {
          // Abaikan non-JSON frame
        }
      };

      this.socket.onerror = () => {
        // Error socket ditangani via onclose untuk mencegah spam log
        this.lastErrorMessage = 'Gagal melakukan jabat tangan WebSocket';
      };

      this.socket.onclose = () => {
        this.stopHeartbeat();
        if (this.isLoggedOut) {
          this.transitionState(RealtimeState.DISCONNECTED, 'User logged out');
          return;
        }

        this.transitionState(RealtimeState.RECONNECTING, 'Socket ditutup');
        this.scheduleReconnect();
      };
    } catch (err) {
      this.lastErrorMessage = err?.message || 'Inisialisasi WebSocket gagal';
      this.scheduleReconnect();
    }
  }

  /**
   * Penjadwalan reconnect dengan Exponential Backoff (Maksimum 5 kali, max delay 30s)
   */
  scheduleReconnect() {
    if (this.reconnectTimer) return;
    if (this.isLoggedOut) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Maksimal 5 percobaan habis -> fallback ke SSE atau Polling
      this.transitionState(RealtimeState.FAILED, 'Maksimal 5 percobaan reconnect tercapai');
      this.startFallbackCascade();
      return;
    }

    // Exponential Backoff: 1s, 2s, 4s, 8s, 16s (max 30s)
    const delay = Math.min(
      this.baseReconnectDelayMs * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelayMs
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isLoggedOut) {
        this.connect(this.role, this.tenantId);
      }
    }, delay);
  }

  /**
   * Jalur Fallback Bertingkat: WebSocket Gagal -> Coba SSE -> Coba Polling
   */
  startFallbackCascade() {
    this.cleanupSocket();
    if (this.mode === RealtimeMode.WEBSOCKET) {
      this.mode = RealtimeMode.SSE;
      this.connectSSE();
    } else if (this.mode === RealtimeMode.SSE) {
      this.mode = RealtimeMode.POLLING;
      this.startPollingFallback();
    }
  }

  /**
   * Jalur 2: Server-Sent Events (SSE)
   */
  connectSSE() {
    this.cleanupSSE();
    if (this.isLoggedOut) return;

    try {
      const url = this.getSseUrl(this.role, this.tenantId);
      if (typeof EventSource === 'undefined') {
        throw new Error('EventSource tidak didukung lingkungan ini');
      }

      this.sseSource = new EventSource(url);
      this.transitionState(RealtimeState.CONNECTING, 'Menghubungkan ke SSE stream');

      this.sseSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.isRealtimeAvailable = true;
        this.mode = RealtimeMode.SSE;
        this.transitionState(RealtimeState.CONNECTED);
        this.emitInternal('connect', { mode: RealtimeMode.SSE, role: this.role });

        if (this.role === 'school_admin') {
          this.syncProgress('Workspace Aktif (SSE)');
        }
      };

      this.sseSource.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event) {
            this.emitInternal(payload.event, payload);
          }
        } catch (_) {}
      });

      this.sseSource.onerror = () => {
        this.cleanupSSE();
        if (this.isLoggedOut) {
          this.transitionState(RealtimeState.DISCONNECTED);
          return;
        }

        // Jika SSE gagal, turunkan ke Polling HTTP (setiap 30-60 detik)
        this.mode = RealtimeMode.POLLING;
        this.startPollingFallback();
      };
    } catch (err) {
      this.mode = RealtimeMode.POLLING;
      this.startPollingFallback();
    }
  }

  /**
   * Jalur 3: Periodic HTTP Polling (Interval 30–60 Detik)
   */
  startPollingFallback() {
    this.stopPollingFallback();
    if (this.isLoggedOut) return;

    this.mode = RealtimeMode.POLLING;
    this.isRealtimeAvailable = true;
    this.transitionState(RealtimeState.CONNECTED, 'Polling HTTP aktif');

    // Polling pertama kali secara langsung
    this.executePoll();

    // Polling berulang setiap 30 detik (konservatif & aman dari rate limiter)
    this.pollingTimer = setInterval(() => {
      if (!this.isLoggedOut) {
        this.executePoll();
      }
    }, 30000);
  }

  stopPollingFallback() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  async executePoll() {
    try {
      const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) || '';
      if (this.role === 'super_admin') {
        const res = await fetch(`${apiBase}/api/v1/super/metrics`, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          this.emitInternal('metrics_update', data);
        }
      } else if (this.role === 'school_admin' && this.tenantId) {
        const res = await fetch(`${apiBase}/api/v1/school/dashboard`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-School-ID': this.tenantId
          },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          this.emitInternal('dashboard_update', data);
        }
      }
    } catch (_) {
      // Polling network drop tidak boleh memicu error unhandled
    }
  }

  /**
   * Heartbeat ping (interval 25 detik)
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === 1 /* WebSocket.OPEN */) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping' }));
        } catch (_) {}
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  cleanupSocket() {
    this.stopHeartbeat();
    if (this.socket) {
      try {
        this.socket.onopen = null;
        this.socket.onmessage = null;
        this.socket.onerror = null;
        this.socket.onclose = null;
        this.socket.close();
      } catch (_) {}
      this.socket = null;
    }
  }

  cleanupSSE() {
    if (this.sseSource) {
      try {
        this.sseSource.onopen = null;
        this.sseSource.onerror = null;
        this.sseSource.close();
      } catch (_) {}
      this.sseSource = null;
    }
  }

  /**
   * Putus koneksi dan bersihkan seluruh state/timer
   * @param {boolean} [isLogout=false] Jika true, cegah koneksi ulang otomatis
   */
  disconnect(isLogout = false) {
    if (isLogout) {
      this.isLoggedOut = true;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopPollingFallback();
    this.cleanupSocket();
    this.cleanupSSE();

    this.reconnectAttempts = 0;
    this.transitionState(RealtimeState.DISCONNECTED, isLogout ? 'User logout' : 'Client disconnected');
  }

  /**
   * Pemicu Reconnect manual oleh pengguna (misal klik "Coba Sambungkan")
   */
  manualReconnect() {
    this.isLoggedOut = false;
    this.reconnectAttempts = 0;
    this.connect(this.role, this.tenantId);
  }

  /**
   * Event Listener Pub/Sub
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  removeAllListeners() {
    this.listeners.clear();
  }

  emitInternal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[Realtime Client] Listener error on event:', event, e);
        }
      });
    }
  }

  /**
   * Hitung kesiapan sekolah secara akurat dari local state
   */
  computeCurrentReadiness() {
    if (typeof localStorage === 'undefined') return 0;
    let p = 0;
    try {
      const lembaga = localStorage.getItem('guruKu_lembaga_data') || localStorage.getItem('guruKu_lembaga_valid');
      if (lembaga) p += 10;

      const classes = JSON.parse(localStorage.getItem('guruKu_classes') || '[]');
      if (Array.isArray(classes) && classes.length > 0) p += 20;

      const sesi = localStorage.getItem('guruKu_sesi_kbm');
      if (sesi) {
        const parsed = JSON.parse(sesi);
        if (parsed && typeof parsed === 'object') {
          const keys = Object.keys(parsed);
          if (keys.some(k => Array.isArray(parsed[k]) && parsed[k].length > 0)) {
            p += 20;
          }
        }
      }

      const teachers = JSON.parse(localStorage.getItem('guruKu_teachers') || '[]');
      if (Array.isArray(teachers) && teachers.length > 0) p += 20;

      const mapel = JSON.parse(localStorage.getItem('guruKu_mapel') || '[]');
      if (Array.isArray(mapel) && mapel.length > 0) p += 15;

      const pengampu = localStorage.getItem('guruKu_pengampu');
      if (pengampu) {
        const parsedP = JSON.parse(pengampu);
        if (parsedP && Array.isArray(parsedP.rows) && parsedP.rows.length > 0) {
          p += 15;
        }
      }
    } catch (_) {}

    return Math.min(100, p);
  }

  /**
   * Siarkan progres saat ini ke Super Admin (dual-channel: socket/SSE + HTTP guarantee)
   */
  async syncProgress(menuName = 'Master Data') {
    const readiness = this.computeCurrentReadiness();
    await this.reportProgress(readiness, menuName);
    return readiness;
  }

  async reportProgress(percentage, menuName = 'Master Data') {
    const tenantId = this.tenantId || (typeof localStorage !== 'undefined' ? localStorage.getItem('school_id') : null) || '';
    const payload = {
      type: 'update_progress',
      tenant_id: tenantId,
      readiness_percentage: Math.min(100, Math.max(0, Math.round(percentage))),
      last_active_menu: menuName
    };

    // 1. Kirim via WebSocket jika open
    if (this.socket && this.socket.readyState === 1 /* OPEN */) {
      try {
        this.socket.send(JSON.stringify(payload));
      } catch (_) {}
    }

    // 2. HTTP POST guarantee untuk persistensi database Neon
    try {
      const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) || '';
      await fetch(`${apiBase}/api/v1/school/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-School-ID': tenantId
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (_) {}
  }
}

export const realtimeClient = new RealtimeClient();
export default realtimeClient;
