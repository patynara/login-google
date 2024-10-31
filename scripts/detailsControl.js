// detailsControl.js
import { APPS_SCRIPT_URL } from './config.js';
import { showLoader, showMessage } from './sessionCheck.js';

function getQueryParams() {
    const params = {};
    const search = window.location.search.substring(1);
    if (search) {
        search.split('&').forEach(function(param) {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });
    }
    return params;
}

async function fetchDashboardData(filterField, filterValue) {
    const token = sessionStorage.getItem('userToken');
    if (!token) {
        window.location.replace('index.html');
        return;
    }

    try {
        showLoader(true);
        let url = `${APPS_SCRIPT_URL}?action=dashboard&token=${token}&filterField=${filterField}&filterValue=${encodeURIComponent(filterValue)}`;
        const response = await fetch(url);
        const result = await response.json();

        if (!result.autorizado) {
            throw new Error(result.message || 'Não autorizado');
        }

        return result.data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        showMessage('Erro ao carregar dados do dashboard', true);
        return null;
    } finally {
        showLoader(false);
    }
}

function updateDetails(data, filterField, filterValue) {
    const detailTitle = document.getElementById('detailTitle');
    if (detailTitle) {
        detailTitle.textContent = `Detalhes - ${filterValue}`;
    }

    if (data && data.analytics) {
        createCharts(data.analytics);
    }
}

function createCharts(analytics) {
    createSexoChart(analytics);
    // Adicione mais gráficos conforme necessário
}

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
                },
                title: {
                    display: true,
                    text: 'Distribuição por Sexo'
                }
            }
        }
    });
}

// Inicialização única
async function initializeDetails() {
    const params = getQueryParams();
    const filterField = params.filterField || 'instituicao';
    const filterValue = params.filterValue;

    if (!filterValue) {
        showMessage('Parâmetros inválidos', true);
        window.location.replace('dashboard.html');
        return;
    }

    const data = await fetchDashboardData(filterField, filterValue);
    if (data) {
        updateDetails(data, filterField, filterValue);
    }
}

// Executar apenas uma vez quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDetails);
} else {
    initializeDetails();
}