const menuButton = document.querySelector(".menu-button");
const menuPanel = document.querySelector(".menu-panel");
const menuClose = document.querySelector(".menu-close");

function setMenu(open) {
  menuPanel?.classList.toggle("is-open", open);
  menuPanel?.setAttribute("aria-hidden", String(!open));
  menuButton?.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}

menuButton?.addEventListener("click", () => setMenu(true));
menuClose?.addEventListener("click", () => setMenu(false));
menuPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });

const progress = document.querySelector(".page-progress span");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? window.scrollY / max : 0;
  progress?.style.setProperty("transform", `scaleX(${value})`);
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.06, rootMargin: "0px 0px -6%" });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const canvas = document.querySelector("#hero-canvas");
const context = canvas?.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

const shapes = [
  { type: "cross", x: .12, y: .30, size: 112, color: "#173ee8", depth: .9, spin: .13 },
  { type: "ring", x: .32, y: .18, size: 105, color: "#f2f2f0", depth: .6, spin: -.08 },
  { type: "sphere", x: .53, y: .24, size: 88, color: "#173ee8", depth: .8, spin: .05 },
  { type: "cross", x: .76, y: .19, size: 138, color: "#15161c", depth: .5, spin: -.1 },
  { type: "ring", x: .91, y: .38, size: 92, color: "#173ee8", depth: .75, spin: .1 },
  { type: "sphere", x: .18, y: .67, size: 118, color: "#dedfe6", depth: .45, spin: -.04 },
  { type: "cross", x: .42, y: .61, size: 158, color: "#14151b", depth: .95, spin: .08 },
  { type: "ring", x: .67, y: .66, size: 125, color: "#173ee8", depth: .7, spin: -.12 },
  { type: "cross", x: .88, y: .74, size: 110, color: "#dedfe6", depth: .4, spin: .06 },
  { type: "sphere", x: .58, y: .88, size: 82, color: "#f1f1ef", depth: .55, spin: .07 },
  { type: "ring", x: .06, y: .92, size: 100, color: "#15161c", depth: .65, spin: -.06 }
];

function resizeCanvas() {
  if (!canvas || !context) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function roundedRect(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(color, amount) {
  const value = color.replace("#", "");
  const number = parseInt(value, 16);
  const r = Math.max(0, Math.min(255, (number >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((number >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (number & 255) + amount));
  return `rgb(${r},${g},${b})`;
}

function drawSphere(ctx, size, color) {
  const gradient = ctx.createRadialGradient(-size * .22, -size * .27, size * .04, 0, 0, size * .55);
  gradient.addColorStop(0, shade(color, 95));
  gradient.addColorStop(.34, color);
  gradient.addColorStop(1, shade(color, -85));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.beginPath();
  ctx.ellipse(-size * .16, -size * .19, size * .08, size * .035, -.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawRing(ctx, size, color) {
  ctx.lineWidth = size * .22;
  const gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
  gradient.addColorStop(0, shade(color, 100));
  gradient.addColorStop(.48, color);
  gradient.addColorStop(1, shade(color, -90));
  ctx.strokeStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size * .35, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCross(ctx, size, color) {
  const gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
  gradient.addColorStop(0, shade(color, 85));
  gradient.addColorStop(.45, color);
  gradient.addColorStop(1, shade(color, -80));
  ctx.fillStyle = gradient;
  roundedRect(ctx, -size * .16, -size * .5, size * .32, size, size * .13);
  ctx.fill();
  roundedRect(ctx, -size * .5, -size * .16, size, size * .32, size * .13);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.32)";
  roundedRect(ctx, -size * .08, -size * .43, size * .07, size * .58, size * .03);
  ctx.fill();
}

function render(time = 0) {
  if (!context || !canvas) return;
  pointerX += (targetX - pointerX) * .045;
  pointerY += (targetY - pointerY) * .045;
  context.clearRect(0, 0, width, height);
  const background = context.createRadialGradient(width * .5, height * .45, 10, width * .5, height * .5, Math.max(width, height));
  background.addColorStop(0, "#161923");
  background.addColorStop(.62, "#0a0c12");
  background.addColorStop(1, "#050609");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  shapes.forEach((shape, index) => {
    const scale = Math.min(width / 1180, 1);
    const size = shape.size * Math.max(.68, scale);
    const drift = reduceMotion ? 0 : Math.sin(time * .00055 + index * 1.7) * 12;
    const x = shape.x * width + pointerX * shape.depth * 18;
    const y = shape.y * height + pointerY * shape.depth * 14 + drift;
    context.save();
    context.translate(x, y);
    context.rotate(time * .0001 * shape.spin * 10 + index * .48);
    context.shadowColor = "rgba(0,0,0,.5)";
    context.shadowBlur = 24;
    context.shadowOffsetY = 18;
    if (shape.type === "sphere") drawSphere(context, size, shape.color);
    if (shape.type === "ring") drawRing(context, size, shape.color);
    if (shape.type === "cross") drawCross(context, size, shape.color);
    context.restore();
  });

  if (!reduceMotion) requestAnimationFrame(render);
}

canvas?.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  targetX = (event.clientX - rect.left) / rect.width - .5;
  targetY = (event.clientY - rect.top) / rect.height - .5;
});
canvas?.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
render();
