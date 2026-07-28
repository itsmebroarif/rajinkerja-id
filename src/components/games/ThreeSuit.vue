<template>
  <div class="game-wrapper bg-dark text-white rounded-4 overflow-hidden position-relative shadow-lg border border-secondary border-opacity-25">
    <div class="p-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
      <div>
        <h5 class="fw-bold mb-0 text-purple d-flex align-items-center gap-2">
          <span>✊🖐️✌️ 3D Rock-Paper-Scissors (Suit)</span>
          <span class="badge bg-purple text-white rounded-pill" style="font-size: 10px;">Fast Play</span>
        </h5>
        <small class="text-white-50">Pilih pilihanmu di bawah untuk melawan komputer dalam hitungan 3D!</small>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span class="small text-white-50">Skor: <span class="fw-bold text-success">{{ playerWins }}</span> - <span class="fw-bold text-danger">{{ aiWins }}</span></span>
        <button class="btn btn-sm btn-outline-light rounded-pill px-2.5" @click="resetScore">Reset Skor</button>
      </div>
    </div>

    <!-- Canvas -->
    <div ref="canvasContainer" class="canvas-container w-100 position-relative" style="height: 450px;">
      <!-- Interactive bottom buttons overlay -->
      <div v-if="!isShaking && !showResult" class="position-absolute bottom-3 start-50 translate-middle-x d-flex gap-2.5 p-3 rounded-4 bg-black bg-opacity-60 backdrop-blur border border-secondary border-opacity-20" style="z-index: 10;">
        <button class="btn btn-outline-info btn-lg px-4 rounded-3 d-flex flex-column align-items-center game-opt-btn" @click="playGame('rock')">
          <span class="fs-2 mb-1">✊</span>
          <span class="small fw-bold">BATU (ROCK)</span>
        </button>
        <button class="btn btn-outline-info btn-lg px-4 rounded-3 d-flex flex-column align-items-center game-opt-btn" @click="playGame('paper')">
          <span class="fs-2 mb-1">🖐️</span>
          <span class="small fw-bold">KERTAS (PAPER)</span>
        </button>
        <button class="btn btn-outline-info btn-lg px-4 rounded-3 d-flex flex-column align-items-center game-opt-btn" @click="playGame('scissors')">
          <span class="fs-2 mb-1">✌️</span>
          <span class="small fw-bold">GUNTING (SCISSORS)</span>
        </button>
      </div>

      <!-- Result banner Overlay -->
      <div v-if="showResult" class="position-absolute top-3 start-50 translate-middle-x p-3 bg-black bg-opacity-75 backdrop-blur rounded-4 text-center border border-secondary border-opacity-20 shadow-lg" style="z-index: 15; min-width: 260px;">
        <h3 class="fw-extrabold mb-1" :class="resultClass">{{ resultText }}</h3>
        <p class="small text-white-50 mb-3">Kamu memilih <strong>{{ playerChoice.toUpperCase() }}</strong> vs Komputer <strong>{{ aiChoice.toUpperCase() }}</strong></p>
        <button class="btn btn-warning rounded-pill px-4 fw-bold text-dark shadow-sm" @click="nextRound">
          <i class="bi bi-play-fill me-1"></i> Main Lagi
        </button>
      </div>

      <!-- Shaking Countdown Overlay -->
      <div v-if="isShaking" class="position-absolute top-50 start-50 translate-middle text-center p-3" style="z-index: 10;">
        <h1 class="display-1 fw-extrabold text-warning shake-text">{{ countdownText }}</h1>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

export default {
  name: 'ThreeSuit',
  setup() {
    const canvasContainer = ref(null);
    const isShaking = ref(false);
    const showResult = ref(false);
    const resultText = ref('');
    const resultClass = ref('');
    const countdownText = ref('3');
    const playerChoice = ref('');
    const aiChoice = ref('');
    const playerWins = ref(0);
    const aiWins = ref(0);

    let scene, camera, renderer, animationId;
    let playerPedestal, aiPedestal;
    let playerObjectGroup, aiObjectGroup; // groups holding current 3D meshes

    const initScene = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 800;
      const height = 450;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0f1d); // Deep cosmic dark blue

      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 3, 7.5);
      camera.lookAt(0, 0.8, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      canvasContainer.value.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
      light1.position.set(-3, 8, 3);
      light1.castShadow = true;
      scene.add(light1);

      const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
      light2.position.set(3, 8, -3);
      scene.add(light2);

      // Colored spotlights onto pedestals
      const playerSpot = new THREE.SpotLight(0x06b6d4, 5, 8, Math.PI / 6, 0.5);
      playerSpot.position.set(-1.8, 4, 1);
      playerSpot.target.position.set(-1.8, 0.8, 0);
      scene.add(playerSpot);
      scene.add(playerSpot.target);

      const aiSpot = new THREE.SpotLight(0xec4899, 5, 8, Math.PI / 6, 0.5);
      aiSpot.position.set(1.8, 4, 1);
      aiSpot.target.position.set(1.8, 0.8, 0);
      scene.add(aiSpot);
      scene.add(aiSpot.target);

      // Build Pedestals
      buildPedestals();

      // Object groups (containers for the rock/paper/scissors shapes)
      playerObjectGroup = new THREE.Group();
      playerObjectGroup.position.set(-1.8, 0.9, 0);
      scene.add(playerObjectGroup);

      aiObjectGroup = new THREE.Group();
      aiObjectGroup.position.set(1.8, 0.9, 0);
      scene.add(aiObjectGroup);

      // Place default starting meshes (e.g. resting Rock shapes)
      setGroupShape(playerObjectGroup, 'rock');
      setGroupShape(aiObjectGroup, 'rock');

      window.addEventListener('resize', onWindowResize);

      animate();
    };

    const buildPedestals = () => {
      const pedestalGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.8, 32);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });

      playerPedestal = new THREE.Mesh(pedestalGeo, pedMat);
      playerPedestal.position.set(-1.8, 0.4, 0);
      playerPedestal.receiveShadow = true;
      scene.add(playerPedestal);

      aiPedestal = new THREE.Mesh(pedestalGeo, pedMat);
      aiPedestal.position.set(1.8, 0.4, 0);
      aiPedestal.receiveShadow = true;
      scene.add(aiPedestal);
    };

    // Helper to generate 3D mesh based on type
    const create3DModel = (type, side) => {
      const group = new THREE.Group();
      const color = side === 'player' ? 0x06b6d4 : 0xec4899;

      if (type === 'rock') {
        // Coarse boulder by merging spheres
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
        const sphereGeo = new THREE.SphereGeometry(0.32, 8, 8);
        
        for (let i = 0; i < 5; i++) {
          const sphere = new THREE.Mesh(sphereGeo, mat);
          sphere.position.set(
            (Math.random() - 0.5) * 0.18,
            (Math.random() - 0.5) * 0.18,
            (Math.random() - 0.5) * 0.18
          );
          group.add(sphere);
        }

      } else if (type === 'paper') {
        // Floating document page (box)
        const mat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5, metalness: 0.1 });
        const sheetGeo = new THREE.BoxGeometry(0.55, 0.03, 0.8);
        const sheet = new THREE.Mesh(sheetGeo, mat);
        sheet.rotation.x = 0.2;
        sheet.rotation.y = 0.4;
        group.add(sheet);

      } else if (type === 'scissors') {
        // Metallic scissors shape
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.1, metalness: 0.9 });

        // Blade 1
        const bladeGeo = new THREE.BoxGeometry(0.08, 0.7, 0.02);
        const blade1 = new THREE.Mesh(bladeGeo, mat);
        blade1.position.set(-0.12, 0.1, 0);
        blade1.rotation.z = 0.2;
        group.add(blade1);

        // Blade 2
        const blade2 = new THREE.Mesh(bladeGeo, mat);
        blade2.position.set(0.12, 0.1, 0);
        blade2.rotation.z = -0.2;
        group.add(blade2);

        // Handles (torus)
        const handleGeo = new THREE.TorusGeometry(0.12, 0.04, 8, 16);
        
        const h1 = new THREE.Mesh(handleGeo, mat);
        h1.position.set(-0.2, -0.3, 0);
        group.add(h1);

        const h2 = new THREE.Mesh(handleGeo, mat);
        h2.position.set(0.2, -0.3, 0);
        group.add(h2);
      }

      return group;
    };

    const setGroupShape = (group, type, side) => {
      // Clear old meshes
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
      // Add new model
      const model = create3DModel(type, side);
      group.add(model);
    };

    const playGame = (choice) => {
      playerChoice.value = choice;
      isShaking.value = true;
      countdownText.value = '3';

      // 1. Shaking animation countdown
      let count = 3;
      const interval = setInterval(() => {
        count--;
        if (count === 0) {
          clearInterval(interval);
          revealResult();
        } else {
          countdownText.value = count.toString();
        }
      }, 500);
    };

    const revealResult = () => {
      isShaking.value = false;

      // Computer choice
      const options = ['rock', 'paper', 'scissors'];
      aiChoice.value = options[Math.floor(Math.random() * options.length)];

      // 2. Set final 3D meshes on pedestals
      setGroupShape(playerObjectGroup, playerChoice.value, 'player');
      setGroupShape(aiObjectGroup, aiChoice.value, 'ai');

      // 3. Evaluate Winner
      if (playerChoice.value === aiChoice.value) {
        resultText.value = 'DRAW! (SERI)';
        resultClass.value = 'text-warning';
      } else if (
        (playerChoice.value === 'rock' && aiChoice.value === 'scissors') ||
        (playerChoice.value === 'paper' && aiChoice.value === 'rock') ||
        (playerChoice.value === 'scissors' && aiChoice.value === 'paper')
      ) {
        resultText.value = 'YOU WIN! (MENANG)';
        resultClass.value = 'text-success';
        playerWins.value++;
      } else {
        resultText.value = 'YOU LOSE! (KALAH)';
        resultClass.value = 'text-danger';
        aiWins.value++;
      }

      showResult.value = true;
    };

    const nextRound = () => {
      showResult.value = false;
      // Revert pedestals to default Rock shapes
      setGroupShape(playerObjectGroup, 'rock', 'player');
      setGroupShape(aiObjectGroup, 'rock', 'ai');
    };

    const resetScore = () => {
      playerWins.value = 0;
      aiWins.value = 0;
      nextRound();
    };

    const onWindowResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const width = canvasContainer.value.clientWidth;
      camera.aspect = width / 450;
      camera.updateProjectionMatrix();
      renderer.setSize(width, 450);
    };

    const animate = () => {
      if (renderer && scene && camera) {
        animationId = requestAnimationFrame(animate);

        // Pedestals / shapes floating / shaking effect
        const time = Date.now() * 0.003;

        if (isShaking.value) {
          // Shake both objects vertically rapidly
          const shakeVal = Math.sin(time * 6) * 0.15;
          playerObjectGroup.position.y = 0.9 + shakeVal;
          aiObjectGroup.position.y = 0.9 + shakeVal;
          playerObjectGroup.rotation.set(0, 0, 0);
          aiObjectGroup.rotation.set(0, 0, 0);
        } else {
          // Smooth floating idle rotation
          playerObjectGroup.position.y = 0.9 + Math.sin(time) * 0.08;
          aiObjectGroup.position.y = 0.9 + Math.cos(time) * 0.08;

          playerObjectGroup.rotation.y += 0.012;
          aiObjectGroup.rotation.y += 0.012;
        }

        renderer.render(scene, camera);
      }
    };

    onMounted(() => {
      setTimeout(() => {
        initScene();
      }, 100);
    });

    onUnmounted(() => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement) renderer.domElement.remove();
      }
    });

    return {
      canvasContainer,
      isShaking,
      showResult,
      resultText,
      resultClass,
      countdownText,
      playerChoice,
      aiChoice,
      playerWins,
      aiWins,
      playGame,
      nextRound,
      resetScore
    };
  }
};
</script>

<style scoped>
.game-wrapper {
  user-select: none;
}
.canvas-container {
  background-color: #020617;
}
.game-opt-btn {
  border-width: 2px;
  background-color: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
}
.game-opt-btn:hover {
  transform: translateY(-4px);
}
.shake-text {
  animation: pulse-countdown 0.5s infinite alternate;
}
@keyframes pulse-countdown {
  from { transform: scale(0.9); }
  to { transform: scale(1.1); }
}
</style>
