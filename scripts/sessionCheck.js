// sessionCheck.js

// Controle para evitar múltiplas inicializações
let initialized = false;

// Função principal de verificação de autenticação
export function checkAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    const userName = sessionStorage.getItem('userName');
    
    // Se qualquer um dos dados essenciais estiver faltando, redireciona para login
    if (!userEmail || !userToken || !userName) {
        // Limpar a sessão para garantir um estado limpo
        sessionStorage.clear();
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Função para verificar autenticação na página de login
export function checkIndexAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    
    if (userEmail && userToken) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

// Inicialização da interface
export function initInterface() {
    if (initialized) return;
    initialized = true;
    
    const userName = sessionStorage.getItem('userName');
    const userNameElement = document.getElementById('userName');
    if (userNameElement && userName) {
        userNameElement.textContent = userName;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Função de logout
export function logout(e) {
    if (e) e.preventDefault();
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Utilitários para mensagens e loader
export function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.className = `message ${isError ? 'error' : 'success'}`;
    }
}

export function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}