// Função para verificar autenticação
function checkAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    const userName = sessionStorage.getItem('userName');
    
    if (!userEmail || !userToken || !userName) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Executar imediatamente antes de qualquer renderização
if (document.location.pathname.includes('dashboard.html')) {
    if (!checkAuth()) {
        throw new Error('Acesso não autorizado');
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

        // Adicionar evento de logout ao botão
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    }
});

// Função de logout
async function logout() {
    // Limpar dados da sessão
    sessionStorage.clear();

    // Tentar desconectar do Google
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }

    // Forçar redirecionamento para a página de login
    window.location.href = 'index.html';
    
    // Garantir que a página será recarregada
    setTimeout(() => {
        if (window.location.pathname !== '/index.html') {
            window.location.reload();
        }
    }, 100);
}