const lanePositions = [-1, 0, 1];

export const randomLanePosition = () => {
  const randomIndex = Math.floor(Math.random() * lanePositions.length);
  return lanePositions[randomIndex];
};

export const randomRangeNum = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const moveObstacles = (arr, speed, maxZ, minZ, camera) => {
  arr.forEach((el) => {
    el.body.position.z += speed;
    if (el.body.position.z > camera.position.z) {
      el.body.position.x = randomLanePosition();
      el.body.position.z = randomRangeNum(maxZ, minZ);
    }
    el.mesh.position.copy(el.body.position);
    el.mesh.quaternion.copy(el.body.quaternion);
  });
};

export const resetObstacles = (arr, maxZ, minZ) => {
  arr.forEach((el) => {
    el.body.position.x = randomLanePosition();
    el.body.position.z = randomRangeNum(maxZ, minZ);
    el.body.velocity.set(0, 0, 0);
    el.mesh.position.copy(el.body.position);
    el.mesh.quaternion.copy(el.body.quaternion);
  });
};
