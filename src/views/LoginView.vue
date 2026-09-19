<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden font-sans">
    
    <!-- Decorative background elements -->
    <div class="absolute top-0 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div class="absolute top-0 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-40 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

    <!-- Login Card -->
    <div class="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 relative z-10 m-4">
      
      <!-- Card Header -->
      <div class="pt-10 pb-6 px-8 text-center">
        <!-- Logo -->
        <div class="w-28 h-28 mx-auto mb-4 bg-white p-2 rounded-full shadow-md border border-gray-100 flex items-center justify-center">
          <img src="/logo.png" alt="Logo Sistem Sekolah Pintar" class="w-full h-full object-contain" />
        </div>
        
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Sistem Sekolah Pintar
        </h1>
        <p class="text-gray-500 mt-2 text-sm sm:text-base font-medium">
          Masuk ke Portal Layanan Akademik
        </p>
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
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 shadow-sm"
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
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 shadow-sm"
                required
              />
            </div>
          </div>

          <!-- Lupa Password & Submit -->
          <div class="flex items-center justify-between pt-2">
            <a href="#" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              Lupa Password?
            </a>
          </div>

          <button 
            type="submit" 
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 active:scale-[0.98]"
          >
            Masuk
          </button>
        </form>

        <!-- Divider & Help text -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-400 font-medium">
            © 2026 Sistem Sekolah Pintar. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = () => {
  // --- MOCK LOGIN LOGIC ---
  const user = username.value.toLowerCase()
  
  if (user === 'admin') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'SUPER_ADMIN')
    router.push('/super-admin')
  } 
  else if (user === 'sekolah') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'SCHOOL_ADMIN')
    router.push('/admin-sekolah')
  } 
  else if (user === 'guru') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'TEACHER')
    router.push('/guru')
  }
  else if (user === 'expired') {
    localStorage.setItem('token', 'dummy-token')
    localStorage.setItem('user_role', 'SCHOOL_ADMIN')
    localStorage.setItem('valid_until', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) 
    router.push('/admin-sekolah') 
  }
  else {
    alert("Coba ketik 'admin', 'sekolah', atau 'guru' untuk login sementara.")
  }
}
</script>

<style scoped>
/* Keyframes untuk efek blur di background agar terlihat modern & premium */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
