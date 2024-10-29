// Verificação de sessão
document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    const userName = sessionStorage.getItem('userName');

    if (!userEmail || !userToken || !userName) {
        window.location.href = 'index.html';
        return;
    }

    // Atualizar nome do usuário na página
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
});

// Função de logout
function logout() {
    // Limpar dados da sessão
    sessionStorage.clear();
    
    // Desconectar do Google
    google.accounts.id.disableAutoSelect();
    
    // Redirecionar para página de login
    window.location.href = 'index.html';
}

// Adicionar evento de logout ao botão quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});