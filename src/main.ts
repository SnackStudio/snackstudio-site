import "./style.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { read, save, fresh, today, valid, sections, type Bite } from "./state";
import { Crumbs, constants } from "./physics";
import { Sound } from "./audio";

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const app = document.querySelector<HTMLDivElement>("#app")!;
let state = read(),
  active = "studio",
  soft = false,
  baking = false,
  bakeTimer: ReturnType<typeof setInterval> | undefined;
const sound = new Sound();
let visitToken = "";
try {
  visitToken = sessionStorage.getItem("pantry-visit") || crypto.randomUUID();
  sessionStorage.setItem("pantry-visit", visitToken);
} catch {
  visitToken = crypto.randomUUID();
}
const $ = <T extends Element = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
const labels: Record<string, string> = {
  studio: "Studio",
  work: "Work",
  method: "Method",
  pantry: "Writing",
  plate: "Contact",
};
const path = location.pathname.replace(/\/$/, "") || "/";
const logo = `<a class="brand" href="/" aria-label="SnackStudio home"><img src="/brand/web/bitten-solid-small.webp" alt="" width="34" height="34">snackstudio</a>`;
const header = `<a class="skip" href="#main">Skip to content</a><header class="topbar">${logo}<div class="location label"><i></i>Independent studio · Spokane, WA</div><nav class="topnav" aria-label="Main"><a href="/#work">Work</a><a href="/#method">Method</a><a href="/#pantry">Writing</a><a class="contact-link" href="mailto:hi@zachshallbetter.com">Let’s talk <span aria-hidden="true">↗</span></a></nav></header>`;
const nav = `<nav class="crumb-nav" aria-label="Crumb navigation">${sections.map((s) => `<a href="/#${s}" data-section="${s}" class="${s === "studio" ? "active" : ""}" aria-label="${labels[s]}">${labels[s]}</a>`).join("")}</nav>`;
const biteMask = () =>
  state.bites
    .map((b) =>
      b.points
        ? `<polygon points="${b.points.map((p) => p.join(",")).join(" ")}" fill="black"/>`
        : `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="black"/>`,
    )
    .join("");
const cookie = `<div class="cookie-stage" id="cookie-stage"><div class="cookie-note">Go on. Take a bite.<span aria-hidden="true">⤵</span></div><svg id="cookie-svg" viewBox="0 0 1254 1254" role="img" aria-label="Your edible pink cookie"><defs><mask id="eaten-mask"><rect width="1254" height="1254" fill="white"/><g id="bite-shapes">${biteMask()}</g></mask><clipPath id="upper-half"><rect width="1254" height="628"/></clipPath><clipPath id="lower-half"><rect y="626" width="1254" height="628"/></clipPath><clipPath id="slice-clip"><rect id="slice-window" width="1254" height="1254"/></clipPath></defs><g id="whole-cookie" mask="url(#eaten-mask)" clip-path="url(#slice-clip)"><g class="cookie-upper"><image href="/brand/web/whole-solid.webp" width="1254" height="1254" clip-path="url(#upper-half)"/></g><g class="cookie-lower"><image href="/brand/web/whole-solid.webp" width="1254" height="1254" clip-path="url(#lower-half)"/></g></g><line id="cut-line" x1="60" x2="1194" y1="1254" y2="1254" stroke="#F472B6" stroke-width="9" opacity="0"/></svg><button class="cookie-hit" data-edible aria-label="Take a bite of the cookie. Six bites left."></button><div class="cookie-meta"><span class="bite-dots" aria-hidden="true"></span><span class="label" id="bite-count">6 bites left</span></div></div>`;
const heroText = ["Good things", "come in", "small bites."];
let letterIndex = 0;
const title = heroText
  .map(
    (line, i) =>
      `<span class="headline-line ${i === 2 ? "pink" : ""}">${[...line].map((c) => (c === " " ? '<span class="word-space" aria-hidden="true"> </span>' : `<button class="letter" data-edible data-letter="${letterIndex++}" aria-label="Bite letter ${c}">${c}</button>`)).join("")}</span>`,
  )
  .join("<br>");
function home() {
  app.innerHTML = /* HTML */ `${header}
    <main id="main">
      <section class="hero" id="studio">
        <div class="hero-copy">
          <div class="eyebrow">A product & engineering studio</div>
          <h1 aria-label="Good things come in small bites.">${title}</h1>
          <p class="hero-description">
            Computational interaction.<br />Applied AI. A healthy appetite<br />for
            making things work.
          </p>
        </div>
        ${cookie}
        <div class="hero-footer">
          <a href="#work" class="scroll-cue"
            ><span aria-hidden="true">↓</span
            ><span>Scroll to take it apart</span></a
          >
        </div>
      </section>
      <section class="section" id="work">
        <div class="section-inner">
          <span class="section-number label">01 / Fresh from the oven</span>
          <h2 class="sticker" tabindex="0" data-edible>Selected work.</h2>
          <p>Pull something apart.<br />See what went into it.</p>
          <div class="sheet" aria-label="Work sticker sheet">
            ${["Product", "Interaction", "Applied AI"].map((name, i) => `<button class="work-tile" data-work="${i}" data-edible aria-expanded="false"><span class="index">0${i + 1} / ${name}</span><strong>Case study coming from WORK.md</strong><span class="tear" aria-hidden="true">↗</span></button>`).join("")}
            <div class="sheet-backing" hidden>
              SnackStudio · Zach Shallbetter<br />Spokane, WA<br /><span
                class="missing"
                >Street address not supplied.</span
              >
            </div>
          </div>
          <p class="missing">
            WORK.md was not supplied. Project names, outcomes, and case studies
            are awaiting the source file.
          </p>
        </div>
      </section>
      <section class="section" id="method">
        <div class="section-inner">
          <span class="section-number label">02 / What goes into it</span>
          <h2 class="sticker" tabindex="0" data-edible>Ask the studio.</h2>
          <p>One question at a time.<br />Only answers we can stand behind.</p>
          <form class="ask-form">
            <label class="sr-only" for="question">Ask about SnackStudio</label
            ><input
              id="question"
              maxlength="300"
              autocomplete="off"
              placeholder="What do you make?"
              required
            /><button aria-label="Ask question" type="submit">↗</button>
          </form>
          <div class="answer" aria-live="polite">
            <p>
              Product and engineering, with a focus on computational interaction
              and applied AI.
            </p>
          </div>
          <div class="questions">
            <button data-question="Who is behind the studio?">
              Who’s in the kitchen?</button
            ><button data-question="Where are you based?">Where are you?</button
            ><button data-question="How do we work together?">
              Work together
            </button>
          </div>
        </div>
      </section>
      <section class="section pantry-section" id="pantry">
        <div class="section-inner">
          <span class="section-number label">03 / Something to chew on</span>
          <h2 class="sticker" tabindex="0" data-edible>The pantry.</h2>
          <p>Evidence. Structure. Authority.<br />Open a jar.</p>
          <div class="jars">
            ${["Evidence", "Structure", "Authority"].map((name, i) => `<button class="jar" data-jar="${name}" aria-expanded="${i === 0}" aria-controls="essay-card"><span class="jar-lid" aria-hidden="true"></span><span class="jar-name">${name}</span><img src="/brand/web/${i === 0 ? "bitten-outline" : "whole-outline"}-small.webp" width="58" loading="lazy" height="58" alt=""></button>`).join("")}
          </div>
          <div class="essay-card" id="essay-card" aria-live="polite">
            <span class="label">Evidence / The open jar</span>
            <p class="missing">
              ESSAYS.md was not supplied. Essays will appear here when the
              source file is available.
            </p>
          </div>
          <div class="weather">
            <span>Spokane, WA</span><span id="weather">Window closed</span>
          </div>
          <p class="missing" id="global-jar">
            Shared jar unavailable. Your cookie is saved on this device.
          </p>
        </div>
      </section>
      <section class="section plate-section" id="plate">
        <div class="section-inner">
          <span class="section-number label">04 / Save room</span>
          <h2 class="sticker" tabindex="0" data-edible>Got an appetite?</h2>
          <p>Bring a question.<br />We’ll put the coffee on.</p>
          <a class="contact" href="mailto:hi@zachshallbetter.com"
            >hi@zachshallbetter.com</a
          ><span class="label">Zach Shallbetter · Spokane, WA</span>
          <div
            class="coffee-ring"
            tabindex="0"
            title="Deployment date unavailable until published"
            aria-label="Deployment date unavailable until published"
          >
            Freshly<br />made.
          </div>
          <div class="plate-links">
            <a href="/kitchen">Inside the kitchen ↗</a
            ><span>© ${new Date().getFullYear()} SnackStudio</span>
          </div>
          <div class="crumb-list">
            ${sections.map((s) => `<a href="#${s}">${labels[s]}</a>`).join(" · ")}
          </div>
        </div>
      </section>
    </main>
    <footer class="toolbar">
      ${nav}
      <div class="tools">
        <button
          id="sound"
          aria-pressed="false"
          title="Sound uses a synthesized preview until commissioned recordings arrive"
        >
          ◌ Sound off</button
        ><button id="mouth" title="Use your camera to bite">◡ Your bite</button
        ><button id="sweep" title="Sweep crumbs and start fresh">⌁ Sweep</button
        ><button id="share" class="share">Share a bite ↗</button>
      </div>
    </footer>
    <div class="milk" aria-hidden="true">
      <span class="label">A little milk.</span>
    </div>
    <dialog id="camera-dialog" aria-labelledby="camera-title">
      <h2 id="camera-title">Bring your own bite.</h2>
      <p>
        Your camera stays in your browser. Open and close your mouth to take a
        bite. Jaw landmarks shape the mark; they do not measure a real cookie’s
        edge.
      </p>
      <div class="proof">
        Frames uploaded: 0<br />Processing: on this device<br />Saved: bite
        outline only, on this device
      </div>
      <p class="missing">Camera stops when you close it or leave the tab.</p>
      <div class="actions">
        <button class="primary" id="start-camera">Open camera</button
        ><button id="cancel-camera">Keep clicking</button>
      </div>
      <p id="camera-status" role="status"></p>
    </dialog>`;
}
function kitchen() {
  app.innerHTML = /* HTML */ `${header}
    <main class="kitchen" id="main">
      <div class="eyebrow">SnackStudio / The kitchen is open</div>
      <h1>Nothing up<br />our sleeves.</h1>
      <p class="kitchen-intro">
        One cookie is the interface. Scroll cuts it. A click bites it. What
        falls off becomes the navigation. This is where you can turn the knobs.
      </p>
      <div class="kitchen-grid">
        <section class="kitchen-card">
          <span class="label">01 / Tune the spring</span>
          <h2>A little give.</h2>
          <label
            >Duration
            <input
              id="spring"
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value="0.48"
            /><output id="spring-value">0.48s</output></label
          ><label
            >Overshoot
            <input
              id="overshoot"
              type="range"
              min="1"
              max="4"
              step="0.1"
              value="1.7"
          /></label>
          <div class="spring-demo">
            <img
              src="/brand/web/whole-solid.webp"
              alt="Cookie spring preview"
              width="80"
              height="80"
            />
          </div>
          <button class="pill" id="test-spring">Give it a nudge ↗</button>
        </section>
        <section class="kitchen-card">
          <span class="label">02 / Crumb physics</span>
          <h2>Let it fall.</h2>
          <label
            >Gravity
            <input
              id="gravity"
              type="range"
              min="0"
              max="2"
              step="0.05"
              value="0.65"
            /><output id="gravity-value">0.65</output></label
          ><label
            >Bounce
            <input
              id="bounce"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value="0.52"
            /><output id="bounce-value">0.52</output></label
          ><label
            >Friction
            <input
              id="friction"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value="0.12"
            /><output id="friction-value">0.12</output></label
          ><button class="pill" id="drop-crumbs">Drop a handful ↗</button>
        </section>
      </div>
      <section style="margin-top:65px">
        <span class="label">Build notes / An honest record</span>
        <h2 style="font-size:40px;letter-spacing:-.04em">
          A cookie, taken seriously.
        </h2>
        <p class="kitchen-intro">
          The supplied cookie marks anchor the whole interaction. The page
          starts readable. Animation adds texture without deciding who can use
          it. Motion preferences, keyboard input, and offline use are part of
          the same experience.
        </p>
        <details open>
          <summary>What your device remembers</summary>
          <p>
            Bites, the headline you leave, and up to 400 crumbs live in browser
            storage. All open tabs share them. Sweep clears that cookie. Camera
            frames are never stored or uploaded.
          </p>
        </details>
        <details>
          <summary>Where the illusion ends</summary>
          <p>
            A jaw landmark model gives us an expressive bite shape. It cannot
            identify the edge of a real cookie. Sound is currently synthesized,
            not a commissioned recording. Worldwide activity is shown only when
            the shared pantry service is configured.
          </p>
        </details>
        <details>
          <summary>Failed versions</summary>
          <p>
            No historical prototypes were supplied. This is the first
            implementation; no invented failure archive.
          </p>
        </details>
        <details>
          <summary>Sound sessions</summary>
          <p>
            Commissioned recordings are pending. Required sessions: dry snap,
            stale crack, paper peel, slicing hiss, milk drip, oven tick, room
            tone, and the pantry whisper.
          </p>
        </details>
        <details>
          <summary>Source & release</summary>
          <p>
            The local source includes the interaction constants and acceptance
            checks.
            <a href="https://github.com/SnackStudio/snackstudio-site"
              >Source is open under SnackStudio.</a
            >
            Award submissions have not happened.
          </p>
        </details>
      </section>
      <a class="pill" href="/" style="display:inline-block;margin-top:35px"
        >Back to your cookie ↗</a
      >
    </main>`;
}
function notFound() {
  app.innerHTML = /* HTML */ `${header}
    <main class="error-page" id="main">
      <img
        class="burnt"
        src="/brand/web/bitten-solid-small.webp"
        alt="A burnt cookie"
      />
      <h1>Left it in too long.</h1>
      <p>That page is burnt. Your cookie is fine.</p>
      <button id="alarm" class="pill">Silence the smoke detector</button>
      <p><a href="/">Back to the kitchen ↗</a></p>
    </main>`;
}
if (path === "/") home();
else if (path === "/kitchen") kitchen();
else notFound();
document.body.insertAdjacentHTML(
  "beforeend",
  `<canvas class="crumb-canvas" aria-hidden="true"></canvas><div class="teeth" aria-hidden="true"></div><div class="toast" role="status" aria-live="polite"></div><div class="bake-bar" aria-hidden="true"></div><div class="offline-badge">Pantry lights off · You’re offline</div><article class="print-card"><img src="/brand/web/bitten-solid-small.webp" alt=""><span class="label">SnackStudio / Recipe no. 001</span><h1>A small bite.</h1><p>One good question.<br>A measure of evidence.<br>Structure enough to hold it.<br>The appetite to make it real.</p><p>Mix product and engineering. Bake with care.<br>Take apart. Try again. Share.</p><p>hi@zachshallbetter.com · snackstud.io</p></article>`,
);
const physics = new Crumbs($(".crumb-canvas"), state.crumbs, reduced);
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  $(".toast").textContent = message;
  $(".toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $(".toast").classList.remove("visible"), 3400);
}
let channel: BroadcastChannel | undefined;
try {
  channel = new BroadcastChannel("snackstudio-cookie");
} catch {
  /* Optional cross-tab enhancement. */
}
function persist(broadcast = true) {
  state.crumbs = physics.snapshot();
  save(state);
  if (broadcast) channel?.postMessage({ type: "cookie", state });
}
function applyRemote(next: unknown) {
  if (!valid(next) || next.revision < state.revision) return;
  state = next;
  physics.sweep();
  state.crumbs.forEach((c) => physics.add(c, false));
  render();
}
channel?.addEventListener("message", (e) => {
  if (e.data?.type === "cookie") applyRemote(e.data.state);
  if (e.data?.type === "bye") physics.shake();
});
addEventListener("storage", (e) => {
  if (e.key === "snack-cookie" && e.newValue) {
    try {
      applyRemote(JSON.parse(e.newValue));
    } catch {
      /* Ignore malformed browser storage. */
    }
  }
});
addEventListener("pagehide", () => {
  persist();
  channel?.postMessage({ type: "bye" });
  stopCamera();
});
let iconImage = new Image();
iconImage.src = "/brand/web/whole-solid.webp";
iconImage.onload = () => updateIcon();
function drawCookie(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 1254, size / 1254);
  ctx.drawImage(iconImage, 0, 0, 1254, 1254);
  ctx.globalCompositeOperation = "destination-out";
  for (const b of state.bites) {
    ctx.beginPath();
    if (b.points) {
      b.points.forEach(([px, py], i) =>
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py),
      );
      ctx.closePath();
    } else ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
function updateIcon() {
  if (!iconImage.complete || !iconImage.naturalWidth) return;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  drawCookie(c.getContext("2d")!, 0, 0, 64);
  $("link[rel=icon]").setAttribute("href", c.toDataURL());
  document.querySelectorAll<HTMLImageElement>(".brand img").forEach((img) => {
    if (state.bites.length) img.src = c.toDataURL();
    else img.src = "/brand/web/bitten-solid-small.webp";
  });
}
function sentence() {
  let index = 0;
  return heroText
    .map((line) =>
      [...line]
        .filter((c) => c === " " || !state.letters.includes(index++))
        .join(""),
    )
    .join(" ");
}
function render() {
  if (path === "/") {
    $("main h1").setAttribute(
      "aria-label",
      sentence() || "Every letter eaten.",
    );
    $("#bite-shapes").innerHTML = biteMask();
    $("#whole-cookie").setAttribute(
      "opacity",
      state.bites.length >= 6 ? "0" : "1",
    );
    $(".bite-dots").innerHTML = Array.from(
      { length: 6 },
      (_, i) => `<i class="${i < state.bites.length ? "used" : ""}"></i>`,
    ).join("");
    $("#bite-count").textContent =
      state.bites.length === 6
        ? "Every last crumb."
        : `${6 - state.bites.length} bites left`;
    $(".cookie-hit").setAttribute(
      "aria-label",
      state.bites.length === 6
        ? "Bake another cookie"
        : `Take a bite of the cookie. ${6 - state.bites.length} bites left.`,
    );
    $(".cookie-stage").classList.toggle("gone", state.bites.length === 6);
    $(".cookie-stage").classList.toggle(
      "stale",
      Date.now() - state.created > 3600000,
    );
    document
      .querySelectorAll<HTMLButtonElement>("[data-letter]")
      .forEach((el) => {
        const eaten = state.letters.includes(Number(el.dataset.letter));
        el.classList.toggle("eaten", eaten);
        el.disabled = eaten;
      });
  }
  if (!baking)
    document.title = `SnackStudio · ${6 - state.bites.length} bites left`;
  updateIcon();
}
function bake() {
  if (baking) return;
  clearInterval(bakeTimer);
  state.bites = [];
  state.baked = today();
  state.created = Date.now();
  baking = !reduced;
  render();
  persist();
  if (reduced) return;
  let remaining = 8;
  const stage = $(".cookie-stage");
  if (stage)
    gsap.fromTo(
      stage,
      { scale: 0.98 },
      { scale: 1, duration: 8, ease: "power1.inOut" },
    );
  gsap.fromTo(
    ".bake-bar",
    { width: "0%" },
    { width: "100%", duration: 8, ease: "none" },
  );
  document.title = `Baking · ${remaining}s`;
  bakeTimer = setInterval(() => {
    remaining--;
    sound.play("tick");
    if (remaining <= 0) {
      clearInterval(bakeTimer);
      baking = false;
      gsap.to(".bake-bar", { opacity: 0, duration: 0.4 });
      render();
    } else document.title = `Baking · ${remaining}s`;
  }, 1000);
}
const defaultBites = [
  { x: 1080, y: 260, r: 310 },
  { x: 1190, y: 690, r: 320 },
  { x: 900, y: 1080, r: 350 },
  { x: 380, y: 1090, r: 380 },
  { x: 150, y: 490, r: 420 },
  { x: 610, y: 520, r: 590 },
];
function takeBite(event?: MouseEvent, custom?: Bite) {
  const act = () => {
    const latest = read();
    if (latest.revision > state.revision) applyRemote(latest);
    performBite(event, custom);
  };
  if (navigator.locks)
    void navigator.locks.request("snack-cookie-mutation", act);
  else act();
}
function performBite(event?: MouseEvent, custom?: Bite) {
  if (state.bites.length >= 6) {
    bake();
    return;
  }
  const stage = $(".cookie-stage");
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const fallback = defaultBites[state.bites.length];
  let bite = custom || { ...fallback };
  if (event && event.detail > 0) {
    bite = {
      x: ((event.clientX - rect.left) / rect.width) * 1254,
      y: ((event.clientY - rect.top) / rect.height) * 1254,
      r: fallback.r,
    };
  }
  if (state.signature && !custom) {
    bite.points = state.signature.map(
      ([x, y]) =>
        [bite.x + x * bite.r, bite.y + y * bite.r] as [number, number],
    );
  }
  state.bites.push(bite);
  const x = rect.left + (bite.x / 1254) * rect.width,
    y = rect.top + (bite.y / 1254) * rect.height;
  physics.burst(
    x,
    y,
    active,
    reduced ? 1 : 18,
    soft,
    Date.now() - state.created > 3600000,
  );
  sound.play(Date.now() - state.created > 3600000 ? "crack" : "bite", soft);
  if (!reduced)
    gsap.fromTo(
      "#cookie-svg",
      { scale: 0.94, rotation: -2 },
      {
        scale: 1,
        rotation: 0,
        duration: constants.spring,
        ease: "back.out(1.7)",
      },
    );
  if (state.bites.length === 6) {
    state.eaten++;
    toast("Every last crumb. Take one more bite to bake again.");
    void pantryEvent("eaten");
  } else void pantryEvent("crumb");
  render();
  persist();
}
let lastSaved = performance.now();
setInterval(() => {
  if (document.hidden) return;
  if (performance.now() - lastSaved > 8000) {
    persist(false);
    lastSaved = performance.now();
  }
  if (state.baked !== today() && path === "/") bake();
  if (path === "/")
    $(".cookie-stage").classList.toggle(
      "stale",
      Date.now() - state.created > 3600000,
    );
}, 10000);
if (path === "/") {
  $(".cookie-hit").addEventListener("click", (e) => {
    if (!dragged) takeBite(e as MouseEvent);
  });
  $("#sound").addEventListener("click", async () => {
    const on = await sound.toggle();
    $("#sound").textContent = on ? "◌ Sound on" : "◌ Sound off";
    $("#sound").setAttribute("aria-pressed", String(on));
    if (on) {
      sound.play("tick");
      toast("Synthesized sound preview. Original recordings are pending.");
    }
  });
  $("#sweep").addEventListener("click", () => {
    if (!reduced)
      gsap.fromTo(
        ".crumb-canvas",
        { x: 0 },
        {
          x: innerWidth,
          duration: 0.55,
          onComplete: () => gsap.set(".crumb-canvas", { x: 0 }),
        },
      );
    setTimeout(
      () => {
        const eaten = state.eaten;
        state = fresh();
        state.eaten = eaten;
        state.baked = today();
        physics.sweep();
        render();
        persist();
        toast("A clean plate. A whole cookie.");
      },
      reduced ? 0 : 550,
    );
  });
  document.querySelectorAll<HTMLButtonElement>("[data-letter]").forEach((el) =>
    el.addEventListener("click", () => {
      const index = Number(el.dataset.letter);
      if (state.letters.includes(index)) return;
      state.letters.push(index);
      const r = el.getBoundingClientRect();
      physics.burst(
        r.x + r.width / 2,
        r.y + r.height / 2,
        active,
        reduced ? 1 : 5,
      );
      sound.play("bite");
      render();
      persist();
    }),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      active = visible[0].target.id;
      document.querySelectorAll("[data-section]").forEach((el) => {
        el.classList.toggle(
          "active",
          (el as HTMLElement).dataset.section === active,
        );
        if ((el as HTMLElement).dataset.section === active)
          el.setAttribute("aria-current", "location");
        else el.removeAttribute("aria-current");
      });
      if (reduced && innerWidth > 700) {
        gsap.to("#slice-window", {
          attr: {
            height:
              1254 -
              sections.indexOf(active as (typeof sections)[number]) * 195,
          },
          duration: 0.6,
          ease: "power2.out",
        });
        sound.play("slice", true);
      }
    },
    { rootMargin: "-20% 0px -35% 0px", threshold: [0, 0.25, 0.5] },
  );
  document.querySelectorAll("main>section").forEach((s) => observer.observe(s));
  if (!reduced && innerWidth > 700) {
    ScrollTrigger.create({
      trigger: "#main",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const depth = 1254 - self.progress * 910;
        gsap.set("#slice-window", { attr: { height: depth } });
        gsap.set("#cut-line", {
          attr: { y1: depth, y2: depth, opacity: self.progress > 0 ? 1 : 0 },
        });
      },
    });
  }
  document.querySelectorAll<HTMLAnchorElement>(".crumb-nav a").forEach((a) =>
    a.addEventListener("click", () => {
      const section = a.dataset.section!;
      history.replaceState(null, "", `#${section}`);
    }),
  );
  document
    .querySelectorAll<HTMLButtonElement>("[data-work]")
    .forEach((tile) => {
      const tear = () => {
        const open = tile.classList.toggle("torn");
        tile.setAttribute("aria-expanded", String(open));
        tile.querySelector("strong")!.textContent = open
          ? "The case study belongs here."
          : "Case study coming from WORK.md";
        tile.querySelector(".tear")!.textContent = open ? "↶" : "↗";
        sound.play("peel");
        if (open) {
          const r = tile.getBoundingClientRect();
          physics.burst(r.right, r.bottom, "work", reduced ? 1 : 5);
        }
        const all = [...document.querySelectorAll("[data-work]")].every((t) =>
          t.classList.contains("torn"),
        );
        $(".sheet-backing").toggleAttribute("hidden", !all);
      };
      tile.addEventListener("click", tear);
      let start = 0;
      tile.addEventListener("pointerdown", (e) => {
        start = e.clientX;
      });
      tile.addEventListener("pointerup", (e) => {
        if (Math.abs(e.clientX - start) > 70) {
          tear();
          e.preventDefault();
        }
      });
    });
  $(".contact").addEventListener("pointerenter", () =>
    physics.formText("hi@zachshallbetter.com"),
  );
  $(".contact").addEventListener("pointerleave", () => physics.releaseText());
  $(".contact").addEventListener("focus", () =>
    physics.formText("hi@zachshallbetter.com"),
  );
  $(".contact").addEventListener("blur", () => physics.releaseText());
  $(".ask-form").addEventListener("submit", (e) => {
    e.preventDefault();
    answerQuestion();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-question]").forEach((b) =>
    b.addEventListener("click", () => {
      $<HTMLInputElement>("#question").value = b.dataset.question!;
      answerQuestion();
    }),
  );
  document.querySelectorAll<HTMLButtonElement>("[data-jar]").forEach((jar) =>
    jar.addEventListener("click", () => {
      const open = jar.getAttribute("aria-expanded") !== "true";
      document
        .querySelectorAll("[data-jar]")
        .forEach((j) => j.setAttribute("aria-expanded", "false"));
      jar.setAttribute("aria-expanded", String(open));
      $("#essay-card").innerHTML = open
        ? `<span class="label">${jar.dataset.jar} / The open jar</span><p class="missing">ESSAYS.md was not supplied. Essays will appear here when the source file is available.</p>`
        : '<p class="missing">Pick a jar. Leave a little room.</p>';
      sound.play("jar");
    }),
  );
  $("#share").addEventListener("click", () => void share());
  $("#mouth").addEventListener("click", () => {
    if (reduced) {
      toast(
        "Camera motion is off with reduced motion. The cookie still takes a click or Enter.",
      );
      return;
    }
    $<HTMLDialogElement>("#camera-dialog").showModal();
  });
  $("#cancel-camera").addEventListener("click", () => {
    stopCamera();
    $<HTMLDialogElement>("#camera-dialog").close();
  });
  $("#camera-dialog").addEventListener("cancel", stopCamera);
  $("#start-camera").addEventListener("click", () => void startCamera());
  if (state.baked !== today()) bake();
  void weather();
  void pantryEvent("visit");
  setInterval(() => {
    if (!document.hidden) void pantryEvent("read");
  }, 20000);
  const params = new URLSearchParams(location.search);
  const box = params.get("box"),
    depth = params.get("bite");
  if (box && /^\d{1,2}$/.test(box) && Number(box) >= 1 && Number(box) <= 50) {
    toast(`Box ${box}. The physical bite record is not yet supplied.`);
    if (depth && /^[1-6]$/.test(depth)) {
      state.bites = defaultBites.slice(0, Number(depth));
      render();
      persist();
    }
  }
}
function answerQuestion() {
  const input = $<HTMLInputElement>("#question");
  const q = input.value.trim().toLowerCase();
  if (!q) return;
  let answer = "";
  if (/who|founder|behind|kitchen|team/.test(q))
    answer = "SnackStudio is run by Zach Shallbetter.";
  else if (/where|based|location/.test(q)) answer = "Spokane, Washington.";
  else if (/contact|together|email|hire|start/.test(q))
    answer = "Bring your question to hi@zachshallbetter.com.";
  else if (/make|build|work|studio|focus|do\b/.test(q))
    answer =
      "Product and engineering, with a focus on computational interaction and applied AI.";
  else {
    answer =
      "We don’t have a grounded answer for that here. Ask Zach: hi@zachshallbetter.com.";
    const r = input.getBoundingClientRect();
    physics.burst(r.x + r.width / 2, r.bottom, "method", reduced ? 1 : 12);
    sound.play("bite");
    if (!reduced)
      gsap.fromTo(
        input,
        { clipPath: "polygon(0 0,100% 0,90% 50%,100% 100%,0 100%)" },
        {
          clipPath: "polygon(0 0,100% 0,100% 50%,100% 100%,0 100%)",
          duration: 0.8,
        },
      );
  }
  $(".answer").textContent = answer;
}
let dragged = false,
  dragStart: { x: number; y: number; at: number } | null = null;
if (path === "/") {
  const hit = $<HTMLButtonElement>(".cookie-hit");
  hit.addEventListener("pointerdown", (e) => {
    dragged = false;
    dragStart = { x: e.clientX, y: e.clientY, at: performance.now() };
    hit.setPointerCapture(e.pointerId);
  });
  hit.addEventListener("pointermove", (e) => {
    if (!dragStart || reduced) return;
    const dx = e.clientX - dragStart.x,
      dy = e.clientY - dragStart.y;
    if (Math.hypot(dx, dy) < 12) return;
    dragged = true;
    gsap.set("#cookie-svg", { x: dx, y: dy, rotation: dx / 20 });
    $(".milk").classList.toggle("show", e.clientX < innerWidth * 0.2);
  });
  hit.addEventListener("pointerup", (e) => {
    if (!dragStart) return;
    const elapsed = performance.now() - dragStart.at;
    const dx = e.clientX - dragStart.x;
    if (dragged) {
      if (e.clientX < innerWidth * 0.2) {
        soft = true;
        $(".cookie-stage").classList.add("soft");
        physics.burst(85, innerHeight * 0.6, active, 3, true);
        sound.play("drip");
        if (elapsed > 3000) {
          takeBite(undefined, { x: 627, y: 1150, r: 430 });
          toast("A little too long in the milk.");
        } else toast("Dunked. A softer bite.");
      } else if (Math.abs(dx) / elapsed > 0.8) {
        physics.burst(
          Math.max(20, Math.min(innerWidth - 20, e.clientX)),
          e.clientY,
          active,
          1,
        );
        sound.play("crack");
      }
      gsap.to("#cookie-svg", {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.7,
        ease: "elastic.out(1,.5)",
      });
      setTimeout(() => {
        dragged = false;
      }, 50);
    }
    dragStart = null;
    $(".milk").classList.remove("show");
  });
  hit.addEventListener("pointercancel", () => {
    dragStart = null;
    dragged = false;
    gsap.set("#cookie-svg", { x: 0, y: 0, rotation: 0 });
    $(".milk").classList.remove("show");
  });
  hit.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "d") {
      soft = true;
      $(".cookie-stage").classList.add("soft");
      sound.play("drip");
      toast("Dunked. A softer bite.");
    }
    if (e.key.toLowerCase() === "f") {
      physics.shake();
      toast("Cookie flicked. Crumbs loosened.");
    }
  });
  document.querySelectorAll<HTMLElement>(".sticker").forEach((el, i) => {
    let origin: { x: number; y: number; px: number; py: number } | undefined;
    let x = 0,
      y = 0;
    try {
      const data = JSON.parse(sessionStorage.getItem(`sticker-${i}`) || "null");
      if (data && Number.isFinite(data.x) && Number.isFinite(data.y)) {
        x = Math.max(-50, Math.min(100, data.x));
        y = Math.max(-100, Math.min(100, data.y));
        gsap.set(el, { x, y });
      }
    } catch {
      /* Session storage is optional. */
    }
    el.addEventListener("pointerdown", (e) => {
      origin = { x: e.clientX, y: e.clientY, px: x, py: y };
      el.setPointerCapture(e.pointerId);
      el.classList.remove("peeled");
      sound.play("peel");
    });
    el.addEventListener("pointermove", (e) => {
      if (!origin) return;
      x = Math.max(
        -el.offsetLeft,
        Math.min(
          innerWidth - el.getBoundingClientRect().width,
          origin.px + e.clientX - origin.x,
        ),
      );
      y = origin.py + e.clientY - origin.y;
      gsap.set(el, { x, y });
    });
    el.addEventListener("pointerup", () => {
      origin = undefined;
      try {
        sessionStorage.setItem(`sticker-${i}`, JSON.stringify({ x, y }));
      } catch {
        /* Optional persistence. */
      }
    });
    el.addEventListener("keydown", (e) => {
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-10, 0],
        ArrowRight: [10, 0],
        ArrowUp: [0, -10],
        ArrowDown: [0, 10],
      };
      if (moves[e.key]) {
        e.preventDefault();
        x += moves[e.key][0];
        y += moves[e.key][1];
        gsap.set(el, { x, y });
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.classList.toggle("peeled");
      }
      if (e.key === "Delete") {
        const r = el.getBoundingClientRect();
        physics.burst(r.x + r.width / 2, r.y, "work", 1);
        sound.play("bite");
      }
    });
    el.addEventListener("dblclick", (e) => {
      physics.burst(e.clientX, e.clientY, active, 1);
      sound.play("bite");
    });
  });
}
addEventListener("keydown", (e) => {
  if (
    (e.metaKey || e.ctrlKey) &&
    e.key === "a" &&
    !(e.target instanceof HTMLInputElement) &&
    !(e.target instanceof HTMLTextAreaElement)
  ) {
    e.preventDefault();
    document
      .querySelectorAll(".sticker")
      .forEach((s) => s.classList.toggle("peeled"));
    sound.play("peel");
  }
});
const sequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let sequenceIndex = 0;
addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement) return;
  sequenceIndex = e.key === sequence[sequenceIndex] ? sequenceIndex + 1 : 0;
  if (sequenceIndex === sequence.length) {
    sequenceIndex = 0;
    for (let i = 0; i < (reduced ? 5 : 100); i++)
      physics.burst(Math.random() * innerWidth, -10, sections[i % 5], 1);
    toast("An extra batch. On the house.");
  }
});
let previousWidth = innerWidth;
addEventListener("resize", () => {
  if (reduced || path !== "/") return;
  const delta = innerWidth - previousWidth;
  previousWidth = innerWidth;
  gsap.fromTo(
    "#cookie-svg",
    { scaleX: delta > 0 ? 1.025 : 0.975 },
    { scaleX: 1, duration: 0.5, ease: "elastic.out(1,.4)" },
  );
  sound.play("crack", true);
  if (innerWidth < 480) {
    $("#cut-line").setAttribute("y1", "627");
    $("#cut-line").setAttribute("y2", "627");
    $("#cut-line").setAttribute("opacity", "1");
  }
});
addEventListener("deviceorientation", (e) => {
  if (reduced || e.gamma === null) return;
  physics.engine.gravity.x = Math.max(-1, Math.min(1, e.gamma / 40));
});
addEventListener("pointermove", (e) => {
  if (reduced) return;
  gsap.set(".teeth", { x: e.clientX, y: e.clientY });
  document.body.classList.toggle(
    "edible-cursor",
    !!(e.target as Element)?.closest("[data-edible]"),
  );
  if (e.clientY > innerHeight - 45) {
    const item = physics.pick(e.clientX, e.clientY);
    if (item)
      $(".crumb-canvas").setAttribute("title", labels[item.data.section]);
  }
});
addEventListener("pointerdown", () => $(".teeth").classList.add("close"));
addEventListener("pointerup", () => $(".teeth").classList.remove("close"));
addEventListener("click", (e) => {
  if ((e.target as Element).closest("button,a,input,summary")) return;
  if (e.clientY > innerHeight - 45) {
    const item = physics.pick(e.clientX, e.clientY);
    if (item) {
      location.hash = item.data.section;
      document
        .getElementById(item.data.section)
        ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
      sound.play("bite");
    }
  }
});
async function share() {
  try {
    await iconImage.decode();
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 630;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#FDF2F8";
    ctx.fillRect(0, 0, 1200, 630);
    const cookieCanvas = document.createElement("canvas");
    cookieCanvas.width = 600;
    cookieCanvas.height = 600;
    drawCookie(cookieCanvas.getContext("2d")!, 0, 0, 600);
    ctx.drawImage(cookieCanvas, 610, 10);
    ctx.fillStyle = "#111827";
    ctx.font = "900 38px system-ui";
    ctx.fillText("snackstudio", 60, 78);
    const words = sentence();
    ctx.font = "900 68px system-ui";
    const message = state.letters.length
      ? words
      : "Good things come in small bites.";
    let line = "",
      lineY = 230;
    for (const word of message.split(" ")) {
      if (ctx.measureText(line + word).width > 510 && line) {
        ctx.fillText(line, 60, lineY);
        line = word + " ";
        lineY += 78;
      } else line += word + " ";
    }
    ctx.fillText(line, 60, lineY, 510);
    ctx.font = "16px system-ui";
    ctx.fillText("Your cookie. Your bite. snackstud.io", 60, 555);
    ctx.fillStyle = "#EC4899";
    physics
      .snapshot()
      .slice(-200)
      .forEach((p) => {
        ctx.save();
        ctx.translate(p.x * 1200, 600 - p.y * 20);
        ctx.rotate(p.angle);
        ctx.fillRect(0, 0, p.size, p.size);
        ctx.restore();
      });
    const blob = await new Promise<Blob | null>((resolve) =>
      c.toBlob(resolve, "image/png"),
    );
    if (!blob) throw Error("No image");
    const file = new File([blob], "my-snackstudio-bite.png", {
      type: "image/png",
    });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My SnackStudio bite" });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast("Your bite is ready to share.");
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError"))
      toast("Couldn’t bake the image. Try another bite.");
  }
}
let cameraGeneration = 0;
let cameraStream: MediaStream | undefined,
  cameraFrame = 0,
  landmarker: import("@mediapipe/tasks-vision").FaceLandmarker | undefined,
  startingCamera = false;
function stopCamera() {
  cameraGeneration++;
  cancelAnimationFrame(cameraFrame);
  cameraStream?.getTracks().forEach((t) => t.stop());
  cameraStream = undefined;
  landmarker?.close();
  landmarker = undefined;
  document.querySelector(".camera-live")?.remove();
}
async function startCamera() {
  if (startingCamera) return;
  startingCamera = true;
  const generation = ++cameraGeneration;
  const status = $("#camera-status");
  const button = $<HTMLButtonElement>("#start-camera");
  button.disabled = true;
  try {
    if (!navigator.mediaDevices?.getUserMedia)
      throw Error("Camera unavailable");
    const { FilesetResolver, FaceLandmarker } =
      await import("@mediapipe/tasks-vision");
    const files = await FilesetResolver.forVisionTasks("/models/wasm");
    landmarker = await FaceLandmarker.createFromOptions(files, {
      baseOptions: {
        modelAssetPath: "/models/face_landmarker.task",
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });
    if (generation !== cameraGeneration) {
      landmarker.close();
      landmarker = undefined;
      return;
    }
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });
    if (generation !== cameraGeneration) {
      stopCamera();
      return;
    }
    $<HTMLDialogElement>("#camera-dialog").close();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<aside class="camera-live"><video autoplay playsinline muted aria-label="Your local camera preview"></video><small>On-device · 0 frames uploaded</small><button id="stop-camera">Close camera</button></aside>',
    );
    const video = $<HTMLVideoElement>(".camera-live video");
    video.srcObject = cameraStream;
    await video.play();
    $("#stop-camera").addEventListener("click", stopCamera);
    let opened = false,
      lastBite = 0,
      lastVideoTime = -1;
    const tick = () => {
      if (!cameraStream || !landmarker) return;
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        const face = result.faceLandmarks[0];
        if (face) {
          const upper = face[13],
            lower = face[14],
            left = face[61],
            right = face[291];
          const width = Math.hypot(left.x - right.x, left.y - right.y);
          const openness =
            Math.hypot(upper.x - lower.x, upper.y - lower.y) /
            Math.max(width, 0.001);
          if (openness > 0.25) opened = true;
          if (
            opened &&
            openness < 0.12 &&
            performance.now() - lastBite > 1800
          ) {
            opened = false;
            lastBite = performance.now();
            const jaw = [
              234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400,
              378, 379, 365, 397, 288, 361, 323, 454,
            ].map((i) => face[i]);
            const centerX = (face[234].x + face[454].x) / 2,
              centerY = (face[234].y + face[454].y) / 2;
            const scale = Math.max(
              0.01,
              Math.abs(face[454].x - face[234].x) / 2,
            );
            state.signature = jaw.map(
              (p) =>
                [(p.x - centerX) / scale, (p.y - centerY) / scale] as [
                  number,
                  number,
                ],
            );
            state.signature.push([1, -1], [-1, -1]);
            const base = defaultBites[Math.min(state.bites.length, 5)];
            takeBite(undefined, {
              ...base,
              points: state.signature.map(([x, y]) => [
                base.x + x * base.r,
                base.y + y * base.r,
              ]),
            });
          }
        }
      }
      cameraFrame = requestAnimationFrame(tick);
    };
    tick();
  } catch {
    stopCamera();
    status.textContent =
      "Camera couldn’t open. Your cookie still takes a click.";
  } finally {
    button.disabled = false;
    startingCamera = false;
  }
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopCamera();
});
async function readExternalJSON(response: Response) {
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error("Unexpected response type");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty response");
  const decoder = new TextDecoder();
  let size = 0,
    text = "";
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      throw new Error("Response too large");
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}
async function weather() {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=47.6588&longitude=-117.426&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit",
      { signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) return;
    const data = await readExternalJSON(response);
    const w = data?.current;
    if (
      !w ||
      typeof w.temperature_2m !== "number" ||
      typeof w.weather_code !== "number" ||
      ![0, 1].includes(w.is_day)
    )
      return;
    const snow = w.weather_code >= 71 && w.weather_code <= 86;
    const rain =
      (w.weather_code >= 51 && w.weather_code <= 67) || w.weather_code >= 95;
    const description = snow
      ? "Snow"
      : rain
        ? "Rain"
        : w.weather_code <= 1
          ? "Clear"
          : "Cloudy";
    $("#weather").textContent =
      `${Math.round(w.temperature_2m)}°F · ${description}`;
    if (snow && !reduced) physics.engine.gravity.y = 0.35;
    if (w.is_day === 0 && w.weather_code <= 1)
      document.body.classList.add("night");
  } catch {
    /* The pantry stays usable without weather. */
  }
}

async function pantryEvent(kind: "visit" | "crumb" | "eaten" | "read") {
  if (!navigator.onLine) return;
  try {
    const response = await fetch("/api/pantry", {
      method: kind === "read" ? "GET" : "POST",
      headers: kind === "read" ? {} : { "Content-Type": "application/json" },
      body:
        kind === "read"
          ? undefined
          : JSON.stringify({ kind, token: visitToken, eaten: state.eaten }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return;
    const data = await readExternalJSON(response);
    if (
      !Number.isSafeInteger(data.eaten) ||
      data.eaten < 0 ||
      !Number.isSafeInteger(data.visitors) ||
      data.visitors < 0 ||
      typeof data.empty !== "boolean" ||
      !Array.isArray(data.crumbs)
    )
      return;
    $("#global-jar").textContent = data.empty
      ? "The shared jar is empty. Another batch in a minute."
      : `${data.eaten.toLocaleString()} cookies eaten worldwide today.`;
    if (data.last === true)
      toast("You took the last cookie. This little moment is yours.");
    for (const c of data.crumbs.slice(0, 100)) {
      if (
        typeof c.x === "number" &&
        c.x >= 0 &&
        c.x <= 1 &&
        typeof c.y === "number" &&
        c.y >= 0 &&
        c.y <= 1 &&
        c.token !== visitToken
      )
        physics.ghost.push({
          x: c.x,
          y: c.y,
          size: 5,
          expires: performance.now() + 21000,
        });
    }
  } catch {
    /* Local cookie works without realtime. */
  }
}
function connectivity() {
  document.body.classList.toggle("offline", !navigator.onLine);
  if (!navigator.onLine) {
    document.querySelectorAll("[data-jar]").forEach((j, i) => {
      (j as HTMLElement).style.opacity = i === 0 ? "1" : ".3";
    });
  } else
    document
      .querySelectorAll<HTMLElement>("[data-jar]")
      .forEach((j) => (j.style.opacity = ""));
}
addEventListener("online", connectivity);
addEventListener("offline", connectivity);
connectivity();
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("/sw.js").catch(() => {
    /* Offline enhancement is optional. */
  });
if (path === "/kitchen") {
  $("#test-spring").addEventListener("click", () => {
    if (!reduced)
      gsap.fromTo(
        ".spring-demo img",
        { x: 0, rotation: 0 },
        {
          x: Math.min(220, innerWidth * 0.35),
          rotation: 180,
          duration: Number($<HTMLInputElement>("#spring").value),
          ease: `back.out(${$<HTMLInputElement>("#overshoot").value})`,
          yoyo: true,
          repeat: 1,
        },
      );
  });
  $("#spring").addEventListener(
    "input",
    () =>
      ($("#spring-value").textContent =
        $<HTMLInputElement>("#spring").value + "s"),
  );
  for (const name of ["gravity", "bounce", "friction"])
    $("#" + name).addEventListener("input", () => {
      const value = Number($<HTMLInputElement>("#" + name).value);
      $("#" + name + "-value").textContent = String(value);
      if (name === "gravity") physics.engine.gravity.y = value;
      else if (name === "bounce") {
        constants.restitution = value;
        physics.bodies.forEach(({ body }) => (body.restitution = value));
      } else {
        constants.friction = value;
        physics.bodies.forEach(({ body }) => (body.friction = value));
      }
    });
  $("#drop-crumbs").addEventListener("click", () =>
    physics.burst(
      innerWidth * 0.65,
      innerHeight * 0.4,
      "studio",
      reduced ? 1 : 20,
    ),
  );
}
if (path !== "/" && path !== "/kitchen")
  $("#alarm").addEventListener("click", () => {
    $("#alarm").textContent = "Quiet now.";
    $(".burnt").setAttribute("style", "filter:grayscale(.5)");
  });
render();
