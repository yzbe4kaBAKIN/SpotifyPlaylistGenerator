// Управление состоянием приложения

import { MOODS } from './config.js';

const state = {
    userId: null,
    selectedMood: null,
    selectedLanguages: [],
    selectedGenres: []
};

// Getters
export function getUserId() {
    return state.userId;
}

export function getSelectedMood() {
    return state.selectedMood;
}

export function getSelectedLanguages() {
    return [...state.selectedLanguages];
}

export function getSelectedGenres() {
    return [...state.selectedGenres];
}

// Setters
export function setUserId(id) {
    state.userId = id;
}

export function setSelectedMood(moodId) {
    state.selectedMood = MOODS[moodId];
    
    document.querySelectorAll('[data-mood]').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelector(`[data-mood="${moodId}"]`)?.classList.add('selected');
}

export function toggleLanguage(lang) {
    const btn = document.querySelector(`[data-lang="${lang}"]`);
    
    if (state.selectedLanguages.includes(lang)) {
        state.selectedLanguages = state.selectedLanguages.filter(l => l !== lang);
        btn.classList.remove('selected');
    } else {
        state.selectedLanguages.push(lang);
        btn.classList.add('selected');
    }
}

export function toggleGenre(genreId) {
    const btn = document.querySelector(`[data-genre="${genreId}"]`);
    
    if (state.selectedGenres.includes(genreId)) {
        state.selectedGenres = state.selectedGenres.filter(g => g !== genreId);
        btn.classList.remove('selected');
    } else {
        state.selectedGenres.push(genreId);
        btn.classList.add('selected');
    }
}

// Сброс состояния
export function resetState() {
    state.selectedMood = null;
    state.selectedLanguages = [];
    state.selectedGenres = [];
}