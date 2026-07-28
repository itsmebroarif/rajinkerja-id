<template>
  <div class="container-fluid p-0 position-relative" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-purple-subtle text-purple fw-semibold px-3 py-1.5 rounded-pill" style="font-size: 11px;">
            🎮 Break Time & Brain Focus Zone
          </span>
          <span class="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1 rounded-pill" style="font-size: 11px;">
            <i class="bi bi-box-seam me-1"></i> Three.js 3D Engine Powered
          </span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">🕹️ Work Suite Mini Games & 3D Arcade</h2>
        <p class="text-muted mb-0">Lepas penat saat jeda kerja! Mainkan berbagai game serba 3D untuk meregangkan fokus otak Anda.</p>
      </div>

      <!-- Custom Dropdown Selector -->
      <div class="d-flex align-items-center gap-2">
        <label for="gameSelect" class="fw-bold text-dark mb-0 d-none d-sm-inline" style="white-space: nowrap;">Pilih Game 3D:</label>
        <select
          id="gameSelect"
          class="form-select form-select-lg border-2 border-primary rounded-3 text-dark fw-bold shadow-sm"
          style="min-width: 250px; cursor: pointer;"
          v-model="activeGame"
        >
          <option v-for="game in gamesList" :key="game.id" :value="game.id">
            {{ game.icon }} {{ game.title }}
          </option>
        </select>
      </div>
    </div>

    <!-- Active 3D Game Render Container (Loaded one-by-one) -->
    <div class="game-container mb-4">
      <transition name="game-fade" mode="out-in">
        <component :is="activeGameComponent" :key="activeGame" />
      </transition>
    </div>

    <!-- 3D WORKSPACE SIMULATOR WIDGET AT BOTTOM -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
      <h5 class="fw-bold text-dark mb-3"><i class="bi bi-display me-2 text-primary"></i>3D Workspace Setup Simulator</h5>
      <Workspace3DSimulator />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import ThreeRunner from '../components/games/ThreeRunner.vue';
import ThreeStacker from '../components/games/ThreeStacker.vue';
import ThreeIsland from '../components/games/ThreeIsland.vue';
import ThreeTicTacToe from '../components/games/ThreeTicTacToe.vue';
import ThreeCheckers from '../components/games/ThreeCheckers.vue';
import ThreeSuit from '../components/games/ThreeSuit.vue';
import Workspace3DSimulator from '../components/Workspace3DSimulator.vue';

export default {
  name: 'MiniGamesView',
  components: {
    ThreeRunner,
    ThreeStacker,
    ThreeIsland,
    ThreeTicTacToe,
    ThreeCheckers,
    ThreeSuit,
    Workspace3DSimulator
  },
  setup() {
    // Default to the Island walk explorer
    const activeGame = ref('island');

    const gamesList = [
      { id: 'island', title: '3D Island Explorer', icon: '🌴' },
      { id: 'runner', title: '3D Task Runner', icon: '🏃‍♂️' },
      { id: 'stacker', title: '3D Tower Stacker', icon: '🏗️' },
      { id: 'tictactoe', title: '3D Tic-Tac-Toe', icon: '❌' },
      { id: 'checkers', title: '3D Checkers Board', icon: '🏁' },
      { id: 'suit', title: '3D Suit (Rock-Paper-Scissors)', icon: '✊' }
    ];

    // Compute active component for rendering
    const activeGameComponent = computed(() => {
      switch (activeGame.value) {
        case 'island': return 'ThreeIsland';
        case 'runner': return 'ThreeRunner';
        case 'stacker': return 'ThreeStacker';
        case 'tictactoe': return 'ThreeTicTacToe';
        case 'checkers': return 'ThreeCheckers';
        case 'suit': return 'ThreeSuit';
        default: return 'ThreeIsland';
      }
    });

    return {
      activeGame,
      gamesList,
      activeGameComponent
    };
  }
};
</script>

<style scoped>
.game-fade-enter-active,
.game-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.game-fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.game-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
