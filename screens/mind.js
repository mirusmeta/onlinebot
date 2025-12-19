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

}
