// sessionCheck.js
export function checkAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    const userName = sessionStorage.getItem('userName');
  
    if (!userEmail || !userToken || !userName) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');

    // Configurar toggle do menu
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');

            // Alternar ícone
            const icon = toggleBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-chevron-right');
            } else {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Configurar nome do usuário
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const userName = sessionStorage.getItem('userName');
        if (userName) {
            try {
                const decodedName = decodeURIComponent(escape(userName));
                userNameElement.textContent = decodedName;
            } catch (e) {
                userNameElement.textContent = userName;
            }
        }
    }

    // Marcar item atual do menu
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Configurar responsividade
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
}

export function checkIndexAuth() {
    // Verificação para a página de login
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');

    if (userEmail && userToken) {
        window.location.replace('dashboard.html');
        return true;
    }
    return false;
}

export async function logout() {
    try {
        // Limpar dados da sessão
        sessionStorage.clear();

        // Tentar desconectar do Google
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }

        // Redirecionar para a página de login
        window.location.href = 'index.html';

        // Garantir que a página será recarregada
        if (window.location.pathname !== '/index.html') {
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    } catch (error) {
        console.error('Erro durante logout:', error);
        // Forçar redirecionamento mesmo em caso de erro
        window.location.href = 'index.html';
    }
}

export function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.className = 'message ' + (isError ? 'error' : 'success');
    } else {
        console.log(message);
    }
}

export function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// Função para decodificar token JWT
export function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erro ao decodificar token:', error);
        return null;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Não verificar autenticação na página de login
    if (window.location.pathname.includes('index.html')) {
        checkIndexAuth();
        return;
    }

    // Verificar autenticação em outras páginas
    if (!checkAuth()) return;

    // Adicionar evento de logout ao botão
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Inicializar sidebar
    initSidebar();
});