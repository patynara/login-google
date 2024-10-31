// detailsControl.js
import { APPS_SCRIPT_URL } from './config.js';
import { checkAuth, initSidebar, showLoader, showMessage } from './sessionCheck.js';

let initialized = false;

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

async function fetchDetailsData(instituicao) {
    const token = sessionStorage.getItem('userToken');
    if (!token || !instituicao) return null;

    try {
        showLoader(true);
        const url = `${APPS_SCRIPT_URL}?action=dashboard&token=${token}&filterField=instituicao&filterValue=${encodeURIComponent(instituicao)}`;
        const response = await fetch(url);
        const result = await response.json();

        if (!result.autorizado) {
            throw new Error(result.message || 'Não autorizado');
        }

        return result.data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        showMessage('Erro ao carregar detalhes', true);
        return null;
    } finally {
        showLoader(false);
    }
}

function updateDetails(data, instituicao) {
    const titleElement = document.getElementById('detailTitle');
    if (titleElement) {
        titleElement.textContent = `Detalhes - ${instituicao}`;
    }

    if (data?.analytics) {
        createCharts(data.analytics);
    }
}

function createCharts(analytics) {
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

async function initializeDetails() {
    if (initialized || !checkAuth()) return;
    initialized = true;

    initSidebar();
    const params = getQueryParams();
    const instituicao = params.instituicao;

    if (!instituicao) {
        showMessage('Instituição não especificada', true);
        window.location.replace('dashboard.html');
        return;
    }

    const data = await fetchDetailsData(instituicao);
    if (data) {
        updateDetails(data, instituicao);
    }
}

// Inicialização única
if (document.readyState === 'complete') {
    initializeDetails();
} else {
    window.addEventListener('load', initializeDetails, { once: true });
}