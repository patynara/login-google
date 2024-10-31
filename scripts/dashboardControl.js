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
            // Adiciona evento de clique nas linhas
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
    const chartIds = ['escolaChart', 'turmaChart', 'cursoIdadeChart', 'deficienciaChart'];
    chartIds.forEach(id => {
        const canvas = document.getElementById(id);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Filtra dados para a instituição selecionada
    const filteredAnalytics = filterDataByInstituicao(globalData.analytics, instituicao);
    
    // Cria novos gráficos
    createEscolaChart(filteredAnalytics);
    createTurmaChart(filteredAnalytics);
    createCursoIdadeChart(filteredAnalytics);
    createDeficienciaChart(filteredAnalytics);
    // Adicione mais chamadas para outros gráficos
}

function filterDataByInstituicao(analytics, instituicao) {
    // Filtra os dados para a instituição selecionada
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

function createEscolaChart(analytics) {
    const ctx = document.getElementById('escolaChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(analytics.alunosPorEscola),
            datasets: [{
                label: 'Alunos por Escola',
                data: Object.values(analytics.alunosPorEscola),
                backgroundColor: '#4a90e2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createTurmaChart(analytics) {
    const ctx = document.getElementById('turmaChart').getContext('2d');
    const turmaData = Object.entries(analytics.alunosPorTurma)
        .reduce((acc, [key, value]) => {
            const [curso, turma] = key.split('-');
            if (!acc[curso]) acc[curso] = {};
            acc[curso][turma] = value;
            return acc;
        }, {});

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(turmaData),
            datasets: Object.keys(turmaData[Object.keys(turmaData)[0]] || {}).map((turma, index) => ({
                label: turma,
                data: Object.values(turmaData).map(curso => curso[turma] || 0),
                backgroundColor: getChartColor(index)
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createCursoIdadeChart(analytics) {
    const ctx = document.getElementById('cursoIdadeChart').getContext('2d');
    const cursoIdadeData = Object.entries(analytics.alunosPorCursoIdade)
        .reduce((acc, [key, value]) => {
            const [curso, idade] = key.split('-');
            if (!acc[curso]) acc[curso] = {};
            acc[curso][idade] = value;
            return acc;
        }, {});

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(cursoIdadeData),
            datasets: Object.keys(cursoIdadeData[Object.keys(cursoIdadeData)[0]] || {}).map((idade, index) => ({
                label: `${idade} anos`,
                data: Object.values(cursoIdadeData).map(curso => curso[idade] || 0),
                backgroundColor: getChartColor(index)
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createDeficienciaChart(analytics) {
    const ctx = document.getElementById('deficienciaChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Com Deficiência', 'Sem Deficiência'],
            datasets: [{
                data: [
                    Object.values(analytics.alunosDeficienciaPorEscola).reduce((a, b) => a + b, 0),
                    analytics.totalAlunos - Object.values(analytics.alunosDeficienciaPorEscola).reduce((a, b) => a + b, 0)
                ],
                backgroundColor: ['#ff6b6b', '#4a90e2']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function getChartColor(index) {
    const colors = [
        '#4a90e2', '#50c878', '#ff6b6b', '#ffd700', 
        '#8884d8', '#82ca9d', '#ff7c43', '#a05195'
    ];
    return colors[index % colors.length];
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
        const data = await fetchDashboar