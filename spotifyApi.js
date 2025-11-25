//Spotify API

let accessToken = null;

export function setAccessToken(token) {
    accessToken = token;
}

export function getStoredAccessToken() {
    return sessionStorage.getItem('access_token');
}

export function saveAccessToken(token) {
    accessToken = token;
    sessionStorage.setItem('access_token', token);
}

//Фетчим юзер айди
export async function getUserProfile() {
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    return data.id;
}

//Поиск треков
export async function searchTracksByMood(mood, languages, genres) {
    const tracks = new Set();//Чтобы не было дубликатов
    const uniqueSearches = new Set();

    languages.forEach(lang => {
        const moodSeeds = mood.seeds[lang];
    if(genres.length > 0) {
        genres.forEach(genre => {
            moodSeeds.forEach(seed => {
                uniqueSearches.add(`${seed} ${genre}`);
            });
        });
    }else{
            moodSeeds.forEach(seed => uniqueSearches.add(seed));
        }
    });

    // Параметры эмоций
    const moodToParams = {
        happy:   { target_valence: 0.9, target_energy: 0.7 },
        energetic: { target_valence: 0.7, target_energy: 0.9 },
        chill:   { target_valence: 0.5, target_energy: 0.3 },
        sad:     { target_valence: 0.2, target_energy: 0.2 }
    };

    const recParams = moodToParams[mood.id] || moodToParams.happy;
    const genreStr = genres.join(',') || null;

    // Создаем ссылку для фетча Recommendations API
    //Такого вида https://api.spotify.com/v1/recommendations?limit=20&seed_genres=pop,rock&target_valence=0.9&target_energy=0.7
    try {
        const url = new URL("https://api.spotify.com/v1/recommendations");
        url.searchParams.set('limit', '20');
        if (genreStr) url.searchParams.set('seed_genres', genreStr);
        url.searchParams.set('target_valence', recParams.target_valence);
        url.searchParams.set('target_energy', recParams.target_energy);

        const recResponse = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const recData = await recResponse.json();
        if (recData.tracks) {
            recData.tracks.forEach(t => tracks.add(t.uri));
        }
    } catch (error) {
        console.error("Ошибка Recommendations API:", error);
    }

    // Фетчим для каждого жанра и настроения
    for (const query of uniqueSearches) {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=7`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );

            const data = await response.json();
            if (data.tracks && data.tracks.items) {
                data.tracks.items.forEach(t => tracks.add(t.uri));
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    }

    return Array.from(tracks).slice(0, 35);//Преобразуем Set в массив и получаем массив треков
}

// Создание плейлиста
export async function createSpotifyPlaylist(userId, name, description) {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            description: description,
            public: false
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create playlist');
    }

    return await response.json();
}

// Добавление треков в плейлист
export async function addTracksToPlaylist(playlistId, trackUris) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: trackUris })
    });

    if (!response.ok) {
        throw new Error('Failed to add tracks');
    }

    return await response.json();
}
