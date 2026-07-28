<template>
  <div class="game-wrapper bg-dark text-white rounded-4 overflow-hidden position-relative shadow-lg border border-secondary border-opacity-25">
    <!-- Header -->
    <div class="p-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
      <div>
        <h5 class="fw-bold mb-0 text-info d-flex align-items-center gap-2">
          <span>🏗️ 3D Milestone Tower Stacker</span>
          <span class="badge bg-info text-dark rounded-pill" style="font-size: 10px;">3D Physics</span>
        </h5>
        <small class="text-white-50">Tekan spasi atau klik layar pada momen pas untuk menumpuk balok tepat di atas tumpukan!</small>
      </div>

      <div class="d-flex align-items-center gap-3">
        <div class="text-end">
          <span class="small text-white-50 d-block">SKOR SAAT INI</span>
          <span class="fs-5 fw-extrabold text-info">{{ score }}</span>
        </div>
        <div class="text-end border-start border-secondary border-opacity-50 ps-3">
          <span class="small text-warning d-block"><i class="bi bi-trophy-fill me-1"></i>REKOR</span>
          <span class="fs-5 fw-extrabold text-warning">{{ highScore }}</span>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div ref="canvasContainer" class="canvas-container w-100 position-relative" style="height: 450px;">
      <!-- Overlay Instructions / Game Over -->
      <div v-if="!isPlaying" class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-75 backdrop-blur d-flex flex-column align-items-center justify-content-center text-center p-4" style="z-index: 20;">
        <div class="display-3 mb-2">{{ isGameOver ? '💥' : '🧱' }}</div>
        <h2 class="fw-extrabold mb-2">{{ isGameOver ? 'Game Over!' : '3D Tower Stacker' }}</h2>
        <p class="text-white-50 mb-4" style="max-width: 400px;">
          {{ isGameOver ? `Menara terhenti di tinggi ${score} balok.` : 'Tumpuk balok setinggi mungkin. Potongan yang melenceng dari tumpukan akan terpotong!' }}
        </p>
        <button class="btn btn-info btn-lg rounded-pill px-5 py-3 fw-bold text-dark shadow" @click="startGame">
          {{ isGameOver ? 'MULAI LAGI' : 'MULAI BERMAIN' }}
        </button>
      </div>

      <!-- Action Button Overlay for Mobile/Mouse -->
      <div v-if="isPlaying" class="position-absolute bottom-3 start-50 translate-middle-x" style="z-index: 10;">
        <button class="btn btn-info btn-lg rounded-pill px-5 py-3 fw-extrabold text-dark shadow-lg" @click="placeBlock">
          👇 JATUHKAN BALOK (DROP)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

export default {
  name: 'ThreeStacker',
  setup() {
    const canvasContainer = ref(null);
    const isPlaying = ref(false);
    const isGameOver = ref(false);
    const score = ref(0);
    const highScore = ref(parseInt(localStorage.getItem('ft_stacker_highscore') || '0', 10));

    let scene, camera, renderer, animationId;
    let towerStack = []; // Array of stable meshes
    let fallingObjects = []; // Array of debris meshes animating down

    // Game states
    const blockHeight = 0.25;
    let activeBlock = null; // Currently moving mesh
    let baseWidth = 3.0;
    let baseDepth = 3.0;
    
    let direction = 'x'; // Moving direction 'x' or 'z'
    let moveSpeed = 0.08;
    let moveRange = 5.0;
    let movingForward = true;

    const initScene = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 800;
      const height = 450;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1e293b);

      camera = new THREE.OrthographicCamera(
        width / -150, width / 150,
        height / 150, height / -150,
        -10, 100
      );
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      canvasContainer.value.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.6);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.45);
      dirLight.position.set(4, 12, 4);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('resize', onWindowResize);

      // Render loop
      animate();
    };

    const startGame = () => {
      // Clean old objects
      towerStack.forEach(obj => scene.remove(obj));
      towerStack = [];
      fallingObjects.forEach(obj => scene.remove(obj));
      fallingObjects = [];

      if (activeBlock) {
        scene.remove(activeBlock);
        activeBlock = null;
      }

      score.value = 0;
      baseWidth = 3.0;
      baseDepth = 3.0;
      moveSpeed = 0.08;
      direction = 'x';
      isGameOver.value = false;
      isPlaying.value = true;

      // 1. Create Base Foundation Block
      const baseGeo = new THREE.BoxGeometry(baseWidth, blockHeight, baseDepth);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(0, blockHeight / 2, 0);
      baseMesh.receiveShadow = true;
      scene.add(baseMesh);
      towerStack.push(baseMesh);

      // Reset camera
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);

      // 2. Spawn first moving block
      spawnBlock();
    };

    const spawnBlock = () => {
      const topLevel = towerStack.length; // index level
      const topBlock = towerStack[topLevel - 1];

      // Alternates movement axis
      direction = direction === 'x' ? 'z' : 'x';

      const blockGeo = new THREE.BoxGeometry(baseWidth, blockHeight, baseDepth);
      
      // Procedural color changing with height (creates a beautiful rainbow stack)
      const hue = (topLevel * 12) % 360;
      const blockMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`hsl(${hue}, 85%, 55%)`),
        roughness: 0.2
      });

      activeBlock = new THREE.Mesh(blockGeo, blockMat);
      
      // Position spawn offset based on axis
      if (direction === 'x') {
        activeBlock.position.set(-moveRange, topLevel * blockHeight + blockHeight / 2, topBlock.position.z);
      } else {
        activeBlock.position.set(topBlock.position.x, topLevel * blockHeight + blockHeight / 2, -moveRange);
      }

      activeBlock.castShadow = true;
      scene.add(activeBlock);
    };

    const placeBlock = () => {
      if (!isPlaying.value || !activeBlock) return;

      const topLevel = towerStack.length;
      const targetBlock = towerStack[topLevel - 1]; // stable block directly underneath

      const diffX = activeBlock.position.x - targetBlock.position.x;
      const diffZ = activeBlock.position.z - targetBlock.position.z;

      let isHit = false;

      if (direction === 'x') {
        const overlapX = baseWidth - Math.abs(diffX);
        if (overlapX > 0) {
          isHit = true;
          const newX = targetBlock.position.x + diffX / 2;

          // Slice off overhang and spawn falling piece
          const overhangWidth = baseWidth - overlapX;
          const fallingX = newX + (diffX > 0 ? overlapX / 2 + overhangWidth / 2 : -overlapX / 2 - overhangWidth / 2);
          spawnDebris(fallingX, activeBlock.position.y, activeBlock.position.z, overhangWidth, baseDepth, activeBlock.material.color);

          // Update active stable block size
          baseWidth = overlapX;
          activeBlock.scale.x = baseWidth / 3.0; // scale relative to original BoxGeometry size
          activeBlock.position.x = newX;
        }
      } else {
        const overlapZ = baseDepth - Math.abs(diffZ);
        if (overlapZ > 0) {
          isHit = true;
          const newZ = targetBlock.position.z + diffZ / 2;

          // Slice off overhang and spawn falling piece
          const overhangDepth = baseDepth - overlapZ;
          const fallingZ = newZ + (diffZ > 0 ? overlapZ / 2 + overhangDepth / 2 : -overlapZ / 2 - overhangDepth / 2);
          spawnDebris(activeBlock.position.x, activeBlock.position.y, fallingZ, baseWidth, overhangDepth, activeBlock.material.color);

          // Update active stable block size
          baseDepth = overlapZ;
          activeBlock.scale.z = baseDepth / 3.0;
          activeBlock.position.z = newZ;
        }
      }

      if (isHit) {
        // Successful stack!
        towerStack.push(activeBlock);
        activeBlock = null;
        score.value++;

        if (score.value > highScore.value) {
          highScore.value = score.value;
          localStorage.setItem('ft_stacker_highscore', highScore.value.toString());
        }

        // Increase speed slightly
        moveSpeed = 0.08 + score.value * 0.003;

        // Smooth camera slide upwards
        const targetCameraY = 5 + score.value * blockHeight;
        const panCamera = () => {
          if (camera.position.y < targetCameraY) {
            camera.position.y += 0.05;
            requestAnimationFrame(panCamera);
          } else {
            camera.position.y = targetCameraY;
          }
        };
        panCamera();

        // Spawn next block
        spawnBlock();
      } else {
        // Complete miss! Game Over
        gameOver();
      }
    };

    const spawnDebris = (x, y, z, width, depth, color) => {
      if (width <= 0.02 || depth <= 0.02) return; // ignore tiny debris

      const debGeo = new THREE.BoxGeometry(width, blockHeight, depth);
      const debMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
      const debris = new THREE.Mesh(debGeo, debMat);
      debris.position.set(x, y, z);
      scene.add(debris);

      fallingObjects.push({
        mesh: debris,
        velocityY: 0.0
      });
    };

    const gameOver = () => {
      isPlaying.value = false;
      isGameOver.value = true;
      if (activeBlock) {
        // Drop the missed block completely
        fallingObjects.push({
          mesh: activeBlock,
          velocityY: 0.0
        });
        activeBlock = null;
      }
    };

    const onKeyDown = (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (isPlaying.value) {
          placeBlock();
        } else {
          startGame();
        }
      }
    };

    const onWindowResize = () => {
      if (!canvasContainer.value || !renderer || !camera) return;
      const width = canvasContainer.value.clientWidth;
      camera.left = width / -150;
      camera.right = width / 150;
      camera.updateProjectionMatrix();
      renderer.setSize(width, 450);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // 1. Move the active block back and forth
      if (isPlaying.value && activeBlock) {
        if (direction === 'x') {
          if (movingForward) {
            activeBlock.position.x += moveSpeed;
            if (activeBlock.position.x >= moveRange) movingForward = false;
          } else {
            activeBlock.position.x -= moveSpeed;
            if (activeBlock.position.x <= -moveRange) movingForward = true;
          }
        } else {
          if (movingForward) {
            activeBlock.position.z += moveSpeed;
            if (activeBlock.position.z >= moveRange) movingForward = false;
          } else {
            activeBlock.position.z -= moveSpeed;
            if (activeBlock.position.z <= -moveRange) movingForward = true;
          }
        }
      }

      // 2. Animate falling debris with gravity
      for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const debris = fallingObjects[i];
        debris.velocityY += 0.015; // gravity pull
        debris.mesh.position.y -= debris.velocityY;

        // Rotate debris as it falls
        debris.mesh.rotation.x += 0.03;
        debris.mesh.rotation.y += 0.03;

        // Clean up debris if it falls below zero
        if (debris.mesh.position.y < -5) {
          scene.remove(debris.mesh);
          fallingObjects.splice(i, 1);
        }
      }

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
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.dispose();
      }
    });

    return {
      canvasContainer,
      isPlaying,
      isGameOver,
      score,
      highScore,
      startGame,
      placeBlock
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
</style>
