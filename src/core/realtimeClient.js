/**
 * GuruKu Real-Time WebSocket & SSE Architecture
 * Industrial-Grade Bi-Directional Event Stream & Presence Hub
 */

class RealtimeClient {
  constructor() {
    this.socket = null;
    this.sseSource = null;
    this.role = null;
    this.tenantId = null;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.backoffDelays = [2000, 5000, 10000]; // Linear/Exponential Backoff
    this.pollingTimer = null;
    this.isPollingFallback = false;
    this.hasLoggedFallbackWarning = false;
  }

  getWsUrl(role, tenantId) {
    const apiBase = import.meta.env.VITE_API_URL || '';
    let host = window.location.host;
    let proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    if (apiBase.startsWith('http://')) {
      host = apiBase.replace('http://', '');
      proto = 'ws:';
    } else if (apiBase.startsWith('https://')) {
      host = apiBase.replace('https://', '');
      proto = 'wss:';
    }

    host = host.replace(/\/+$/, '');
    let url = `${proto}//${host}/api/v1/ws?role=${encodeURIComponent(role)}`;
    if (tenantId) {
      url += `&tenant_id=${encodeURIComponent(tenantId)}`;
    }
    return url;
  }

  getSseUrl(role, tenantId) {
    const apiBase = import.meta.env.VITE_API_URL || '';
    let baseUrl = apiBase ? apiBase.replace(/\/+$/, '') : '';
    let url = `${baseUrl}/api/v1/realtime/stream?role=${encodeURIComponent(role)}`;
    if (tenantId) {
      url += `&tenant_id=${encodeURIComponent(tenantId)}`;
    }
    return url;
  }

  /**
   * Connect to WebSocket room
   * @param {'super_admin'|'school_admin'} role
   * @param {string} [tenantId]
   */
  connect(role = 'school_admin', tenantId = null) {
    this.role = role;
    this.tenantId = tenantId || localStorage.getItem('school_id') || 'TEN-C9320E88';

    if (this.isPollingFallback) {
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = this.getWsUrl(this.role, this.tenantId);
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.hasLoggedFallbackWarning = false;
        this.stopPollingFallback();
        this.startHeartbeat();
        this.emitInternal('connect', { role: this.role, tenantId: this.tenantId });
        
        // If connecting as School Admin, broadcast initial presence and cached progress
        if (this.role === 'school_admin') {
          this.syncProgress('Workspace Dibuka');
        }

        if (this.sseSource) {
          this.sseSource.close();
          this.sseSource = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'pong') {
            return;
          }
          if (payload.event) {
            this.emitInternal(payload.event, payload);
          }
        } catch (e) {
          // Ignore non-json frames
        }
      };

      this.socket.onerror = () => {
        // Handled via onclose and backoff to avoid console flood
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emitInternal('disconnect');
        this.scheduleReconnect();
      };
    } catch (e) {
      this.connectSSE();
    }
  }

  connectSSE() {
    if (this.sseSource || this.isPollingFallback) return;
    try {
      const url = this.getSseUrl(this.role, this.tenantId);
      this.sseSource = new EventSource(url);

      this.sseSource.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emitInternal('connect', { mode: 'sse' });
        if (this.role === 'school_admin') {
          this.syncProgress('Workspace Dibuka');
        }
      };

      this.sseSource.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event) {
            this.emitInternal(payload.event, payload);
          }
        } catch (e) {}
      });

      this.sseSource.onerror = () => {
        this.isConnected = false;
        if (this.sseSource) {
          this.sseSource.close();
          this.sseSource = null;
        }
        this.stopReconnectingAndFallback();
      };
    } catch (e) {
      this.stopReconnectingAndFallback();
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000); // 20s heartbeat
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.stopReconnectingAndFallback();
      return;
    }

    const delay = this.backoffDelays[this.reconnectAttempts] || 10000;
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.role, this.tenantId);
    }, delay);
  }

  stopReconnectingAndFallback() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    if (this.socket) {
      try { this.socket.close(); } catch (e) {}
      this.socket = null;
    }
    if (this.sseSource) {
      try { this.sseSource.close(); } catch (e) {}
      this.sseSource = null;
    }

    if (!this.hasLoggedFallbackWarning) {
      console.warn('[Realtime WS] WebSocket connection failed after 3 attempts. Stopped reconnecting. Falling back to HTTP polling (every 30s).');
      this.hasLoggedFallbackWarning = true;
    }

    this.startPollingFallback();
  }

  startPollingFallback() {
    if (this.pollingTimer) return;
    this.isPollingFallback = true;
    // Initial poll
    this.pollFallback();
    // Recurring 30s poll
    this.pollingTimer = setInterval(() => {
      this.pollFallback();
    }, 30000);
  }

  stopPollingFallback() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isPollingFallback = false;
  }

  async pollFallback() {
    try {
      if (this.role === 'super_admin') {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiBase}/api/v1/super/metrics`, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            this.emitInternal('metrics_update', data);
          }
        }
      }
    } catch (e) {
      // Graceful fallback
    }
  }

  manualReconnect() {
    this.stopPollingFallback();
    this.reconnectAttempts = 0;
    this.hasLoggedFallbackWarning = false;
    this.connect(this.role, this.tenantId);
  }

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

  emitInternal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[Realtime Client] Error executing handler for', event, e);
        }
      });
    }
  }

  /**
   * Hitung progres kesiapan sekolah secara akurat dari local data
   * Validasi Lembaga = 10%, Daftar Kelas = 20%, Sesi KBM = 20%, Daftar Guru = 20%, Mapel = 15%, Pengampu = 15%
   */
  computeCurrentReadiness() {
    let p = 0;
    try {
      // 1. Validasi Lembaga (10%)
      const lembaga = localStorage.getItem('guruKu_lembaga_data') || localStorage.getItem('guruKu_lembaga_valid');
      if (lembaga) p += 10;

      // 2. Daftar Kelas (20%)
      const classes = JSON.parse(localStorage.getItem('guruKu_classes') || '[]');
      if (Array.isArray(classes) && classes.length > 0) p += 20;

      // 3. Sesi & Waktu KBM (20%)
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

      // 4. Daftar Guru (20%)
      const teachers = JSON.parse(localStorage.getItem('guruKu_teachers') || '[]');
      if (Array.isArray(teachers) && teachers.length > 0) p += 20;

      // 5. Mata Pelajaran (15%)
      const mapel = JSON.parse(localStorage.getItem('guruKu_mapel') || '[]');
      if (Array.isArray(mapel) && mapel.length > 0) p += 15;

      // 6. Pengampu Mapel (15%)
      const pengampu = localStorage.getItem('guruKu_pengampu');
      if (pengampu) {
        const parsedP = JSON.parse(pengampu);
        if (parsedP && Array.isArray(parsedP.rows) && parsedP.rows.length > 0) {
          p += 15;
        }
      }
    } catch (e) {}

    return Math.min(100, p);
  }

  /**
   * Hitung dan siarkan progres saat ini ke Super Admin
   * @param {string} menuName
   */
  async syncProgress(menuName = 'Master Data') {
    const readiness = this.computeCurrentReadiness();
    await this.reportProgress(readiness, menuName);
    return readiness;
  }

  /**
   * Broadcast progress update from School Admin to Super Admin
   * Dual-dispatch: WebSocket message + HTTP POST (Reliable self-healing)
   * @param {number} percentage (0 - 100)
   * @param {string} menuName (e.g. 'Daftar Kelas', 'Validasi Lembaga')
   */
  async reportProgress(percentage, menuName = 'Master Data') {
    const tenantId = this.tenantId || localStorage.getItem('school_id') || 'TEN-C9320E88';
    const payload = {
      type: 'update_progress',
      tenant_id: tenantId,
      readiness_percentage: Math.min(100, Math.max(0, Math.round(percentage))),
      last_active_menu: menuName,
    };

    // 1. Send via WebSocket if alive
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(payload));
      } catch (e) {}
    }

    // 2. HTTP POST guarantee (ensures database persistence and SSE broadcast)
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      await fetch(`${apiBase}/api/v1/school/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-School-ID': tenantId,
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          readiness_percentage: payload.readiness_percentage,
          last_active_menu: menuName,
        }),
      }).catch(() => {});
    } catch (e) {}
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    this.isConnected = false;
  }
}

export const realtimeClient = new RealtimeClient();
export default realtimeClient;
