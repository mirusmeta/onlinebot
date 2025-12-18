import { initNavigation } from "./core/navigation.js";
import { renderBody } from "./screens/body.js";
import { renderMind } from "./screens/mind.js";
import { renderGrowth } from "./screens/growth.js";
import { renderProfile } from "./screens/profile.js";

const container = document.getElementById("appContent");

function render(screen) {
  switch(screen) {
    case "body": return renderBody(container);
    case "mind": return renderMind(container);
    case "growth": return renderGrowth(container);
    case "profile": return renderProfile(container);
    default: return renderBody(container);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const nav = initNavigation(render);
  const initial = nav.getInitial() || 'body';
  nav.setActiveByName(initial);
  render(initial);

  // handle hash changes (deep links)
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#','');
    if (h) {
      nav.setActiveByName(h);
      render(h);
    }
  });
});