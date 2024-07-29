import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

import {
  createGameElements,
  updateCannonDebugger,
  playerBody,
  player,
  powerups,
  enemies,
  particles,
} from "./gameElements";
import {
  moveObstacles,
  randomLanePosition,
  randomRangeNum,
  resetObstacles,
} from "./helper";
import "./style.css";

// HTML Elements
const pointsUI = document.querySelector("#points");
const pointsGO = document.querySelector("#pointsGameOver");
const popupStartGame = document.querySelector("#popupStartGame");
const popupGameOver = document.querySelector("#popupGameOver");
const startGameButton = document.querySelector("#startGameButton");
const gameOverButton = document.querySelector("#gameOverButton");
const gameOverLabel = document.querySelector("#gameOverLabel");

// Points
let points = 0;
let gameStart;
let gameOver;

// Generate world game
const scene = new THREE.Scene();
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // World gravity
});

// Player
let currentLane = 1; // 0 - left, 1 - middle, 2 - right

// Debugger
const cannonDebugger = new CannonDebugger(scene, world, {
  color: "#AEE2FF",
  scale: 1,
});

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 4.5;
camera.position.y = 1.5;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Handle Game Functions
function initGame() {
  gameStart = true;
  points = 0;
  pointsUI.innerHTML = points.toString();
  popupStartGame.style.display = "none";
  resetObstacles(powerups, -5, -10);
  resetObstacles(enemies, -5, -10);

  createGameElements(scene, world);
}

function restartGame() {
  gameOver = false;
  points = 0;
  pointsUI.innerHTML = points.toString();
  popupGameOver.style.display = "none";
  resetObstacles(powerups, -5, -10);
  resetObstacles(enemies, -5, -10);

  createGameElements(scene, world);
}

function movePlayer(direction) {
  const directionLeft = direction === "left";
  const directionRight = direction === "right";
  const directionUp = direction === "up";
  const directionDown = direction === "down";
  console.log(playerBody.position.y);
  const playerIsFloor =
    playerBody.position.y < -0.25 && playerBody.position.y > -0.26;

  if (directionLeft && currentLane > 0 && playerIsFloor) {
    currentLane--;
    playerBody.velocity.x = -45;
  } else if (directionRight && currentLane < 2 && playerIsFloor) {
    currentLane++;
    playerBody.velocity.x = 45;
  } else if (directionUp && playerIsFloor) {
    playerBody.velocity.y = 6;
  } else if (directionDown && !playerIsFloor) {
    playerBody.velocity.y = -5.5;
  } else if (directionLeft && !playerIsFloor) {
    if (currentLane == 1) {
      playerBody.position.x = -1;
    }
    if (currentLane == 2) {
      playerBody.position.x = 0;
    }

    currentLane--;
  } else if (directionRight && !playerIsFloor) {
    if (currentLane == 0) {
      playerBody.position.x = 0;
    }
    if (currentLane == 1) {
      playerBody.position.x = 1;
    }

    currentLane++;
  } else {
    return;
  }
}

// Animate Loop
function animate() {
  requestAnimationFrame(animate);

  particles.rotation.x += 0.0001;
  particles.rotation.y += 0.0001;
  particles.rotation.z += 0.0005;

  if (!gameOver) {
    moveObstacles(powerups, 0.02, -5, -10, camera);
    moveObstacles(enemies, 0.03, -5, -10, camera);
  } else {
    pointsGO.innerHTML = "Game Over";
    gameOverLabel.innerHTML = "died ⚰️";
    popupGameOver.style.display = "flex";
    scene.remove(player);
    world.removeBody(playerBody);
    playerBody.velocity.set(0, 3, 3);
  }

  controls.update();
  world.fixedStep();

  player.position.copy(playerBody.position);
  player.quaternion.copy(playerBody.quaternion);

  updateCannonDebugger(cannonDebugger);
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
      el.body.position.z = randomRangeNum(-5, -10);
      el.mesh.position.copy(el.body.position);
      el.mesh.quaternion.copy(el.body.quaternion);
      points += 1;
      pointsUI.innerHTML = points.toString();
    }
  });
  enemies.forEach((el) => {
    if (e.body === el.body) {
      gameOver = true;
    }
  });
});

window.addEventListener("keydown", (e) => {
  // Player Controls
  if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
    movePlayer("right");
  }

  if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
    movePlayer("left");
  }

  if (e.key === " " || e.key == "w" || e.key === "W" || e.key === "ArrowUp") {
    movePlayer("up");
  }

  if (e.key === "s" || e.key == "S" || e.key === "ArrowDown") {
    movePlayer("down");
  }

  // Game Controls
  if (e.key === "enter" || (e.key === "Enter" && !gameStart)) {
    initGame();
    animate();
  }

  if ((gameOver && e.key === "r") || e.key === "R") {
    restartGame();
    animate();
  }
});

window.addEventListener("keyup", (e) => {
  if (
    e.key === "d" ||
    e.key === "D" ||
    e.key === "ArrowRight" ||
    e.key === "a" ||
    e.key === "A" ||
    e.key === "ArrowLeft"
  ) {
    playerBody.velocity.x = 0;
  }
});

// E.L Game
startGameButton.addEventListener("click", () => {
  initGame();
  animate(false);
});

gameOverButton.addEventListener("click", () => {
  restartGame();
  animate(false);
});
