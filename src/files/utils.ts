function randomId() {
  var id = "";
  var letters =
    "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ1234567890";

  for (var i = 0; i < 10; i++) {
    id += letters[Math.floor(Math.random() * letters.length)];
  }
  return id;
}

function twoPointDistance(from: Point, to: Point): Point {
  return new Point(to.x - from.x, to.y - from.y);
}

enum BlockTypes {
  circle,
  rectangle,
  textBox,
}

export class Grid {
  pixel: number;
  canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement, { pixel = 50 } = {}) {
    this.pixel = pixel;
    this.canvas = canvas;
  }

  draw(ctx: CanvasRenderingContext2D, zoom: number, panOffset: Point) {
    const cWidth = this.canvas.width * zoom;
    const cHeight = this.canvas.height * zoom;
    for (var col = 0; col < Math.floor(cWidth / this.pixel); col++) {
      ctx.beginPath();
      ctx.moveTo(col * this.pixel - panOffset.x, -panOffset.y);
      ctx.lineTo(col * this.pixel - panOffset.x, cHeight);
      ctx.lineWidth = col % 5 ? 0.1 : 0.2;
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
    for (var row = 0; row < Math.floor(cHeight / this.pixel); row++) {
      ctx.beginPath();
      ctx.moveTo(-panOffset.x, row * this.pixel - panOffset.y);
      ctx.lineTo(cWidth, row * this.pixel - panOffset.y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = row % 5 ? 0.1 : 0.2;
      ctx.stroke();
    }
  }
}

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return "location is " + this.x + ", " + this.y;
  }
}

interface EdgePointProps {
  location: Point;
  controlPoint: Point;
}
interface EdgePoint {
  top: EdgePointProps;
  bottom: EdgePointProps;
  left: EdgePointProps;
  right: EdgePointProps;
}

export class Block {
  width = 180;
  height = 70;
  text = "Block";
  type: BlockTypes;
  id: string;
  radius: number = 10;
  position: Point;
  offset = new Point(0, 0);
  hovering: boolean = false;
  selected: boolean = false;
  strokeWidth: number = 1;
  edgePoints: EdgePoint;
  selectedEdgePoint: Point | null = null;

  constructor(position: Point, { type = BlockTypes.rectangle } = {}) {
    this.id = randomId();
    if (type == BlockTypes.circle) {
      this.width = this.height;
      this.radius = this.width / 2;
    }
    if (type == BlockTypes.textBox) {
      this.strokeWidth = 0.5;
      this.text = "type here";
    }
    this.position = new Point(
      position.x - this.width / 2,
      position.y - this.height / 2
    );
    this.type = type;
    this.edgePoints = {
      top: { location: this.position, controlPoint: this.position },
      bottom: { location: this.position, controlPoint: this.position },
      left: { location: this.position, controlPoint: this.position },
      right: { location: this.position, controlPoint: this.position },
    };

    this.getEdgePoint();
  }

  getEdgePoint(): EdgePoint {
    this.edgePoints.top = {
      location: new Point(this.position.x + this.width / 2, this.position.y),
      controlPoint: new Point(
        this.position.x + this.width / 2,
        this.position.y - this.height
      ),
    };
    this.edgePoints.bottom = {
      location: new Point(
        this.position.x + this.width / 2,
        this.position.y + this.height
      ),
      controlPoint: new Point(
        this.position.x + this.width / 2,
        this.position.y + this.height * 2
      ),
    };
    this.edgePoints.right = {
      location: new Point(
        this.position.x + this.width,
        this.position.y + this.height / 2
      ),
      controlPoint: new Point(
        this.position.x + this.width * 2,
        this.position.y + this.height / 2
      ),
    };
    this.edgePoints.left = {
      location: new Point(this.position.x, this.position.y + this.height / 2),
      controlPoint: new Point(
        this.position.x - this.width,
        this.position.y + this.height / 2
      ),
    };
    return this.edgePoints;
  }

  isPresentInLocation(location: Point): boolean {
    return (
      location.x > this.position.x &&
      location.x < this.position.x + this.width &&
      location.y > this.position.y &&
      location.y < this.position.y + this.height
    );
  }

  updateLocation(location: Point) {
    this.position = location;
  }

  handleLetter(letter: string) {
    if (letter == "Backspace") {
      this.text = this.text.slice(0, this.text.length - 1);
      return;
    }
    if (
      ["Control", "Alt", "Shift", "Tab", "CapsLock", "Delete"].includes(letter)
    )
      return;
    if (letter == "Enter") {
      this.text += "\n";
      return;
    }
    if (this.text.length < 30) this.text += letter;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.selected) ctx.strokeStyle = "#E0218A";
    else if (this.hovering) ctx.strokeStyle = "pink";
    else ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.lineWidth = this.strokeWidth;
    if (this.type != BlockTypes.textBox) {
      ctx.roundRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height,
        this.radius
      );
    }
    ctx.font = "normal 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.selected ? "#E0218A" : "white";
    ctx.stroke();
    ctx.fillText(
      this.text,
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );

    if (this.hovering || this.selected) {
      if (this.type == BlockTypes.textBox) {
        ctx.beginPath();
        ctx.roundRect(
          this.position.x,
          this.position.y,
          this.width,
          this.height,
          this.radius
        );
        ctx.stroke();
      } else
        for (const edge of Object.values(this.getEdgePoint())) {
          ctx.beginPath();
          ctx.fillStyle = "white";
          ctx.arc(edge.location.x, edge.location.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
    }

    if (this.selectedEdgePoint) {
      ctx.fillStyle = "white";
      ctx.arc(
        this.selectedEdgePoint.x,
        this.selectedEdgePoint.y,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

class Tool {
  type: string;
  cursor: string;

  constructor(type: string, cursor: string) {
    this.type = type;
    this.cursor = cursor;
  }
}

class Edge {
  from: Block;
  to: Block;
  id: string;
  headlen = 10;
  constructor(from: Block, to: Block) {
    this.from = from;
    this.to = to;
    this.id = this.from.id + "_" + this.to.id;
  }

  getNearestEdge(): EdgePointProps[] {
    var nearestDistance = 999999999;
    var edges: EdgePointProps[] = [];
    for (const ef of Object.values(this.from.edgePoints)) {
      for (const et of Object.values(this.to.edgePoints)) {
        const dist =
          Math.abs(ef.location.x - et.location.x) +
          Math.abs(ef.location.y - et.location.y);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          edges = [ef, et];
        }
      }
    }
    return edges;
  }

  isThisEdge(edge: Edge) {
    return edge.id === this.id;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const edges = this.getNearestEdge();
    ctx.beginPath();
    ctx.strokeStyle = "pink";
    ctx.moveTo(edges[0].location.x, edges[0].location.y);
    ctx.bezierCurveTo(
      edges[0].controlPoint.x,
      edges[0].controlPoint.y,
      edges[1].controlPoint.x,
      edges[1].controlPoint.y,
      edges[1].location.x,
      edges[1].location.y
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = "#E0218A";
    ctx.moveTo(edges[1].location.x, edges[1].location.y);
    ctx.arc(edges[1].location.x, edges[1].location.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class Board {
  blocks: Block[] = [];
  edges: Edge[] = [];
  grid: Grid;
  cursor: string = "pointer";
  zoomLevel: number = 1;
  dragging = false;
  cHeight: number = 0;
  cWidth: number = 0;
  panning = false;
  panLastLocation = new Point(0, 0);
  panOffset = new Point(0, 0);
  selectedBox: Block | null = null;
  hoverBlock: Block | null = null;
  hovering: boolean = true;
  mouseLocation: Point = new Point(0, 0);
  keyboard = new Map();
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.setupCanvas();
    this.grid = new Grid(this.canvas);
    this.initListeners();
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth - 20;
    this.canvas.height = window.innerHeight - 20;
    this.canvas.style.cursor = this.cursor;
    this.cWidth = this.canvas.width;
    this.cHeight = this.canvas.height;
  }

  initListeners() {
    this.canvas.addEventListener("click", this.handleMouseClick.bind(this));
    this.canvas.addEventListener("wheel", this.handleMouseWheel.bind(this));
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.canvas.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleMouseWheel(event: WheelEvent) {
    event.preventDefault();
    const dir = Math.sign(event.deltaY);
    const step = 0.1;
    this.zoomLevel += dir * step;
    this.zoomLevel = Math.max(1, Math.min(3, this.zoomLevel));
    this.draw();
  }

  handleMouseDown(event: MouseEvent) {
    if (this.keyboard.get(" ")) {
      this.canvas.style.cursor = "grabbing";
      this.panLastLocation = this.getMouseLocation(
        event.offsetX,
        event.offsetY
      );
      this.panning = true;
    } else if (this.hoverBlock) {
      this.dragging = true;
      const mouseLocation = this.getMouseLocation(event.offsetX, event.offsetY);
      this.hoverBlock.offset = new Point(
        mouseLocation.x - this.hoverBlock.position.x,
        mouseLocation.y - this.hoverBlock.position.y
      );
    }
  }
  handleMouseUp(event: MouseEvent) {
    if (this.panning) {
      this.canvas.style.cursor = "grab";
      this.panning = false;
    } else if (this.dragging) {
      this.dragging = false;
    } else if (this.hoverBlock) {
      this.hoverBlock.offset = new Point(0, 0);
    }
  }

  getMouseLocation(x: number, y: number) {
    return new Point(
      x * this.zoomLevel - this.panOffset.x,
      y * this.zoomLevel - this.panOffset.y
    );
  }

  handleMouseMove(event: MouseEvent) {
    this.mouseLocation = this.getMouseLocation(event.offsetX, event.offsetY);

    if (this.panning) {
      const newoffset = twoPointDistance(
        this.panLastLocation,
        this.mouseLocation
      );
      this.panOffset = new Point(
        this.panOffset.x + newoffset.x,
        this.panOffset.y + newoffset.y
      );
      this.draw();
    } else if (this.hovering && !this.dragging) {
      var tempblock;
      for (let block of this.blocks) {
        block.hovering = block.isPresentInLocation(this.mouseLocation);
        if (block.hovering) {
          this.hoverBlock = block;
          tempblock = block;
          this.draw();
          break;
        }
      }
      if (!tempblock) this.hoverBlock = null;
    } else if (this.dragging && this.hoverBlock) {
      this.hoverBlock.updateLocation(
        new Point(
          this.mouseLocation.x - this.hoverBlock.offset.x,
          this.mouseLocation.y - this.hoverBlock.offset.y
        )
      );
      this.draw();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    this.keyboard.set(event.key, true);
    event.preventDefault();
    // check for ctrl space
    const deleteButton = this.keyboard.get("Delete");
    console.log(deleteButton);
    if (deleteButton) {
      if (this.selectedBox) {
        console.log("sdfsfsd");
        this.removeBlock(this.selectedBox);
        return;
      }
    }
    if (this.selectedBox) {
      return;
    }

    const ctrl = this.keyboard.get("Control");
    const space = this.keyboard.get(" ");

    if (ctrl && space) {
    } else if (space) {
      if (!["grab", "grabbing"].includes(this.canvas.style.cursor))
        this.canvas.style.cursor = "grab";
    }

    const skey = this.keyboard.get("s");
    if (ctrl && skey) {
      if (this.blockExistOnLocation(this.mouseLocation)) {
        return;
      }
      const block = new Block(this.mouseLocation, { type: BlockTypes.textBox });
      this.blocks.push(block);
      this.draw();
      this.draw();
    }

    const ckey = this.keyboard.get("c");
    if (ctrl && ckey) {
      if (this.blockExistOnLocation(this.mouseLocation)) {
        return;
      }
      const block = new Block(this.mouseLocation, { type: BlockTypes.circle });
      this.blocks.push(block);
      this.draw();
    }

    const bkey = this.keyboard.get("b");

    if (ctrl && bkey) {
      if (this.blockExistOnLocation(this.mouseLocation)) {
        return;
      }
      const block = new Block(this.mouseLocation);
      this.blocks.push(block);
      this.draw();
    }
  }
  handleKeyUp(event: KeyboardEvent) {
    if (this.selectedBox) {
      this.selectedBox.handleLetter(event.key);
      this.draw();
    }
    if (event.key == " ") {
      this.canvas.style.cursor = "pointer";
    }
    this.keyboard.set(event.key, false);
  }

  isThisEdgeExist(from: Block, to: Block) {
    const edgeId = from.id + "_" + to.id;
    for (const edge of this.edges) {
      if (edge.id == edgeId) return true;
    }
    return false;
  }

  removeBlock(block: Block) {
    this.edges = this.edges.filter((edge) => !edge.id.includes(block.id));
    this.blocks = this.blocks.filter((blck) => blck.id != block.id);
    this.selectedBox = null;
    this.hoverBlock = null;
    this.draw();
  }

  addEdges(from: Block, to: Block) {
    if (from == to) return;
    if ([from.type, to.type].includes(BlockTypes.textBox)) return;
    if (this.isThisEdgeExist(from, to)) return;
    this.edges.push(new Edge(from, to));
  }

  handleMouseClick(event: MouseEvent) {
    console.log(
      event.offsetX,
      event.offsetY,
      this.getMouseLocation(event.offsetX, event.offsetY),
      this.panOffset
    );
    if (this.hoverBlock) {
      if (this.selectedBox) {
        this.selectedBox.selected = false;
        this.addEdges(this.selectedBox, this.hoverBlock);
      }
      this.selectedBox = this.hoverBlock;
      this.selectedBox.selected = true;
    } else {
      if (this.selectedBox) {
        this.selectedBox.selected = false;
      }
      this.selectedBox = null;
      this.draw();
    }
  }

  blockExistOnLocation(location: Point): boolean {
    return (
      this.blocks.find((block) => block.isPresentInLocation(location)) !=
      undefined
    );
  }

  draw() {
    console.log("draw");
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#131313";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.scale(1 / this.zoomLevel, 1 / this.zoomLevel);
    this.ctx.translate(this.panOffset.x, this.panOffset.y);
    // this.grid.draw(this.ctx, this.zoomLevel, this.panOffset);
    for (const block of this.blocks) {
      block.draw(this.ctx);
    }
    for (const edge of this.edges) {
      edge.draw(this.ctx);
    }
  }
}
