import Matter from "matter-js";
import type { Crumb } from "./state";
const { Engine, Bodies, Body, Composite } = Matter;
export const constants = {
  gravity: 0.65,
  restitution: 0.52,
  friction: 0.12,
  spring: 0.48,
};
export class Crumbs {
  engine = Engine.create({ enableSleeping: true });
  bodies: { body: Matter.Body; data: Crumb }[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  floor!: Matter.Body;
  raf = 0;
  last = 0;
  changed = false;
  targets?: { x: number; y: number }[];
  reduced: boolean;
  width = innerWidth;
  height = innerHeight;
  ghost: { x: number; y: number; size: number; expires: number }[] = [];
  constructor(canvas: HTMLCanvasElement, initial: Crumb[], reduced: boolean) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.reduced = reduced;
    this.engine.gravity.y = constants.gravity;
    this.resize();
    initial.forEach((c) => this.add(c, false));
    if (!reduced) this.raf = requestAnimationFrame(this.frame);
    addEventListener("resize", () => this.resize());
    document.addEventListener("visibilitychange", () => {
      this.last = 0;
    });
  }
  resize() {
    this.width = innerWidth;
    this.height = innerHeight;
    const d = Math.min(devicePixelRatio, 2);
    this.canvas.width = this.width * d;
    this.canvas.height = this.height * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    if (this.floor) Composite.remove(this.engine.world, this.floor);
    this.floor = Bodies.rectangle(
      this.width / 2,
      this.height - 3,
      this.width * 4,
      30,
      { isStatic: true },
    );
    Composite.add(this.engine.world, this.floor);
    this.bodies.forEach(({ body }) =>
      Body.setPosition(body, {
        x: Math.min(this.width - 10, Math.max(10, body.position.x)),
        y: Math.min(this.height - 20, body.position.y),
      }),
    );
  }
  add(data: Crumb, burst = true) {
    if (this.bodies.length >= 400) {
      const old = this.bodies.shift();
      if (old) Composite.remove(this.engine.world, old.body);
    }
    const body = Bodies.polygon(
      data.x * this.width,
      data.y * this.height,
      3,
      data.size,
      {
        restitution: constants.restitution,
        friction: constants.friction,
        angle: data.angle,
      },
    );
    Composite.add(this.engine.world, body);
    this.bodies.push({ body, data });
    if (burst && !this.reduced)
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 14,
        y: -4 - Math.random() * 9,
      });
    this.changed = true;
  }
  burst(
    x: number,
    y: number,
    section: string,
    count = 16,
    dark = false,
    stale = false,
  ) {
    for (let i = 0; i < count; i++)
      this.add({
        x: x / this.width,
        y: y / this.height,
        size: (stale ? 2 : 3) + Math.random() * (stale ? 3 : 6),
        angle: Math.random() * 6,
        section,
        dark,
      });
  }
  snapshot() {
    return this.bodies.map(({ body, data }) => ({
      ...data,
      x: Math.max(0, Math.min(1, body.position.x / this.width)),
      y: Math.max(0, Math.min(1, body.position.y / this.height)),
      angle: body.angle,
    }));
  }
  shake() {
    this.bodies.forEach(({ body }) =>
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: -2 - Math.random() * 4,
      }),
    );
  }
  sweep() {
    this.bodies.forEach(({ body }) =>
      Composite.remove(this.engine.world, body),
    );
    this.bodies = [];
    this.changed = true;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  pick(x: number, y: number) {
    return this.bodies.find(
      ({ body, data }) =>
        Math.hypot(body.position.x - x, body.position.y - y) <
        Math.max(15, data.size * 2),
    );
  }
  formText(text: string) {
    if (this.reduced) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 60;
    const c = canvas.getContext("2d")!;
    c.font = "bold 34px system-ui";
    c.fillText(text, 0, 40);
    const pixels = c.getImageData(0, 0, 640, 60).data;
    const points: { x: number; y: number }[] = [];
    const width = Math.min(600, this.width - 40);
    for (let y = 0; y < 60; y += 5)
      for (let x = 0; x < 640; x += 5)
        if (pixels[(y * 640 + x) * 4 + 3] > 128)
          points.push({
            x: 20 + (x / 640) * width,
            y: this.height - 105 + y * 0.7,
          });
    this.targets = points;
    while (this.bodies.length < Math.min(400, points.length))
      this.add(
        { x: Math.random(), y: 0.95, size: 2, angle: 0, section: "plate" },
        false,
      );
  }
  releaseText() {
    this.targets = undefined;
    this.shake();
  }
  frame = (time: number) => {
    this.raf = requestAnimationFrame(this.frame);
    if (document.hidden || (!this.bodies.length && !this.ghost.length)) return;
    const delta = this.last ? Math.min(time - this.last, 32) : 16;
    this.last = time;
    Engine.update(this.engine, delta);
    if (this.targets?.length)
      this.bodies.forEach(({ body }, i) => {
        const target = this.targets![i % this.targets!.length];
        Body.setVelocity(body, {
          x: (target.x - body.position.x) * 0.12,
          y: (target.y - body.position.y) * 0.12,
        });
      });
    const c = this.ctx;
    c.clearRect(0, 0, this.width, this.height);
    for (const { body, data } of this.bodies) {
      if (body.position.x < 5 || body.position.x > this.width - 5) {
        Body.setPosition(body, {
          x: Math.max(5, Math.min(this.width - 5, body.position.x)),
          y: body.position.y,
        });
        Body.setVelocity(body, {
          x: -body.velocity.x * 0.6,
          y: body.velocity.y,
        });
      }
      c.fillStyle = data.dark ? "#9d174d" : "#EC4899";
      c.beginPath();
      body.vertices.forEach((p, i) =>
        i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y),
      );
      c.closePath();
      c.fill();
    }
    this.ghost = this.ghost.filter((g) => g.expires > time);
    c.globalAlpha = 0.15;
    this.ghost.forEach((g) => {
      c.fillRect(g.x * this.width, this.height - 22 - g.y * 35, g.size, g.size);
    });
    c.globalAlpha = 1;
  };
}
