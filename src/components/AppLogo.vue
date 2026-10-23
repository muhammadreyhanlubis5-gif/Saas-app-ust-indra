<template>
  <div class="inline-flex items-center gap-3 select-none">
    <!-- Vector Emblem (Tampilan Tajam, Presisi, & Human-Crafted) -->
    <div 
      :class="[
        sizeClasses,
        'shrink-0 rounded-2xl shadow-sm flex items-center justify-center transition-transform'
      ]"
    >
      <svg 
        class="w-full h-full" 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="appLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e3a8a" />
            <stop offset="50%" stop-color="#1e40af" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>

          <linearGradient id="appLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>

          <linearGradient id="appLogoBook" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#f1f5f9" />
          </linearGradient>
        </defs>

        <!-- Base Squircle -->
        <rect x="24" y="24" width="464" height="464" rx="104" fill="url(#appLogoBg)" />
        <rect x="24" y="24" width="464" height="464" rx="104" fill="none" stroke="#60a5fa" stroke-opacity="0.3" stroke-width="6" />

        <!-- Academic Toga Cap (Mortarboard) -->
        <g>
          <polygon points="256,108 384,164 256,220 128,164" fill="url(#appLogoGold)" />
          <path d="M184,190 L184,236 C184,272 328,272 328,236 L328,190 Z" fill="#b45309" fill-opacity="0.9" />
          <path d="M192,194 L192,232 C192,260 320,260 320,232 L320,194 Z" fill="url(#appLogoGold)" />
          <circle cx="256" cy="164" r="7" fill="#ffffff" />
          <path d="M256,164 Q330,176 348,224" fill="none" stroke="#fef3c7" stroke-width="4" stroke-linecap="round" />
          <polygon points="344,222 352,222 356,252 340,252" fill="url(#appLogoGold)" />
        </g>

        <!-- Open Book & Schedule Foundation -->
        <g>
          <path d="M256,400 L256,290" stroke="url(#appLogoGold)" stroke-width="6" stroke-linecap="round" />
          <path d="M256,296 C216,280 148,284 116,298 C110,300 106,306 106,312 L106,386 C106,394 114,400 122,398 C150,386 214,382 256,398 Z" fill="url(#appLogoBook)" />
          <path d="M256,296 C296,280 364,284 396,298 C402,300 406,306 406,312 L406,386 C406,394 398,400 390,398 C362,386 298,382 256,398 Z" fill="url(#appLogoBook)" />

          <!-- Schedule Row Indications -->
          <line x1="140" y1="324" x2="232" y2="314" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
          <line x1="140" y1="344" x2="232" y2="334" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
          <line x1="140" y1="364" x2="216" y2="356" stroke="#2563eb" stroke-width="4" stroke-linecap="round" />

          <line x1="280" y1="314" x2="372" y2="324" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
          <line x1="280" y1="334" x2="372" y2="344" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
          <line x1="296" y1="356" x2="372" y2="364" stroke="#2563eb" stroke-width="4" stroke-linecap="round" />
        </g>
      </svg>
    </div>

    <!-- Teks Branding Tipografi Modern & Profesional (Bebas dari Huruf Cursive Coretan) -->
    <div v-if="showText" class="leading-tight">
      <div class="flex items-center gap-1.5">
        <span 
          :class="[
            textDark ? 'text-white' : 'text-slate-900',
            textSizeClasses,
            'font-black tracking-tight font-sans block'
          ]"
        >
          GuruKu
        </span>
      </div>
      <span 
        v-if="subtitle" 
        :class="[
          textDark ? 'text-blue-400' : 'text-blue-600',
          'text-[10px] font-bold tracking-widest uppercase block mt-0.5'
        ]"
      >
        {{ subtitle }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md' // 'xs', 'sm', 'md', 'lg', 'xl'
  },
  showText: {
    type: Boolean,
    default: true
  },
  subtitle: {
    type: String,
    default: 'Sistem Sekolah Pintar'
  },
  textDark: {
    type: Boolean,
    default: false
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-7 h-7'
    case 'sm': return 'w-9 h-9'
    case 'md': return 'w-11 h-11'
    case 'lg': return 'w-14 h-14'
    case 'xl': return 'w-16 h-16'
    default: return 'w-11 h-11'
  }
})

const textSizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-sm'
    case 'sm': return 'text-base'
    case 'md': return 'text-lg'
    case 'lg': return 'text-xl'
    case 'xl': return 'text-2xl'
    default: return 'text-lg'
  }
})
</script>
