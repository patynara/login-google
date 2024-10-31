// Verificação para a página de login
document.addEventListener('DOMContentLoaded', function() {
    // Se já estiver autenticado, redirecionar para o dashboard
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
  
    if (userEmail && userToken) {
      window.location.replace('dashboard.html');
    }
  });
  