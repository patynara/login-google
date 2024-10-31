// dashboardControl.js
import { APPS_SCRIPT_URL } from './config.js';
import { showLoader, showMessage } from './sessionCheck.js';

let dataTable = null;

async function fetchDashboardData(filterField = null, filterValue = null) {
    const token = sessionStorage.getItem('userToken');
    if (!token) {
        window.location.replace('index.html');
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
        return null;
    } finally {
        showLoader(false);
    }
}

function initializeDataTable(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('Sem dados para exibir na tabela');
        return;
    }

    if (dataTable) {
        dataTable.destroy();
    }

    const tableContainer = document.getElementById('dataTableContainer');
    if (!document.getElementById('mainTable')) {
        tableContainer.innerHTML = `
            <table id="mainTable" class="display" style="width:100%">
                <thead>
                    <tr>
                        <th>Instituição</th>
                        <th>Curso</th>
                        <th>Turma</th>
                        <th>Turno</th>
                        <th>Total Alunos</th>
                    </tr>
                </thead>
            </table>
        `;
    }

    const groupedData = data.reduce((acc, curr) => {
        const key = `${curr.instituicao}-${curr.curso}-${curr.turma}-${curr.turno}`;
        if (!acc[key]) {
            acc[key] = {
                instituicao: curr.instituicao,
                curso: curr.curso,
                turma: curr.turma,
                turno: curr.turno,
                totalAlunos: 0
            };
        }
        acc[key].totalAlunos++;
        return acc;
    }, {});

    const tableData = Object.values(groupedData);

    dataTable = $('#mainTable').DataTable({
        data: tableData,
        columns: [
            { data: 'instituicao' },
            { data: 'curso' },
            { data: 'turma' },
            { data: 'turno' },
            { data: 'totalAlunos' }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
        },
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        initComplete: function() {
            this.api().columns().every(function() {
                const column = this;
                const header = $(column.header());
                const title = header.text();

                const input = $('<input type="text" placeholder="Filtrar ' + title + '" />')
                    .appendTo(header)
                    .on('keyup change clear', function() {
                        if (column.search() !== this.value) {
                            column.search(this.value).draw();
                        }
                    });
            });
        }
    });

    $('#mainTable tbody').on('click', 'tr', function() {
        const rowData = dataTable.row(this).data();
        if (rowData) {
            window.location.href = `details.html?instituicao=${encodeURIComponent(rowData.instituicao)}&curso=${encodeURIComponent(rowData.curso)}&turma=${encodeURIComponent(rowData.turma)}`;
        }
    });
}

function updateEstatisticasGerais(analytics) {
    if (!analytics) return;

    const totalAlunos = document.getElementById('totalAlunos');
    const totalTransporte = document.getElementById('totalTransporte');
    const totalBolsa = document.getElementById('totalBolsa');

    if (totalAlunos) totalAlunos.textContent = analytics.totalAlunos || 0;
    if (totalTransporte) totalTransporte.textContent = Object.values(analytics.transporteEscola || {}).reduce((a, b) => a + b, 0);
    if (totalBolsa) totalBolsa.textContent = Object.keys(analytics.alunosBolsaFamilia || {}).length;
}

function addTableStyles() {
    const styleId = 'dataTableStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        #mainTable_wrapper {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        #mainTable thead input {
            width: 100%;
            padding: 4px;
            margin: 4px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        #mainTable tbody tr {
            cursor: pointer;
        }

        #mainTable tbody tr:hover {
            background-color: #f5f5f5;
        }

        .dt-buttons {
            margin-bottom: 10px;
        }

        .dt-button {
            padding: 5px 10px;
            margin-right: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f8f9fa;
            cursor: pointer;
        }

        .dt-button:hover {
            background-color: #e9ecef;
        }
    `;
    document.head.appendChild(style);
}

// Inicialização única
async function initializeDashboard() {
    addTableStyles();
    
    const data = await fetchDashboardData();
    if (data) {
        updateEstatisticasGerais(data.analytics);
        initializeDataTable(data.filteredData);
    }
}

// Executar apenas uma vez quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}