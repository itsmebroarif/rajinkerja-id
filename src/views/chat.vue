<template>
  <div class="chat-container" data-aos="zoom-in-down">
    <h1>Arif Chat Box</h1>
    <p>ketik "Help" untuk help bubble</p>
    <div class="chat-box" ref="chatBox">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="chat-message"
        :class="message.role"
      >
        <div class="bubble">{{ message.content }}</div>
      </div>

      <div v-if="typing" class="chat-message assistant">
        <div class="bubble typing">...</div>
      </div>

      <!-- Jika ada pilihan (bubbles) -->
      <div v-if="lastMessageOptions.length > 0" class="options">
        <button
          v-for="(option, idx) in lastMessageOptions"
          :key="idx"
          @click="handleOption(option)"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <form class="input-area" @submit.prevent="sendMessage">
      <input v-model="userInput" type="text" placeholder="Tulis pesan..." />
      <button type="submit">Kirim</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: "",
      messages: [],
      typing: false,
      responses: {
        todo: "📝 Todo adalah daftar tugas kamu. Catat, atur deadline, dan checklist. Aku membuatnya dengan langsung menaruh deadline disana tanpa waktu mulai karena aku yakin kamu sendiri tuh pasti naronya pas udah mulai jalan waktu pengerjaan jadi jangan males ngerjainnnya ya",
        proyek:
          "📁 Proyek digunakan untuk mengelola pekerjaan besar jadi beberapa tugas kecil trus juga nyatet siapa klien kamu supaya jauh lebih gampang.",
        keuangan:
          "💰 Keuangan digunakan untuk mencatat income dan expenses. Biar kamu bisa kontrol pengeluaran dan inget jangan boros ya kalo punya duit biar bisa ketabung dan punya duit kalau mau jajan xixixi.",
        invoice:
          "📨 Invoice digunakan untuk membuat tagihan ke klien dengan template rapi. Biasanya ini dipakai kalo kamu freelance biar kamu bisa nyatet keperluan kamu pada saat lagi ngerjain project sesuatu biar bisa nyatet harganya dan bisa punya template sendiri",
        developer:
          "👨‍💻 Developer: aku (Arif) adalah seorang developer yang lahir di Jakarta dan besar di Depok. Aku adalah pendiri Belajar Bareng dan Robust Tech Studio, dua Komunitas yang bergerak di bidang teknologi kreatif seperti web dan app development, network engineering, dan database management. Tapi selain itu aku juga bisa jadi seorang musisi yang bisa main gitar & piano juga xixixi",
        kontak: {
          message: "🗨 kontak: silahkan simpen kontak aku di instagram (@eexxvvn), abis itu di email juga ada di (aripstrike@gmail.com). Ditunggu ya di personal chat jika ada kendala atau apapun itu xixixi",
          details: {
            whatsapp: "085817048266 |",
            instagram: "eexxvvn |",
            youtube: "Arif Alexander |",
            medium: "https://itsmebroarif.medium.com/ |",
            website: "https://arifpermana.vercel.app/ |"
          }
        }
      },
      options: [
        "Todo",
        "Proyek",
        "Keuangan",
        "Invoice",
        "Tentang Developer",
        "Kontak Arif",
      ],
      lastMessageOptions: [],
    };
  },
  methods: {
    sendMessage() {
      if (!this.userInput.trim()) return;

      const text = this.userInput.trim();
      this.messages.push({ role: "user", content: text });
      this.userInput = "";
      this.lastMessageOptions = [];

      if (/hallo|halo|hai|hei|holla|Help|Hao|Hau/i.test(text)) {
        this.showBotMessage(
          "Hai! Bisa saya bantu? Pilih salah satu:",
          this.options
        );
      } else {
        this.autoReply(text.toLowerCase());
      }
    },
    handleOption(option) {
      this.messages.push({ role: "user", content: option });
      this.lastMessageOptions = [];
      this.autoReply(option.toLowerCase());
    },
    autoReply(input) {
      let reply =
        "🤖 Maaf, aku belum mengerti. Pilih: Todo, Proyek, Keuangan, Invoice, atau Tentang Developer.";

      for (const key in this.responses) {
        if (input.includes(key)) {
          if (key === "kontak") {
            const kontakDetails = this.responses.kontak.details;
            reply = `${this.responses.kontak.message}
            \n\nWhatsapp: ${kontakDetails.whatsapp}
            \nInstagram: ${kontakDetails.instagram}
            \nYoutube: ${kontakDetails.youtube}
            \nMedium: ${kontakDetails.medium}
            \nWebsite: ${kontakDetails.website}`;
          } else {
            reply = this.responses[key];
          }
          break;
        }
      }

      this.typing = true;
      setTimeout(() => {
        this.typing = false;
        this.messages.push({ role: "assistant", content: reply });
        this.scrollToBottom();
      }, 1000);
    },
    showBotMessage(text, options = []) {
      this.typing = true;
      setTimeout(() => {
        this.typing = false;
        this.messages.push({ role: "assistant", content: text });
        this.lastMessageOptions = options;
        this.scrollToBottom();
      }, 800);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$refs.chatBox;
        chatBox.scrollTop = chatBox.scrollHeight;
      });
    },
  },
};

</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 90vh;
  background: #f2f5f9;
  padding: 20px;
  border-radius: 20px;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.chat-message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

.bubble {
  background: #ffffff;
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 70%;
  word-wrap: break-word;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chat-message.user .bubble {
  background: #4fc3f7;
  color: white;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 8px;
}

.input-area {
  display: flex;
  padding-top: 10px;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border-radius: 30px;
  border: 1px solid #ccc;
}

.input-area button {
  padding: 0 20px;
  background: #4fc3f7;
  color: white;
  border: none;
  border-radius: 30px;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  justify-content: center;
}

.options button {
  padding: 8px 20px;
  border-radius: 20px;
  background: #e0f7fa;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.options button:hover {
  background: #b2ebf2;
}

.typing {
  font-style: italic;
  color: gray;
}
</style>
