<template>
  <div class="game-wrapper bg-dark text-white rounded-4 overflow-hidden position-relative shadow-lg border border-secondary border-opacity-25">
    <!-- Header info -->
    <div class="p-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
      <div>
        <h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
          <span style="color: #ff69b4;">🌸 Dunia Yuki 3D</span>
          <span class="badge bg-danger text-white rounded-pill" style="font-size: 10px;">Ported Edition</span>
        </h5>
        <small class="text-white-50">Eksplorasi Pulau Yuki, kumpulkan koin, dan jajan di Toko Yuki!</small>
      </div>
      <button class="btn btn-sm btn-outline-light rounded-pill px-3" @click="resetPlayer">
        <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Posisi
      </button>
    </div>

    <!-- Canvas & UI overlays -->
    <div ref="canvasContainer" class="canvas-container w-100 position-relative" style="height: 480px;">
      
      <!-- 1. TITLE SCREEN OVERLAY -->
      <div v-if="!gameStarted && !showCutscene" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4" 
           style="z-index: 20; background: radial-gradient(ellipse at center, rgba(60,10,40,0.5) 0%, rgba(10,0,20,0.96) 100%); backdrop-filter: blur(4px);">
        <div class="studio-logo text-pink mb-1" style="font-size: 11px; letter-spacing: 5px; color: #ff69b4; font-weight: 800; font-family: monospace;">A DREAM BY ARIF ALEXANDER</div>
        <h1 class="display-4 fw-extrabold mb-1 text-white" style="font-family: 'Arial Black', sans-serif; text-shadow: 0 0 20px rgba(255,105,180,0.5);">DUNIA YUKI 3D</h1>
        
        <p class="text-white-50 mb-4 small" style="max-width: 450px;">
          Gunakan tombol <kbd class="bg-secondary text-white">W A S D</kbd> atau tombol arah untuk berjalan, dan tombol <kbd class="bg-secondary text-white">E</kbd> untuk Lompat (Tekan 2x untuk Double Jump)!
        </p>

        <button class="btn btn-pink-custom btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg text-white" @click="startCutscene">
          JELAJAHI DUNIA
        </button>
      </div>

      <!-- 2. CUTSCENE OVERLAY -->
      <div v-if="showCutscene" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4" 
           style="z-index: 20; background: #1a0010;">
        <div class="card bg-dark bg-opacity-70 text-white border border-2 rounded-4 p-4 shadow-lg" style="max-width: 600px; border-color: #ff69b4;">
          <h4 class="fw-bold mb-3" style="color: #ff69b4; letter-spacing: 2px;">✦ NYX ✦</h4>
          <p class="fs-5 leading-relaxed mb-4 text-white-50" style="font-family: monospace;">
            "ohh sayang kamu mau keliling yaudah hati hati ya gantengnya aku sayangnya dan cintanya aku unch unch hahaha. Jangan lupa ngoding ya sayang!"
          </p>
          <button class="btn btn-pink-custom btn-lg px-4 py-2.5 rounded-pill fw-bold text-white" @click="enterWorld">
            Masuk ke Dunia
          </button>
        </div>
      </div>

      <!-- 3. IN-GAME HUD -->
      <div v-if="gameStarted" class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none d-flex flex-column justify-content-between p-3" style="z-index: 10;">
        <!-- Top HUD row -->
        <div class="d-flex justify-content-between align-items-start w-100 pointer-events-auto">
          <!-- Distance Counter -->
          <div class="hud-box bg-dark bg-opacity-80 border border-secondary border-opacity-25 rounded-3 px-3 py-2 text-start backdrop-blur">
            <span class="d-block text-white-50 uppercase tracking-wider" style="font-size: 9px;">JARAK</span>
            <span class="fs-5 fw-bold text-white">{{ distanceTraveled }}M</span>
          </div>

          <!-- Coin Counter -->
          <div class="hud-box bg-dark bg-opacity-80 border border-secondary border-opacity-25 rounded-3 px-3 py-2 text-end backdrop-blur">
            <span class="d-block text-white-50 uppercase tracking-wider" style="font-size: 9px;">DUIT</span>
            <span class="fs-5 fw-bold text-warning">Rp {{ coins.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <!-- Center Notification Toast -->
        <div v-if="notificationText" class="align-self-center bg-pink-custom text-white border border-white rounded-pill px-4 py-1.5 shadow-lg fw-bold border-opacity-20 pointer-events-none" 
             style="background: linear-gradient(135deg, #ff69b4, #ff1493); z-index: 15;">
          {{ notificationText }}
        </div>

        <!-- Bottom HUD row -->
        <div class="d-flex justify-content-between align-items-end w-100 pointer-events-auto">
          <!-- Status / Role -->
          <div class="hud-box bg-dark bg-opacity-80 border border-secondary border-opacity-25 rounded-3 px-3 py-2 text-start backdrop-blur" style="max-width: 250px;">
            <span class="d-block text-white-50 uppercase tracking-wider" style="font-size: 9px;">STATUS</span>
            <span class="fw-bold text-success" style="font-size: 14px;">{{ statusText }}</span>
          </div>

          <!-- Toko Yuki trigger -->
          <button class="btn btn-warning rounded-pill px-4 py-2.5 fw-extrabold shadow-lg d-flex align-items-center gap-1.5 text-dark" @click="shopOpen = true">
            <i class="bi bi-shop"></i>
            <span>TOKO YUKI</span>
          </button>
        </div>
      </div>

      <!-- 4. SHOP MODAL OVERLAY -->
      <div v-if="shopOpen" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-center" 
           style="z-index: 30; background: rgba(15,0,8,0.92); backdrop-filter: blur(8px);">
        <div class="card bg-dark text-white border border-secondary border-opacity-50 rounded-4 p-4 shadow-2xl w-100" style="max-width: 500px;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="fw-bold text-warning mb-0"><i class="bi bi-shop me-1"></i> TOKO YUKI</h4>
            <span class="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill">Rp {{ coins.toLocaleString('id-ID') }}</span>
          </div>
          <p class="text-white-50 small mb-3">Makan & Minum agar status bertambah bertenaga!</p>

          <div class="shop-grid overflow-y-auto mb-4 pe-1" style="max-height: 220px;">
            <div v-for="item in shopItems" :key="item.name" class="d-flex justify-content-between align-items-center bg-black bg-opacity-40 p-2.5 rounded-3 mb-2 border border-secondary border-opacity-25">
              <div class="text-start">
                <span class="fw-bold d-block" style="font-size: 13px;">{{ item.name }}</span>
                <span class="badge bg-secondary text-white-50 rounded-pill" style="font-size: 9px;">{{ item.type }}</span>
              </div>
              <button class="btn btn-sm btn-warning fw-bold px-3" @click="buyItem(item)">
                Beli Rp {{ item.price.toLocaleString('id-ID') }}
              </button>
            </div>
          </div>

          <button class="btn btn-outline-light rounded-pill px-4" @click="shopOpen = false">
            Tutup Toko
          </button>
        </div>
      </div>

      <!-- Touch Controls for Mobile Devices -->
      <div v-if="gameStarted && !shopOpen" class="position-absolute bottom-3 start-3 d-flex flex-column gap-2 d-md-none" style="z-index: 10;">
        <div class="d-flex justify-content-center">
          <button class="btn btn-secondary btn-lg rounded-circle border-secondary touch-btn" @touchstart="setKey('forward', true)" @touchend="setKey('forward', false)">
            <i class="bi bi-chevron-up"></i>
          </button>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-secondary btn-lg rounded-circle border-secondary touch-btn" @touchstart="setKey('left', true)" @touchend="setKey('left', false)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button class="btn btn-secondary btn-lg rounded-circle border-secondary touch-btn" @touchstart="setKey('backward', true)" @touchend="setKey('backward', false)">
            <i class="bi bi-chevron-down"></i>
          </button>
          <button class="btn btn-secondary btn-lg rounded-circle border-secondary touch-btn" @touchstart="setKey('right', true)" @touchend="setKey('right', false)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <div v-if="gameStarted && !shopOpen" class="position-absolute bottom-3 end-3 d-md-none" style="z-index: 10;">
        <button class="btn btn-warning btn-lg rounded-circle border-warning touch-btn" @touchstart="triggerMobileJump" style="width: 60px; height: 60px;">
          <i class="bi bi-arrow-up-circle-fill"></i>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'ThreeIsland',
  setup() {
    const canvasContainer = ref(null);
    const gameStarted = ref(false);
    const showCutscene = ref(false);
    const shopOpen = ref(false);

    // HUD values
    const distanceTraveled = ref(0);
    const coins = ref(10000);
    const statusText = ref('PENGANGGURAN 😴');
    const notificationText = ref('');

    // Shop Items
    const shopItems = [
      { name: 'Nasi Goreng', price: 15000, type: 'makanan' },
      { name: 'Mie Goreng', price: 12000, type: 'makanan' },
      { name: 'Soto Ayam', price: 20000, type: 'makanan' },
      { name: 'Es Teh Manis', price: 5000, type: 'minuman' },
      { name: 'Jus Alpukat', price: 12000, type: 'minuman' },
      { name: 'Kopi Susu', price: 8000, type: 'minuman' }
    ];

    let scene, camera, renderer, controls, animationId;
    let player, waterPlane;
    let trees = [];
    let coinMeshes = [];
    let swingSeatGroup;
    const prevPlayerPos = new THREE.Vector3();

    // Audio SFX engine
    let audioCtx = null;
    const playSFX = (type) => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        if (type === 'coin') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
          osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.08); // E6
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } else if (type === 'jump') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.12);
        } else if (type === 'buy') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          osc.frequency.linearRampToValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.18);
        }
      } catch (err) {
        console.warn('Audio Context error: ', err);
      }
    };

    const showNotif = (msg) => {
      notificationText.value = msg;
      setTimeout(() => {
        if (notificationText.value === msg) {
          notificationText.value = '';
        }
      }, 1500);
    };

    // Controller states
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };

    // Player physics
    const playerSpeed = 0.08;
    const rotationSpeed = 0.04;
    const gravity = 0.014;
    let playerVelocityY = 0;
    let isGrounded = true;
    let jumpCount = 0;

    const setKey = (key, state) => {
      keys[key] = state;
    };

    const triggerMobileJump = () => {
      if (isGrounded) {
        playerVelocityY = 0.22;
        isGrounded = false;
        jumpCount = 1;
        playSFX('jump');
      } else if (jumpCount === 1) {
        playerVelocityY = 0.20;
        jumpCount = 2;
        playSFX('jump');
      }
    };

    const startCutscene = () => {
      playSFX('buy');
      showCutscene.value = true;
    };

    const enterWorld = () => {
      playSFX('buy');
      showCutscene.value = false;
      gameStarted.value = true;
      if (player) {
        prevPlayerPos.copy(player.position);
      }
    };

    const buyItem = (item) => {
      if (coins.value >= item.price) {
        coins.value -= item.price;
        playSFX('buy');
        if (item.name === 'Kopi Susu') {
          statusText.value = 'JAGO CODING 💻';
        } else if (item.name === 'Nasi Goreng') {
          statusText.value = 'KENYANG MAKSIMAL 🍛';
        } else {
          statusText.value = `SEGARNYA ${item.name.toUpperCase()} 🍹`;
        }
        showNotif(`Membeli ${item.name}!`);
      } else {
        showNotif('Uang tidak cukup!');
      }
    };

    const initScene = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 800;
      const height = 480;

      // Scene & Environment Fog
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xb0e0e6); // Sky blue
      scene.fog = new THREE.FogExp2(0xb0e0e6, 0.02);

      // Camera
      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 8, 14);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      canvasContainer.value.appendChild(renderer.domElement);

      // Orbit Controls (Chase camera helpers)
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.02;
      controls.minDistance = 4;
      controls.maxDistance = 25;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffe4e1, 0.85);
      hemiLight.position.set(0, 50, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfff8dc, 1.85);
      dirLight.position.set(20, 40, 20);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      // Build World Components
      buildIsland();
      buildPlayer();
      buildSmilingSun();
      buildSwing();
      spawnCoins();

      // Keyboard Listeners
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onWindowResize);

      // Start loop
      animate();
    };

    const buildIsland = () => {
      // Water plane
      const waterGeo = new THREE.PlaneGeometry(120, 120, 64, 64);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.8
      });
      waterPlane = new THREE.Mesh(waterGeo, waterMat);
      waterPlane.rotation.x = -Math.PI / 2;
      waterPlane.position.y = 0.2;
      scene.add(waterPlane);

      // Sandy Base
      const sandGeo = new THREE.CylinderGeometry(15, 18, 2, 32);
      const sandMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
      const sand = new THREE.Mesh(sandGeo, sandMat);
      sand.position.y = 0.5;
      sand.receiveShadow = true;
      scene.add(sand);

      // Grassy Center Hill
      const grassGeo = new THREE.ConeGeometry(11, 4, 32);
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.position.y = 3.5;
      grass.castShadow = true;
      grass.receiveShadow = true;
      scene.add(grass);

      // Trees
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

      const treePositions = [
        [3, 2, 4], [-4, 2.5, -3], [5, 1.8, -5], [-6, 1.9, 4],
        [1, 2.8, -6], [-2, 2.1, 6], [7, 1.5, 2], [-7, 1.4, -2]
      ];

      treePositions.forEach(pos => {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 1.5, 8);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Leaves
        const foliageGeo = new THREE.ConeGeometry(0.9, 1.8, 8);
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 1.9;
        foliage.castShadow = true;
        treeGroup.add(foliage);

        treeGroup.position.set(pos[0], pos[1], pos[2]);
        scene.add(treeGroup);
        trees.push(treeGroup);
      });

      // Rocks
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
      for (let i = 0; i < 12; i++) {
        const size = 0.3 + Math.random() * 0.5;
        const rockGeo = new THREE.DodecahedronGeometry(size);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 5;
        rock.position.set(Math.cos(angle) * radius, 0.7, Math.sin(angle) * radius);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
      }
    };

    const buildPlayer = () => {
      const playerGroup = new THREE.Group();

      // Main body (sphere)
      const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.8 }); // purple
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.65;
      body.castShadow = true;
      playerGroup.add(body);

      // Eye / Screen
      const eyeGeo = new THREE.BoxGeometry(0.45, 0.15, 0.2);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0.7, 0.32);
      playerGroup.add(eye);

      // Hat/Antenna
      const antTrunkGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
      const antTrunk = new THREE.Mesh(antTrunkGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
      antTrunk.position.set(0, 1.1, 0);
      playerGroup.add(antTrunk);

      const antTipGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const antTip = new THREE.Mesh(antTipGeo, new THREE.MeshBasicMaterial({ color: 0xeab308 }));
      antTip.position.set(0, 1.25, 0);
      playerGroup.add(antTip);

      playerGroup.position.set(0, 1.5, 0);
      scene.add(playerGroup);
      player = playerGroup;
    };

    const buildSmilingSun = () => {
      const sunGroup = new THREE.Group();
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), sunMat);
      sunGroup.add(sphere);

      // Sun Rays
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const ray = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.5), rayMat);
        ray.position.set(Math.sin(a) * 3.3, Math.cos(a) * 3.3, 0);
        ray.rotation.z = -a;
        sunGroup.add(ray);
      }

      // Blush
      const pinkMat = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
      const b1 = new THREE.Mesh(new THREE.CircleGeometry(0.3, 12), pinkMat);
      b1.position.set(-0.9, -0.2, 2.51);
      sunGroup.add(b1);

      const b2 = new THREE.Mesh(new THREE.CircleGeometry(0.3, 12), pinkMat);
      b2.position.set(0.9, -0.2, 2.51);
      sunGroup.add(b2);

      // Black eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), eyeMat);
      leftEye.position.set(-0.6, 0.3, 2.45);
      sunGroup.add(leftEye);

      const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), eyeMat);
      rightEye.position.set(0.6, 0.3, 2.45);
      sunGroup.add(rightEye);

      // Small cute mouth (spheres)
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0xcc3366 });
      const m1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), mouthMat);
      m1.position.set(-0.12, -0.3, 2.48);
      sunGroup.add(m1);
      const m2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), mouthMat);
      m2.position.set(0.12, -0.3, 2.48);
      sunGroup.add(m2);

      sunGroup.position.set(0, 22, -26);
      scene.add(sunGroup);
    };

    const buildSwing = () => {
      const swingGroup = new THREE.Group();
      const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.3 });
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 });
      const chainMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });

      // Frame Legs (A-shapes)
      const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.8, 8);
      const leg1 = new THREE.Mesh(legGeo, standMat);
      leg1.position.set(-1.4, 1.8, -0.5);
      leg1.rotation.z = 0.18;
      leg1.rotation.x = -0.12;
      swingGroup.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, standMat);
      leg2.position.set(-1.4, 1.8, 0.5);
      leg2.rotation.z = 0.18;
      leg2.rotation.x = 0.12;
      swingGroup.add(leg2);

      const leg3 = new THREE.Mesh(legGeo, standMat);
      leg3.position.set(1.4, 1.8, -0.5);
      leg3.rotation.z = -0.18;
      leg3.rotation.x = -0.12;
      swingGroup.add(leg3);

      const leg4 = new THREE.Mesh(legGeo, standMat);
      leg4.position.set(1.4, 1.8, 0.5);
      leg4.rotation.z = -0.18;
      leg4.rotation.x = 0.12;
      swingGroup.add(leg4);

      // Top bar
      const topBarGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
      const topBar = new THREE.Mesh(topBarGeo, standMat);
      topBar.rotation.z = Math.PI / 2;
      topBar.position.set(0, 3.6, 0);
      swingGroup.add(topBar);

      // Seat assembly group
      swingSeatGroup = new THREE.Group();
      swingSeatGroup.position.set(0, 3.6, 0);

      // Chains
      const chainGeo = new THREE.CylinderGeometry(0.012, 0.012, 2.5, 6);
      const leftChain = new THREE.Mesh(chainGeo, chainMat);
      leftChain.position.set(-0.6, -1.25, 0);
      swingSeatGroup.add(leftChain);

      const rightChain = new THREE.Mesh(chainGeo, chainMat);
      rightChain.position.set(0.6, -1.25, 0);
      swingSeatGroup.add(rightChain);

      // Seat Board
      const seatGeo = new THREE.BoxGeometry(1.4, 0.06, 0.35);
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(0, -2.5, 0);
      swingSeatGroup.add(seat);

      swingGroup.add(swingSeatGroup);

      // Place swing near grass center
      swingGroup.position.set(-4, 2.0, 3);
      scene.add(swingGroup);
    };

    const spawnCoins = () => {
      const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xca8a04,
        emissiveIntensity: 0.2
      });

      const positions = [
        [5, 1.4, 5], [-5, 1.4, -5], [7, 1.4, -7], [-7, 1.4, 7],
        [0, 3.5, 4], [3, 2.1, -3], [-3, 2.2, 3], [0, 3.8, -2],
        [10, 1.4, 0], [-10, 1.4, 0], [0, 1.4, 10], [0, 1.4, -10]
      ];

      positions.forEach(pos => {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.rotation.x = Math.PI / 2;
        coin.position.set(pos[0], pos[1] + 0.35, pos[2]);
        coin.castShadow = true;
        scene.add(coin);
        coinMeshes.push(coin);
      });
    };

    const resetPlayer = () => {
      if (player) {
        player.position.set(0, 3, 0);
        player.rotation.set(0, 0, 0);
        playerVelocityY = 0;
        if (gameStarted.value) {
          prevPlayerPos.copy(player.position);
        }
      }
    };

    // Keyboard controls (jumping switched to 'e')
    const onKeyDown = (e) => {
      if (!gameStarted.value) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
      
      // Jump with E
      if (e.key === 'e' || e.key === 'E') {
        if (isGrounded) {
          playerVelocityY = 0.22;
          isGrounded = false;
          jumpCount = 1;
          playSFX('jump');
        } else if (jumpCount === 1) {
          playerVelocityY = 0.20;
          jumpCount = 2;
          playSFX('jump');
        }
      }
    };

    const onKeyUp = (e) => {
      if (!gameStarted.value) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    };

    const onWindowResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const width = canvasContainer.value.clientWidth;
      camera.aspect = width / 480;
      camera.updateProjectionMatrix();
      renderer.setSize(width, 480);
    };

    const getGroundHeight = (x, z) => {
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter < 11) {
        const baseHeight = 1.5;
        const grassHillFactor = (11 - distFromCenter) / 11;
        return baseHeight + grassHillFactor * 4;
      }
      if (distFromCenter < 17) {
        return 1.4;
      }
      return 0.2;
    };

    const updatePlayer = () => {
      if (!player || !gameStarted.value) return;

      // Rotate player
      if (keys.left) {
        player.rotation.y += rotationSpeed;
      }
      if (keys.right) {
        player.rotation.y -= rotationSpeed;
      }

      // Move player
      const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
      if (keys.forward) {
        player.position.addScaledVector(dir, playerSpeed);
      }
      if (keys.backward) {
        player.position.addScaledVector(dir, -playerSpeed * 0.6);
      }

      // Keep player inside boundary
      const mapLimit = 40;
      const distFromCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
      if (distFromCenter > mapLimit) {
        const angle = Math.atan2(player.position.z, player.position.x);
        player.position.x = Math.cos(angle) * mapLimit;
        player.position.z = Math.sin(angle) * mapLimit;
      }

      // Jump and Gravity
      const groundY = getGroundHeight(player.position.x, player.position.z);
      if (player.position.y <= groundY) {
        player.position.y = groundY;
        playerVelocityY = 0;
        isGrounded = true;
        jumpCount = 0;
      } else {
        isGrounded = false;
      }

      if (!isGrounded) {
        playerVelocityY -= gravity;
        player.position.y += playerVelocityY;
      }

      // Track distance traveled
      const deltaDist = prevPlayerPos.distanceTo(player.position);
      if (deltaDist > 0.001 && deltaDist < 1.0) {
        distanceTraveled.value += Math.round(deltaDist * 10);
      }
      prevPlayerPos.copy(player.position);

      // Camera Offset
      const relativeCameraOffset = new THREE.Vector3(0, 4.5, -8.5);
      const cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld);
      
      camera.position.x += (cameraOffset.x - camera.position.x) * 0.1;
      camera.position.y += (cameraOffset.y - camera.position.y) * 0.1;
      camera.position.z += (cameraOffset.z - camera.position.z) * 0.1;
      
      controls.target.set(player.position.x, player.position.y + 0.6, player.position.z);
      controls.update();
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Water waving
      if (waterPlane) {
        const time = Date.now() * 0.001;
        const posAttr = waterPlane.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const u = posAttr.getX(i);
          const v = posAttr.getY(i);
          const z = Math.sin(u * 0.2 + time) * 0.15 + Math.cos(v * 0.2 + time) * 0.15;
          posAttr.setZ(i, z);
        }
        waterPlane.geometry.computeVertexNormals();
        posAttr.needsUpdate = true;
      }

      // Swing movement
      if (swingSeatGroup) {
        swingSeatGroup.rotation.x = Math.sin(Date.now() * 0.002) * 0.25;
      }

      // Rotate coins and test collisions
      for (let i = coinMeshes.length - 1; i >= 0; i--) {
        const coin = coinMeshes[i];
        coin.rotation.z += 0.04;
        if (player) {
          const dist = player.position.distanceTo(coin.position);
          if (dist < 0.9) {
            scene.remove(coin);
            coinMeshes.splice(i, 1);
            coins.value += 1500;
            playSFX('coin');
            showNotif('+ Rp 1.500');
          }
        }
      }

      updatePlayer();

      if (renderer && scene && camera) {
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
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.dispose();
      }
    });

    return {
      canvasContainer,
      gameStarted,
      showCutscene,
      shopOpen,
      distanceTraveled,
      coins,
      statusText,
      notificationText,
      shopItems,
      buyItem,
      startCutscene,
      enterWorld,
      resetPlayer,
      setKey,
      triggerMobileJump
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
  cursor: grab;
}
.canvas-container:active {
  cursor: grabbing;
}
.btn-pink-custom {
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  transition: all 0.3s;
}
.btn-pink-custom:hover {
  background: linear-gradient(135deg, #ff85a2, #ff69b4);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 105, 180, 0.4);
  color: #fff;
}
.hud-box {
  min-width: 100px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.touch-btn {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  opacity: 0.8;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}
.touch-btn:active {
  opacity: 1;
  transform: scale(0.9);
}
</style>
