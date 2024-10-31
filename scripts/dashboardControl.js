// dashboardControl.js
import { APPS_SCRIPT_URL } from './config.js';
import { checkAuth, initSidebar } from './sessionCheck.js';

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
    // Destruir tabela existente se houver
    if (dataTable) {
        dataTable.destroy();
    }

    // Criar estrutura da tabela se não existir
    if (!document.getElementById('mainTable')) {
        const tableHtml = `
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
        document.getElementById('dataTableContainer').innerHTML = tableHtml;
    }

    // Processar dados para agrupar por instituição, curso, turma e turno
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

    // Converter dados agrupados para array
    const tableData = Object.values(groupedData);

    // Inicializar DataTable
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
            // Adicionar filtros individuais para cada coluna
            this.api().columns().every(function() {
                const column = this;
                const header = $(column.header());
                const title = header.text();

                // Criar input de pesquisa
                const input = $('<input type="text" placeholder="Filtrar ' + title + '" />')
                    .appendTo(header)
                    .on('keyup change', function() {
                        if (column.search() !== this.value) {
                            column.search(this.value).draw();
                        }
                    });
            });
        }
    });

    // Adicionar evento de clique nas linhas
    $('#mainTable tbody').on('click', 'tr', function() {
        const data = dataTable.row(this).data();
        if (data) {
            showDetails(data);
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

function showDetails(data) {
    window.location.href = `details.html?instituicao=${encodeURIComponent(data.instituicao)}&curso=${encodeURIComponent(data.curso)}&turma=${encodeURIComponent(data.turma)}`;
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

// Adicionar estilos CSS para a tabela
function addTableStyles() {
    const style = document.createElement('style');
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

        .dataTables_wrapper .dt-buttons {
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

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;

    initSidebar();
    addTableStyles();

    try {
        const data = await fetchDashboardData();
        if (data) {
            globalData = data;
            updateEstatisticasGerais(data.analytics);
            initializeDataTable(data.filteredData);
        }
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
    }
});