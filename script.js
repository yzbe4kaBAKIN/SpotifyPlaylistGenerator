//
//  🔥 НОВАЯ ФУНКЦИЯ ПОИСКА ТРЕКОВ (гарантирует ровно 30)
//
async function searchTracksByMood(mood, languages, genres) {
    const collected = new Set();
    const uniqueSearches = new Set();

    //
    // 1) формируем поисковые запросы
    //
    languages.forEach(lang => {
        const moodSeeds = mood.seeds[lang];

        genres.forEach(genre => {
            moodSeeds.forEach(seed => {
                uniqueSearches.add(`${seed} ${genre}`);
            });
        });

        if (genres.length === 0) {
            moodSeeds.forEach(seed => uniqueSearches.add(seed));
        }
    });

    //
    // 2) Recommendations API + настроение
    //
    const moodToParams = {
        happy:   { target_valence: 0.9, target_energy: 0.7 },
        energetic: { target_valence: 0.7, target_energy: 0.9 },
        chill:   { target_valence: 0.5, target_energy: 0.3 },
        sad:     { target_valence: 0.2, target_energy: 0.2 }
    };

    const recParams = moodToParams[mood.id] || moodToParams.happy;
    const genreStr = genres.join(',') || null;

    try {
        const url = new URL("https://api.spotify.com/v1/recommendations");
        url.searchParams.set('limit', '40');
        if (genreStr) url.searchParams.set('seed_genres', genreStr);
        url.searchParams.set('target_valence', recParams.target_valence);
        url.searchParams.set('target_energy', recParams.target_energy);

        const recResponse = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const recData = await recResponse.json();
        if (recData.tracks) {
            recData.tracks.forEach(t => collected.add(t.uri));
        }
    } catch (e) {
        console.error("Ошибка recommendations:", e);
    }

    //
    // 3) Текстовый поиск
    //
    for (const query of uniqueSearches) {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const data = await response.json();
            if (data.tracks?.items) {
                data.tracks.items.forEach(t => collected.add(t.uri));
            }
        } catch (e) {
            console.error("Ошибка поиска:", e);
        }
    }

    //
    // 4) ГАРАНТИЯ 30 ТРЕКОВ
    //
    const arr = Array.from(collected);
    return await getExactly30Tracks(arr);
}
