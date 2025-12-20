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
      <div style="margin-top: 8px" class="mind-block">
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
              <svg
                class="breathe-svg"
                viewBox="0 0 200 200"
                width="200"
                height="200"
              >
                <circle
                  class="breathe-svg-dot"
                  cx="100"
                  cy="100"
                  r="8"
                />
              </svg>
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
    container.insertAdjacentHTML("beforeend", `
      <div class="mind-advice-overlay" id="mindAdviceOverlay">
        <div class="mind-advice-screen">
    
          <button class="mind-advice-back" id="mindAdviceBack">‹</button>
    
          <h1 class="mind-advice-title">
            Я стал(а) жертвой буллинга,<br>что делать?
          </h1>
    
          <div class="mind-advice-card">
            <div class="mind-advice-author">
              Ответ от Джеки-Чана, психолога
            </div>
    
            <div class="mind-advice-text">
              Если вы стали жертвой буллинга, не молчите:
              немедленно расскажите доверенному взрослому
              (родителям, учителю, психологу), не вините себя,
              ищите поддержку (друзья, горячие линии),
              собирайте доказательства (особенно если это онлайн
              или есть физический вред), а в тяжёлых случаях —
              обращайтесь в полицию (112). Главное — выйти из
              ситуации, искать помощи и не оставаться одному.
            </div>
          </div>
    
          <div class="mind-advice-extra">Дополнительно:</div>
    
          <div class="mind-advice-link" id="mindAdviceLink">
            <span>Найти психолога</span>
            <span class="mind-advice-accent">профи.ру</span>
            <span class="mind-advice-arrow">›</span>
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
    const startBtn = container.querySelector("#breatheStart");
    const svgDot = container.querySelector(".breathe-svg-dot");

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

    /* ---------- SVG ANIMATION ---------- */

    function animateRadius(from, to, duration) {
        const start = performance.now();

        function frame(time) {
            const progress = Math.min((time - start) / duration, 1);
            const value = from + (to - from) * progress;
            svgDot.setAttribute("r", value);

            if (progress < 1) requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }

    /* ---------- BREATHING ---------- */

    function startBreathing() {
        cycle = 0;
        startBtn.disabled = true;
        startBtn.style.opacity = "0.4";
        runCycle();
    }

    function stopBreathing() {
        clearTimeout(timer);
        animateRadius(90, 8, 500);
        breatheText.textContent = "Нажмите «Начать»";
        startBtn.disabled = false;
        startBtn.style.opacity = "1";
        startBtn.textContent = "Начать";
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
        animateRadius(8, 90, 2500);

        // ЗАДЕРЖКА
        setTimeout(() => {
            breatheText.textContent = "Задержите дыхание…";
        }, 2500);

        // ВЫДОХ
        setTimeout(() => {
            breatheText.textContent = "Выдыхайте…";
            tg?.HapticFeedback?.impactOccurred("soft");
            animateRadius(90, 8, 3500);
        }, 3500);

        timer = setTimeout(runCycle, 7000);
    }

    function finishBreathing() {
        clearTimeout(timer);
        animateRadius(90, 8, 600);
        breatheText.textContent = "Готово. Вы молодец";
        tg?.HapticFeedback?.notificationOccurred("success");
        startBtn.textContent = "Завершено";
    }

    startBtn.addEventListener("click", startBreathing);


    //СОВЕТЫ
    const helpCard = container.querySelector(".help-card");

    const adviceOverlay = container.querySelector("#mindAdviceOverlay");
    const adviceBack = container.querySelector("#mindAdviceBack");
    const adviceLink = container.querySelector("#mindAdviceLink");

    /* ---------- OPEN ADVICE ---------- */
    helpCard.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("medium");
        adviceOverlay.classList.add("visible");
        document.body.classList.add("no-scroll");
    });

    /* ---------- CLOSE ADVICE ---------- */
    adviceBack.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("light");
        adviceOverlay.classList.remove("visible");
        document.body.classList.remove("no-scroll");
    });

    adviceLink.addEventListener("click", () => {
        tg?.HapticFeedback?.impactOccurred("soft");

        tg?.openLink(
            "https://profi.ru/repetitor/psihologia/",
            { try_instant_view: false }
        );
    });

// лёгкий haptic после появления экрана
    setTimeout(() => {
        tg?.HapticFeedback?.impactOccurred("light");
    }, 450);



}
