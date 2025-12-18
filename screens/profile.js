// screens/profile.js
// Profile with REAL stats from app

const PROFILE_KEY = "profile_state_v2";
const BODY_KEY = "body_metrics_v1";
const GROWTH_KEY = "growth_state_v2";

const DEFAULT_PROFILE = {
  completedChallengeDays: [] // массив дат YYYY-MM-DD
};

/* ================= utils ================= */

function loadProfile() {
  return { ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") };
}

function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

function loadJSON(key) {
  return JSON.parse(localStorage.getItem(key) || "{}");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* ================= telegram ================= */

function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user || {
    first_name: "Гость",
    last_name: "",
    photo_url: null
  };
}

/* ================= stats ================= */

function calcStreak(days) {
  let streak = 0;
  const today = new Date();

  for (let i = 0; ; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.includes(key)) streak++;
    else break;
  }
  return streak;
}

/* ================= render ================= */

export function renderProfile(container) {
  const user = getTelegramUser();
  const profile = loadProfile();

  const body = loadJSON(BODY_KEY);
  const growth = loadJSON(GROWTH_KEY);

  const points = body.points || 0;
  const focusSessions = growth.completedSessions || 0;
  const streak = calcStreak(profile.completedChallengeDays);

  const todayDone = profile.completedChallengeDays.includes(todayKey());

  container.innerHTML = `
    <section class="profile-screen">

      <!-- Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          ${
      user.photo_url
          ? `<img src="${user.photo_url}" alt="avatar">`
          : `<div class="avatar-placeholder">👤</div>`
  }
        </div>
        <div class="profile-name">
          ${user.first_name} ${user.last_name || ""}
        </div>
      </div>

      <!-- Stats -->
      <div class="metric-card">
        <div class="metric-header">
          <span>📊 Твоя статистика</span>
        </div>

        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-value">${points}</div>
            <div class="stat-label">Баллы</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${focusSessions}</div>
            <div class="stat-label">Фокус-сессии</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${streak}</div>
            <div class="stat-label">Дней подряд</div>
          </div>
        </div>
      </div>

      <!-- Challenge -->
      <div class="metric-card">
        <div class="metric-header">
          <span>🏆 Челлендж дня</span>
        </div>

        <div class="challenge-box ${todayDone ? "done" : ""}">
          <div class="challenge-text">
            🌱 Сделай сегодня что-то полезное для себя
          </div>

          ${
      todayDone
          ? `<div class="challenge-done">Выполнено сегодня ✅</div>`
          : `<button class="challenge-btn" data-action="done">Отметить выполненным</button>`
  }
        </div>
      </div>

      <div class="profile-footer">
        Ты строишь баланс шаг за шагом 💚
      </div>

    </section>
  `;

  bindEvents(container);
}

/* ================= events ================= */

function bindEvents(container) {
  const profile = loadProfile();

  const btn = container.querySelector('[data-action="done"]');
  if (btn) {
    btn.onclick = () => {
      const today = todayKey();
      if (!profile.completedChallengeDays.includes(today)) {
        profile.completedChallengeDays.push(today);
        saveProfile(profile);
        renderProfile(container);
      }
    };
  }
}
