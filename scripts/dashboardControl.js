import { APPS_SCRIPT_URL } from './config.js';


let globalData = null;
let dataTable = null;

async function fetchDashboardData(filterField = null, filterValue = null) {
    const token = sessionStorage.getItem('userToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        showLoader(true);
        let url = `${APPS_SCRIPT_URL}?action=dashboard&token=${token}`;
        if (filterField && filterValue) {
            url += `&filterField=${filterField}&filterValue=${encodeURIComponent(filterValue)}`;
        }
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

function initializeDataTable(data) {
    if (dataTable) {
        dataTable.destroy();
    }

    dataTable = $('#mainTable').DataTable({
        data: data.filteredData,
        columns: [
            { data: 'instituicao', title: 'Instituição' },
            { data: 'curso', title: 'Curso' },
            { data: 'turma', title: 'Turma' },
            { data: 'turno', title: 'Turno' }
        ],
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
        },
        initComplete: function() {
            $('#mainTable tbody').on('click', 'tr', function() {
                const data = dataTable.row(this).data();
                showCharts(data.instituicao);
            });
        }
    });
}

function updateEstatisticasGerais(analytics) {
    document.getElementById('totalAlunos').textContent = analytics.totalAlunos || 0;
    document.getElementById('totalTransporte').textContent = 
        Object.values(analytics.transporteEscola).reduce((a, b) => a + b, 0);
    document.getElementById('totalBolsa').textContent = 
        Object.keys(analytics.alunosBolsaFamilia).length;
}

function showCharts(instituicao) {
    const chartsContainer = document.getElementById('chartsContainer');
    chartsContainer.style.display = 'grid';
    
    // Limpa gráficos existentes
    const chartCanvases = chartsContainer.querySelectorAll('canvas');
    chartCanvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Filtra dados para a instituição selecionada
    const filteredAnalytics = filterDataByInstituicao(globalData.analytics, instituicao);
    
    // Atualiza todos os gráficos
    updateAllCharts(instituicao);
}

function filterDataByInstituicao(analytics, instituicao) {
    const filtered = {};
    Object.keys(analytics).forEach(key => {
        if (typeof analytics[key] === 'object') {
            filtered[key] = Object.entries(analytics[key])
                .filter(([k]) => k.includes(instituicao))
                .reduce((obj, [k, v]) => ({...obj, [k]: v}), {});
        } else {
            filtered[key] = analytics[key];
        }
    });
    return filtered;
}

function getChartColor(index) {
    const colors = [
        '#4a90e2', '#50c878', '#ff6b6b', '#ffd700', 
        '#8884d8', '#82ca9d', '#ff7c43', '#a05195'
    ];
    return colors[index % colors.length];
}

function updateAllCharts(instituicao) {
    const filteredAnalytics = filterDataByInstituicao(globalData.analytics, instituicao);
    
    // Cria ou atualiza cada gráfico
    createEscolaChart(filteredAnalytics);
    createTurmaChart(filteredAnalytics);
    createCursoIdadeChart(filteredAnalytics);
    createDeficienciaChart(filteredAnalytics);
    createAlunosCursoDeficienciaChart(filteredAnalytics);
    createAlunosCursoCorChart(filteredAnalytics, instituicao);
    createAlunosTransporteZonaChart(filteredAnalytics);
    createAlunosBolsaFamiliaChart(filteredAnalytics, instituicao);
    createAlunosSituacaoChart(filteredAnalytics, instituicao);
    createAlunosTurnoChart(filteredAnalytics);
    createAlunosTempoIntegralChart(filteredAnalytics);
    createAlunosIdadeTransporteChart(filteredAnalytics);
}

function createChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            ...options
        }
    });
}

// Funções específicas para cada gráfico
function createEscolaChart(analytics) {
    createChart('escolaChart', 'bar', {
        labels: Object.keys(analytics.alunosPorEscola),
        datasets: [{
            label: 'Alunos por Escola',
            data: Object.values(analytics.alunosPorEscola),
            backgroundColor: '#4a90e2'
        }]
    });
}

function createTurmaChart(analytics) {
    const turmaData = Object.entries(analytics.alunosPorTurma)
        .reduce((acc, [key, value]) => {
            const [curso, turma] = key.split('-');
            if (!acc[curso]) acc[curso] = {};
            acc[curso][turma] = value;
            return acc;
        }, {});

    createChart('turmaChart', 'bar', {
        labels: Object.keys(turmaData),
        datasets: Object.keys(turmaData[Object.keys(turmaData)[0]] || {}).map((turma, index) => ({
            label: turma,
            data: Object.values(turmaData).map(curso => curso[turma] || 0),
            backgroundColor: getChartColor(index)
        }))
    });
}

function createCursoIdadeChart(analytics) {
    const cursoIdadeData = Object.entries(analytics.alunosPorCursoIdade)
        .reduce((acc, [key, value]) => {
            const [curso, idade] = key.split('-');
            if (!acc[curso]) acc[curso] = {};
            acc[curso][idade] = value;
            return acc;
        }, {});

    createChart('cursoIdadeChart', 'bar', {
        labels: Object.keys(cursoIdadeData),
        datasets: Object.keys(cursoIdadeData[Object.keys(cursoIdadeData)[0]] || {}).map((idade, index) => ({
            label: `${idade} anos`,
            data: Object.values(cursoIdadeData).map(curso => curso[idade] || 0),
            backgroundColor: getChartColor(index)
        }))
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

    try {
        const data = await fetchDashboardData();
        if (data) {
            globalData = data;
            initializeDataTable(data);
            updateEstatisticasGerais(data.analytics);
            
            // Inicialmente oculta a área de gráficos
            const chartsContainer = document.getElementById('chartsContainer');
            chartsContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        showMessage('Erro ao carregar dados do dashboard', true);
    }
});