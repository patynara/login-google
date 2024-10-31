// URL do seu Web App do Google Apps Script após o deploy
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCkjULPSc9tclYT6Zisu7t6dVfDMRSdz4Styw4GvhFqfjbhpq_GQZgr__n8G7_3aO_/exec';

function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    messageBox.className = 'message ' + (isError ? 'error' : 'success');
}

function showLoader(show = true) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
}

async function verificarAutorizacao(token) {
    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao verificar autorização:', error);
        throw error;
    }
}

function handleCredentialResponse(response) {
    showLoader(true);
    
    if (!response || !response.credential) {
        showMessage('Erro no login com Google', true);
        showLoader(false);
        return;
    }

    const idToken = response.credential;
    
    verificarAutorizacao(idToken)
        .then(authResult => {
            if (authResult.autorizado) {
                showMessage('Login realizado com sucesso! Redirecionando...', false);
                // Usar o email verificado retornado pelo backend
                sessionStorage.setItem('userEmail', authResult.email);
                sessionStorage.setItem('userToken', idToken);
                
                // Decodificar token apenas para pegar o nome
                const payload = JSON.parse(atob(idToken.split('.')[1]));
                sessionStorage.setItem('userName', payload.name);
                
                // Redirecionar após 1 segundo para dar tempo de ver a mensagem
                setTimeout(() => {
                    window.location.href = 'dashboard.html'; // Alterado aqui
                }, 1000);
            } else {
                showMessage('Email não autorizado para acessar o sistema.', true);
            }
        })
        .catch(error => {
            showMessage('Erro ao verificar autorização: ' + error.message, true);
        })
        .finally(() => {
            showLoader(false);
        });
}