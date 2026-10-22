
<script setup>
import { ref } from 'vue'
import { getCsrfCookie, getCurrentUser } from '../services/auth'

const message = ref('Belum diuji')
const loading = ref(false)
const user = ref(null)

async function testAuth() {
  loading.value = true
  message.value = ''
  user.value = null

  try {
    await getCsrfCookie()
    message.value = 'Cookie CSRF berhasil diminta.'

    try {
      user.value = await getCurrentUser()
      message.value = 'Kamu sudah login.'
    } catch (error) {
      if (error.response?.status === 401) {
        message.value = 'CSRF berhasil. Kamu belum login, ini normal.'
      } else {
        throw error
      }
    }
  } catch (error) {
    message.value =
      error.response?.data?.message ||
      error.message ||
      'Pengujian gagal. Periksa server Laravel dan konfigurasi CORS.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-8 text-gray-800">
    <div class="mx-auto max-w-xl rounded-xl bg-white p-6 shadow-sm">
      <h1 class="text-xl font-bold">Tes Autentikasi TEFA</h1>

      <p class="mt-2 text-sm text-gray-600">
        Memeriksa koneksi CSRF dan status login Laravel.
      </p>

      <button
        class="mt-5 rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
        :disabled="loading"
        @click="testAuth"
      >
        {{ loading ? 'Memeriksa...' : 'Uji Koneksi' }}
      </button>

      <p class="mt-4 break-words text-sm">{{ message }}</p>

      <pre
        v-if="user"
        class="mt-4 overflow-auto rounded-lg bg-gray-100 p-3 text-sm"
      >{{ JSON.stringify(user, null, 2) }}</pre>
    </div>
  </main>
</template>
