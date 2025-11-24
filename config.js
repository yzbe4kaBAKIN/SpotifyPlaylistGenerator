// Конфиг
export const CONFIG = {
    clientId: '7e57a16117fb4356911ef8642239d066',
    redirectUri: window.location.origin + window.location.pathname,
    scopes: [
        'playlist-modify-public',
        'playlist-modify-private',
        'user-read-private'
    ]
};

export const MOODS = {
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

export const GENRES = {
    'pop': { name: 'Поп' },
    'rock': { name: 'Рок' },
    'hip-hop': { name: 'Хип-хоп' },
    'electronic': { name: 'Электроника' },
    'jazz': { name: 'Джаз' },
    'classical': { name: 'Классика' },
    'r-n-b': { name: 'R&B' },
    'indie': { name: 'Инди' }
};