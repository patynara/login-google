// sessionCheck.js
let initialized = false;

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
    if (initialized) return;
    initialized = true;

    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = sessionStorage.getItem('userName') || '';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Responsividade
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    function adjustLayout() {
        if (window.innerWidth <= 768) {
            sidebar?.classList.add('collapsed');
            mainContent?.classList.add('expanded');
        }
    }

    window.addEventListener('resize', adjustLayout);
    adjustLayout();
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
    window.location.replace('index.html');
}

export function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.className = 'message ' + (isError ? 'error' : 'success');
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 3000);
    }
}

export function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}