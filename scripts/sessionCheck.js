// sessionCheck.js
export function checkAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    const userName = sessionStorage.getItem('userName');
  
    if (!userEmail || !userToken || !userName) {
        window.location.replace('index.html');
        return false;
    }
    return true;
}

export function initSidebar() {
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
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            if (sidebar) sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('expanded');
        }
    }

    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();

    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

export function checkIndexAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');

    if (userEmail && userToken) {
        window.location.replace('dashboard.html');
        return true;
    }
    return false;
}

export async function logout(e) {
    if (e) e.preventDefault();
    sessionStorage.clear();
    
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    
    window.location.replace('index.html');
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

// Inicialização única
const isLoginPage = window.location.pathname.includes('index.html');
if (!isLoginPage && !checkAuth()) {
    window.location.replace('index.html');
} else if (isLoginPage) {
    checkIndexAuth();
} else {
    initSidebar();
}