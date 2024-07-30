import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

import {
  createGameElements,
  clearGame,
  playerBody,
  player,
  camera,
  powerups,
  enemies,
  particles,
  coinSound,
  gameOverSound,
  winGameSound,
  bgSound,
} from "./gameElements";

import {
  movePlayer,
  moveObstacles,
  randomLanePosition,
  clearLanePosition,
} from "./helper";

import "./style.css";

// HTML Elements
const pointsUI = document.querySelector("#points");
const pointsGO = document.querySelector("#pointsGameOver");
const pointsWG = document.querySelector("#pointsWinGame");
const popupStartGame = document.querySelector("#popupStartGame");
const popupGameOver = document.querySelector("#popupGameOver");
const popupWinGame = document.querySelector("#popupWinGame");
const startGameButton = document.querySelector("#startGameButton");
const gameOverButton = document.querySelector("#gameOverButton");

// States
let points = 0;
let gameStart;
let gameOver;

// Generate world game
const scene = new THREE.Scene();
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // World gravity
});

// Debugger
const cannonDebugger = new CannonDebugger(scene, world, {
  color: "#AEE2FF",
  scale: 1,
});

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Handle Game Functions
function initGame() {
  gameStart = true;
  gameOver = false;
  points = 0;
  pointsUI.innerHTML = points.toString();
  popupStartGame.style.display = "none";
  popupGameOver.style.display = "none";
  popupWinGame.style.display = "none";

  clearLanePosition();

  if (bgSound.isPlaying) bgSound.stop();
  if (coinSound.isPlaying) coinSound.stop();
  if (gameOverSound.isPlaying) gameOverSound.stop();
  if (winGameSound.isPlaying) winGameSound.stop();

  clearGame(scene, world);
  createGameElements(scene, world);
  animate();
}

function restartGame() {
  gameStart = true;
  gameOver = false;
  points = 0;
  pointsUI.innerHTML = points.toString();
  popupGameOver.style.display = "none";
  popupWinGame.style.display = "none";

  clearLanePosition();

  if (bgSound.isPlaying) bgSound.stop();
  if (coinSound.isPlaying) coinSound.stop();
  if (gameOverSound.isPlaying) gameOverSound.stop();
  if (winGameSound.isPlaying) winGameSound.stop();

  clearGame(scene, world);
  createGameElements(scene, world);
}

// Animate Loop Game
function animate() {
  requestAnimationFrame(animate);

  // Sky particles
  particles.rotation.x += 0.0001;
  particles.rotation.y += 0.0001;
  particles.rotation.z += 0.0005;

  // Câmera
  camera.position.x = playerBody.position.x;

  // Handle game status
  if (!gameOver) {
    moveObstacles(powerups, 0.03, -10, camera, true);
    moveObstacles(enemies, 0.03, -10, camera, false);
    bgSound.play();
    if (points === 20) {
      pointsWG.innerHTML = points.toString();
      popupWinGame.style.display = "flex";
      scene.remove(player);
      world.removeBody(playerBody);
      playerBody.velocity.set(0, 3, 3);
      if (bgSound.isPlaying) bgSound.stop();
      winGameSound.play();
    }
  } else {
    pointsGO.innerHTML = points.toString();
    popupGameOver.style.display = "flex";
    scene.remove(player);
    world.removeBody(playerBody);
    playerBody.velocity.set(0, 3, 3);
    if (bgSound.isPlaying) bgSound.stop();
  }

  controls.update();
  world.fixedStep();

  player.position.copy(playerBody.position);
  player.quaternion.copy(playerBody.quaternion);

  // cannonDebugger.update();
  renderer.render(scene, camera);
}

// Event Listenners
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// E.L Controls
playerBody.addEventListener("collide", (e) => {
  powerups.forEach((el) => {
    if (e.body === el.body) {
      el.body.position.x = randomLanePosition();
      el.body.position.z = -10;
      el.mesh.position.copy(el.body.position);
      el.mesh.quaternion.copy(el.body.quaternion);
      points += 1;
      pointsUI.innerHTML = points.toString();

      if (coinSound.isPlaying) coinSound.stop();
      coinSound.play();
    }
  });
  enemies.forEach((el) => {
    if (e.body === el.body) {
      gameOver = true;
      if (gameOverSound.isPlaying) gameOverSound.stop();
      gameOverSound.play();
    }
  });
});

window.addEventListener("keydown", (e) => {
  // Player Controls
  if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
    movePlayer("right", playerBody);
  }

  if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
    movePlayer("left", playerBody);
  }

  if (e.key === " " || e.key == "w" || e.key === "W" || e.key === "ArrowUp") {
    movePlayer("up", playerBody);
  }

  if (e.key === "s" || e.key == "S" || e.key === "ArrowDown") {
    movePlayer("down", playerBody);
  }

  // Game Controls
  if (e.key === "enter" || (e.key === "Enter" && !gameStart)) {
    initGame();
  }

  if ((gameOver && e.key === "r") || e.key === "R") {
    restartGame();
  }
});

// E.L Game
startGameButton.addEventListener("click", () => {
  initGame();
});

gameOverButton.addEventListener("click", () => {
  restartGame();
});
