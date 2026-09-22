<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="text-center mb-10">
        <svg class="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        <h1 class="text-3xl font-extrabold text-gray-900">Sistem Pembayaran Aman</h1>
        <p class="text-gray-500 mt-2">Enkripsi End-to-End. Dana dilindungi langsung oleh sistem pusat.</p>
      </div>

      <div class="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        <!-- Left Side: Order Summary -->
        <div class="bg-blue-600 p-8 md:w-1/3 text-white">
          <h2 class="text-xl font-bold mb-6 text-blue-100">Ringkasan Pesanan</h2>
          
          <div class="mb-8">
            <p class="text-sm text-blue-200 uppercase tracking-wider font-semibold mb-1">Paket Terpilih</p>
            <p class="text-3xl font-extrabold">{{ planName }}</p>
          </div>

          <div class="mb-8 space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-blue-100">Subtotal</span>
              <span class="font-medium">{{ formattedPrice }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-blue-100">Biaya Layanan Pihak Ketiga</span>
              <span class="font-medium text-green-300">Gratis (Subsidi)</span>
            </div>
            <hr class="border-blue-400/50">
            <div class="flex justify-between items-end">
              <span class="font-bold text-lg">Total</span>
              <span class="font-extrabold text-2xl">{{ formattedPrice }}</span>
            </div>
          </div>

          <div class="bg-blue-700/50 p-4 rounded-xl flex items-start gap-3">
            <svg class="w-6 h-6 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="text-xs text-blue-100 leading-relaxed">
              Masa aktif otomatis diperpanjang setelah pembayaran diverifikasi oleh pusat komando.
            </p>
          </div>
        </div>

        <!-- Right Side: Payment Options -->
        <div class="p-8 md:w-2/3">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Pilih Metode Pembayaran</h3>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <button 
              v-for="method in paymentMethods" 
              :key="method.id"
              @click="selectedMethod = method.id"
              :class="['border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all', 
                selectedMethod === method.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50']"
            >
              <div class="font-extrabold text-gray-700 tracking-wider">{{ method.name }}</div>
            </button>
          </div>

          <!-- Payment Instructions -->
          <div v-if="selectedMethodData" class="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
              Menunggu Pembayaran
            </div>
            
            <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Instruksi Transfer {{ selectedMethodData.name }}
            </h4>
            
            <div class="mb-6">
              <p class="text-sm text-gray-600 mb-2">Transfer tepat sesuai nominal ke Virtual Account / Nomor Rekening berikut:</p>
              <div class="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-300 shadow-inner">
                <div class="flex-1">
                  <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Nomor Tujuan (Pusat)</p>
                  <p class="font-mono text-2xl font-extrabold text-gray-900 tracking-widest">{{ selectedMethodData.accountNumber }}</p>
                </div>
                <button @click="copyToClipboard(selectedMethodData.accountNumber)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors" title="Salin Nomor">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
              <p class="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Terverifikasi Atas Nama: A/N Admin Pusat Sistem
              </p>
            </div>

            <div class="border-t border-gray-200 pt-6">
              <p class="text-sm text-gray-600 mb-4">Setelah melakukan transfer, silakan konfirmasi pembayaran Anda dengan mengirimkan bukti transfer ke Pusat Komando.</p>
              <button @click="confirmPayment" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Konfirmasi Pembayaran via WhatsApp
              </button>
            </div>
          </div>
          
          <div v-else class="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
            <p class="text-gray-400 font-medium">Pilih metode pembayaran di atas untuk melihat instruksi.</p>
          </div>

        </div>
      </div>
      
      <div class="mt-8 text-center">
        <button @click="$router.push('/expired')" class="text-gray-500 hover:text-gray-900 font-medium transition-colors">
          &larr; Batal & Kembali
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const planName = route.query.plan || 'Plus'
const planPrices = {
  'Standard': 499000,
  'Plus': 899000,
  'Premium': 2500000
}
const price = planPrices[planName] || 899000

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
})

// Tujuan pembayaran dikunci ke DANA milik admin
const adminNumber = "08218487328"

const paymentMethods = [
  { id: 'dana', name: 'DANA', accountNumber: adminNumber },
  { id: 'bri', name: 'BRI / BRIMO', accountNumber: adminNumber },
  { id: 'mandiri', name: 'Livin Mandiri', accountNumber: adminNumber },
  { id: 'gopay', name: 'GoPay', accountNumber: adminNumber },
  { id: 'ovo', name: 'OVO', accountNumber: adminNumber },
  { id: 'shopeepay', name: 'ShopeePay', accountNumber: adminNumber },
  { id: 'paypal', name: 'PayPal', accountNumber: adminNumber } // Simplified
]

const selectedMethod = ref(null)

const selectedMethodData = computed(() => {
  return paymentMethods.find(m => m.id === selectedMethod.value)
})

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert("Nomor Rekening / Virtual Account disalin!")
}

const confirmPayment = () => {
  const method = selectedMethodData.value.name
  const text = encodeURIComponent(`Halo Admin Pusat, saya telah melakukan transfer pembayaran sebesar ${formattedPrice.value} melalui metode *${method}* untuk perpanjangan Paket *${planName}*. Berikut saya lampirkan bukti transfernya:`)
  window.open(`https://wa.me/628218487328?text=${text}`, '_blank')
}
</script>
