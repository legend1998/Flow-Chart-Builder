import { Point } from "./utils";

export class Block {
  width = 200;
  height = 80;
  text = "block";
  position: Point;
  offset = new Point(0, 0);
  hovering: boolean = false;
  selected: boolean = false;
  strokeWidth: number = 1;

  constructor(position: Point) {
    this.position = new Point(
      position.x - this.width / 2,
      position.y - this.height / 2
    );
  }

  isPresentInLocation(location: Point): boolean {
    return (
      location.x > this.position.x &&
      location.x < this.position.x + this.width &&
      location.y > this.position.y &&
      location.y < this.position.y + this.height
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.hovering) ctx.strokeStyle = "#E0218A";
    else ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.lineWidth = this.strokeWidth;
    ctx.roundRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      10
    );
    ctx.font = "12px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.stroke();
    ctx.fillText(
      this.text,
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }
}
