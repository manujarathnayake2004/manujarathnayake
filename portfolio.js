"use strict";

// All page content and links remain usable without JavaScript.
const menuButton = document.querySelector(".nav-toggle");
const menu = document.querySelector("#primary-menu");

if (menuButton && menu) {
  const setMenu = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "Close" : "Menu";
    menu.classList.toggle("is-open", isOpen);
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
  const mobileLayout = window.matchMedia("(max-width: 860px)");
  mobileLayout.addEventListener("change", () => setMenu(false));
  document.documentElement.classList.add("js");
}

document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

// Native dialog provides keyboard focus containment and Escape-to-close.
const dialog = document.querySelector("#image-dialog");
if (dialog && typeof dialog.showModal === "function") {
  const image = dialog.querySelector("img");
  const heading = dialog.querySelector("#image-title");
  let opener;

  document.querySelectorAll("[data-lightbox]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector("img").alt;
      heading.textContent = link.dataset.lightbox;
      dialog.showModal();
      document.body.classList.add("dialog-open");
    });
  });

  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    image.removeAttribute("src");
    if (opener) opener.focus();
  });
}
