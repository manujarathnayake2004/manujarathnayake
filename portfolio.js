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
const cards = [...document.querySelectorAll(".work-card")];
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
}

const revealSelector = [
  ".section > .container > .eyebrow", ".section > .container > h2",
  ".section-heading", ".section-intro", ".about-copy", ".facts",
  ".work-card", ".project-heading", ".project-detail",
  ".career-grid > div > .eyebrow", ".career-grid > div > h2",
  ".timeline-item", ".education-list > li", ".skill-group", ".strengths",
  ".service", ".contact-grid > div", ".contact-details", ".gallery-item", ".gallery-contact",
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

// The small desktop tilt moves the entire card without cropping its artwork.
cards.forEach((card) => {
  let frame = 0;
  let bounds;
  let point;
  card.classList.add("tilt-ready");
  function resetTilt() {
    cancelAnimationFrame(frame);
    frame = 0;
    bounds = null;
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  }
  card.addEventListener("pointerenter", () => {
    if (motionAllowed() && finePointer.matches) bounds = card.getBoundingClientRect();
  });
  card.addEventListener("pointermove", (event) => {
    if (!motionAllowed() || !finePointer.matches || event.pointerType === "touch") return;
    point = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!motionAllowed() || !finePointer.matches) return;
      bounds ||= card.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (point.x - bounds.left) / bounds.width - .5));
      const y = Math.max(-.5, Math.min(.5, (point.y - bounds.top) / bounds.height - .5));
      card.style.setProperty("--tilt-x", `${(-y * 3.5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 3.5).toFixed(2)}deg`);
    });
  });
  card.addEventListener("pointerleave", resetTilt);
  card.addEventListener("pointercancel", resetTilt);
  card.addEventListener("blur", resetTilt);
  finePointer.addEventListener("change", resetTilt);
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
