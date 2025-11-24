//Авторизация и PKCE

import { CONFIG } from './config.js';

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

// Авторизация
export async function login() {
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

// Фетчим токен
export async function getAccessToken(code) {
    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
        throw new Error('Code verifier not found');
    }

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

    if (!data.access_token) {
        throw new Error('Failed to get access token');
    }

    sessionStorage.removeItem('code_verifier');
    return data.access_token;
}