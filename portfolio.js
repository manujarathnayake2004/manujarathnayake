"use strict";

// Motion never gates content, navigation or image access.
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const animationPreference = "manuja-portfolio-motion-paused";
let manuallyPaused = false;
try { manuallyPaused = localStorage.getItem(animationPreference) === "true"; } catch {}

const runningAnimations = new Set();
const revealed = new WeakSet();
let revealObserver;
let heroObserver;
const hero = document.querySelector(".hero");
const cards = [...document.querySelectorAll(".work-card, .project-detail, .skill-group, .service, .gallery-item, .contact-details")];
const motionAllowed = () => !manuallyPaused && !reducedMotion.matches;
const motionButton = document.createElement("button");
motionButton.type = "button";
motionButton.className = "motion-toggle";
motionButton.setAttribute("aria-label", "Enable animations");
document.body.appendChild(motionButton);

function animateElement(element, keyframes, options = {}) {
  if (!element || !motionAllowed() || typeof element.animate !== "function") return null;
  try {
    const animation = element.animate(keyframes, {
      duration: 620,
      easing: "cubic-bezier(.22,.7,.2,1)",
      fill: "backwards",
      ...options,
    });
    runningAnimations.add(animation);
    const clear = () => runningAnimations.delete(animation);
    animation.addEventListener("finish", clear, { once: true });
    animation.addEventListener("cancel", clear, { once: true });
    return animation;
  } catch {
    // A missing animation API must never affect the page itself.
    return null;
  }
}

function reveal(element, delay = 0, entrance = false) {
  if (revealed.has(element)) return;
  revealed.add(element);
  animateElement(element, [
    { opacity: entrance ? .55 : .15, translate: "0 18px" },
    { opacity: 1, translate: "0 0" },
  ], { delay, duration: entrance ? 640 : 620 });
  element.querySelectorAll(".skill-group li, .facts > div, .contact-details > div, .strengths > li, .tags > span")
    .forEach((item, index) => animateElement(item, [
      { opacity: .25, transform: "translateX(-10px)" },
      { opacity: 1, transform: "translateX(0)" },
    ], { delay: delay + 100 + index * 65, duration: 480 }));
}

const revealSelector = [
  ".section > .container > .eyebrow", ".section > .container > h2",
  ".section-heading", ".section-intro", ".about-copy", ".facts",
  ".work-card", ".project-heading", ".project-detail",
  ".career-grid > div > .eyebrow", ".career-grid > div > h2",
  ".timeline-item", ".education-list > li", ".skills-overview", ".skill-group", ".strengths",
  ".service", ".contact-grid > div", ".contact-details", ".gallery-item", ".gallery-contact", ".footer-inner",
].join(",");

function startReveals() {
  document.querySelectorAll(".hero-grid > div:first-child > *, .gallery-header > *")
    .forEach((element, index) => reveal(element, Math.min(index, 4) * 70, true));
  const portrait = document.querySelector(".portrait-stage");
  if (portrait) reveal(portrait, 140, true);

  document.querySelectorAll(".work-grid, .project-grid, .skills-grid, .services-grid, .gallery-grid, .education-list, .timeline")
    .forEach((group) => [...group.children].forEach((element, index) => {
      element.dataset.revealDelay = String(Math.min(index, 2) * 75);
    }));

  if (typeof IntersectionObserver !== "function") {
    hero?.classList.add("is-in-view");
    return;
  }

  try {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !motionAllowed()) return;
        reveal(entry.target, Number(entry.target.dataset.revealDelay || 0));
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -24px 0px" });
    document.querySelectorAll(revealSelector).forEach((element) => {
      if (!revealed.has(element)) revealObserver.observe(element);
    });
    if (hero) {
      heroObserver = new IntersectionObserver(([entry]) => {
        hero.classList.toggle("is-in-view", entry.isIntersecting);
      }, { threshold: 0 });
      heroObserver.observe(hero);
    }
  } catch {
    revealObserver?.disconnect();
    heroObserver?.disconnect();
    // Content remains in its normal, visible state.
  }
}

function applyMotionPreference() {
  revealObserver?.disconnect();
  heroObserver?.disconnect();
  for (const animation of runningAnimations) animation.cancel();
  runningAnimations.clear();
  const enabled = motionAllowed();
  root.classList.toggle("motion-enabled", enabled);
  root.classList.toggle("motion-paused", !enabled);
  motionButton.hidden = reducedMotion.matches;
  motionButton.textContent = enabled ? "Motion on" : "Motion off";
  motionButton.setAttribute("aria-pressed", String(enabled));
  motionButton.title = enabled ? "Pause animations" : "Enable animations";
  cards.forEach((card) => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
  if (enabled) startReveals();
  document.dispatchEvent(new CustomEvent("portfolio:motionchange"));
}

motionButton.addEventListener("click", () => {
  manuallyPaused = !manuallyPaused;
  try { localStorage.setItem(animationPreference, String(manuallyPaused)); } catch {}
  applyMotionPreference();
});
reducedMotion.addEventListener("change", applyMotionPreference);
window.addEventListener("storage", (event) => {
  if (event.key !== animationPreference && event.key !== null) return;
  manuallyPaused = event.newValue === "true";
  applyMotionPreference();
});
function updateVisibility() {
  root.classList.toggle("tab-hidden", document.hidden);
}
document.addEventListener("visibilitychange", updateVisibility);
updateVisibility();
applyMotionPreference();

// Desktop cards follow the pointer without cropping the original artwork.
cards.forEach((card) => {
  let frame = 0;
  let point;
  card.classList.add("tilt-ready");
  function resetTilt() {
    cancelAnimationFrame(frame);
    frame = 0;
    card.classList.remove("pointer-over");
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  }
  card.addEventListener("pointermove", (event) => {
    if (!motionAllowed() || !finePointer.matches || event.pointerType === "touch") return;
    point = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!motionAllowed() || !finePointer.matches) return;
      const bounds = card.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (point.x - bounds.left) / bounds.width - .5));
      const y = Math.max(-.5, Math.min(.5, (point.y - bounds.top) / bounds.height - .5));
      card.classList.add("pointer-over");
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
      card.style.setProperty("--spot-x", `${(point.x - bounds.left).toFixed(1)}px`);
      card.style.setProperty("--spot-y", `${(point.y - bounds.top).toFixed(1)}px`);
    });
  });
  card.addEventListener("pointerleave", resetTilt);
  card.addEventListener("pointercancel", resetTilt);
  card.addEventListener("blur", resetTilt);
  finePointer.addEventListener("change", resetTilt);
  document.addEventListener("portfolio:motionchange", resetTilt);
  window.addEventListener("blur", resetTilt);
});

// Scroll progress is updated at most once per animation frame.
const header = document.querySelector(".site-header");
let scrollFrame = 0;
function paintScrollState() {
  const range = root.scrollHeight - window.innerHeight;
  const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
  root.style.setProperty("--scroll-progress", String(progress));
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
  scrollFrame = 0;
}
function scheduleScrollState() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScrollState);
}
window.addEventListener("scroll", scheduleScrollState, { passive: true });
window.addEventListener("resize", scheduleScrollState, { passive: true });
window.addEventListener("load", scheduleScrollState, { once: true });
paintScrollState();

// Navigation remains available if JavaScript is disabled.
const menuButton = document.querySelector(".nav-toggle");
const menu = document.querySelector("#primary-menu");
if (menuButton && menu) {
  const setMenu = (isOpen) => {
    const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "Close" : "Menu";
    menu.classList.toggle("is-open", isOpen);
    if (isOpen && !wasOpen) animateElement(menu, [
      { opacity: .2, translate: "0 -8px" }, { opacity: 1, translate: "0 0" },
    ], { duration: 200 });
  };
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenu(false);
  });
  window.matchMedia("(max-width: 860px)").addEventListener("change", () => setMenu(false));
  root.classList.add("js");
}

document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

// Native dialog retains its keyboard focus containment and Escape behaviour.
const dialog = document.querySelector("#image-dialog");
if (dialog && typeof dialog.showModal === "function") {
  const image = dialog.querySelector("img");
  const heading = dialog.querySelector("#image-title");
  let opener;
  let closing = false;

  function closePreview() {
    if (!dialog.open || closing) return;
    closing = true;
    dialog.classList.add("is-closing");
    const finish = () => {
      if (dialog.open) dialog.close();
    };
    const animation = animateElement(dialog, [
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(8px) scale(.985)" },
    ], { duration: 160, easing: "ease-in" });
    if (animation) animation.finished.then(finish, finish);
    else finish();
  }

  document.querySelectorAll("[data-lightbox]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector("img").alt;
      heading.textContent = link.dataset.lightbox;
      closing = false;
      dialog.classList.remove("is-closing");
      dialog.showModal();
      document.body.classList.add("dialog-open");
      animateElement(dialog, [
        { opacity: 0, transform: "translateY(12px) scale(.98)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ], { duration: 240 });
    });
  });
  dialog.querySelector(".dialog-close").addEventListener("click", closePreview);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePreview();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePreview();
  });
  dialog.addEventListener("close", () => {
    closing = false;
    dialog.classList.remove("is-closing");
    document.body.classList.remove("dialog-open");
    image.removeAttribute("src");
    if (opener) opener.focus();
  });
}

// All pages share one decorative scene. It never intercepts a click or replaces the cursor.
function createAmbientScene() {
  const scene = document.createElement("div");
  scene.className = "ambient-scene";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = '<div class="ambient-mesh"></div><div class="ambient-orbs"><i class="ambient-orb orb-blue"></i><i class="ambient-orb orb-violet"></i><i class="ambient-orb orb-teal"></i></div><canvas class="ambient-particles"></canvas><div class="pointer-aura"></div>';
  document.body.prepend(scene);
  const halo = document.createElement("div");
  halo.className = "pointer-halo";
  halo.setAttribute("aria-hidden", "true");
  document.body.appendChild(halo);
  const canvas = scene.querySelector("canvas");
  const aura = scene.querySelector(".pointer-aura");
  const orbs = scene.querySelector(".ambient-orbs");
  const portrait = document.querySelector(".portrait-stage");
  let context;
  try { context = canvas.getContext("2d"); } catch { /* Gradients remain available. */ }
  let width = 0;
  let height = 0;
  let frame = 0;
  let previousTime = 0;
  let lastDraw = 0;
  let particles = [];
  let portraitVisible = Boolean(portrait);
  let pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0, active: false };

  function resizeScene() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    if (context) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3000000 / (width * height)));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    const count = finePointer.matches ? Math.min(60, Math.max(26, Math.round(width * height / 26000))) : 18;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * 11, vy: -(3 + Math.random() * 6),
      size: .7 + Math.random() * 1.2, phase: Math.random() * Math.PI * 2,
    }));
  }

  function drawParticles(time, delta) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      const distance = pointer.active ? Math.hypot(particle.x - pointer.x, particle.y - pointer.y) : Infinity;
      if (distance > 1 && distance < 150) {
        const force = (1 - distance / 150) * 24 * delta;
        particle.x += (particle.x - pointer.x) / distance * force;
        particle.y += (particle.y - pointer.y) / distance * force;
      }
      if (particle.x < -12) particle.x = width + 12;
      if (particle.x > width + 12) particle.x = -12;
      if (particle.y < -12) particle.y = height + 12;
      if (particle.y > height + 12) particle.y = -12;
      const alpha = .3 + Math.sin(time * .0007 + particle.phase) * .12 + (distance < 180 ? .25 : 0);
      context.fillStyle = `rgba(132,201,255,${alpha.toFixed(2)})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
      for (let j = index + 1; j < particles.length; j++) {
        const other = particles[j];
        const gap = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (gap >= 135) continue;
        context.strokeStyle = `rgba(91,164,235,${((1 - gap / 135) * .16).toFixed(3)})`;
        context.lineWidth = .65;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
      if (pointer.active && distance < 180) {
        context.strokeStyle = `rgba(133,211,255,${((1 - distance / 180) * .24).toFixed(3)})`;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(pointer.x, pointer.y);
        context.stroke();
      }
    });
  }

  function paintScene(time) {
    frame = 0;
    if (!motionAllowed() || document.hidden) return;
    const elapsed = previousTime ? Math.min(time - previousTime, 50) : 16;
    previousTime = time;
    if (pointer.active) {
      const easing = 1 - Math.exp(-elapsed / 90);
      pointer.smoothX += (pointer.x - pointer.smoothX) * easing;
      pointer.smoothY += (pointer.y - pointer.smoothY) * easing;
      aura.style.transform = `translate3d(${pointer.smoothX.toFixed(1)}px,${pointer.smoothY.toFixed(1)}px,0)`;
      halo.style.transform = `translate3d(${pointer.smoothX.toFixed(1)}px,${pointer.smoothY.toFixed(1)}px,0)`;
      const x = (pointer.smoothX / width - .5) * 2;
      const y = (pointer.smoothY / height - .5) * 2;
      orbs.style.transform = `translate3d(${(x * 16).toFixed(1)}px,${(y * 12).toFixed(1)}px,0)`;
      if (portrait && portraitVisible) {
        portrait.style.setProperty("--portrait-x", `${(x * 7).toFixed(1)}px`);
        portrait.style.setProperty("--portrait-y", `${(y * 6).toFixed(1)}px`);
        portrait.style.setProperty("--portrait-rotate", `${(x * 1.2).toFixed(2)}deg`);
      }
    }
    if (!lastDraw || time - lastDraw >= (finePointer.matches ? 32 : 48)) {
      drawParticles(time, lastDraw ? Math.min((time - lastDraw) / 1000, .07) : .032);
      lastDraw = time;
    }
    if (context || pointer.active) frame = requestAnimationFrame(paintScene);
  }

  function startScene() {
    if (!frame && motionAllowed() && !document.hidden) frame = requestAnimationFrame(paintScene);
  }

  function clearPointer() {
    pointer.active = false;
    root.classList.remove("pointer-active", "pointer-interactive");
    orbs.style.removeProperty("transform");
    portrait?.style.removeProperty("--portrait-x");
    portrait?.style.removeProperty("--portrait-y");
    portrait?.style.removeProperty("--portrait-rotate");
  }

  function syncScene() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = lastDraw = 0;
    clearPointer();
    if (motionAllowed() && !document.hidden) startScene();
  }

  window.addEventListener("pointermove", (event) => {
    if (!motionAllowed() || !finePointer.matches || event.pointerType === "touch" || document.body.classList.contains("dialog-open")) return;
    if (!pointer.active) {
      pointer.smoothX = event.clientX;
      pointer.smoothY = event.clientY;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    root.classList.add("pointer-active");
    root.classList.toggle("pointer-interactive", Boolean(event.target?.closest?.("a, button")));
    startScene();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", clearPointer);
  window.addEventListener("blur", clearPointer);
  document.addEventListener("keydown", (event) => { if (event.key === "Tab" || event.key === "Escape") clearPointer(); });
  document.addEventListener("portfolio:motionchange", syncScene);
  document.addEventListener("visibilitychange", syncScene);
  finePointer.addEventListener("change", () => { resizeScene(); syncScene(); });
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; resizeScene(); });
  }, { passive: true });
  if (portrait && typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(([entry]) => { portraitVisible = entry.isIntersecting; });
    observer.observe(portrait);
  }
  resizeScene();
  syncScene();
}

// Magnetic motion has a small travel distance so targets remain easy to click.
function setupMagneticButtons() {
  document.querySelectorAll(".btn, .whatsapp-fab").forEach((button) => {
    let frame = 0;
    let point;
    button.classList.add("magnetic-ready");
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      button.style.removeProperty("--magnet-x");
      button.style.removeProperty("--magnet-y");
    };
    button.addEventListener("pointermove", (event) => {
      if (!motionAllowed() || !finePointer.matches || event.pointerType === "touch") return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!motionAllowed() || !finePointer.matches) return;
        const bounds = button.getBoundingClientRect();
        const clamp = (value) => Math.max(-5, Math.min(5, value * .12));
        button.style.setProperty("--magnet-x", `${clamp(point.x - bounds.left - bounds.width / 2).toFixed(1)}px`);
        button.style.setProperty("--magnet-y", `${clamp(point.y - bounds.top - bounds.height / 2).toFixed(1)}px`);
      });
    }, { passive: true });
    button.addEventListener("pointerleave", reset);
    button.addEventListener("pointercancel", reset);
    button.addEventListener("blur", reset);
    window.addEventListener("blur", reset);
    finePointer.addEventListener("change", reset);
    document.addEventListener("portfolio:motionchange", reset);
  });
}

// Section accents pause offscreen. The observer does not hide any content.
function setupSectionMotion() {
  const sections = document.querySelectorAll(".section, .gallery-header, .gallery-main, .footer");
  if (typeof IntersectionObserver !== "function") {
    sections.forEach((section) => section.classList.add("is-in-view"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-in-view", entry.isIntersecting));
  }, { threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}

setupMagneticButtons();
setupSectionMotion();
createAmbientScene();

// The donut represents listed skill entries, not invented proficiency ratings.
function setupSkillsChart() {
  const chart = document.querySelector("[data-skills-chart]");
  if (!chart) return;
  const groups = [...document.querySelectorAll("[data-skill-group]")];
  const categories = groups.map((group) => ({
    id: group.dataset.skillGroup,
    name: group.querySelector("h3").textContent,
    count: group.querySelectorAll("li").length,
    element: group,
  }));
  const total = categories.reduce((sum, category) => sum + category.count, 0);
  if (!total) return;
  const controls = [...chart.querySelectorAll("[data-skill-select]")];
  const slices = [...chart.querySelectorAll(".skill-slice")];
  const count = chart.querySelector("[data-skill-count]");
  const caption = chart.querySelector("[data-skill-caption]");
  const readout = chart.querySelector(".skill-chart-readout");
  const reset = chart.querySelector("[data-skill-reset]");
  let selected = null;
  let played = false;
  let readoutAnimation;
  let offset = 0;
  categories.forEach((category) => {
    const slice = slices.find((element) => element.dataset.skillSelect === category.id);
    const share = category.count / total * 100;
    const gap = Math.min(4, share * .18);
    if (slice) {
      const length = (share - gap).toFixed(3);
      slice.setAttribute("stroke-dasharray", `${length} ${(100 - Number(length)).toFixed(3)}`);
      slice.setAttribute("stroke-dashoffset", String(-(offset + gap / 2)));
      slice.dataset.arcLength = length;
      slice.style.visibility = category.count ? "visible" : "hidden";
    }
    offset += share;
    controls.filter((control) => control.dataset.skillSelect === category.id).forEach((control) => {
      control.setAttribute("aria-label", `Highlight ${category.name}, ${category.count} listed skills`);
      const label = control.querySelector(".skill-option-count");
      if (label) label.textContent = `${category.count} skills`;
    });
  });
  count.textContent = String(total);
  caption.textContent = `Across ${categories.length} areas`;

  function selectCategory(id) {
    const category = categories.find((item) => item.id === id);
    selected = category ? category.id : null;
    chart.classList.toggle("has-selection", Boolean(category));
    controls.forEach((control) => control.setAttribute("aria-pressed", String(control.dataset.skillSelect === selected)));
    reset.setAttribute("aria-pressed", String(!category));
    categories.forEach((item) => item.element.classList.toggle("is-skill-active", item.id === selected));
    count.textContent = String(category ? category.count : total);
    caption.textContent = category ? category.name : `Across ${categories.length} areas`;
    readoutAnimation?.cancel();
    readoutAnimation = animateElement(readout, [
      { opacity: .4, transform: "scale(.94)" }, { opacity: 1, transform: "scale(1)" },
    ], { duration: 280 });
    category?.element.querySelectorAll("li").forEach((item, index) => animateElement(item, [
      { opacity: .5, transform: "translateX(-7px)" }, { opacity: 1, transform: "translateX(0)" },
    ], { delay: index * 45, duration: 340 }));
  }

  controls.forEach((control) => {
    const choose = () => selectCategory(selected === control.dataset.skillSelect ? null : control.dataset.skillSelect);
    control.addEventListener("click", choose);
    if (control.tagName.toLowerCase() === "circle") {
      control.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        choose();
      });
    }
  });
  reset.addEventListener("click", () => selectCategory(null));

  function revealChart() {
    if (played || !motionAllowed() || !chart.classList.contains("is-in-view")) return;
    played = true;
    slices.forEach((slice, index) => animateElement(slice, [
      { strokeDasharray: "0 100", opacity: .4 },
      { strokeDasharray: slice.getAttribute("stroke-dasharray"), opacity: 1 },
    ], { duration: 950, delay: index * 120 }));
    animateElement(readout, [
      { opacity: .25, transform: "scale(.88)" }, { opacity: 1, transform: "scale(1)" },
    ], { duration: 700, delay: 200 });
  }
  if (typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(([entry]) => {
      chart.classList.toggle("is-in-view", entry.isIntersecting);
      revealChart();
    }, { threshold: .25 });
    observer.observe(chart);
  } else {
    chart.classList.add("is-in-view");
    revealChart();
  }
  document.addEventListener("portfolio:motionchange", revealChart);
}

setupSkillsChart();
