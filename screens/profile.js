// screens/profile.js
// Экран "Профиль" — данные из Telegram + челлендж дня

export function renderProfile(container) {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  const userName = user
      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
      : "Имя пользователя";

  const userPhoto = user?.photo_url ?? "../icons/avatar-placeholder.png";

  container.innerHTML = `
      <section class="profile-screen">

        <!-- AVATAR -->
        <div class="profile-header">
          <div class="profile-avatar">
            <img src="${userPhoto}" alt="Аватар пользователя">
          </div>

          <h2 class="profile-name">${userName}</h2>
        </div>

        <!-- STATS -->
        <div class="profile-block">
          <h3 class="profile-block-title">Статистика</h3>

          <div class="profile-stats">
            <div class="profile-stat">
              <div class="profile-stat-value">0</div>
              <div class="profile-stat-label">Баллы</div>
            </div>

            <div class="profile-stat profile-stat-accent">
              <div class="profile-stat-value">1</div>
              <div class="profile-stat-label">Дней подряд</div>
            </div>
          </div>
        </div>

        <!-- CHALLENGE -->
        <div class="profile-block">
          <h3 class="profile-block-title">Челлендж дня</h3>

          <div class="profile-challenge">
            <div class="profile-challenge-text">
              Самостоятельно выбери задачу, и выполни ее
            </div>

            <div class="profile-challenge-check">✓</div>
          </div>

          <div class="profile-challenge-hint">
            Нажми, чтобы отметить выполнение
          </div>
        </div>

        <div class="profile-footer">
          Ты делаешь успехи!
        </div>

      </section>
    `;

  /* ---------- CHALLENGE LOGIC ---------- */

  const challengeCard = container.querySelector(".profile-challenge");

  const CHALLENGE_KEY = "profile_daily_challenge_done";
  const today = new Date().toISOString().slice(0, 10);

  const savedDate = localStorage.getItem(CHALLENGE_KEY);
  let challengeDone = savedDate === today;

  // если уже выполнено сегодня — сразу красим
  if (challengeDone) {
    challengeCard.classList.add("done");
  }

  challengeCard.addEventListener("click", () => {
    if (challengeDone) return;

    challengeDone = true;

    // сохраняем выполнение на сегодня
    localStorage.setItem(CHALLENGE_KEY, today);

    // haptic — успех
    tg?.HapticFeedback?.notificationOccurred("success");

    // визуал
    challengeCard.classList.add("done");
  });

  setTimeout(() => {
    tg?.HapticFeedback?.impactOccurred("light");
  }, 450);
}
