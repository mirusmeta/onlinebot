// screens/growth.js
// Block 3 — Development (Social wellbeing)

const STORAGE_KEY = "growth_state_v2";

const DEFAULT_DATA = {
  mode: "idle",          // idle | focus | break
  focusDuration: 25,     // minutes
  timeLeft: 25 * 60,     // seconds
  testResult: null,
  completedSessions: 0
};

let timerInterval = null;

/* ================= utils ================= */

function loadData() {
  return { ...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ================= render ================= */

export function renderGrowth(container) {
  const data = loadData();

  container.innerHTML = `
    <section class="growth-screen">

      <!-- Pomodoro -->
      <div class="metric-card">
        <div class="metric-header">
          <span>⏱ Фокус (Pomodoro)</span>
          <span class="pomodoro-mode">
            ${data.mode === "focus" ? "Фокус" : data.mode === "break" ? "Перерыв" : ""}
          </span>
        </div>

        <div class="pomodoro-time">${formatTime(data.timeLeft)}</div>

        <div class="pomodoro-presets">
          ${[25, 40, 60].map(m => `
            <button
              class="preset-btn ${data.focusDuration === m ? "active" : ""}"
              data-preset="${m}"
              ${data.mode !== "idle" ? "disabled" : ""}
            >
              ${m} мин
            </button>
          `).join("")}
        </div>

        <button class="pomodoro-btn" data-action="toggle">
          ${data.mode === "idle" ? "Начать" : "Стоп"}
        </button>
      </div>

      <!-- Self knowledge -->
      <div class="metric-card">
        <div class="metric-header">
          <span>🧩 Самопознание</span>
        </div>

        <p class="growth-text">Что тебе сейчас ближе?</p>

        <div class="test-options">
          <button data-test="logic">Аналитика</button>
          <button data-test="people">Общение с людьми</button>
        </div>

        ${
      data.testResult
          ? `<div class="test-result">Твоя сильная сторона: <b>${data.testResult}</b></div>`
          : ""
  }
      </div>

      <!-- Soft skills -->
      <div class="metric-card">
        <div class="metric-header">
          <span>🤝 Софт-скиллы</span>
        </div>

        <div class="soft-list">
          <div class="soft-item">💬 Слушай собеседника, не перебивая</div>
          <div class="soft-item">🎤 Говори уверенно, но спокойно</div>
          <div class="soft-item">👥 В команде важна поддержка</div>
        </div>
      </div>

    </section>
  `;

  bindEvents(container);
}

/* ================= events ================= */

function bindEvents(container) {
  const data = loadData();

  // presets
  container.querySelectorAll('[data-preset]').forEach(btn => {
    btn.onclick = () => {
      const minutes = Number(btn.dataset.preset);
      data.focusDuration = minutes;
      data.timeLeft = minutes * 60;
      saveData(data);
      renderGrowth(container);
    };
  });

  // start / stop
  container.querySelector('[data-action="toggle"]').onclick = () => {
    if (data.mode === "idle") {
      startFocus(container, data);
    } else {
      resetTimer(data);
      renderGrowth(container);
    }
  };

  // test
  container.querySelectorAll('[data-test]').forEach(btn => {
    btn.onclick = () => {
      data.testResult =
          btn.dataset.test === "logic"
              ? "Аналитическое мышление"
              : "Коммуникация с людьми";
      saveData(data);
      renderGrowth(container);
    };
  });
}

/* ================= pomodoro logic ================= */

function startFocus(container, data) {
  data.mode = "focus";
  data.timeLeft = data.focusDuration * 60;
  saveData(data);

  renderGrowth(container);   // ← ВАЖНО
  runTimer(container, data);
}


function startBreak(container, data) {
  data.mode = "break";
  data.timeLeft = 5 * 60;
  saveData(data);

  renderGrowth(container);   // ← тоже
  runTimer(container, data);
}


function runTimer(container, data) {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (data.timeLeft > 0) {
      data.timeLeft--;
      saveData(data);
      const timeEl = container.querySelector(".pomodoro-time");
      if (timeEl) timeEl.textContent = formatTime(data.timeLeft);
    } else {
      clearInterval(timerInterval);

      if (data.mode === "focus") {
        startBreak(container, data);
      } else {
        resetTimer(data);
        data.completedSessions = (data.completedSessions || 0) + 1;
        saveData(data);
        alert("Цикл Pomodoro завершён 👏");
        renderGrowth(container);

      }
    }
  }, 1000);
}

function resetTimer(data) {
  clearInterval(timerInterval);
  data.mode = "idle";
  data.timeLeft = data.focusDuration * 60;
  saveData(data);
}
