<template>
  <div class="game-wrapper bg-dark text-white rounded-4 overflow-hidden position-relative shadow-lg border border-secondary border-opacity-25">
    <div class="p-3 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25">
      <div>
        <h5 class="fw-bold mb-0 text-info d-flex align-items-center gap-2">
          <span>🏁 3D Checkers</span>
          <span class="badge bg-info text-dark rounded-pill" style="font-size: 10px;">Classic</span>
        </h5>
        <small class="text-white-50">{{ statusText }}</small>
      </div>
      <button class="btn btn-sm btn-outline-info rounded-pill px-3" @click="resetGame">
        <i class="bi bi-arrow-counterclockwise me-1"></i> Mulai Baru
      </button>
    </div>

    <!-- Canvas -->
    <div ref="canvasContainer" class="canvas-container w-100 position-relative" style="height: 450px;">
      <!-- Turn indicator -->
      <div class="position-absolute top-2 start-2 p-2.5 bg-black bg-opacity-75 backdrop-blur rounded-3 text-start pointer-events-none" style="z-index: 10;">
        <span class="small d-block text-white-50">Giliran:</span>
        <span class="fw-bold fs-5 text-info" v-if="currentPlayer === 'player'">Kamu (Merah)</span>
        <span class="fw-bold fs-5 text-warning" v-else>Komputer (Hitam)</span>
      </div>

      <!-- Victory overlay banner -->
      <div v-if="gameEnded" class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-80 backdrop-blur d-flex flex-column align-items-center justify-content-center text-center p-4" style="z-index: 20;">
        <div class="display-3 mb-2">{{ winner === 'player' ? '🏆' : '💀' }}</div>
        <h2 class="fw-extrabold mb-1">
          {{ winner === 'player' ? 'Kamu Menang!' : 'Komputer Menang!' }}
        </h2>
        <p class="text-white-50 mb-4">{{ winner === 'player' ? 'Permainan yang luar biasa!' : 'Lebih beruntung di game berikutnya!' }}</p>
        <button class="btn btn-info btn-lg rounded-pill px-4 fw-bold text-dark shadow" @click="resetGame">
          Main Lagi
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
  name: 'ThreeCheckers',
  setup() {
    const canvasContainer = ref(null);
    const currentPlayer = ref('player'); // 'player' (red) or 'ai' (black)
    const gameEnded = ref(false);
    const winner = ref(null);
    const statusText = ref('Pilih salah satu bidak Merahmu untuk melangkah');

    let scene, camera, renderer, controls, animationId;
    let raycaster, mouse;

    // Board representation: 8x8 grid. Null, or object { id, side: 'player'|'ai', isKing: bool, row, col, mesh }
    let board = [];
    let boardSquares = []; // 3D square meshes for destinations
    let selectedPiece = null;
    let validMoves = []; // Array of { row, col, jumpOver: Piece|null }

    const initScene = () => {
      if (!canvasContainer.value) return;

      const width = canvasContainer.value.clientWidth || 800;
      const height = 450;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 7.5, 8.5);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      canvasContainer.value.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.05;
      controls.minDistance = 4;
      controls.maxDistance = 15;
      controls.target.set(0, 0, 0);

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 12, 5);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // Build checkerboard mesh and setup initial state
      buildBoard();
      setupPieces();

      renderer.domElement.addEventListener('pointerdown', onCanvasClick);
      window.addEventListener('resize', onWindowResize);

      animate();
    };

    const buildBoard = () => {
      // Board border / frame
      const frameGeo = new THREE.BoxGeometry(8.6, 0.15, 8.6);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = -0.076;
      scene.add(frame);

      // Build 8x8 squares
      const squareSize = 1.0;
      const startX = -3.5;
      const startZ = -3.5;

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const isDark = (row + col) % 2 === 1;

          const sqGeo = new THREE.BoxGeometry(squareSize, 0.05, squareSize);
          const sqMat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x1e293b : 0xe2e8f0,
            roughness: 0.4
          });
          const sqMesh = new THREE.Mesh(sqGeo, sqMat);
          sqMesh.position.set(startX + col * squareSize, 0, startZ + row * squareSize);
          sqMesh.receiveShadow = true;
          sqMesh.userData = { row, col, isDark };
          scene.add(sqMesh);
          boardSquares.push(sqMesh);
        }
      }
    };

    const setupPieces = () => {
      const squareSize = 1.0;
      const startX = -3.5;
      const startZ = -3.5;
      let pieceId = 1;

      // Setup board data array
      board = Array(8).fill(null).map(() => Array(8).fill(null));

      const pieceGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.16, 24);
      const playerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.2 }); // Red
      const aiMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.2 }); // Black/Dark Grey

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const isDark = (row + col) % 2 === 1;
          
          if (isDark) {
            let side = null;
            if (row < 3) {
              side = 'player'; // Player pieces start in rows 0, 1, 2
            } else if (row > 4) {
              side = 'ai'; // AI pieces start in rows 5, 6, 7
            }

            if (side) {
              const mesh = new THREE.Mesh(pieceGeo, side === 'player' ? playerMat : aiMat);
              mesh.castShadow = true;
              mesh.position.set(startX + col * squareSize, 0.12, startZ + row * squareSize);
              scene.add(mesh);

              const piece = {
                id: pieceId++,
                side,
                isKing: false,
                row,
                col,
                mesh
              };
              board[row][col] = piece;
              mesh.userData = { piece };
            }
          }
        }
      }
    };

    const onCanvasClick = (event) => {
      if (gameEnded.value || currentPlayer.value === 'ai') return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // 1. Raycast for piece click
      const pieceMeshes = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c] && board[r][c].side === 'player') {
            pieceMeshes.push(board[r][c].mesh);
          }
        }
      }

      const pieceIntersects = raycaster.intersectObjects(pieceMeshes);
      if (pieceIntersects.length > 0) {
        const piece = pieceIntersects[0].object.userData.piece;
        selectPiece(piece);
        return;
      }

      // 2. Raycast for destination square click
      if (selectedPiece && validMoves.length > 0) {
        const activeSquareMeshes = boardSquares.filter(sq => {
          const { row, col } = sq.userData;
          return validMoves.some(m => m.row === row && m.col === col);
        });

        const squareIntersects = raycaster.intersectObjects(activeSquareMeshes);
        if (squareIntersects.length > 0) {
          const sq = squareIntersects[0].object;
          const move = validMoves.find(m => m.row === sq.userData.row && m.col === sq.userData.col);
          if (move) {
            executeMove(selectedPiece, move);
          }
        }
      }
    };

    const selectPiece = (piece) => {
      // Clear old selection height
      if (selectedPiece) {
        selectedPiece.mesh.position.y = 0.12;
      }

      selectedPiece = piece;
      selectedPiece.mesh.position.y = 0.3; // lift selected piece

      // Calculate valid moves
      validMoves = calculateValidMoves(selectedPiece);
      
      if (validMoves.length > 0) {
        statusText.value = 'Pilih salah satu kotak hijau untuk memindahkan bidak';
      } else {
        statusText.value = 'Bidak ini tidak bisa melangkah. Silakan pilih bidak lain.';
      }
    };

    const calculateValidMoves = (piece) => {
      const moves = [];
      const directions = [];

      // Red (player) moves up rows (+1), Black (AI) moves down rows (-1)
      if (piece.side === 'player' || piece.isKing) {
        directions.push({ rDir: 1, cDirs: [-1, 1] });
      }
      if (piece.side === 'ai' || piece.isKing) {
        directions.push({ rDir: -1, cDirs: [-1, 1] });
      }

      directions.forEach(dir => {
        const nextRow = piece.row + dir.rDir;

        // Normal walk diagonals
        dir.cDirs.forEach(cDir => {
          const nextCol = piece.col + cDir;

          if (isInsideBoard(nextRow, nextCol)) {
            const target = board[nextRow][nextCol];
            if (target === null) {
              // Valid walk move
              moves.push({ row: nextRow, col: nextCol, jumpOver: null });
            } else if (target.side !== piece.side) {
              // Enemy piece! Can we jump?
              const jumpRow = nextRow + dir.rDir;
              const jumpCol = nextCol + cDir;
              if (isInsideBoard(jumpRow, jumpCol) && board[jumpRow][jumpCol] === null) {
                // Valid jump capture
                moves.push({ row: jumpRow, col: jumpCol, jumpOver: target });
              }
            }
          }
        });
      });

      return moves;
    };

    const isInsideBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

    const executeMove = (piece, move) => {
      // 1. Move piece on data board
      board[piece.row][piece.col] = null;
      
      const prevRow = piece.row;
      const prevCol = piece.col;

      piece.row = move.row;
      piece.col = move.col;
      board[move.row][move.col] = piece;

      // 2. King promotion check
      if (piece.side === 'player' && piece.row === 7 && !piece.isKing) {
        promoteToKing(piece);
      } else if (piece.side === 'ai' && piece.row === 0 && !piece.isKing) {
        promoteToKing(piece);
      }

      // 3. Remove captured piece
      if (move.jumpOver) {
        const deadPiece = move.jumpOver;
        board[deadPiece.row][deadPiece.col] = null;
        scene.remove(deadPiece.mesh);
      }

      // Reset selection heights
      piece.mesh.position.y = 0.12;
      selectedPiece = null;
      validMoves = [];

      // 4. Animate piece movement (interpolation)
      const targetX = -3.5 + move.col * 1.0;
      const targetZ = -3.5 + move.row * 1.0;

      const animateSlide = () => {
        const dx = targetX - piece.mesh.position.x;
        const dz = targetZ - piece.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.05) {
          piece.mesh.position.x += dx * 0.25;
          piece.mesh.position.z += dz * 0.25;
          // small jump arc
          piece.mesh.position.y = 0.12 + Math.sin((1.0 - dist / 1.4) * Math.PI) * 0.5;
          requestAnimationFrame(animateSlide);
        } else {
          piece.mesh.position.set(targetX, 0.12, targetZ);
          // Check if game ended after move
          checkGameOver();
          
          if (!gameEnded.value) {
            // Swap turns
            if (currentPlayer.value === 'player') {
              currentPlayer.value = 'ai';
              statusText.value = 'Komputer sedang berpikir...';
              setTimeout(aiTurn, 800);
            } else {
              currentPlayer.value = 'player';
              statusText.value = 'Bidakmu jalan! Silakan pilih bidak Merah';
            }
          }
        }
      };
      animateSlide();
    };

    const promoteToKing = (piece) => {
      piece.isKing = true;
      // Add a small golden crown visual (simply stack a small sphere or cylinder on top)
      const crownGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.1 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = 0.12; // place on top of cylinder piece
      piece.mesh.add(crown);
    };

    const aiTurn = () => {
      if (gameEnded.value) return;

      // 1. Gather all AI pieces
      const aiPieces = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c] && board[r][c].side === 'ai') {
            aiPieces.push(board[r][c]);
          }
        }
      }

      // 2. Find all valid moves for AI. Prioritize capture/jump moves!
      let aiMoves = [];
      let captureMoves = [];

      aiPieces.forEach(p => {
        const moves = calculateValidMoves(p);
        moves.forEach(m => {
          const moveInfo = { piece: p, move: m };
          if (m.jumpOver) {
            captureMoves.push(moveInfo);
          } else {
            aiMoves.push(moveInfo);
          }
        });
      });

      // 3. Choose a move.
      let finalChoice = null;
      if (captureMoves.length > 0) {
        // AI must capture if possible
        finalChoice = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      } else if (aiMoves.length > 0) {
        finalChoice = aiMoves[Math.floor(Math.random() * aiMoves.length)];
      }

      // 4. Perform move
      if (finalChoice) {
        executeMove(finalChoice.piece, finalChoice.move);
      } else {
        // AI has no moves: player wins
        gameEnded.value = true;
        winner.value = 'player';
        statusText.value = 'Kamu menang! Komputer tidak punya langkah lagi.';
      }
    };

    const checkGameOver = () => {
      let playerHasPieces = false;
      let aiHasPieces = false;

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c]) {
            if (board[r][c].side === 'player') playerHasPieces = true;
            if (board[r][c].side === 'ai') aiHasPieces = true;
          }
        }
      }

      if (!playerHasPieces) {
        gameEnded.value = true;
        winner.value = 'ai';
        statusText.value = 'Komputer menang! Semua bidak Merahmu habis.';
      } else if (!aiHasPieces) {
        gameEnded.value = true;
        winner.value = 'player';
        statusText.value = 'Kamu menang! Semua bidak Komputer habis.';
      }
    };

    const resetGame = () => {
      // Clear pieces from scene
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r] && board[r][c]) {
            scene.remove(board[r][c].mesh);
          }
        }
      }

      // Reset board Squares highlights
      boardSquares.forEach(sq => {
        sq.material.color.setHex(sq.userData.isDark ? 0x1e293b : 0xe2e8f0);
      });

      selectedPiece = null;
      validMoves = [];
      currentPlayer.value = 'player';
      gameEnded.value = false;
      winner.value = null;
      statusText.value = 'Pilih salah satu bidak Merahmu untuk melangkah';

      setupPieces();
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

        // Highlight valid move squares in green
        boardSquares.forEach(sq => {
          const { row, col } = sq.userData;
          const isValid = validMoves.some(m => m.row === row && m.col === col);
          if (isValid) {
            sq.material.color.setHex(0x10b981); // Bright green
          } else {
            sq.material.color.setHex(sq.userData.isDark ? 0x1e293b : 0xe2e8f0);
          }
        });

        if (controls) controls.update();
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
        renderer.domElement.removeEventListener('pointerdown', onCanvasClick);
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
  cursor: grab;
}
.canvas-container:active {
  cursor: grabbing;
}
</style>
