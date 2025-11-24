
import { login, getAccessToken } from './auth.js';
import { 
    getUserProfile, 
    saveAccessToken, 
    getStoredAccessToken,
    searchTracksByMood,
    createSpotifyPlaylist,
    addTracksToPlaylist
} from './spotifyApi.js';
import { MOODS, GENRES } from './config.js';
import { 
    showMessage, 
    showLoginScreen, 
    showMainScreen, 
    setCreateButtonLoading,
    resetForm
} from './ui.js';
import { 
    setUserId,
    setSelectedMood,
    toggleLanguage,
    toggleGenre,
    getSelectedMood,
    getSelectedLanguages,
    getSelectedGenres,
    getUserId,
    resetState
} from './state.js';

// Инициализация
function init() {
    setupEventListeners();
    checkAuth();
}

// Обработчики
function setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('createBtn').addEventListener('click', createPlaylist);

    document.querySelectorAll('[data-mood]').forEach(btn => {
        btn.addEventListener('click', () => setSelectedMood(btn.dataset.mood));
    });

    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => toggleLanguage(btn.dataset.lang));
    });

    document.querySelectorAll('[data-genre]').forEach(btn => {
        btn.addEventListener('click', () => toggleGenre(btn.dataset.genre));
    });
}

// Проверка авторизации
async function checkAuth() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        try {
            const token = await getAccessToken(code);
            saveAccessToken(token);

            // Очищаем URL от code
            window.history.replaceState({}, document.title, window.location.pathname);

            showMainScreen();
            const userId = await getUserProfile();
            setUserId(userId);
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            showLoginScreen();
        }
    } else {
        // Проверяем сохраненный токен
        const savedToken = getStoredAccessToken();
        if (savedToken) {
            saveAccessToken(savedToken);
            showMainScreen();
            try {
                const userId = await getUserProfile();
                setUserId(userId);
            } catch (error) {
                console.error('Ошибка получения профиля:', error);
                showLoginScreen();
            }
        } else {
            showLoginScreen();
        }
    }
}

// Создание плейлиста
async function createPlaylist() {
    const mood = getSelectedMood();
    const languages = getSelectedLanguages();
    const genres = getSelectedGenres();

    if (!mood) {
        showMessage('Пожалуйста, выберите настроение!', 'error');
        return;
    }

    if (languages.length === 0) {
        showMessage('Пожалуйста, выберите хотя бы один язык!', 'error');
        return;
    }

    const playlistName = document.getElementById('playlistName').value.trim();
    if (!playlistName) {
        showMessage('Введите название плейлиста!', 'error');
        return;
    }

    setCreateButtonLoading(true);

    try {
        // Создание описания
        let description = `Настроение: ${mood.name}`;
        if (languages.length > 0) {
            const langNames = languages.map(l => l === 'en' ? 'Английский' : 'Русский').join(', ');
            description += ` | Языки: ${langNames}`;
        }
        if (genres.length > 0) {
            const genreNames = genres.map(g => GENRES[g].name).join(', ');
            description += ` | Жанры: ${genreNames}`;
        }

        // Создание плейлиста
        const playlist = await createSpotifyPlaylist(getUserId(), playlistName, description);

        // Поиск треков
        const trackUris = await searchTracksByMood(mood, languages, genres);

        if (trackUris.length === 0) {
            throw new Error('Не удалось найти треки с выбранными параметрами');
        }

        // Добавление треков в плейлист
        await addTracksToPlaylist(playlist.id, trackUris);

        showMessage(`✅ Плейлист "${playlistName}" успешно создан с ${trackUris.length} треками!`, 'success');
        
        // Сброс формы
        resetForm();
        resetState();

    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('❌ Ошибка при создании плейлиста: ' + error.message, 'error');
    } finally {
        setCreateButtonLoading(false);
    }
}

// Запуск приложения
init();