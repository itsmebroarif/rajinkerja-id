<template>
  <div class="game-wrapper bg-dark text-white rounded-4 overflow-hidden position-relative shadow-lg border border-secondary border-opacity-25">
    <div class="p-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
      <div>
        <h5 class="fw-bold mb-0 text-warning d-flex align-items-center gap-2">
          <span>🏃‍♂️ 3D Task Runner</span>
          <span class="badge bg-danger text-white rounded-pill text-uppercase" style="font-size: 10px;">3D Arcade</span>
        </h5>
        <small class="text-white-50">Hindari "Deadline Block" & "Bug", kumpulkan "Task Coin"!</small>
      </div>

      <div class="d-flex align-items-center gap-3">
        <div class="text-end">
          <span class="small text-white-50 d-block">SKOR SAAT INI</span>
          <span class="fs-5 fw-extrabold text-white">{{ runnerScore }}</span>
        </div>
        <div class="text-end border-start border-secondary border-opacity-50 ps-3">
          <span class="small text-warning d-block"><i class="bi bi-trophy-fill me-1"></i>REKOR</span>
          <span class="fs-5 fw-extrabold text-warning">{{ runnerHighScore }}</span>
        </div>
      </div>
    </div>

    <div ref="runnerCanvasHolder" class="runner-canvas-holder w-100 position-relative" style="height: 450px;">
      <!-- Overlay Game Controls / Start Screen / Game Over -->
      <div v-if="!runnerPlaying" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-black bg-opacity-75 backdrop-blur text-center p-4" style="z-index: 20;">
        <div class="display-3 mb-2">{{ isGameOver ? '💥' : '🚀' }}</div>
        <h2 class="fw-extrabold text-white mb-2">{{ isGameOver ? 'Game Over!' : '3D Task Runner' }}</h2>
        <p class="text-white-50 mb-4" style="max-width: 440px;">
          {{ isGameOver ? `Skor Akhir Anda: ${runnerScore}.` : 'Gunakan tombol A / D atau Left / Right untuk pindah jalur, dan Space / Up untuk Lompat!' }}
        </p>
        <button class="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2 fs-5 text-dark" @click="startRunnerGame">
          <i class="bi bi-play-fill fs-3"></i>
          <span>{{ isGameOver ? 'MAIN LAGI' : 'MULAI MAIN' }}</span>
        </button>
      </div>

      <!-- Touch Controls for Mobile Devices -->
      <div v-if="runnerPlaying" class="position-absolute bottom-3 start-3 d-flex gap-2" style="z-index: 10;">
        <button class="btn btn-secondary btn-lg rounded-circle p-3 touch-btn" @click="moveRunnerLeft">
          <i class="bi bi-arrow-left"></i>
        </button>
        <button class="btn btn-secondary btn-lg rounded-circle p-3 touch-btn" @click="moveRunnerRight">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>

      <div v-if="runnerPlaying" class="position-absolute bottom-3 end-3" style="z-index: 10;">
        <button class="btn btn-warning btn-lg rounded-pill px-4 py-3 fw-bold text-dark touch-btn-jump" @click="runnerJump">
          <i class="bi bi-arrow-up-circle-fill me-1"></i> JUMP
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

export default {
  name: 'ThreeRunner',
  setup() {
    const runnerCanvasHolder = ref(null);
    const runnerPlaying = ref(false);
    const isGameOver = ref(false);
    const runnerScore = ref(0);
    const runnerHighScore = ref(parseInt(localStorage.getItem('ft_runner_highscore') || '0', 10));

    let rScene, rCamera, rRenderer, rAnimationFrame;
    let rPlayer, rObstacles = [], rCoins = [];
    let rCurrentLane = 0; // -1, 0, 1
    let rIsJumping = false;
    let rJumpVelocity = 0;

    const startRunnerGame = () => {
      runnerScore.value = 0;
      runnerPlaying.value = true;
      isGameOver.value = false;
      rCurrentLane = 0;
      initRunnerThree();
    };

    const initRunnerThree = () => {
      if (!runnerCanvasHolder.value) return;

      const width = runnerCanvasHolder.value.clientWidth || 800;
      const height = 450;

      rScene = new THREE.Scene();
      rScene.background = new THREE.Color(0x1e293b);
      rScene.fog = new THREE.Fog(0x1e293b, 10, 35);

      rCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      rCamera.position.set(0, 3.2, 5.5);
      rCamera.lookAt(0, 1, -2);

      rRenderer = new THREE.WebGLRenderer({ antialias: true });
      rRenderer.setSize(width, height);
      rRenderer.shadowMap.enabled = true;

      runnerCanvasHolder.value.innerHTML = '';
      runnerCanvasHolder.value.appendChild(rRenderer.domElement);

      // Lights
      const amb = new THREE.AmbientLight(0xffffff, 1.0);
      rScene.add(amb);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x475569, 0.65);
      rScene.add(hemi);

      const dir = new THREE.DirectionalLight(0xffb703, 1.85);
      dir.position.set(5, 10, 5);
      rScene.add(dir);

      // Track Floor
      const trackGeo = new THREE.BoxGeometry(4.8, 0.2, 40);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.position.set(0, -0.1, -15);
      rScene.add(track);

      // Player 3D Character
      const pGeo = new THREE.BoxGeometry(0.7, 0.9, 0.7);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 });
      rPlayer = new THREE.Mesh(pGeo, pMat);
      rPlayer.position.set(0, 0.45, 0);
      rScene.add(rPlayer);

      rObstacles = [];
      rCoins = [];

      window.addEventListener('keydown', onRunnerKeyDown);
      window.addEventListener('resize', onWindowResize);
      animateRunner();
    };

    const spawnRunnerElements = () => {
      if (Math.random() < 0.04) {
        // Spawn Obstacle
        const lane = Math.floor(Math.random() * 3) - 1;
        const obsGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const obsMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
        const obs = new THREE.Mesh(obsGeo, obsMat);
        obs.position.set(lane * 1.4, 0.4, -25);
        rScene.add(obs);
        rObstacles.push(obs);
      }

      if (Math.random() < 0.06) {
        // Spawn Coin
        const lane = Math.floor(Math.random() * 3) - 1;
        const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const coinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.rotation.x = Math.PI / 2;
        coin.position.set(lane * 1.4, 0.5, -25);
        rScene.add(coin);
        rCoins.push(coin);
      }
    };

    const animateRunner = () => {
      if (!runnerPlaying.value) return;

      rAnimationFrame = requestAnimationFrame(animateRunner);

      runnerScore.value++;
      if (runnerScore.value > runnerHighScore.value) {
        runnerHighScore.value = runnerScore.value;
        localStorage.setItem('ft_runner_highscore', runnerHighScore.value.toString());
      }

      // Smooth X movement towards lane
      const targetX = rCurrentLane * 1.4;
      rPlayer.position.x += (targetX - rPlayer.position.x) * 0.2;

      // Jump Physics
      if (rIsJumping) {
        rPlayer.position.y += rJumpVelocity;
        rJumpVelocity -= 0.02;
        if (rPlayer.position.y <= 0.45) {
          rPlayer.position.y = 0.45;
          rIsJumping = false;
        }
      }

      spawnRunnerElements();

      // Move Obstacles
      for (let i = rObstacles.length - 1; i >= 0; i--) {
        const obs = rObstacles[i];
        obs.position.z += 0.35;

        // Collision Check
        if (Math.abs(obs.position.z - rPlayer.position.z) < 0.6 &&
            Math.abs(obs.position.x - rPlayer.position.x) < 0.6 &&
            rPlayer.position.y < 0.9) {
          // Game Over!
          runnerPlaying.value = false;
          isGameOver.value = true;
          cancelAnimationFrame(rAnimationFrame);
          return;
        }

        if (obs.position.z > 5) {
          rScene.remove(obs);
          rObstacles.splice(i, 1);
        }
      }

      // Move Coins
      for (let i = rCoins.length - 1; i >= 0; i--) {
        const coin = rCoins[i];
        coin.position.z += 0.35;
        coin.rotation.z += 0.05;

        // Collect Check
        if (Math.abs(coin.position.z - rPlayer.position.z) < 0.6 &&
            Math.abs(coin.position.x - rPlayer.position.x) < 0.6) {
          runnerScore.value += 100;
          rScene.remove(coin);
          rCoins.splice(i, 1);
        } else if (coin.position.z > 5) {
          rScene.remove(coin);
          rCoins.splice(i, 1);
        }
      }

      rRenderer.render(rScene, rCamera);
    };

    const moveRunnerLeft = () => { if (rCurrentLane > -1) rCurrentLane--; };
    const moveRunnerRight = () => { if (rCurrentLane < 1) rCurrentLane++; };
    const runnerJump = () => {
      if (!rIsJumping) {
        rIsJumping = true;
        rJumpVelocity = 0.32;
      }
    };

    const onRunnerKeyDown = (e) => {
      if (!runnerPlaying.value) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') moveRunnerLeft();
      if (e.key === 'ArrowRight' || e.key === 'd') moveRunnerRight();
      if (e.key === ' ' || e.key === 'ArrowUp') runnerJump();
    };

    const onWindowResize = () => {
      if (!runnerCanvasHolder.value || !rRenderer || !rCamera) return;
      const width = runnerCanvasHolder.value.clientWidth;
      rCamera.aspect = width / 450;
      rCamera.updateProjectionMatrix();
      rRenderer.setSize(width, 450);
    };

    onMounted(() => {
      // Just initialize starting dimensions
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', onRunnerKeyDown);
      window.removeEventListener('resize', onWindowResize);
      if (rAnimationFrame) cancelAnimationFrame(rAnimationFrame);
      if (rRenderer) {
        rRenderer.dispose();
      }
    });

    return {
      runnerCanvasHolder,
      runnerPlaying,
      isGameOver,
      runnerScore,
      runnerHighScore,
      startRunnerGame,
      moveRunnerLeft,
      moveRunnerRight,
      runnerJump
    };
  }
};
</script>

<style scoped>
.game-wrapper {
  user-select: none;
}
.runner-canvas-holder {
  background-color: #0a0a16;
}
.touch-btn {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  opacity: 0.8;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}
.touch-btn-jump {
  height: 54px;
  display: flex;
  align-items: center;
  opacity: 0.8;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}
.touch-btn:active, .touch-btn-jump:active {
  opacity: 1;
  transform: scale(0.9);
}
</style>
