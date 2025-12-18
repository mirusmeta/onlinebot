// screens/mind.js
// Robust breathing using requestAnimationFrame (RAF) — deterministic, cancellable

const STORAGE_KEY = "mind_state_v1";

const DEFAULT_DATA = { mood: null };

const MOODS = [
    { id: "sad", emoji: "😔", label: "Грусть" },
    { id: "anxious", emoji: "😰", label: "Тревога" },
    { id: "neutral", emoji: "😐", label: "Нормально" },
    { id: "good", emoji: "🙂", label: "Хорошо" },
    { id: "great", emoji: "😄", label: "Отлично" }
];

const TOTAL_STEPS = 10;
const INHALE_MS = 4000;
const EXHALE_MS = 6000;

function loadData() {
    return { ...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
}
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ========== breathing engine state ========== */
let breathing = {
    running: false,
    rafId: null,
    phaseStart: 0,
    phase: "inhale", // "inhale" | "exhale"
    step: 1,
    container: null,
    circleEl: null,
    textEl: null,
    progressEl: null,
    onFinishCalled: false
};

/* ========== helper easing ========== */
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/* ========== render main ========== */

export function renderMind(container) {
    const data = loadData();

    container.innerHTML = `
    <section class="mind-screen">

      <div class="sos-card">
        <div class="sos-title">Если тревожно прямо сейчас</div>
        <button class="sos-main-btn" data-action="open-sos">SOS · Анти-стресс</button>
      </div>

      <div class="metric-card">
        <div class="metric-header"><span>🧠 Как ты себя чувствуешь?</span></div>
        <div class="mood-picker">
          ${MOODS.map(m => `
            <button class="mood-btn ${data.mood === m.id ? "active" : ""}" data-mood="${m.id}">
              <div class="mood-emoji">${m.emoji}</div>
              <div class="mood-label">${m.label}</div>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header"><span>🧭 Навигатор помощи</span></div>
        <div class="help-list">
          <button data-topic="bullying">Буллинг</button>
          <button data-topic="conflict">Конфликты</button>
          <button data-topic="exam">Стресс перед экзаменами</button>
        </div>
      </div>

      <div class="mind-content" id="mindContent"></div>

      <div class="sos-overlay hidden" id="sosOverlay" aria-hidden="true">
        <div class="sos-overlay-content" id="sosContent"></div>
      </div>
    </section>
  `;

    bindEvents(container);
}

/* ========== binding ========== */

function bindEvents(container) {
    const data = loadData();
    const content = container.querySelector("#mindContent");
    const overlay = container.querySelector("#sosOverlay");
    const sosContent = container.querySelector("#sosContent");

    const openBtn = container.querySelector('[data-action="open-sos"]');
    if (openBtn) {
        openBtn.onclick = () => {
            // ensure any previous breathing stopped
            stopBreathing();
            overlay.classList.remove("hidden");
            overlay.setAttribute("aria-hidden", "false");
            renderIntro(sosContent);
        };
    }

    // mood buttons
    container.querySelectorAll('.mood-btn').forEach(btn => {
        btn.onclick = () => {
            data.mood = btn.dataset.mood;
            saveData(data);
            renderMind(container);
        };
    });

    // help navigator
    container.querySelectorAll('[data-topic]').forEach(btn => {
        btn.onclick = () => {
            content.innerHTML = getHelpContent(btn.dataset.topic);
        };
    });
}

/* ========== SOS screens ========== */

function renderIntro(container) {
    container.innerHTML = `
    <div class="sos-step sos-animate">
      <p class="sos-intro-text">
        Сейчас мы сделаем дыхательное упражнение.<br>
        Следуй за кругом и текстом.<br>
        Это займёт пару минут.
      </p>
      <button class="sos-main-btn" id="startBreathing">Начать</button>
    </div>
  `;

    requestAnimationFrame(() => container.querySelector('.sos-step')?.classList.add('show'));

    const startBtn = container.querySelector("#startBreathing");
    if (startBtn) startBtn.onclick = () => startBreathing(container);
}

/* ========== BREATHING ENGINE (RAF) ========== */

function startBreathing(container) {
    if (breathing.running) return; // guard
    breathing.running = true;
    breathing.onFinishCalled = false;
    breathing.step = 1;
    breathing.phase = "inhale";
    breathing.phaseStart = performance.now();
    breathing.container = container;

    container.innerHTML = `
    <div class="sos-step show">
      <div class="sos-progress" id="sosProgress">Этап 1 / ${TOTAL_STEPS}</div>
      <div class="breath-circle" id="breathCircle"></div>
      <div class="breath-text" id="breathText">Вдох</div>
      <div style="height:10px"></div>
      <button class="close-sos" id="cancelBreathing">Прервать</button>
    </div>
  `;

    breathing.circleEl = container.querySelector("#breathCircle");
    breathing.textEl = container.querySelector("#breathText");
    breathing.progressEl = container.querySelector("#sosProgress");

    const cancelBtn = container.querySelector("#cancelBreathing");
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            stopBreathing();
            const ov = document.getElementById("sosOverlay");
            if (ov) {
                ov.classList.add("hidden");
                ov.setAttribute("aria-hidden", "true");
            }
        };
    }

    // start RAF loop
    breathing.rafId = requestAnimationFrame(breathFrame);
}

function breathFrame(now) {
    if (!breathing.running) {
        return cancelRAF();
    }

    // compute elapsed in current phase
    const phaseStart = breathing.phaseStart;
    const phase = breathing.phase;
    const elapsed = now - phaseStart;
    const duration = phase === "inhale" ? INHALE_MS : EXHALE_MS;
    let t = Math.min(Math.max(elapsed / duration, 0), 1); // 0..1
    const eased = easeInOutQuad(t);
    let scale;

    if (breathing.phase === "inhale") {
        // вдох — медленно расширяемся
        scale = 1 + 0.25 * eased;
    } else {
        // выдох — быстрее и глубже сжимаемся
        scale = 1.25 - 0.25 * eased;
    }
    if (breathing.phase === "inhale") {
        breathing.circleEl.style.background = "#ef4444";
    } else {
        breathing.circleEl.style.background = "#f97316";
    }

    if (breathing.circleEl) {
        breathing.circleEl.style.transform = `scale(${scale})`;
    }


    // update text depending on phase
    if (breathing.textEl) {
        breathing.textEl.textContent = phase === "inhale" ? "Вдох" : "Выдох";
    }

    // if phase finished -> switch
    if (elapsed >= duration) {
        // advance phase
        if (phase === "inhale") {
            breathing.phase = "exhale";
            breathing.phaseStart = now;
            // stay on same step until exhale ends
        } else { // exhale finished -> step completed
            // increment step count
            breathing.step++;
            if (breathing.step > TOTAL_STEPS) {
                // finished all cycles
                breathing.running = false;
                // small delay to let final exhale visual settle
                setTimeout(() => {
                    renderFinish(breathing.container);
                    cancelRAF();
                }, 250);
                return;
            } else {
                breathing.phase = "inhale";
                breathing.phaseStart = now;
            }
            // update progress UI
            if (breathing.progressEl) {
                breathing.progressEl.textContent = `Этап ${breathing.step} / ${TOTAL_STEPS}`;
            }
        }
    }

    // continue
    breathing.rafId = requestAnimationFrame(breathFrame);
}

function cancelRAF() {
    if (breathing.rafId) {
        cancelAnimationFrame(breathing.rafId);
        breathing.rafId = null;
    }
}

/* safe stop */
function stopBreathing() {
    breathing.running = false;
    cancelRAF();
    // reset transforms (optional)
    if (breathing.circleEl) breathing.circleEl.style.transform = "";
    breathing.container = null;
    breathing.circleEl = null;
    breathing.textEl = null;
    breathing.progressEl = null;
}

/* ========== finish UI ========== */

function renderFinish(container) {
    container.innerHTML = `
    <div class="sos-step sos-animate show">
      <p class="sos-finish-text">Ты в порядке 🤍</p>
      <button class="close-sos" id="closeSOS">Закрыть</button>
    </div>
  `;

    const closeBtn = container.querySelector("#closeSOS");
    if (closeBtn) {
        closeBtn.onclick = () => {
            stopBreathing();
            const ov = document.getElementById("sosOverlay");
            if (ov) {
                ov.classList.add("hidden");
                ov.setAttribute("aria-hidden", "true");
            }
        };
    }
}

/* ========== help content ========== */

function getHelpContent(type) {
    if (type === "bullying") return `<div class="mind-box"><h3>Буллинг</h3><p>Ты не обязан терпеть давление. Обратись за поддержкой.</p></div>`;
    if (type === "conflict") return `<div class="mind-box"><h3>Конфликты</h3><p>Пауза и спокойный разговор помогают.</p></div>`;
    if (type === "exam") return `<div class="mind-box"><h3>Экзамены</h3><p>Тревога нормальна. Делай маленькие шаги.</p></div>`;
    return "";
}
