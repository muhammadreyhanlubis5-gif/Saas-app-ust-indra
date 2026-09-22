<template>
  <!-- Loading Animation Overlay -->
  <div v-if="showAnimation" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300">
    <div class="relative flex flex-col items-center">
      
      <!-- The uploaded animation image -->
      <img :src="animasiImg" alt="Loading..." class="w-48 h-48 object-contain z-10" />
      
      <h2 class="mt-8 text-2xl font-semibold text-white tracking-wide z-10">Menyiapkan Workspace Anda...</h2>
      <p class="mt-3 text-blue-300 text-sm font-medium z-10 animate-pulse transition-all duration-300">{{ loadingText }}</p>
    </div>
  </div>

  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
    
    <!-- Login Card (Lightweight) -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      
      <!-- Card Header -->
      <div class="pt-10 pb-6 px-8 text-center">
        <!-- Logo (Optimized display) -->
        <div class="w-24 h-24 mx-auto mb-4 p-2 flex items-center justify-center">
          <img src="/logo.png" alt="Logo Sistem Sekolah Pintar" class="w-full h-full object-contain" fetchpriority="high" />
        </div>
        
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Sistem Sekolah Pintar
        </h1>
      </div>

      <!-- Card Body (Form) -->
      <div class="px-8 pb-10">
        <!-- Notifikasi Approved -->
        <div v-if="approvedNotification" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
          <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p class="text-sm font-bold text-green-800">Password kamu sudah dikonfirmasi oleh admin. Silakan login dengan password baru.</p>
        </div>

        <form v-if="!showForgotPassword" @submit.prevent="handleLogin" class="space-y-5 animate-fade-in">
          
          <!-- Username Input -->
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <input 
                type="text" 
                id="username" 
                v-model="username"
                placeholder="Masukkan username Anda"
                class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                required
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
             <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <input 
                type="password" 
                id="password" 
                v-model="password"
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                required
              />
            </div>
          </div>

          <!-- Lupa Password & Submit -->
          <div class="flex items-center justify-between pt-2">
            <button type="button" @click="showForgotPassword = true" class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Lupa Password?
            </button>
          </div>

          <button 
            type="submit" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-[0.99]"
          >
            Masuk
          </button>
        </form>

        <!-- Formulir Lupa Password -->
        <form v-else @submit.prevent="submitForgotPassword" class="space-y-5 animate-fade-in">
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              Username Klien
            </label>
            <input 
              type="text" 
              v-model="forgotForm.username"
              placeholder="Username akun Anda"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              Password Yang Ingin Diajukan
            </label>
            <input 
              type="text" 
              v-model="forgotForm.newPassword"
              placeholder="Ketik password baru"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
              required
            />
          </div>

          <div class="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <input type="checkbox" id="minta_izin" v-model="forgotForm.requestPermission" required class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <label for="minta_izin" class="text-sm font-bold text-blue-900 cursor-pointer select-none">
              Minta izin ubah password ke admin
            </label>
          </div>

          <div class="pt-2 flex gap-3">
            <button 
              type="button" 
              @click="showForgotPassword = false"
              class="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors"
            >
              Ajukan Perubahan
            </button>
          </div>
        </form>

        <!-- Divider & Help text -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-400 font-medium">
            © 2026 Sistem Sekolah Pintar.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import animasiImg from '../assets/animasi.png'

const router = useRouter()
const username = ref('')
const password = ref('')
const showAnimation = ref(false)
const loadingText = ref('Sinkronisasi dengan admin...')

// Forgot Password Logic
const showForgotPassword = ref(false)
const approvedNotification = ref(false)
const forgotForm = ref({ username: '', newPassword: '', requestPermission: false })

const submitForgotPassword = async () => {
  if (!forgotForm.value.requestPermission) {
    alert("Mohon centang kotak permintaan izin ke admin.")
    return
  }
  
  try {
    const res = await fetch('/api/v1/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: forgotForm.value.username, 
        new_password: forgotForm.value.newPassword 
      })
    })

    const data = await res.json()
    if (!res.ok) {
      alert("Error: " + (data.error || "Gagal mengajukan permintaan"))
      return
    }

    alert("Pengajuan perubahan password telah dikirim ke Pusat Komando Super Admin. Silakan tunggu konfirmasi!")
    showForgotPassword.value = false
    forgotForm.value = { username: '', newPassword: '', requestPermission: false }
  } catch (err) {
    alert("Terjadi kesalahan jaringan.")
  }
}

const handleLogin = async () => {
  try {
    const response = await fetch('/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      showAnimation.value = true
      
      // Decode JWT token untuk mendapatkan role
      const token = data.token
      localStorage.setItem('token', token)
      
      const payloadBase64 = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))
      
      localStorage.setItem('user_role', decodedPayload.role)
      if (decodedPayload.school_id) {
        localStorage.setItem('school_id', decodedPayload.school_id)
      }
      if (decodedPayload.valid_until) {
        localStorage.setItem('valid_until', decodedPayload.valid_until)
      }

      // Ambil nama sekolah khusus untuk teks animasi (jika bukan super admin)
      let schoolName = "sekolah yang tervalidasi"
      if (decodedPayload.school_id) {
        try {
           const profileRes = await fetch('/api/v1/school/profile', {
             headers: { 'X-School-ID': decodedPayload.school_id }
           })
           if (profileRes.ok) {
             const profileData = await profileRes.json()
             if (profileData.name) {
               schoolName = profileData.name
             }
           }
        } catch(e) {}
      }

      // Animasi pergantian teks
      setTimeout(() => {
        loadingText.value = 'Data berhasil tervalidasi...'
      }, 1500)
      
      setTimeout(() => {
        loadingText.value = `Siap mengunggah data (${schoolName})...`
      }, 3000)

      // Redirect setelah semua teks selesai terbaca (total 4.5 detik)
      setTimeout(() => {
        if (decodedPayload.role === 'SUPER_ADMIN') {
          router.push('/super-admin')
        } else if (decodedPayload.role === 'SCHOOL_ADMIN') {
          router.push('/admin-sekolah')
        } else {
          router.push('/guru')
        }
      }, 4500)
      
    } else {
      alert("Login Gagal: " + (data.error || "Password salah atau user tidak ditemukan"))
    }
  } catch (error) {
    alert("Terjadi kesalahan jaringan saat login.")
  }
}

let approvalInterval = null

const checkApproval = async () => {
  if (!username.value && !forgotForm.value.username) return
  const uname = username.value || forgotForm.value.username
  if (!uname) return

  try {
    const res = await fetch(`/api/v1/forgot-password/status?username=${encodeURIComponent(uname)}`)
    const data = await res.json()
    if (res.ok && data.status === 'APPROVED') {
      approvedNotification.value = true
      // Auto-hilangkan notifikasi setelah 10 detik
      setTimeout(() => {
        approvedNotification.value = false
      }, 10000)
    }
  } catch(e) {}
}

onMounted(() => {
  // Preload gambar animasi agar langsung muncul tanpa jeda loading (jaringan)
  const img = new Image()
  img.src = animasiImg

  // Cek langsung saat pertama kali render
  checkApproval()
  
  // Polling tiap detik kalau-kalau pengguna membuka tab tanpa reload
  approvalInterval = setInterval(() => {
    checkApproval()
  }, 1000)
})

onUnmounted(() => {
  if (approvalInterval) clearInterval(approvalInterval)
})
</script>
