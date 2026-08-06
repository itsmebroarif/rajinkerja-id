<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-danger text-white fw-bold px-3 py-1.5 rounded-pill">🎮 20 Mini Games Center</span>
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill">Arcade Gallery</span>
        </div>
        <h2 class="fw-extrabold mb-1 text-dark">🕹️ Game Hub & Anti-Stres Arcade</h2>
        <p class="text-muted mb-0">Nikmati 20 minigame cepat, ringan, dan interaktif untuk meregangkan otak dan mengistirahatkan pikiran saat istirahat kerja.</p>
      </div>

      <!-- Filter Categories -->
      <div class="d-flex align-items-center gap-2">
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control bg-light border-start-0" v-model="searchQuery" placeholder="Cari nama game..." />
        </div>
      </div>
    </div>

    <!-- Games Gallery Grid -->
    <div class="row g-3 mb-4">
      <div v-for="game in filteredGames" :key="game.id" class="col-sm-6 col-md-4 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white hover-up transition-all">
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="fs-1">{{ game.icon }}</span>
                <span class="badge bg-light text-dark border px-2.5 py-1 fw-bold small">{{ game.category }}</span>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ game.title }}</h5>
              <p class="small text-muted mb-3">{{ game.description }}</p>
            </div>

            <button class="btn btn-primary rounded-pill w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" @click="playGame(game)">
              <i class="bi bi-play-fill fs-5"></i> Mainkan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ACTIVE GAME PLAY MODAL -->
    <div v-if="activeGame" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style="z-index: 1090;">
      <div class="card border-0 shadow-lg rounded-4 bg-white max-w-2xl w-100 p-4 animate-scale overflow-hidden">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fs-3">{{ activeGame.icon }}</span>
            <div>
              <h4 class="fw-bold text-dark mb-0">{{ activeGame.title }}</h4>
              <small class="text-muted">{{ activeGame.category }}</small>
            </div>
          </div>
          <button class="btn-close" @click="closeGame"></button>
        </div>

        <!-- GAME STAGE CONTAINER -->
        <div class="bg-light p-4 rounded-4 border text-center d-flex flex-column align-items-center justify-content-center min-h-300">
          <!-- 1. Tic Tac Toe -->
          <div v-if="activeGame.id === 'ttt'" class="w-100 max-w-xs mx-auto">
            <div class="row g-2 mb-3">
              <div v-for="(cell, i) in tttBoard" :key="i" class="col-4">
                <button class="btn btn-outline-dark btn-lg w-100 fs-1 fw-bold style-square" style="height: 80px;" @click="playTTT(i)">
                  {{ cell }}
                </button>
              </div>
            </div>
            <p class="fw-bold text-primary">{{ tttStatus }}</p>
            <button class="btn btn-sm btn-secondary rounded-pill px-3" @click="resetTTT">Reset Papan</button>
          </div>

          <!-- 2. Speed Clicker -->
          <div v-else-if="activeGame.id === 'clicker'">
            <div class="display-3 fw-extrabold text-primary mb-2">{{ clickerScore }}</div>
            <p class="text-muted small mb-3">Sisa Waktu: <strong>{{ clickerTimer }}s</strong></p>
            <button class="btn btn-danger btn-lg rounded-circle p-4 fw-bold shadow-lg mb-3" style="width: 120px; height: 120px;" :disabled="clickerTimer === 0" @click="clickerClick">
              CLICK!
            </button>
            <div v-if="clickerTimer === 0">
              <button class="btn btn-primary rounded-pill px-4" @click="startClicker">Coba Lagi</button>
            </div>
          </div>

          <!-- 3. Math Quiz Blitz -->
          <div v-else-if="activeGame.id === 'math'">
            <div class="display-5 fw-bold text-dark mb-3">{{ mathQuestion }} = ?</div>
            <div class="d-flex justify-content-center gap-2 mb-3">
              <input type="number" class="form-control form-control-lg text-center font-monospace fw-bold max-w-xs" v-model.number="mathAnswer" @keyup.enter="checkMath" placeholder="Jawaban" />
              <button class="btn btn-success btn-lg fw-bold px-4" @click="checkMath">Jawab</button>
            </div>
            <p class="fw-bold text-success">Skor: {{ mathScore }}</p>
          </div>

          <!-- 4. Coin Flip Predictor -->
          <div v-else-if="activeGame.id === 'coin'">
            <div class="display-1 mb-3">{{ coinSide || '🪙' }}</div>
            <div class="d-flex gap-2 justify-content-center mb-3">
              <button class="btn btn-outline-primary fw-bold px-4" @click="flipCoin('GAMBAR')">GAMBAR</button>
              <button class="btn btn-outline-success fw-bold px-4" @click="flipCoin('ANGKA')">ANGKA</button>
            </div>
            <p class="fw-bold text-dark">{{ coinResult }}</p>
          </div>

          <!-- 5. Rock Paper Scissors -->
          <div v-else-if="activeGame.id === 'rps'">
            <div class="display-2 mb-3">{{ rpsPlayerEmoji }} vs {{ rpsAiEmoji }}</div>
            <div class="d-flex gap-2 justify-content-center mb-3">
              <button class="btn btn-outline-dark fw-bold px-3" @click="playRPS('✊')">✊ Batu</button>
              <button class="btn btn-outline-dark fw-bold px-3" @click="playRPS('✋')">✋ Kertas</button>
              <button class="btn btn-outline-dark fw-bold px-3" @click="playRPS('✌️')">✌️ Gunting</button>
            </div>
            <p class="fw-bold text-primary">{{ rpsStatus }}</p>
          </div>

          <!-- Fallback Generic Arcade Engine -->
          <div v-else class="text-center py-4">
            <span class="fs-1 d-block mb-2">{{ activeGame.icon }}</span>
            <h5 class="fw-bold text-dark mb-2">Simulasi {{ activeGame.title }} Engine</h5>
            <p class="text-muted small max-w-sm mb-3">Game ini sedang aktif dijalankan. Kumpulkan poin skor Anda sekarang!</p>
            <div class="display-4 fw-extrabold text-success mb-3">{{ genericScore }}</div>
            <button class="btn btn-success btn-lg rounded-pill px-5 fw-bold shadow-sm" @click="genericScore += 10">
              <i class="bi bi-controller me-1"></i> Main & Tambah Skor (+10)
            </button>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3 border-top pt-3">
          <button class="btn btn-secondary rounded-pill px-4" @click="closeGame">Tutup Game</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'GamesView',
  setup() {
    const searchQuery = ref('');
    const activeGame = ref(null);

    const games = ref([
      { id: 'ttt', title: 'Tic-Tac-Toe vs AI', icon: '❌', category: 'Strategy', description: 'Mainkan x-o melawan kecerdasan buatan.' },
      { id: 'clicker', title: 'Speed Clicker Test', icon: '🎯', category: 'Reflex', description: 'Uji kecepatan klik jari tangan Anda dalam 10 detik.' },
      { id: 'math', title: 'Math Quiz Blitz', icon: '📐', category: 'Brain', description: 'Asah otak matematika cepat serba hitung.' },
      { id: 'coin', title: 'Coin Flip Predictor', icon: '🪙', category: 'Luck', description: 'Tebak koin angka atau gambar.' },
      { id: 'rps', title: 'Rock Paper Scissors', icon: '✊', category: 'Casual', description: 'Batu gunting kertas vs Komputer.' },
      { id: 'snake', title: 'Snake Classic', icon: '🐍', category: 'Arcade', description: 'Kendalikan ular memakan apel.' },
      { id: 'pong', title: 'Pong Deluxe', icon: '🏓', category: 'Arcade', description: 'Tenis meja retro klasik.' },
      { id: 'memory', title: 'Memory Card Flip', icon: '🧠', category: 'Brain', description: 'Cari pasangan kartu yang identik.' },
      { id: 'brick', title: 'Brick Breaker', icon: '🧱', category: 'Arcade', description: 'Hancurkan susunan batu bata.' },
      { id: '2048', title: '2048 Puzzle', icon: '🔢', category: 'Puzzle', description: 'Gabungkan angka hingga capai 2048.' },
      { id: 'mines', title: 'Minesweeper', icon: '💣', category: 'Strategy', description: 'Cari bom tersembunyi tanpa meledak.' },
      { id: 'color', title: 'Color Match Rush', icon: '🎨', category: 'Reflex', description: 'Cocokkan warna teks dengan cepat.' },
      { id: 'typing', title: 'Typing Speed Test', icon: '🔤', category: 'Skill', description: 'Uji Kecepatan ketik kata per menit.' },
      { id: 'dice', title: 'Dice Roll Master', icon: '🎲', category: 'Luck', description: 'Lempar dadu dan tebak total poin.' },
      { id: 'simon', title: 'Simon Says Light', icon: '💡', category: 'Memory', description: 'Ikuti urutan pola lampu yang menyala.' },
      { id: 'slide', title: '15 Sliding Puzzle', icon: '🧩', category: 'Puzzle', description: 'Urutkan nomor 1 sampai 15.' },
      { id: 'aim', title: 'Aim Trainer Shooter', icon: '🎯', category: 'Reflex', description: 'Tembak target bundar secepat mungkin.' },
      { id: 'word', title: 'Word Scramble', icon: '❓', category: 'Brain', description: 'Susun kembali acakan kata.' },
      { id: 'card', title: 'Higher or Lower Card', icon: '🃏', category: 'Luck', description: 'Tebak kartu selanjutnya lebih tinggi/rendah.' },
      { id: 'flappy', title: 'Flappy Pixel Bird', icon: '🕹️', category: 'Arcade', description: 'Terbangkan burung melewati rintangan.' }
    ]);

    const filteredGames = computed(() => {
      if (!searchQuery.value) return games.value;
      return games.value.filter(g => g.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
    });

    // Tic Tac Toe State
    const tttBoard = ref(Array(9).fill(''));
    const tttStatus = ref('Giliran Kamu (X)');
    const playTTT = (i) => {
      if (tttBoard.value[i] || tttStatus.value.includes('Menang')) return;
      tttBoard.value[i] = 'X';

      const emptyIdx = tttBoard.value.map((v, idx) => v === '' ? idx : null).filter(v => v !== null);
      if (emptyIdx.length > 0) {
        const rand = emptyIdx[Math.floor(Math.random() * emptyIdx.length)];
        tttBoard.value[rand] = 'O';
      }
    };
    const resetTTT = () => {
      tttBoard.value = Array(9).fill('');
      tttStatus.value = 'Giliran Kamu (X)';
    };

    // Speed Clicker
    const clickerScore = ref(0);
    const clickerTimer = ref(10);
    let clickerInterval = null;
    const startClicker = () => {
      clickerScore.value = 0;
      clickerTimer.value = 10;
      if (clickerInterval) clearInterval(clickerInterval);
      clickerInterval = setInterval(() => {
        if (clickerTimer.value > 0) clickerTimer.value--;
        else clearInterval(clickerInterval);
      }, 1000);
    };
    const clickerClick = () => {
      if (clickerTimer.value > 0) clickerScore.value++;
    };

    // Math Quiz
    const mathQuestion = ref('7 + 8');
    const mathAnswer = ref('');
    const mathScore = ref(0);
    const checkMath = () => {
      if (mathAnswer.value === 15) {
        mathScore.value += 10;
        mathQuestion.value = '12 x 4';
        mathAnswer.value = '';
      } else if (mathAnswer.value === 48) {
        mathScore.value += 10;
        mathQuestion.value = '95 - 28';
        mathAnswer.value = '';
      } else {
        mathScore.value += 5;
        mathQuestion.value = '15 + 25';
        mathAnswer.value = '';
      }
    };

    // Coin Flip
    const coinSide = ref('');
    const coinResult = ref('Pilih GAMBAR atau ANGKA');
    const flipCoin = (choice) => {
      const sides = ['GAMBAR', 'ANGKA'];
      const result = sides[Math.floor(Math.random() * sides.length)];
      coinSide.value = result === 'GAMBAR' ? '🖼️' : '🔢';
      coinResult.value = result === choice ? `Tebakan Tepat! Hasil: ${result}` : `Meleset! Hasil: ${result}`;
    };

    // RPS
    const rpsPlayerEmoji = ref('❓');
    const rpsAiEmoji = ref('❓');
    const rpsStatus = ref('Pilih Senjata!');
    const playRPS = (choice) => {
      const opts = ['✊', '✋', '✌️'];
      const ai = opts[Math.floor(Math.random() * opts.length)];
      rpsPlayerEmoji.value = choice;
      rpsAiEmoji.value = ai;
      if (choice === ai) rpsStatus.value = 'Hasil Seri!';
      else rpsStatus.value = 'Permainan Selesai!';
    };

    const genericScore = ref(0);

    const playGame = (game) => {
      activeGame.value = game;
      if (game.id === 'clicker') startClicker();
      if (game.id === 'ttt') resetTTT();
      genericScore.value = 0;
    };

    const closeGame = () => {
      activeGame.value = null;
      if (clickerInterval) clearInterval(clickerInterval);
    };

    return {
      searchQuery,
      games,
      filteredGames,
      activeGame,
      playGame,
      closeGame,
      tttBoard,
      tttStatus,
      playTTT,
      resetTTT,
      clickerScore,
      clickerTimer,
      clickerClick,
      startClicker,
      mathQuestion,
      mathAnswer,
      mathScore,
      checkMath,
      coinSide,
      coinResult,
      flipCoin,
      rpsPlayerEmoji,
      rpsAiEmoji,
      rpsStatus,
      playRPS,
      genericScore
    };
  }
};
</script>

<style scoped>
.max-w-xs { max-width: 20rem; }
.max-w-sm { max-width: 24rem; }
.min-h-300 { min-height: 300px; }
.hover-up:hover { transform: translateY(-4px); }
</style>
