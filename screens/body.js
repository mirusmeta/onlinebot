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
        <!-- Карточка с полезными советами -->
        <div class="advice-card">
            <div class="advice-header">
                <h3 class="advice-title">Полезные советы</h3>
            </div>
            <div class="advice-bottom-image">
                <div class="bottom-img"></div>
            </div>
        </div>
        
        <!-- Контейнер для двух горизонтальных карточек -->
        <div class="horizontal-cards">
            <!-- Карточка "Вода" -->
            <div class="tracker-card water-card">
                <div class="card-header">
                    <h4 class="card-title">Вода</h4>
                </div>
                <div class="card-content">
                    <div class="card-main-value">0.8л / 2л</div>
                    <div class="card-buttons">
                        <div class="minus-btn" data-action="remove-water">
                            <img src="../icons/minus.svg">
                        </div>
                        <span class="action-text">200 мл</span>
                        <div class="plus-btn" data-action="add-water">
                            <img src="../icons/plus.svg">
                        </div>
                    </div>
                </div>
                <!-- Фоновый прогресс -->
                <div class="card-progress-bg"></div>
                <div class="card-progress-fill" style="height: 40%"></div>
            </div>
            
            <!-- Карточка "Сон" -->
            <div class="tracker-card sleep-card">
                <div class="card-header">
                    <h4 class="card-title">Сон</h4>
                </div>
                <div class="card-content">
                    <div class="card-main-value">6ч / 7ч</div>
                    <div class="card-buttons">
                        <div class="minus-btn" data-action="remove-sleep">
                            <img src="../icons/minus.svg">
                        </div>
                        <span class="action-text">1 час</span>
                        <div class="plus-btn" data-action="add-sleep">
                            <img src="../icons/plus.svg">
                        </div>
                    </div>
                </div>
                <!-- Фоновый прогресс -->
                <div class="card-progress-bg"></div>
                <div class="card-progress-fill" style="height: 85%"></div>
            </div>
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
