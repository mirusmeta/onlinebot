// screens/mind.js
// Экран "Душа" — чистая верстка SOS + настроение + помощь
// Без логики, без анимаций, без состояния

export function renderMind(container) {
    container.innerHTML = `
    <section class="mind-screen">

      <!-- SOS CARD -->
      <div class="sos-card">
        <div class="sos-card-bg"></div>

        <div class="sos-card-content">
          <div class="sos-caption">
            На основе медицинских рекомендаций
          </div>

          <h2 class="sos-title">
            Дыхательные упражнения
          </h2>

          <div class="sos-subtitle">
            Если необходимо<br>
            быстро успокоиться
          </div>
            <div style="display: flex;justify-content: center;margin-top: 20px;">
                <div class="sos-tap-icon">️</div>
            </div>
           
        </div>
      </div>

     <div class="mind-block">
      <h3 class="mind-title">Моё настроение</h3>
      <p class="mind-sub">Сегодня я чувствую себя…</p>
    
      <div class="mood-row" id="moodRow">
        <div class="mood-pill mood-blue" data-mood="bad">
          <img class="mood-icon" src="../icons/badmood.svg" alt="Плохо">
        </div>
    
        <div class="mood-pill mood-gray" data-mood="neutral">
          <img class="mood-icon" src="../icons/notbad.svg" alt="Нормально">
        </div>
    
        <div class="mood-pill mood-green" data-mood="good">
          <img class="mood-icon" src="../icons/goodmood.svg" alt="Хорошо">
        </div>
      </div>
    
      <button class="mood-save-btn" id="moodSaveBtn" disabled>
        Выберите один из вариантов
      </button>
    </div>


    </div>


      <!-- ПОМОЩЬ -->
      <div class="mind-block">
        <h3 class="mind-title">Помощь с трудностями</h3>

        <div class="help-card">
          <span>Я стал(а) жертвой буллинга, что делать?</span>
          <span class="help-arrow">›</span>
        </div>
      </div>

    </section>
  `;
    container.insertAdjacentHTML("beforeend", `
      <div class="sos-overlay" id="sosOverlay">
        <div class="sos-screen">
    
          <button class="sos-back" id="sosBack">‹</button>
    
          <div class="sos-breathe">
            <div class="breathe-circle">
              <div class="breathe-dot"></div>
            </div>
    
            <div class="breathe-text">Нажмите «Начать»</div>
    
            <button class="breathe-start" id="breatheStart">Начать</button>
    
            <div class="breathe-caption">
              На основе медицинских рекомендаций
            </div>
          </div>
    
        </div>
      </div>
    `);


    const tg = window.Telegram?.WebApp;

    const moodRow = container.querySelector("#moodRow");
    const saveBtn = container.querySelector("#moodSaveBtn");

    let selectedMood = null;
    let locked = false;

    moodRow.querySelectorAll(".mood-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            if (locked) return;

            // haptic: лёгкий
            tg?.HapticFeedback?.impactOccurred("light");

            // reset
            moodRow.querySelectorAll(".mood-pill")
                .forEach(p => p.classList.remove("active"));

            // activate
            pill.classList.add("active");
            selectedMood = pill.dataset.mood;

            // enable button
            saveBtn.disabled = false;
            saveBtn.textContent = "Сохранить изменения";
        });
    });

    saveBtn.addEventListener("click", () => {
        if (!selectedMood || locked) return;

        locked = true;
        moodRow.classList.add("locked");

        // haptic: подтверждение
        tg?.HapticFeedback?.notificationOccurred("success");

        saveBtn.textContent = "Настроение сохранено";
        saveBtn.disabled = true;
    });

    const sosCard = container.querySelector(".sos-card");
    const sosOverlay = container.querySelector("#sosOverlay");
    const sosBack = container.querySelector("#sosBack");

    const breatheText = container.querySelector(".breathe-text");
    const breatheDot = container.querySelector(".breathe-dot");
    const startBtn = container.querySelector("#breatheStart");

    const TOTAL_CYCLES = 10;
    let cycle = 0;
    let timer = null;

    /* ---------- OPEN / CLOSE ---------- */

    sosCard.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("medium");
        sosOverlay.classList.add("visible");
        document.body.classList.add("no-scroll");
    });

    sosBack.addEventListener("click", () => {
        stopBreathing();
        sosOverlay.classList.remove("visible");
        document.body.classList.remove("no-scroll");
    });

    /* ---------- BREATHING ---------- */

    function startBreathing() {
        cycle = 0;
        startBtn.disabled = true;
        startBtn.style.opacity = "0.4";

        breatheDot.style.animationPlayState = "running";
        runCycle();
    }

    function runCycle() {
        if (cycle >= TOTAL_CYCLES) {
            finishBreathing();
            return;
        }

        cycle++;

        // ВДОХ
        breatheText.textContent = "Вдыхайте…";
        tg?.HapticFeedback?.impactOccurred("light");

        // ЗАДЕРЖКА
        setTimeout(() => {
            breatheText.textContent = "Задержите дыхание…";
        }, 2500);

        // ВЫДОХ
        setTimeout(() => {
            breatheText.textContent = "Выдыхайте…";
            tg?.HapticFeedback?.impactOccurred("soft");
        }, 3500);

        // Следующий цикл (7 секунд)
        timer = setTimeout(runCycle, 7000);
    }


    function finishBreathing() {
        clearTimeout(timer);

        breatheDot.style.animationPlayState = "paused";
        breatheText.textContent = "Готово. Вы молодец";

        tg?.HapticFeedback?.notificationOccurred("success");
        startBtn.textContent = "Завершено";
    }

    function stopBreathing() {
        clearTimeout(timer);
        breatheDot.style.animationPlayState = "paused";
        breatheText.textContent = "Нажмите «Начать»";
        startBtn.disabled = false;
        startBtn.style.opacity = "1";
        startBtn.textContent = "Начать";
    }

    startBtn.addEventListener("click", startBreathing);


}
