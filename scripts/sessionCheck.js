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
  if (!checkAuth()) {
    throw new Error('Acesso não autorizado');
  }
  
  document.addEventListener('DOMContentLoaded', function() {
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
  
  // Funções do Menu Lateral
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');
    const userNameElement = document.getElementById('userName');
  
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
  