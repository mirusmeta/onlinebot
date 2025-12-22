// screens/growth.js
export function renderGrowth(container) {
  const tg = window.Telegram?.WebApp;

  /* =========================
     DATA
  ========================= */

  const RECOMMENDATIONS = {
    speech: {
      title: "Как обрести уверенность на публичных выступлениях?",
      author: "Ответ от Люка Скайвокера, пилота",
      text: `Чтобы обрести уверенность на публичных выступлениях, важно
            тщательно готовиться, начинать с малого, использовать дыхательные
            техники для успокоения, визуализировать успех, работать над голосом
            и телом (уверенная поза, медленная речь), а также помнить — ошибки
            это часть роста и каждый опыт делает тебя сильнее.`
    },
    planning: {
      title: "Как правильно планировать свой день?",
      author: "Ответ от наставника",
      text: `Начинай день с 2–3 приоритетных задач, используй тайм-блоки,
            не забывай про перерывы и оставляй место для отдыха. План — это
            инструмент, а не строгие рамки.`
    }
  };

  /* =========================
     POMODORO STATE
  ========================= */

  const WORK_TIME = 45 * 60;
  const BREAK_TIME = 15 * 60;
  const STORAGE_KEY = "growth_pomodoro_v1";

  let timer = null;
  let remaining = WORK_TIME;
  let mode = "idle"; // idle | work | break | finished
  let running = false;

  /* =========================
     RENDER MAIN
  ========================= */

  renderMain();

  function renderMain() {
    container.innerHTML = `
          <section class="growth-screen fade-in">

            <div class="pomodoro-card">
              <div class="pomodoro-bg" style="background-image:url('icons/growth-bg.png')"></div>
              <div class="pomodoro-content">
                <div class="pomodoro-time" id="pomodoroTime">45:00</div>
                <div class="pomodoro-sub" id="pomodoroSub">Перерыв 15 минут</div>
                <button class="pomodoro-start" id="pomodoroBtn">Запустить</button>
              </div>
            </div>

            <h3 class="section-title">Рекомендации</h3>

            <div class="rec-card" data-rec="speech">
              <span>Как обрести уверенность на публичных выступлениях?</span>
              <span class="rec-arrow">›</span>
            </div>

            <div class="rec-card" data-rec="planning">
              <span>Как правильно планировать свой день?</span>
              <span class="rec-arrow">›</span>
            </div>

            <div class="profile-test-card" id="profileTest">
              <div>
                <div class="pt-title">Профориентационный тест</div>
                <div class="pt-sub">РАБОТА РОССИИ</div>
              </div>
              <div class="pt-action">›</div>
            </div>

          </section>
        `;

    restorePomodoro();
    bindMainEvents();
    tg?.HapticFeedback?.impactOccurred("soft");
  }

  /* =========================
     EVENTS MAIN
  ========================= */

  function bindMainEvents() {
    const pomodoroBtn = container.querySelector("#pomodoroBtn");
    const recCards = container.querySelectorAll(".rec-card");
    const profileTest = container.querySelector("#profileTest");

    pomodoroBtn.addEventListener("click", togglePomodoro);

    recCards.forEach(card => {
      card.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("light");
        openRecommendation(card.dataset.rec);
      });
    });

    profileTest.addEventListener("click", () => {
      tg?.HapticFeedback?.impactOccurred("medium");

      if (tg?.openLink) {
        tg.openLink(
            "https://trudvsem.ru/proforientation/testing/profession-choice",
            { try_instant_view: false }
        );
      } else {
        // Фоллбек если вдруг не Telegram
        window.open(
            "https://trudvsem.ru/proforientation/testing/profession-choice",
            "_blank"
        );
      }
    });

  }

  /* =========================
     POMODORO LOGIC
  ========================= */

  function togglePomodoro() {
    tg?.HapticFeedback?.impactOccurred("light");

    if (running) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  }

  function startPomodoro() {
    running = true;
    mode = mode === "idle" ? "work" : mode;

    timer = setInterval(() => {
      remaining--;
      updatePomodoroUI();

      if (remaining <= 0) {
        nextPomodoroStage();
      }
    }, 1000);

    updatePomodoroUI();
    savePomodoro();
  }

  function pausePomodoro() {
    running = false;
    clearInterval(timer);
    updatePomodoroUI();
    savePomodoro();
  }

  function nextPomodoroStage() {
    clearInterval(timer);

    if (mode === "work") {
      mode = "break";
      remaining = BREAK_TIME;
      tg?.HapticFeedback?.impactOccurred("medium");
      startPomodoro();
    } else {
      mode = "finished";
      running = false;
      tg?.HapticFeedback?.notificationOccurred("success");
    }

    savePomodoro();
  }

  function updatePomodoroUI() {
    const timeEl = container.querySelector("#pomodoroTime");
    const subEl = container.querySelector("#pomodoroSub");
    const btn = container.querySelector("#pomodoroBtn");

    if (!timeEl) return;

    timeEl.textContent = formatTime(remaining);

    if (mode === "work") subEl.textContent = "Работа";
    if (mode === "break") subEl.textContent = "Перерыв";
    if (mode === "finished") subEl.textContent = "Готово";

    btn.textContent = running ? "Пауза" : "Запустить";
  }

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function savePomodoro() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ remaining, mode, running })
    );
  }

  function restorePomodoro() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    remaining = data.remaining ?? WORK_TIME;
    mode = data.mode ?? "idle";
    running = false;

    updatePomodoroUI();
  }

  /* =========================
     RECOMMENDATION SCREEN
  ========================= */

  function openRecommendation(key) {
    const rec = RECOMMENDATIONS[key];

    container.innerHTML = `
          <section class="rec-screen slide-in">

            <button class="rec-back">‹</button>

            <h1>${rec.title}</h1>

            <div class="rec-card-full">
              <div class="rec-author">${rec.author}</div>
              <div class="rec-text">${rec.text}</div>
            </div>

          </section>
        `;

    tg?.HapticFeedback?.impactOccurred("soft");

    container.querySelector(".rec-back").addEventListener("click", () => {
      tg?.HapticFeedback?.impactOccurred("light");
      renderMain();
    });
  }
}
