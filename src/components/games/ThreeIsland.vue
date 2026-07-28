<template>
  <div class="game-wrapper bg-dark text-white rounded-4 overflow-hidden position-relative shadow-lg border border-secondary border-opacity-25">
    <!-- Header info -->
    <div class="p-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
      <div>
        <h5 class="fw-bold mb-0 text-success d-flex align-items-center gap-2">
          <span>🌴 3D Island Explorer</span>
          <span class="badge bg-success text-white rounded-pill" style="font-size: 10px;">Free Roam</span>
        </h5>
        <small class="text-white-50">Gunakan WASD atau Tombol Arah untuk berjalan-jalan mengeksplorasi pulau.</small>
      </div>
      <button class="btn btn-sm btn-outline-light rounded-pill px-3" @click="resetPlayer">
        <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Posisi
      </button>
    </div>

    <!-- Canvas -->
    <div ref="canvasContainer" class="canvas-container w-100 position-relative" style="height: 450px;">
      <!-- Desktop Instructions Overlay -->
      <div v-if="showInstructions" class="position-absolute top-2 start-2 p-3 bg-black bg-opacity-75 backdrop-blur rounded-3 text-start pointer-events-none" style="z-index: 10; max-width: 280px; font-size: 12px;">
        <h6 class="fw-bold text-success mb-1">🎮 KONTROL:</h6>
        <div class="mb-1"><kbd class="bg-secondary text-white">W</kbd> / <kbd class="bg-secondary text-white">↑</kbd> : Maju</div>
        <div class="mb-1"><kbd class="bg-secondary text-white">S</kbd> / <kbd class="bg-secondary text-white">↓</kbd> : Mundur</div>
        <div class="mb-1"><kbd class="bg-secondary text-white">A</kbd> / <kbd class="bg-secondary text-white">←</kbd> : Putar Kiri</div>
        <div class="mb-1"><kbd class="bg-secondary text-white">D</kbd> / <kbd class="bg-secondary text-white">→</kbd> : Putar Kanan</div>
        <div class="mb-1"><kbd class="bg-secondary text-white">Space</kbd> : Lompat</div>
        <hr class="my-2 border-secondary">
        <div class="text-white-50">Klik & geser mouse di layar untuk menggerakkan kamera (Orbit Camera).</div>
      </div>

      <!-- Mobile controls overlay (hidden on desktop) -->
      <div class="position-absolute bottom-3 start-3 d-flex flex-column gap-2 d-md-none" style="z-index: 10;">
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

      <div class="position-absolute bottom-3 end-3 d-md-none" style="z-index: 10;">
        <button class="btn btn-warning btn-lg rounded-circle border-warning touch-btn" @touchstart="setKey('jump', true)" @touchend="setKey('jump', false)" style="width: 60px; height: 60px;">
          <i class="bi bi-arrow-up"></i>
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
    const showInstructions = ref(true);

    let scene, camera, renderer, controls, animationId;
    let player, waterPlane;
    let trees = [];

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
    const gravity = 0.015;
    let playerVelocityY = 0;
    let isGrounded = true;

    const setKey = (key, state) => {
      keys[key] = state;
    };

    const initScene = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 800;
      const height = 450;

      // 1. Scene & Environment Fog
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xb0e0e6); // Sky blue
      scene.fog = new THREE.FogExp2(0xb0e0e6, 0.02);

      // 2. Camera
      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 8, 14);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      canvasContainer.value.appendChild(renderer.domElement);

      // 4. Orbit Controls (Targeting the player)
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevents looking below sand level
      controls.minDistance = 4;
      controls.maxDistance = 25;

      // 5. Lights
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
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 100;
      dirLight.shadow.camera.left = -20;
      dirLight.shadow.camera.right = 20;
      dirLight.shadow.camera.top = 20;
      dirLight.shadow.camera.bottom = -20;
      scene.add(dirLight);

      // 6. Build Island
      buildIsland();

      // 7. Build Player Explorer
      buildPlayer();

      // Hook Keyboard events
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onWindowResize);

      // Start loop
      animate();
    };

    const buildIsland = () => {
      // Water plane surrounding the island
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
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.8 }); // Glowing purple
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.65;
      body.castShadow = true;
      playerGroup.add(body);

      // Eye / Screen (box)
      const eyeGeo = new THREE.BoxGeometry(0.45, 0.15, 0.2);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Glowing green face screen
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0.7, 0.32);
      playerGroup.add(eye);

      // Hat/Helmet Antenna
      const antTrunkGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
      const antTrunk = new THREE.Mesh(antTrunkGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
      antTrunk.position.set(0, 1.1, 0);
      playerGroup.add(antTrunk);

      const antTipGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const antTip = new THREE.Mesh(antTipGeo, new THREE.MeshBasicMaterial({ color: 0xeab308 })); // yellow tip
      antTip.position.set(0, 1.25, 0);
      playerGroup.add(antTip);

      playerGroup.position.set(0, 1.5, 0); // start at grass height
      scene.add(playerGroup);
      player = playerGroup;
    };

    const resetPlayer = () => {
      if (player) {
        player.position.set(0, 3, 0);
        player.rotation.set(0, 0, 0);
        playerVelocityY = 0;
      }
    };

    // Key handlers
    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') keys.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's') keys.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
      if (e.key === ' ' || e.key === 'Spacebar') keys.jump = true;
    };

    const onKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') keys.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's') keys.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
      if (e.key === ' ' || e.key === 'Spacebar') keys.jump = false;
    };

    const onWindowResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const width = canvasContainer.value.clientWidth;
      camera.aspect = width / 450;
      camera.updateProjectionMatrix();
      renderer.setSize(width, 450);
    };

    // Calculate dynamic ground height
    const getGroundHeight = (x, z) => {
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter < 11) {
        // Linear slope matching the grass cone geometry
        const baseHeight = 1.5;
        const grassHillFactor = (11 - distFromCenter) / 11;
        return baseHeight + grassHillFactor * 4;
      }
      if (distFromCenter < 17) {
        // Flat sand height
        return 1.4;
      }
      // Floating in water
      return 0.2;
    };

    const updatePlayer = () => {
      if (!player) return;

      // 1. Rotate player
      if (keys.left) {
        player.rotation.y += rotationSpeed;
      }
      if (keys.right) {
        player.rotation.y -= rotationSpeed;
      }

      // 2. Move player
      const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
      if (keys.forward) {
        player.position.addScaledVector(dir, playerSpeed);
      }
      if (keys.backward) {
        player.position.addScaledVector(dir, -playerSpeed * 0.6); // slower backup
      }

      // Keep player inside map boundary
      const mapLimit = 40;
      const distFromCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
      if (distFromCenter > mapLimit) {
        const angle = Math.atan2(player.position.z, player.position.x);
        player.position.x = Math.cos(angle) * mapLimit;
        player.position.z = Math.sin(angle) * mapLimit;
      }

      // 3. Jump and Gravity
      const groundY = getGroundHeight(player.position.x, player.position.z);
      if (player.position.y <= groundY) {
        player.position.y = groundY;
        playerVelocityY = 0;
        isGrounded = true;
      } else {
        isGrounded = false;
      }

      if (keys.jump && isGrounded) {
        playerVelocityY = 0.24;
        isGrounded = false;
      }

      if (!isGrounded) {
        playerVelocityY -= gravity;
        player.position.y += playerVelocityY;
      }

      // 4. Update Camera position (Chase Camera)
      const relativeCameraOffset = new THREE.Vector3(0, 4.5, -8.5);
      const cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld);
      
      // Interpolate camera to look smooth
      camera.position.x += (cameraOffset.x - camera.position.x) * 0.1;
      camera.position.y += (cameraOffset.y - camera.position.y) * 0.1;
      camera.position.z += (cameraOffset.z - camera.position.z) * 0.1;
      
      controls.target.set(player.position.x, player.position.y + 0.6, player.position.z);
      controls.update();
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Water animation (subtle waving waves)
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

      // Update character and follow camera
      updatePlayer();

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    onMounted(() => {
      // Delay init slightly to make sure DOM container size is fully calculated
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
        if (renderer.domElement) renderer.domElement.remove();
      }
    });

    return {
      canvasContainer,
      showInstructions,
      resetPlayer,
      setKey
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
