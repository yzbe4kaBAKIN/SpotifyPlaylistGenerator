// Конфигурация Spotify API
const CONFIG = {
    clientId: '7e57a16117fb4356911ef8642239d066',
    redirectUri: window.location.origin + window.location.pathname,
    scopes: [
        'playlist-modify-public',
        'playlist-modify-private',
        'user-read-private'
    ]
};

// PKCE
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Настроения
const MOODS = {
    'happy': {
        id: 'happy',
        name: 'Счастливый',
        seeds: { en: ['happy', 'upbeat', 'feel good'], ru: ['весёлый', 'позитив', 'хорошее настроение'] }
    },
    'energetic': {
        id: 'energetic',
        name: 'Энергичный',
        seeds: { en: ['workout', 'energetic', 'pump up'], ru: ['энергия', 'мотивация', 'драйв'] }
    },
    'chill': {
        id: 'chill',
        name: 'Спокойный',
        seeds: { en: ['chill', 'relax', 'ambient'], ru: ['спокойствие', 'релакс', 'отдых'] }
    },
    'sad': {
        id: 'sad',
        name: 'Грустный',
        seeds: { en: ['sad', 'melancholy', 'emotional'], ru: ['грустный', 'меланхолия', 'душевный'] }
    }
};

// Жанры
const GENRES = {
    'pop': { name: 'Поп' },
    'rock': { name: 'Рок' },
    'hip-hop': { name: 'Хип-хоп' },
    'electronic': { name: 'Электроника' },
    'jazz': { name: 'Джаз' },
    'classical': { name: 'Классика' },
    'r-n-b': { name: 'R&B' },
    'indie': { name: 'Инди' }
};

let accessToken = null;
let selectedMood = null;
let selectedLanguages = [];
let selectedGenres = [];
let userId = null;

function init() {
    setupEventListeners();
    checkAuth();
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('createBtn').addEventListener('click', createPlaylist);

    // Обработчики для настроений
    document.querySelectorAll('[data-mood]').forEach(btn => {
        btn.addEventListener('click', () => selectMood(btn.dataset.mood));
    });

    // Обработчики для языков
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => toggleLanguage(btn.dataset.lang));
    });

    // Обработчики для жанров
    document.querySelectorAll('[data-genre]').forEach(btn => {
        btn.addEventListener('click', () => toggleGenre(btn.dataset.genre));
    });
}

// Проверка авторизации
async function checkAuth() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        const codeVerifier = sessionStorage.getItem('code_verifier');
        if (!codeVerifier) {
            showLoginScreen();
            return;
        }

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: CONFIG.clientId,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: CONFIG.redirectUri,
                    code_verifier: codeVerifier,
                })
            });

            const data = await response.json();

            if (data.access_token) {
                accessToken = data.access_token;
                sessionStorage.setItem('access_token', accessToken);
                sessionStorage.removeItem('code_verifier');

                // Очищаем URL от code
                window.history.replaceState({}, document.title, window.location.pathname);

                showMainScreen();
                getUserProfile();
            } else {
                throw new Error('Не удалось получить токен');
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            showLoginScreen();
        }
    } else {
        // Проверяем сохраненный токен
        const savedToken = sessionStorage.getItem('access_token');
        if (savedToken) {
            accessToken = savedToken;
            showMainScreen();
            getUserProfile();
        } else {
            showLoginScreen();
        }
    }
}

// Авторизация через Spotify с PKCE
async function login() {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64urlencode(hashed);

    sessionStorage.setItem('code_verifier', codeVerifier);

    const authUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
        client_id: CONFIG.clientId,
        response_type: 'code',
        redirect_uri: CONFIG.redirectUri,
        scope: CONFIG.scopes.join(' '),
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });

    window.location.href = authUrl;
}

// Получение профиля пользователя
async function getUserProfile() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        userId = data.id;
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
    }
}

// Выбор настроения
function selectMood(moodId) {
    selectedMood = MOODS[moodId];

    document.querySelectorAll('[data-mood]').forEach(btn => {
        btn.classList.remove('selected');
    });

    document.querySelector(`[data-mood="${moodId}"]`).classList.add('selected');
}

// Переключение языка
function toggleLanguage(lang) {
    const btn = document.querySelector(`[data-lang="${lang}"]`);

    if (selectedLanguages.includes(lang)) {
        selectedLanguages = selectedLanguages.filter(l => l !== lang);
        btn.classList.remove('selected');
    } else {
        selectedLanguages.push(lang);
        btn.classList.add('selected');
    }
}

// Переключение жанра
function toggleGenre(genreId) {
    const btn = document.querySelector(`[data-genre="${genreId}"]`);

    if (selectedGenres.includes(genreId)) {
        selectedGenres = selectedGenres.filter(g => g !== genreId);
        btn.classList.remove('selected');
    } else {
        selectedGenres.push(genreId);
        btn.classList.add('selected');
    }
}

//
// 🔥 УЛУЧШЕННЫЙ ПОИСК ТРЕКОВ (ровно 30 треков)
//
async function searchTracksByMood(mood, languages, genres) {
    const tracks = new Set();
    const searches = [];

    // Формируем поисковые запросы
    languages.forEach(lang => {
        const seeds = mood.seeds[lang];

        genres.forEach(genre => {
            seeds.forEach(seed => {
                searches.push(`${seed} ${genre}`);
            });
        });

        if (genres.length === 0) {
            searches.push(...seeds);
        }
    });

    // Перемешиваем запросы для разнообразия
    searches.sort(() => Math.random() - 0.5);

    // Основной поиск
    for (const query of searches) {
        if (tracks.size >= 30) break;

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );

            const data = await response.json();
            if (data.tracks?.items) {
                for (const item of data.tracks.items) {
                    if (tracks.size < 30) {
                        tracks.add(item.uri);
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка поиска треков:', error);
        }
    }

    // Если после поиска недостаточно треков, добираем рекомендациями
    if (tracks.size < 30) {
        try {
            const genreStr = genres.join(',') || '';
            const recResponse = await fetch(
                `https://api.spotify.com/v1/recommendations?limit=${30 - tracks.size}&seed_genres=${genreStr}`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );

            const recData = await recResponse.json();
            if (recData.tracks) {
                recData.tracks.forEach(t => {
                    if (tracks.size < 30) tracks.add(t.uri);
                });
            }
        } catch (err) {
            console.error('Ошибка Recommendations API:', err);
        }
    }

    // Возвращаем ровно 30 треков
    return Array.from(tracks).slice(0, 30);
}

// Создание плейлиста
async function createPlaylist() {
    if (!selectedMood) {
        showMessage('Пожалуйста, выберите настроение!', 'error');
        return;
    }

    if (selectedLanguages.length === 0) {
        showMessage('Пожалуйста, выберите хотя бы один язык!', 'error');
        return;
    }

    const playlistName = document.getElementById('playlistName').value.trim();
    if (!playlistName) {
        showMessage('Введите название плейлиста!', 'error');
        return;
    }

    const createBtn = document.getElementById('createBtn');
    createBtn.disabled = true;
    createBtn.innerHTML = '<span class="spinner"></span>Создаём плейлист...';

    try {
        // Создание описания
        let description = `Настроение: ${selectedMood.name}`;
        if (selectedLanguages.length > 0) {
            const langNames = selectedLanguages.map(l => l === 'en' ? 'Английский' : 'Русский').join(', ');
            description += ` | Языки: ${langNames}`;
        }
        if (selectedGenres.length > 0) {
            const genreNames = selectedGenres.map(g => GENRES[g].name).join(', ');
            description += ` | Жанры: ${genreNames}`;
        }

        // Создание плейлиста
        const createResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                description: description,
                public: false
            })
        });

        if (!createResponse.ok) {
            throw new Error('Не удалось создать плейлист');
        }

        const playlist = await createResponse.json();

        // Поиск треков
        const trackUris = await searchTracksByMood(selectedMood, selectedLanguages, selectedGenres);

        if (trackUris.length === 0) {
            throw new Error('Не удалось найти треки с выбранными параметрами');
        }

        // Добавление треков в плейлист
        await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: trackUris })
        });

        showMessage(`✅ Плейлист "${playlistName}" успешно создан с ${trackUris.length} треками!`, 'success');
        document.getElementById('playlistName').value = '';

        // Сброс выбранных параметров
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        selectedMood = null;
        selectedLanguages = [];
        selectedGenres = [];

    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('❌ Ошибка при создании плейлиста: ' + error.message, 'error');
    } finally {
        createBtn.disabled = false;
        createBtn.innerHTML = 'Создать плейлист';
    }
}

// Показать сообщение
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Переключение экранов
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

function showMainScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
}

// Запуск приложения
init();
