// screens/body.js

const STORAGE_KEY = "body_metrics_v1";

const DEFAULT_DATA = {
    water: 0,
    sleep: 7,
    steps: 0,
    points: 0
};

const MOTIVATION = [
    { min: 0, text: "Баланс начинается с заботы о себе 💙" },
    { min: 20, text: "Хороший старт. Тело чувствует внимание 💪" },
    { min: 40, text: "Ты выстраиваешь здоровый ритм 🔥" },
    { min: 70, text: "Отличный баланс. Так держать 🌱" }
];

/* ===== utils ===== */

function loadData() {
    return { ...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calcPoints({ water, sleep, steps }) {
    return (
        water * 2 +
        Math.min(sleep, 8) * 5 +
        Math.floor(steps / 1000) * 3
    );
}

function getMotivation(points) {
    return MOTIVATION.slice().reverse().find(m => points >= m.min)?.text;
}

/* ===== render ===== */

export function renderBody(container) {
    const data = loadData();
    data.points = calcPoints(data);
    saveData(data);

    const sleepPercent = Math.min((data.sleep / 12) * 100, 100);

    container.innerHTML = `
    <section class="body-screen">

      <!-- Баллы -->
      <div class="points-card">
        <div class="points-title">Баллы благополучия</div>
        <div class="points-value">${data.points}</div>
        <div class="points-sub">Сегодня</div>
      </div>

      <!-- Вода -->
      <div class="metric-card">
        <div class="metric-header">
          <span>💧 Вода</span>
          <span>${data.water} стак.</span>
        </div>
        <div class="metric-controls">
          <button data-action="water-minus">−</button>
          <button data-action="water-plus">+</button>
        </div>
      </div>

      <!-- Сон -->
      <div class="metric-card">
        <div class="metric-header">
          <span>😴 Сон</span>
          <span>${data.sleep} ч</span>
        </div>

        <div class="metric-controls">
          <button data-action="sleep-minus">−</button>
          <button data-action="sleep-plus">+</button>
        </div>

        <div class="sleep-progress">
          <div class="sleep-progress-bar" style="width:${sleepPercent}%"></div>
        </div>
        <div style="margin-top: 10px; font-size: 14px" class="sleep-hint">* Рекомендуется 7–9 часов</div>
      </div>

      <!-- Шаги -->
      <div class="metric-card">
        <div class="metric-header">
          <span>🚶 Шаги</span>
        </div>

        <div class="steps-input">
          <input
            type="number"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Например: 6500"
            value="${data.steps || ""}"
            data-action="steps-input"
          />
          <button class="steps-save" data-action="steps-save">
            Сохранить
          </button>
        </div>
      </div>

      <!-- Мотивация -->
      <div class="motivation-card">
        ${getMotivation(data.points)}
      </div>

    </section>
  `;

    bindEvents(container);
}

/* ===== events ===== */

function bindEvents(container) {
    const data = loadData();

    // вода
    container.querySelector('[data-action="water-plus"]').onclick = () => {
        data.water++;
        rerender(container, data);
    };

    container.querySelector('[data-action="water-minus"]').onclick = () => {
        data.water = Math.max(0, data.water - 1);
        rerender(container, data);
    };

    // сон
    container.querySelector('[data-action="sleep-plus"]').onclick = () => {
        data.sleep = Math.min(12, data.sleep + 1);
        rerender(container, data);
    };

    container.querySelector('[data-action="sleep-minus"]').onclick = () => {
        data.sleep = Math.max(0, data.sleep - 1);
        rerender(container, data);
    };

    // шаги
    const stepsInput = container.querySelector('[data-action="steps-input"]');
    const stepsSave = container.querySelector('[data-action="steps-save"]');

    stepsInput.oninput = e => {
        e.target.value = e.target.value.replace(/\D/g, "");
    };

    stepsSave.onclick = () => {
        data.steps = Number(stepsInput.value) || 0;
        stepsInput.blur();
        updateStats(container, data);
    };
}

/* ===== updates ===== */

function rerender(container, data) {
    data.points = calcPoints(data);
    saveData(data);
    renderBody(container);
}

function updateStats(container, data) {
    data.points = calcPoints(data);
    saveData(data);

    container.querySelector('.points-value').textContent = data.points;
    container.querySelector('.motivation-card').textContent = getMotivation(data.points);
}
