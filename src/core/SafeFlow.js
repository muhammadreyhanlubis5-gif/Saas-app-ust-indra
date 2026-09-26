import localforage from 'localforage';

// Konfigurasi Database Lokal
localforage.config({
  name: 'SistemSekolahPintar',
  storeName: 'safeflow_engine',
  description: 'Industrial Grade Offline-First Cache Engine'
});

export const SafeFlow = {
  async fetch(url, options = {}) {
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase());
    
    // Auto-inject Authorization Token untuk semua request
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchOptions = { ...options, headers };

    if (isMutation) {
      // ----------------------------------------------------
      // OFFLINE-FIRST MUTATION ENGINE (Anti-Crash)
      // ----------------------------------------------------
      try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          const errorData = await response.clone().json().catch(() => ({}));
          console.warn("[SafeFlow] Server returned error, queuing for self-healing:", errorData);
          throw new Error("Server temporary error");
        }
        return response;
      } catch (err) {
        console.error("[SafeFlow] Network/Crash detected. Initiating Self-Healing Queue:", url);
        
        // Simpan ke antrean lokal (IndexedDB)
        const queue = await localforage.getItem('offline_mutation_queue') || [];
        queue.push({ url, options: fetchOptions, timestamp: Date.now() });
        await localforage.setItem('offline_mutation_queue', queue);
        
        // Memanipulasi respons agar UI menganggapnya sukses seketika (Optimistic UI)
        return new Response(JSON.stringify({ 
          message: "Operasi diantrekan secara cerdas di latar belakang", 
          safeflow_queued: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // ----------------------------------------------------
      // STALE-WHILE-REVALIDATE GET ENGINE (Zero-Delay)
      // ----------------------------------------------------
      const cacheKey = `cache_${url}`;
      
      // Jika jaringan bermasalah, kembalikan cache lokal secepat kilat (0 delay)
      try {
        const response = await fetch(url, fetchOptions);
        if (response.ok) {
          const clone = response.clone();
          const data = await clone.text();
          // Simpan data terbaru ke IndexedDB secara asinkron (tidak memblokir render)
          localforage.setItem(cacheKey, data).catch(console.error);
        }
        return response;
      } catch (err) {
        console.warn("[SafeFlow] Koneksi putus. Mengaktifkan Edge Cache Lokal untuk:", url);
        const cached = await localforage.getItem(cacheKey);
        if (cached) {
          return new Response(cached, { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        
        // Jika benar-benar kosong, kembalikan array kosong agar UI tidak crash
        return new Response("[]", { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }
  },
  
  // Worker Sinkronisasi Latar Belakang (Self-Healing)
  async syncQueue() {
    if (!navigator.onLine) return; // Jangan coba sinkron jika terdeteksi offline
    
    const queue = await localforage.getItem('offline_mutation_queue') || [];
    if (queue.length === 0) return;
    
    console.log(`[SafeFlow] Mengirim ${queue.length} antrean data ke cloud...`);
    const newQueue = [];
    
    for (const item of queue) {
      try {
        const res = await fetch(item.url, item.options);
        if (res.ok) {
          console.log("[SafeFlow] Sinkronisasi berhasil:", item.url);
        } else {
          // Jika gagal di sisi server (misal validasi), kita bisa hapus agar tidak infinite loop,
          // atau simpan ke log error. Untuk amannya kita hapus dari antrean jika status 4xx.
          if (res.status >= 400 && res.status < 500) {
            console.error("[SafeFlow] Data ditolak server (4xx), menghapus dari antrean:", item.url);
          } else {
            newQueue.push(item); // 5xx atau error lain, coba lagi nanti
          }
        }
      } catch (err) {
        newQueue.push(item); // Koneksi terputus lagi
      }
    }
    
    await localforage.setItem('offline_mutation_queue', newQueue);
  }
}

// Pasang Global Listener untuk Background Sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => SafeFlow.syncQueue());
  // Jalankan Self-Healing Engine setiap 15 detik di latar belakang
  setInterval(() => SafeFlow.syncQueue(), 15000);
}
