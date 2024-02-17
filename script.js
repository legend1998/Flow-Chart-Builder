var canvas = document.getElementById("canvas");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

// listners

canvas.addEventListener("click", handleMouseClick);

// handler functions
function handleMouseClick(event) {
  if (event.button == 1) {
    // left mouse button cliked
  }
}

// Defs

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Block {
  constructor({ context, point, width = 200, height = 100 } = {}) {
    this.height = height;
    this.width = width;
    this.position = point;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = context;
  }
  draw() {
    this.ctx.strokeRect();
  }
}

/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext("2d");
let grid = new Grid(canvas);

function init() {
  console.log("updating");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  grid.draw();
  requestAnimationFrame(init);
}

init();
