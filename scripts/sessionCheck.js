// Função para verificar autenticação
function checkAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    const userName = sessionStorage.getItem('userName');
    
    if (!userEmail || !userToken || !userName) {
        window.location.replace('index.html');
        return false;
    }
    return true;
}

// Executar imediatamente antes de qualquer renderização
if (document.location.pathname.includes('dashboard.html')) {
    if (!checkAuth()) {
        throw new Error('Acesso não autorizado'); // Impede a execução do resto do código
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.location.pathname.includes('dashboard.html')) {
        if (!checkAuth()) return;
        
        // Atualizar nome do usuário na página
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = sessionStorage.getItem('userName');
        }
    }
});

// Função de logout
function logout() {
    sessionStorage.clear();
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    window.location.replace('index.html');
}

// Adicionar evento de logout ao botão
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});