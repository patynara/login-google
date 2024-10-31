// URL do seu Web App do Google Apps Script após o deploy
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAaGOSL7NToFeAewuE2IWN39OpghdjiVqQ39MsCrpichP7gTzTODlrm3mVmJMiN1iq/exec';
async function fetchDashboardData() {
    const token = sessionStorage.getItem('userToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        showLoader(true);
        const response = await fetch(`${APPS_SCRIPT_URL}?action=dashboard&token=${token}`);
        const result = await response.json();

        if (!result.autorizado) {
            throw new Error(result.message || 'Não autorizado');
        }

        return result.data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        showMessage('Erro ao carregar dados do dashboard', true);
    } finally {
        showLoader(false);
    }
}

function showLoader(show = true) {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

function updateEstatisticasGerais(estatisticas) {
    document.getElementById('totalAlunos').textContent = estatisticas.totalAlunos;
    document.getElementById('totalTransporte').textContent = estatisticas.transporteEscolar;
    document.getElementById('totalBolsa').textContent = estatisticas.bolsaFamilia;
}

function createGeneroChart(dados) {
    const ctx = document.getElementById('generoChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Masculino', 'Feminino'],
            datasets: [{
                data: [dados.porGenero.masculino, dados.porGenero.feminino],
                backgroundColor: ['#4a90e2', '#ff6b6b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}


function createRacaChart(dados) {
    const racaData = Object.entries(dados.porRaca);
    const ctx = document.getElementById('racaChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: racaData.map(([raca]) => raca),
            datasets: [{
                data: racaData.map(([, valor]) => valor),
                backgroundColor: ['#4a90e2', '#50c878', '#ffd700', '#ff6b6b', '#8884d8']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    display: true
                }
            }
        }
    });
}

function updateMatriculasTable(matriculas) {
    const tbody = document.getElementById('matriculasTable');
    tbody.innerHTML = '';
    
    matriculas.forEach(matricula => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${matricula.aluno}</td>
            <td>${new Date(matricula.data).toLocaleDateString()}</td>
            <td>${matricula.turma}</td>
            <td>${matricula.turno}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;

    try {
        const dados = await fetchDashboardData();
        if (!dados) return;

        updateEstatisticasGerais(dados.estatisticas);
        createGeneroChart(dados.estatisticas);
        createRacaChart(dados.estatisticas);
        updateMatriculasTable(dados.ultimasMatriculas);
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        showMessage('Erro ao carregar dashboard', true);
    }
});


// Adicionar no início do dashboardControl.js

// Controle do Menu Lateral e Usuario
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');
    const userNameElement = document.getElementById('userName');

    // Função para alternar o menu
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }

    // Adicionar evento de clique ao botão
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
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
        if (link.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Responsividade
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    // Verificar tamanho da tela
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
});

// Resto do código do dashboard...