// screens/profile.js
// Экран "Профиль" — данные из Telegram + челлендж дня
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm' // Импортируем Supabase

export async function renderProfile(container) {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    // Используем ID пользователя из Telegram как уникальный ключ
    const userId = user?.id?.toString() || 'default_user';

    const userName = user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
        : "Имя пользователя";

    const userPhoto = user?.photo_url ?? "../icons/avatar-placeholder.png";

    // 1. Инициализация клиента Supabase
    const SUPABASE_URL = "https://sksjfwnaomhhjtmlwhue.supabase.co";
    const SUPABASE_KEY = "sb_publishable_4cKEpZw4LK4BCGMBCNhujg_Suize4Bc";

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Переменные для хранения данных, загруженных из БД
    let userPoints = 0;
    let userStreak = 1;
    let isChallengeDone = false;

    // 2. Пробуем загрузить данные пользователя из базы
    try {
        const {data, error} = await supabase
            .from('users')
            .select('points, streak, isChallengeComplited')
            .eq('id', userId)
            .single(); // Ожидаем одну запись

        if (error && error.code !== 'PGRST116') { // PGRST116 — это ошибка "не найдено", она нормальна для нового пользователя
            console.error('Ошибка при загрузке пользователя:', error);
        } else if (data) {
            // Если пользователь найден, используем данные из БД
            userPoints = data.points || 0;
            userStreak = data.streak || 1;
            isChallengeDone = data.isChallengeComplited || false;
        }
    } catch (err) {
        console.error('Неожиданная ошибка при загрузке:', err);
    }

    // 3. Отображаем интерфейс, используя загруженные или дефолтные данные
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
              <div class="profile-stat-value">${userPoints}</div> <!-- Баллы из БД -->
              <div class="profile-stat-label">Баллы</div>
            </div>

            <div class="profile-stat profile-stat-accent">
              <div class="profile-stat-value">${userStreak}</div> <!-- Дней подряд из БД -->
              <div class="profile-stat-label">Дней подряд</div>
            </div>
          </div>
        </div>

        <!-- CHALLENGE -->
        <div class="profile-block">
          <h3 class="profile-block-title">Челлендж дня</h3>

          <div class="profile-challenge ${isChallengeDone ? 'done' : ''}"> <!-- Класс из БД -->
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
    const pointsValueEl = container.querySelector(".profile-stat-value"); // Первый элемент с баллами
    const streakValueEl = container.querySelector(".profile-stat-accent .profile-stat-value"); // Элемент с серией

    challengeCard.addEventListener("click", async () => { // Делаем обработчик асинхронным
        if (isChallengeDone) return;
        try {
            // Логика обновления данных (баллы +10, серия +1, челлендж выполнен)
            const newPoints = userPoints + 10;
            const newStreak = userStreak + 1;

            // 4. Отправляем обновленные данные в Supabase (UPSERT - обновить или создать)
            const {data, error} = await supabase
                .from('users')
                .upsert({
                    id: userId,
                    points: newPoints,
                    streak: newStreak,
                    isChallengeComplited: true
                })
                .select(); // Возвращаем обновленные данные (опционально)

            if (error) {
                throw error;
            }

            // 5. Если запрос к БД успешен, обновляем локальные переменные и интерфейс
            isChallengeDone = true;
            userPoints = newPoints;
            userStreak = newStreak;

            // Обновляем числа на экране
            pointsValueEl.textContent = userPoints;
            streakValueEl.textContent = userStreak;
            challengeCard.classList.add("done");

            // Тактильный отклик
            tg?.HapticFeedback?.notificationOccurred("success");

        } catch (error) {
            console.error('Ошибка при обновлении челленджа в БД:', error);
            // Здесь можно показать пользователю всплывающее сообщение об ошибке
            tg?.HapticFeedback?.notificationOccurred("error");
        }
    });

    // Легкая вибрация для интерактивности
    setTimeout(() => {
        tg?.HapticFeedback?.impactOccurred("light");
    }, 450);
}