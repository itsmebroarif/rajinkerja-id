<template>
  <div class="game-wrapper bg-dark text-white rounded-4 overflow-hidden position-relative shadow-lg border border-secondary border-opacity-25">
    <div class="p-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
      <div>
        <h5 class="fw-bold mb-0 text-warning d-flex align-items-center gap-2">
          <span>❌⭕ 3D Tic-Tac-Toe</span>
          <span class="badge bg-warning text-dark rounded-pill" style="font-size: 10px;">VS AI</span>
        </h5>
        <small class="text-white-50">{{ statusText }}</small>
      </div>
      <button class="btn btn-sm btn-outline-warning rounded-pill px-3" @click="resetGame">
        <i class="bi bi-arrow-counterclockwise me-1"></i> Mulai Baru
      </button>
    </div>

    <!-- Canvas Container -->
    <div ref="canvasContainer" class="canvas-container w-100 position-relative" style="height: 450px;">
      <!-- Interactive status and turn display -->
      <div class="position-absolute top-2 start-2 p-2.5 bg-black bg-opacity-75 backdrop-blur rounded-3 text-start pointer-events-none" style="z-index: 10;">
        <span class="small d-block text-white-50">Giliran:</span>
        <span class="fw-bold fs-5" :class="currentPlayer === 'X' ? 'text-info' : 'text-danger'">
          {{ currentPlayer === 'X' ? 'Kamu (X)' : 'Komputer (O)' }}
        </span>
      </div>

      <!-- Victory Overlay banner -->
      <div v-if="gameEnded" class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-80 backdrop-blur d-flex flex-column align-items-center justify-content-center text-center p-4" style="z-index: 20;">
        <div class="display-3 mb-2">{{ winner === 'Draw' ? '🤝' : winner === 'X' ? '🎉' : '💀' }}</div>
        <h2 class="fw-extrabold mb-1">
          {{ winner === 'Draw' ? 'Hasil Seri!' : winner === 'X' ? 'Kamu Menang!' : 'Komputer Menang!' }}
        </h2>
        <p class="text-white-50 mb-4">{{ winner === 'Draw' ? 'Pertandingan yang seimbang.' : winner === 'X' ? 'Strategi luar biasa!' : 'Coba lagi lain kali!' }}</p>
        <button class="btn btn-warning btn-lg rounded-pill px-4 fw-bold text-dark shadow" @click="resetGame">
          <i class="bi bi-play-fill me-1"></i> Main Lagi
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

export default {
  name: 'ThreeTicTacToe',
  setup() {
    const canvasContainer = ref(null);
    const currentPlayer = ref('X'); // X = Player, O = AI
    const gameEnded = ref(false);
    const winner = ref(null);
    const statusText = ref('Klik salah satu kotak di papan 3D untuk menaruh X');

    let scene, camera, renderer, animationId;
    let boardState = Array(9).fill(null); // 'X', 'O', or null
    let gridHitBoxes = []; // 3D box meshes for raycasting
    let placedPieces = []; // references to meshes placed on board
    let winningLineMesh = null;
    let raycaster, mouse;

    const initScene = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 800;
      const height = 450;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a); // dark indigo

      // Camera positioned looking down slightly at an angle
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 7.5, 7.5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      canvasContainer.value.appendChild(renderer.domElement);

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
      dirLight.position.set(5, 10, 5);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const pointLight1 = new THREE.PointLight(0x0ea5e9, 2, 10);
      pointLight1.position.set(-3, 2, -3);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xec4899, 2, 10);
      pointLight2.position.set(3, 2, 3);
      scene.add(pointLight2);

      // Build Board Grid lines
      buildGridLines();

      // Build interactive cell boxes for raycasting
      buildHitboxes();

      renderer.domElement.addEventListener('pointerdown', onCanvasClick);
      window.addEventListener('resize', onWindowResize);

      animate();
    };

    const buildGridLines = () => {
      // Create a nice metallic main board platform
      const baseGeo = new THREE.BoxGeometry(4.8, 0.1, 4.8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.05;
      baseMesh.receiveShadow = true;
      scene.add(baseMesh);

      // Grid dividers
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.1 });
      const linePositions = [
        [-0.8, 0.05, 0], [0.8, 0.05, 0], // vertical
        [0, 0.05, -0.8], [0, 0.05, 0.8]  // horizontal
      ];

      linePositions.forEach((pos, idx) => {
        const isVertical = idx < 2;
        const lineGeo = isVertical 
          ? new THREE.BoxGeometry(0.12, 0.16, 4.5)
          : new THREE.BoxGeometry(4.5, 0.16, 0.12);
        const lineMesh = new THREE.Mesh(lineGeo, dividerMat);
        lineMesh.position.set(pos[0], pos[1], pos[2]);
        scene.add(lineMesh);
      });
    };

    const buildHitboxes = () => {
      const size = 1.35;
      const positions = [
        [-1.6, -1.6], [0, -1.6], [1.6, -1.6],
        [-1.6, 0],    [0, 0],    [1.6, 0],
        [-1.6, 1.6],  [0, 1.6],  [1.6, 1.6]
      ];

      positions.forEach((pos, index) => {
        const boxGeo = new THREE.BoxGeometry(size, 0.12, size);
        // Semi-transparent hitbox (appears transparent but visible on hover)
        const boxMat = new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.0,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(boxGeo, boxMat);
        mesh.position.set(pos[0], 0.06, pos[1]);
        mesh.userData = { index }; // Store index mapping
        scene.add(mesh);
        gridHitBoxes.push(mesh);
      });
    };

    const onCanvasClick = (event) => {
      if (gameEnded.value || currentPlayer.value === 'O') return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(gridHitBoxes);

      if (intersects.length > 0) {
        const hitBox = intersects[0].object;
        const idx = hitBox.userData.index;

        if (boardState[idx] === null) {
          makeMove(idx, 'X');
          if (!gameEnded.value) {
            currentPlayer.value = 'O';
            statusText.value = 'Komputer sedang berpikir...';
            setTimeout(aiMove, 600); // Small delay for realistic feeling
          }
        }
      }
    };

    const makeMove = (index, playerCode) => {
      boardState[index] = playerCode;

      // Spawn 3D piece
      const targetPos = gridHitBoxes[index].position;
      const pieceGroup = new THREE.Group();

      if (playerCode === 'X') {
        // Redrawn cyan metallic 'X'
        const mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.9 });
        
        const stickGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 12);
        
        const stick1 = new THREE.Mesh(stickGeo, mat);
        stick1.rotation.x = Math.PI / 4;
        stick1.rotation.y = Math.PI / 4;
        stick1.castShadow = true;
        pieceGroup.add(stick1);

        const stick2 = new THREE.Mesh(stickGeo, mat);
        stick2.rotation.x = Math.PI / 4;
        stick2.rotation.y = -Math.PI / 4;
        stick2.castShadow = true;
        pieceGroup.add(stick2);

      } else {
        // Glowing red torus 'O'
        const mat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.7 });
        const torusGeo = new THREE.TorusGeometry(0.42, 0.12, 12, 32);
        const torus = new THREE.Mesh(torusGeo, mat);
        torus.rotation.x = Math.PI / 2;
        torus.castShadow = true;
        pieceGroup.add(torus);
      }

      // Start above and animate drop downwards
      pieceGroup.position.set(targetPos.x, 2.5, targetPos.z);
      scene.add(pieceGroup);
      placedPieces.push(pieceGroup);

      // Simple drop animation
      const animateDrop = () => {
        if (pieceGroup.position.y > 0.4) {
          pieceGroup.position.y -= 0.14;
          requestAnimationFrame(animateDrop);
        } else {
          pieceGroup.position.y = 0.4;
        }
      };
      animateDrop();

      // Check results
      checkGameStatus();
    };

    const aiMove = () => {
      if (gameEnded.value) return;

      // 1. Can AI win in this turn?
      let move = findWinningMove('O');
      
      // 2. Can AI block player from winning?
      if (move === -1) {
        move = findWinningMove('X');
      }

      // 3. Take center if available
      if (move === -1 && boardState[4] === null) {
        move = 4;
      }

      // 4. Random available move
      if (move === -1) {
        const available = boardState.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (available.length > 0) {
          move = available[Math.floor(Math.random() * available.length)];
        }
      }

      if (move !== -1) {
        makeMove(move, 'O');
        if (!gameEnded.value) {
          currentPlayer.value = 'X';
          statusText.value = 'Giliranmu! Klik kotak kosong untuk menaruh X';
        }
      }
    };

    const findWinningMove = (playerSign) => {
      const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diag
      ];

      for (let combo of winCombos) {
        const count = combo.filter(idx => boardState[idx] === playerSign).length;
        const emptyIdx = combo.find(idx => boardState[idx] === null);
        if (count === 2 && emptyIdx !== undefined) {
          return emptyIdx;
        }
      }
      return -1;
    };

    const checkGameStatus = () => {
      const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      for (let combo of winCombos) {
        const [a, b, c] = combo;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
          // Win!
          gameEnded.value = true;
          winner.value = boardState[a];
          drawWinningLine(combo);
          statusText.value = winner.value === 'X' ? 'Kamu menang!' : 'Komputer menang!';
          return;
        }
      }

      // Check Draw
      if (!boardState.includes(null)) {
        gameEnded.value = true;
        winner.value = 'Draw';
        statusText.value = 'Game Seri!';
      }
    };

    const drawWinningLine = (combo) => {
      const startPos = gridHitBoxes[combo[0]].position;
      const endPos = gridHitBoxes[combo[2]].position;

      // Draw a cylindrical glowing line between centers
      const distance = startPos.distanceTo(endPos);
      const lineGeo = new THREE.CylinderGeometry(0.08, 0.08, distance, 8);
      const lineMat = new THREE.MeshBasicMaterial({
        color: winner.value === 'X' ? 0x06b6d4 : 0xef4444,
        transparent: true,
        opacity: 0.8
      });

      winningLineMesh = new THREE.Mesh(lineGeo, lineMat);

      // Position in between
      winningLineMesh.position.copy(startPos).add(endPos).multiplyScalar(0.5);
      winningLineMesh.position.y = 0.45;

      // Align cylinder rotation with direction
      const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      winningLineMesh.quaternion.setFromUnitVectors(up, direction);

      scene.add(winningLineMesh);
    };

    const resetGame = () => {
      boardState = Array(9).fill(null);
      currentPlayer.value = 'X';
      gameEnded.value = false;
      winner.value = null;
      statusText.value = 'Klik salah satu kotak di papan 3D untuk menaruh X';

      // Clear old meshes
      placedPieces.forEach(mesh => scene.remove(mesh));
      placedPieces = [];

      if (winningLineMesh) {
        scene.remove(winningLineMesh);
        winningLineMesh = null;
      }
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

        // Hover animation (raycasting index highlight)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(gridHitBoxes);

        // Reset hitboxes opacity
        gridHitBoxes.forEach((box, i) => {
          if (boardState[i] === null) {
            box.material.opacity = 0.0;
          }
        });

        if (intersects.length > 0 && !gameEnded.value && currentPlayer.value === 'X') {
          const hitBox = intersects[0].object;
          const idx = hitBox.userData.index;
          if (boardState[idx] === null) {
            hitBox.material.opacity = 0.3; // Glow highlighted cell
          }
        }

        // Gently rotate O and X pieces for dynamic look
        placedPieces.forEach(group => {
          group.rotation.y += 0.01;
        });

        renderer.render(scene, camera);
      }
    };

    // Track mouse coordinates during move
    const onMouseMove = (event) => {
      if (!renderer) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    onMounted(() => {
      setTimeout(() => {
        initScene();
        renderer.domElement.addEventListener('pointermove', onMouseMove);
      }, 100);
    });

    onUnmounted(() => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.domElement.removeEventListener('pointerdown', onCanvasClick);
        renderer.domElement.removeEventListener('pointermove', onMouseMove);
        renderer.dispose();
        if (renderer.domElement) renderer.domElement.remove();
      }
    });

    return {
      canvasContainer,
      currentPlayer,
      gameEnded,
      winner,
      statusText,
      resetGame
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
  cursor: pointer;
}
</style>
