// screens/body.js — рабочая версия кнопок + / - для воды и сна
const STORAGE_KEY = "body_metrics_v1";

const DEFAULT_DATA = {
    water: 800,      // миллилитры
    sleep: 7,        // часы
    steps: 0,
    stepsGoal: 6000,
    points: 0
};

const MOTIVATION = [
    { min: 0, text: "Баланс начинается с заботы о себе 💙" },
    { min: 20, text: "Хороший старт. Тело чувствует внимание 💪" },
    { min: 40, text: "Ты выстраиваешь здоровый ритм 🔥" },
    { min: 70, text: "Отличный баланс. Так держать 🌱" }
];

function loadData() {
    try {
        return { ...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
        return { ...DEFAULT_DATA };
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calcPoints({ water, sleep, steps }) {
    return Math.round((water / 1000) * 2 + Math.min(sleep, 8) * 5 + Math.floor(steps / 1000) * 3);
}

function getMotivation(points) {
    return MOTIVATION.slice().reverse().find(m => points >= m.min)?.text || MOTIVATION[0].text;
}

export function renderBody(container) {
    const data = loadData();
    data.points = calcPoints(data);
    saveData(data);

    const waterPercent = Math.min((data.water / 2000) * 100, 100);
    const sleepPercent = Math.min((data.sleep / 8) * 100, 100);
    const stepsPercent = Math.min((data.steps / data.stepsGoal) * 100, 100);

    container.innerHTML = `
    <section class="body-root">
      <div class="advice-card" id="adviceCard" title="Полезные советы"></div>

      <div class="horizontal-cards">
        <div class="tracker-card water-card" id="waterCard">
          <div class="card-header"><h4 class="card-title">Вода</h4></div>

          <div class="card-content">
            <div class="card-main-value" id="waterValue">${(data.water / 1000).toFixed(1)}л / 2л</div>

            <div class="card-buttons">
              <button class="btn minus-btn" data-action="remove-water" aria-label="убрать воду">−</button>
              <div class="action-text">200 мл</div>
              <button class="btn plus-btn" data-action="add-water" aria-label="добавить воду">+</button>
            </div>
          </div>

          <div class="card-progress-bg"></div>
          <div class="card-progress-fill" id="waterFill" style="height:${waterPercent}%"></div>
        </div>

        <div class="tracker-card sleep-card" id="sleepCard">
          <div class="card-header"><h4 class="card-title">Сон</h4></div>

          <div class="card-content">
            <div class="card-main-value" id="sleepValue">${data.sleep}ч / 8ч</div>

            <div class="card-buttons">
              <button class="btn minus-btn" data-action="remove-sleep" aria-label="убрать сон">−</button>
              <div class="action-text">1 час</div>
              <button class="btn plus-btn" data-action="add-sleep" aria-label="добавить сон">+</button>
            </div>
          </div>

          <div class="card-progress-bg"></div>
          <div class="card-progress-fill" id="sleepFill" style="height:${sleepPercent}%"></div>
        </div>
      </div>

      <div class="steps-wrap">
        <div class="steps-card" id="stepsCard">
          <div class="steps-title">Шаги</div>
          <div class="steps-value" id="stepsValue">${data.steps} / ${data.stepsGoal}</div>
          <div class="steps-progress"><div class="steps-fill" id="stepsFill" style="width:${stepsPercent}%"></div></div>
        </div>
      </div>

      <div class="goal-row">
        <input id="stepsGoalInput" type="number" min="1" value="${data.stepsGoal}" />
        <button id="saveGoalBtn">Сохранить</button>
      </div>
    </section>
    `;

    // дать немного времени DOM-у, потом навесить события
    setTimeout(() => bindEvents(container), 0);
}

/* ===== events и обновления ===== */

function bindEvents(container) {
    const tg = window.Telegram?.WebApp;
    const data = loadData();

    // advice card - пасхалка
    const adviceCard = container.querySelector("#adviceCard");
    adviceCard.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("medium");
        if (tg?.showPopup) {
            try {
                tg.showPopup({
                    title: "ФА 😏",
                    message: "Фа… вота фа… шнели… пасхалка поймана 🐸",
                    buttons: [{ type: "ok", text: "Фа" }]
                });
                return;
            } catch (e) { /* fallthrough */ }
        }
        alert("Фа… вота фа… шнели… пасхалка!");
    });

    // вода
    const addWater = container.querySelector('[data-action="add-water"]');
    const removeWater = container.querySelector('[data-action="remove-water"]');

    addWater.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("light");
        data.water = Math.min(2000, (data.water || 0) + 200);
        saveData(data);
        updateWaterUI(container, data);
    });

    removeWater.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("light");
        data.water = Math.max(0, (data.water || 0) - 200);
        saveData(data);
        updateWaterUI(container, data);
    });

    // сон
    const addSleep = container.querySelector('[data-action="add-sleep"]');
    const removeSleep = container.querySelector('[data-action="remove-sleep"]');

    addSleep.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("light");
        data.sleep = Math.min(12, (data.sleep || 0) + 1);
        saveData(data);
        updateSleepUI(container, data);
    });

    removeSleep.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("light");
        data.sleep = Math.max(0, (data.sleep || 0) - 1);
        saveData(data);
        updateSleepUI(container, data);
    });

    // шаги — клик по карточке спрашивает число (или можно заменить)
    const stepsCard = container.querySelector("#stepsCard");
    stepsCard.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("light");
        const answer = prompt("Сколько шагов пройдено сегодня?", String(data.steps || 0));
        const n = parseInt(answer, 10);
        if (!isNaN(n) && n >= 0) {
            data.steps = n;
            saveData(data);
            updateStepsUI(container, data);
        }
    });

    // цель шагов
    const saveGoalBtn = container.querySelector("#saveGoalBtn");
    const goalInput = container.querySelector("#stepsGoalInput");
    saveGoalBtn.addEventListener("click", () => {
        const v = parseInt(goalInput.value, 10);
        if (!isNaN(v) && v > 0) {
            data.stepsGoal = v;
            saveData(data);
            updateStepsUI(container, data);
            tg?.HapticFeedback?.notificationOccurred?.("success");
            saveGoalBtn.textContent = "Сохранено";
            setTimeout(() => saveGoalBtn.textContent = "Сохранить", 1000);
        } else {
            saveGoalBtn.textContent = "Ошибка";
            setTimeout(() => saveGoalBtn.textContent = "Сохранить", 1000);
        }
    });

    // начальные апдейты UI
    updateWaterUI(container, data);
    updateSleepUI(container, data);
    updateStepsUI(container, data);
}

function updateWaterUI(container, data) {
    const waterValue = container.querySelector("#waterValue");
    const waterFill = container.querySelector("#waterFill");
    const percent = Math.min((data.water / 2000) * 100, 100);
    waterValue.textContent = `${(data.water / 1000).toFixed(1)}л / 2л`;
    waterFill.style.height = percent + "%";
    updatePoints(container, data);
}

function updateSleepUI(container, data) {
    const sleepValue = container.querySelector("#sleepValue");
    const sleepFill = container.querySelector("#sleepFill");
    const percent = Math.min((data.sleep / 8) * 100, 100);
    sleepValue.textContent = `${data.sleep}ч / 8ч`;
    if (sleepFill) sleepFill.style.height = percent + "%";
    updatePoints(container, data);
}

function updateStepsUI(container, data) {
    const stepsValue = container.querySelector("#stepsValue");
    const stepsFill = container.querySelector("#stepsFill");
    const percent = Math.min((data.steps / (data.stepsGoal || 1)) * 100, 100);
    stepsValue.textContent = `${data.steps} / ${data.stepsGoal}`;
    if (stepsFill) stepsFill.style.width = percent + "%";
    updatePoints(container, data);
}

function updatePoints(container, data) {
    data.points = calcPoints(data);
    saveData(data);
    // можно показать мотивацию где угодно — пока оставил для расширения
}
