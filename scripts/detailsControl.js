// detailsControl.js
import { APPS_SCRIPT_URL } from './config.js';
import { checkAuth, initSidebar } from './sessionCheck.js';

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
        window.location.href = 'index.html';
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
    } finally {
        showLoader(false);
    }
}

function updateDetails(data, filterField, filterValue) {
    const detailTitle = document.getElementById('detailTitle');
    if (detailTitle) {
        detailTitle.textContent = `Detalhes - ${filterValue}`;
    }

    // Atualizar gráficos
    createCharts(data);
}

function createCharts(data) {
    // Gráfico de distribuição por sexo
    createSexoChart(data);
    
    // Aqui você pode adicionar mais gráficos
    // createIdadeChart(data);
    // createTurnoChart(data);
    // etc...
}

function createSexoChart(data) {
    const ctxSexo = document.getElementById('sexoChart');
    if (!ctxSexo) return;

    // Processar dados para o gráfico
    const sexoData = {
        'Masculino': 0,
        'Feminino': 0
    };

    // Se tivermos dados específicos por sexo no analytics
    if (data.analytics && data.analytics.alunosPorSexoCurso) {
        Object.entries(data.analytics.alunosPorSexoCurso).forEach(([key, value]) => {
            const sexo = key.split('-')[0];
            if (sexo === 'MASCULINO') sexoData['Masculino'] += value;
            if (sexo === 'FEMININO') sexoData['Feminino'] += value;
        });
    }

    // Criar o gráfico
    new Chart(ctxSexo, {
        type: 'pie',
        data: {
            labels: Object.keys(sexoData),
            datasets: [{
                data: Object.values(sexoData),
                backgroundColor: [
                    '#4a90e2',  // Azul para Masculino
                    '#ff6b6b'   // Rosa para Feminino
                ],
                borderWidth: 1
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

function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

function showMessage(message, isError = false) {
    console.log(message);
    // Implementar mensagens visuais se necessário
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;

    initSidebar();

    const params = getQueryParams();
    const filterField = params.filterField || 'instituicao';
    const filterValue = params.filterValue;

    if (!filterValue) {
        showMessage('Parâmetros inválidos', true);
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const data = await fetchDashboardData(filterField, filterValue);
        if (data) {
            updateDetails(data, filterField, filterValue);
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showMessage('Erro ao carregar dados', true);
    }
});