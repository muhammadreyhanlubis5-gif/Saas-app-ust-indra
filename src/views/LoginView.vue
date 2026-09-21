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
        <form @submit.prevent="handleLogin" class="space-y-5">
          
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
            <a href="#" class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Lupa Password?
            </a>
          </div>

          <button 
            type="submit" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-[0.99]"
          >
            Masuk
          </button>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import animasiImg from '../assets/animasi.png'

const router = useRouter()
const username = ref('')
const password = ref('')
const showAnimation = ref(false)
const loadingText = ref('Sinkronisasi dengan admin...')

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

onMounted(() => {
  // Preload gambar animasi agar langsung muncul tanpa jeda loading (jaringan)
  const img = new Image()
  img.src = animasiImg
})
</script>
