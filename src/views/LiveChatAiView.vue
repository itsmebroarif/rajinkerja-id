<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-primary text-white fw-bold px-3 py-1.5 rounded-pill">🤖 Gemini AI v1.5 Flash</span>
          <span class="badge bg-info-subtle text-info-emphasis fw-bold px-3 py-1.5 rounded-pill">Live Assistant</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">💬 Live Chat AI Assistant</h2>
        <p class="text-muted mb-0">Asisten cerdas AI untuk konsultasi pekerjaan, optimasi kodingan, surat menyurat, hingga strategi bisnis.</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <router-link to="/settings" class="btn btn-outline-secondary rounded-pill px-3 fw-semibold">
          <i class="bi bi-key me-1"></i> Pengaturan API Key
        </router-link>
        <button class="btn btn-outline-danger rounded-pill px-3 fw-semibold" @click="clearChat">
          <i class="bi bi-trash me-1"></i> Bersihkan Chat
        </button>
      </div>
    </div>

    <!-- API Key Notice / Configuration -->
    <div v-if="!apiKey" class="alert alert-warning border-0 shadow-sm rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
        <span>API Key Gemini belum diset. Anda dapat memasukkannya di bawah ini atau di menu Settings untuk mengaktifkan AI asli.</span>
      </div>
      <div class="d-flex gap-2">
        <input type="password" class="form-control form-control-sm" placeholder="Tempel Gemini API Key di sini..." v-model="quickApiKey" />
        <button class="btn btn-sm btn-warning fw-bold text-dark px-3 rounded-3 text-nowrap" @click="saveApiKey">Simpan</button>
      </div>
    </div>

    <!-- Main Chat Window -->
    <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden d-flex flex-column" style="min-height: 520px;">
      <!-- Chat Messages Scroll Area -->
      <div class="card-body p-4 flex-grow-1 overflow-y-auto" style="max-height: 480px;" ref="chatBox">
        <div v-if="messages.length === 0" class="text-center py-5 text-muted">
          <div class="p-3 bg-primary bg-opacity-10 text-primary rounded-circle d-inline-block mb-3">
            <i class="bi bi-robot fs-1"></i>
          </div>
          <h5 class="fw-bold text-dark mb-1">Halo! Ada yang bisa AI bantu hari ini?</h5>
          <p class="small text-muted mb-4">Pilih salah satu saran prompt cepat di bawah untuk memulai percakapan:</p>

          <div class="d-flex flex-wrap justify-content-center gap-2 max-w-2xl mx-auto">
            <button
              v-for="(preset, i) in promptPresets"
              :key="i"
              class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold"
              @click="usePresetPrompt(preset)"
            >
              ✨ {{ preset }}
            </button>
          </div>
        </div>

        <div v-for="(msg, idx) in messages" :key="idx" class="mb-3">
          <!-- User Message -->
          <div v-if="msg.role === 'user'" class="d-flex justify-content-end mb-2">
            <div class="bg-primary text-white p-3 rounded-4 rounded-bottom-right-0 shadow-sm max-w-lg">
              <div class="fw-semibold">{{ msg.content }}</div>
              <small class="opacity-75 d-block text-end mt-1" style="font-size: 0.7rem;">{{ msg.time }}</small>
            </div>
          </div>

          <!-- Assistant Message -->
          <div v-else class="d-flex align-items-start gap-2 mb-2">
            <div class="p-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
              <i class="bi bi-robot fs-5"></i>
            </div>
            <div class="bg-light text-dark p-3 rounded-4 rounded-top-left-0 border shadow-sm max-w-xl">
              <div class="fw-bold text-primary small mb-1">RajinKerja AI</div>
              <div class="white-space-pre-line lh-base">{{ msg.content }}</div>
              <div class="d-flex justify-content-between align-items-center mt-2 border-top pt-1 text-muted" style="font-size: 0.75rem;">
                <span>{{ msg.time }}</span>
                <button class="btn btn-link btn-sm p-0 text-muted text-decoration-none" @click="copyText(msg.content)">
                  <i class="bi bi-clipboard me-1"></i> Salin Pesan
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="d-flex align-items-center gap-2 text-primary p-2">
          <div class="spinner-border spinner-border-sm" role="status"></div>
          <span class="small fw-semibold">AI sedang memikirkan jawaban...</span>
        </div>
      </div>

      <!-- Chat Input Footer -->
      <div class="card-footer bg-light border-top p-3">
        <form @submit.prevent="sendMessage" class="d-flex gap-2">
          <input
            type="text"
            class="form-control form-control-lg border-2"
            placeholder="Ketik pertanyaan atau minta bantuan AI di sini..."
            v-model="inputQuery"
            :disabled="isLoading"
          />
          <button type="submit" class="btn btn-primary btn-lg rounded-3 px-4 fw-bold shadow-sm d-flex align-items-center gap-1" :disabled="isLoading || !inputQuery.trim()">
            <i class="bi bi-send-fill"></i>
            <span class="d-none d-md-inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue';
import { useStore } from 'vuex';
import { sendOnDeviceNotification } from '../utils/notification';

export default {
  name: 'LiveChatAiView',
  setup() {
    const store = useStore();

    const apiKey = computed(() => store.getters.getGeminiApiKey);
    const quickApiKey = ref('');
    const inputQuery = ref('');
    const isLoading = ref(false);
    const chatBox = ref(null);

    const messages = ref([
      {
        role: 'assistant',
        content: 'Halo! Saya RajinKerja AI Assistant. Saya siap membantu Anda menyusun tugas, membuat draf email, menganalisis strategi, atau menjawab pertanyaan teknis Anda.',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    const promptPresets = [
      'Bantu saya buatkan draf email penawaran jasa freelance',
      'Bagaimana cara optimasi produktivitas kerja harian?',
      'Buatkan ringkasan struktur laporan pekerjaan mingguan',
      'Bantu analisis dan debug kodingan JavaScript Vue 3'
    ];

    const saveApiKey = () => {
      if (quickApiKey.value.trim()) {
        store.dispatch('setGeminiApiKey', quickApiKey.value.trim());
        sendOnDeviceNotification('🔑 API Key Disimpan', {
          body: 'Gemini API Key berhasil disimpan untuk sesi AI.',
          type: 'success'
        });
        quickApiKey.value = '';
      }
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatBox.value) {
          chatBox.value.scrollTop = chatBox.value.scrollHeight;
        }
      });
    };

    const sendMessage = async () => {
      const q = inputQuery.value.trim();
      if (!q) return;

      messages.value.push({
        role: 'user',
        content: q,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });

      inputQuery.value = '';
      isLoading.value = true;
      scrollToBottom();

      // If API key is available, attempt real Gemini API call
      if (apiKey.value) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.value}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: q }] }]
            })
          });
          const data = await res.json();
          const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, AI tidak dapat memberikan respon saat ini.';
          messages.value.push({
            role: 'assistant',
            content: aiText,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          });
        } catch (err) {
          messages.value.push({
            role: 'assistant',
            content: 'Gagal terhubung ke Gemini API. Pastikan API key valid dan koneksi internet stabil.',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          });
        } finally {
          isLoading.value = false;
          scrollToBottom();
        }
      } else {
        // Fallback intelligent simulation response
        setTimeout(() => {
          let simulatedResponse = `Terima kasih! Mengenai "${q}":\n\n`;
          simulatedResponse += `1. **Rekomendasi Utama**: Tetapkan prioritas berdasarkan matriks Eisenhower dan selesaikan tugas paling mendesak terlebih dahulu.\n`;
          simulatedResponse += `2. **Langkah Kerja**: Pecah menjadi sub-tugas kecil yang terukur.\n`;
          simulatedResponse += `3. **Tips RajinKerja**: Manfaatkan fitur Quick Capture & Alarm untuk mengingatkan jadwal evaluasi harian.`;

          messages.value.push({
            role: 'assistant',
            content: simulatedResponse,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          });

          isLoading.value = false;
          scrollToBottom();
        }, 800);
      }
    };

    const usePresetPrompt = (text) => {
      inputQuery.value = text;
      sendMessage();
    };

    const clearChat = () => {
      messages.value = [];
    };

    const copyText = (text) => {
      navigator.clipboard.writeText(text);
      sendOnDeviceNotification('📋 Copied', { body: 'Teks respon AI tersalin', type: 'info' });
    };

    return {
      apiKey,
      quickApiKey,
      inputQuery,
      isLoading,
      chatBox,
      messages,
      promptPresets,
      saveApiKey,
      sendMessage,
      usePresetPrompt,
      clearChat,
      copyText
    };
  }
};
</script>
