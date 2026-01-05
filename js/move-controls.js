AFRAME.registerComponent('stick-move', {
  schema: {
    speed: { type: 'number', default: 3 }
  },

  init: function () {
    this.direction = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.tmpMove = new THREE.Vector3();
  },

  tick: function (time, delta) {
    const rig = this.el;
    const head = rig.querySelector('#head');
    if (!head) return;

    const dt = delta / 1000;
    let x = 0;
    let y = 0;

    // Read gamepad axes (Quest controllers expose left thumbstick here)
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    gamepads.forEach(gp => {
      if (!gp || !gp.axes || gp.axes.length < 4) return;
      // axes[2] = X, axes[3] = Y for left stick on most WebXR gamepads
      x = gp.axes[2];
      y = gp.axes[3];
    });

    // Dead zone to avoid drift
    if (Math.abs(x) < 0.15) x = 0;
    if (Math.abs(y) < 0.15) y = 0;
    if (x === 0 && y === 0) return;

    // Forward direction based on where the head is looking
    head.object3D.getWorldDirection(this.direction);
    this.direction.y = 0;
    this.direction.normalize();

    // Right vector
    this.right.crossVectors(this.direction, new THREE.Vector3(0, 1, 0)).normalize();

    this.tmpMove.set(0, 0, 0);
    this.tmpMove.addScaledVector(this.direction, -y * this.data.speed * dt);
    this.tmpMove.addScaledVector(this.right, -x * this.data.speed * dt);

    rig.object3D.position.add(this.tmpMove);
  }
});
