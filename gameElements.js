import * as THREE from "three";
import * as CANNON from "cannon-es";

import { randomLanePosition } from "./helper";

// Player
const playerBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25)),
  fixedRotation: true,
});

const player = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xfff })
);
player.castShadow = true;

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Shadow
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
// directionalLight.position.set(10, 50, -30);
directionalLight.position.set(3, 5, 5);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = window.innerWidth; // padrão
directionalLight.shadow.mapSize.height = window.innerHeight; // padrão
directionalLight.shadow.camera.near = 0.9; // padrão
directionalLight.shadow.camera.far = 500; // padrão

// States
let powerups = [];
let enemies = [];
let particles;

function createGameElements(scene, world) {
  // Camera
  camera.position.z = 5.5;
  camera.position.y = 1.5;

  // Recria o ground
  const groundBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1.5, 0.5, 15)),
  });
  groundBody.position.y = -1;
  world.addBody(groundBody);

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 30),
    new THREE.MeshStandardMaterial({ color: 0x0075cd })
  );
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Recria o player
  world.addBody(playerBody);
  scene.add(player);

  // Recria a luz
  scene.add(directionalLight);

  // Recria os powerups
  powerups = [];
  for (let i = 0; i < 3; i++) {
    const posX = randomLanePosition();
    const posZ = -10;

    const powerup = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 16, 50),
      new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    powerup.scale.set(0.1, 0.1, 0.1);
    powerup.position.x = posX;
    powerup.position.z = posZ;
    powerup.name = "powerup" + [i + 1];
    powerup.castShadow = true;
    powerup.receiveShadow = true;
    scene.add(powerup);

    const powerupBody = new CANNON.Body({
      shape: new CANNON.Sphere(0.2),
      collisionResponse: false,
    });

    powerupBody.position.set(posX, 0, posZ);
    world.addBody(powerupBody);

    const powerupObject = {
      mesh: powerup,
      body: powerupBody,
    };

    powerups.push(powerupObject);
  }

  // Recria os inimigos
  enemies = [];
  for (let i = 0; i < 2; i++) {
    const posX = randomLanePosition();
    const posZ = -10;

    const enemy = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    enemy.position.x = posX;
    enemy.position.z = posZ;
    enemy.name = "enemy" + [i + 1];
    enemy.castShadow = true;
    enemy.receiveShadow = true;
    scene.add(enemy);

    const enemyBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)),
      collisionResponse: false,
    });

    enemyBody.position.set(posX, 0, posZ);
    world.addBody(enemyBody);

    const enemyObject = {
      mesh: enemy,
      body: enemyBody,
    };

    enemies.push(enemyObject);
  }

  // Recria as partículas
  scene.fog = new THREE.FogExp2(0xb8860b, 0.06, 50);

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const size = 2000;

  for (let i = 0; i < 5000; i++) {
    const x = (Math.random() * size + Math.random() * size) / 2 - size / 2;
    const y = (Math.random() * size + Math.random() * size) / 2 - size / 2;
    const z = (Math.random() * size + Math.random() * size) / 2 - size / 2;

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const material = new THREE.PointsMaterial({
    size: 1,
    color: 0xb8860b,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function clearGame(scene, world) {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  world.bodies.forEach((body) => {
    world.removeBody(body);
  });

  powerups = [];
  enemies = [];
}

export {
  createGameElements,
  clearGame,
  playerBody,
  player,
  camera,
  powerups,
  enemies,
  particles,
};
