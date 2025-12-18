import { state } from "./state.js";

export function initNavigation(onChange) {
  const items = Array.from(document.querySelectorAll(".nav-item"));

  // attach handlers
  items.forEach(item => {
    item.addEventListener("click", () => {
      const screen = item.dataset.tab || item.dataset.screen;
      if (!screen) return;

      state.currentScreen = screen;
      setActive(items, item);
      onChange(screen);
    });
  });

  // return helper to get currently active or default
  return {
    getInitial: () => {
      const active = items.find(i => i.classList.contains('active'));
      return active ? (active.dataset.tab || active.dataset.screen) : (location.hash.replace('#','') || items[0]?.dataset.tab);
    },
    setActiveByName: (name) => {
      const i = items.find(it => (it.dataset.tab||it.dataset.screen) === name);
      if (i) setActive(items, i);
    }
  };
}

function setActive(items, activeItem) {
  items.forEach(i => i.classList.remove("active"));
  activeItem.classList.add("active");
}