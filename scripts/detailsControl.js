// detailsControl.js
import { APPS_SCRIPT_URL } from './config.js';

// Verificação de autenticação
function checkAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userToken = sessionStorage.getItem('userToken');
    const userName = sessionStorage.getItem('userName');
  
    if (!userEmail || !userToken || !userName) {
        window.location.replace('index.html');
        return false;
    }

    // Configurar nome do usuário
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.replace('index.html');
        });
    }

    return true;
}

// Funções auxiliares
function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

function getQueryParams() {
    const params = {};
    const search = window.location.search.substring(1);
    if (search) {
        search.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });
    }
    return params;
}

// Criar gráfico
function createSexoChart(analytics) {
    const ctxSexo = document.getElementById('sexoChart');
    if (!ctxSexo) return;

    const sexoData = {
        'Masculino': 0,
        'Feminino': 0
    };

    if (analytics.alunosPorSexoCurso) {
        Object.entries(analytics.alunosPorSexoCurso).forEach(([key, value]) => {
            const sexo = key.split('-')[0];
            if (sexo === 'MASCULINO') sexoData['Masculino'] += value;
            if (sexo === 'FEMININO') sexoData['Feminino'] += value;
        });
    }

    new Chart(ctxSexo, {
        type: 'pie',
        data: {
            labels: Object.keys(sexoData),
            datasets: [{
                data: Object.values(sexoData),
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

// Carregar dados
async function loadDetailsData() {
    const params = getQueryParams();
    const instituicao = params.instituicao;

    if (!instituicao) {
        window.location.replace('dashboard.html');
        return;
    }

    try {
        showLoader(true);
        const token = sessionStorage.getItem('userToken');
        const response = await fetch(`${APPS_SCRIPT_URL}?action=dashboard&token=${token}&filterField=instituicao&filterValue=${encodeURIComponent(instituicao)}`);
        const result = await response.json();

        if (!result.autorizado) throw new Error('Não autorizado');

        // Atualizar título
        document.getElementById('detailTitle').textContent = `Detalhes - ${instituicao}`;
        
        // Criar gráfico
        createSexoChart(result.data.analytics);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados');
    } finally {
        showLoader(false);
    }
}

// Inicialização única
if (checkAuth()) {
    loadDetailsData();
}