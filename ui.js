//Управление интерфейсом

// Показать сообщение
export function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Переключение экранов
export function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

export function showMainScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
}

// Управление кнопкой создания
export function setCreateButtonLoading(loading) {
    const createBtn = document.getElementById('createBtn');
    createBtn.disabled = loading;
    
    if (loading) {
        createBtn.innerHTML = '<span class="spinner"></span>Создаём плейлист...';
    } else {
        createBtn.innerHTML = 'Создать плейлист';
    }
}

// Очистка формы
export function resetForm() {
    document.getElementById('playlistName').value = '';
    
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('[data-genre]').forEach(btn => {
        btn.classList.remove('selected');
    });
}