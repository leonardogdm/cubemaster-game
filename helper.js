const lanePositions = [-1, 0, 1];
let currentLane = 1; // 0 - left, 1 - middle, 2 - right

export function movePlayer(direction, playerBody) {
  const directionLeft = direction === "left";
  const directionRight = direction === "right";
  const directionUp = direction === "up";
  const directionDown = direction === "down";
  const playerIsFloor =
    playerBody.position.y < -0.25 && playerBody.position.y > -0.26;

  if (directionLeft && currentLane > 0 && playerIsFloor) {
    currentLane--;
    playerBody.velocity.x = -45;
    return;
  } else if (directionRight && currentLane < 2 && playerIsFloor) {
    currentLane++;
    playerBody.velocity.x = 45;
    return;
  } else if (directionUp && playerIsFloor) {
    playerBody.velocity.y = 6;
    return;
  } else if (directionDown && !playerIsFloor) {
    playerBody.velocity.y = -5.5;
    return;
  } else if (directionLeft && !playerIsFloor) {
    if (currentLane == 1) {
      playerBody.position.x = -1;
      currentLane--;
      return;
    }
    if (currentLane == 2) {
      playerBody.position.x = 0;
      currentLane--;
      return;
    }
  } else if (directionRight && !playerIsFloor) {
    if (currentLane == 0) {
      playerBody.position.x = 0;
      currentLane++;
      return;
    }
    if (currentLane == 1) {
      playerBody.position.x = 1;
      currentLane++;
      return;
    }
  } else {
    return;
  }
}

export const randomLanePosition = () => {
  const randomIndex = Math.floor(Math.random() * lanePositions.length);
  return lanePositions[randomIndex];
};

export const moveObstacles = (arr, speed, maxZ, camera, itsCoin) => {
  arr.forEach((el) => {
    el.body.position.z += speed;
    if (el.body.position.z > camera.position.z) {
      el.body.position.x = randomLanePosition();
      el.body.position.z = maxZ;
    }
    el.mesh.position.copy(el.body.position);

    if (itsCoin) {
      el.mesh.rotation.y += 0.02;
      return;
    }

    el.mesh.quaternion.copy(el.body.quaternion);
  });
};

export const resetObstacles = (arr, maxZ) => {
  arr.forEach((el) => {
    el.body.position.x = randomLanePosition();
    el.body.position.z = maxZ;
    el.body.velocity.set(0, 0, 0);
    el.mesh.position.copy(el.body.position);
    el.mesh.quaternion.copy(el.body.quaternion);
  });
};
