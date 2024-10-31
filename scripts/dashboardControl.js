// dashboardControl.js
import { APPS_SCRIPT_URL } from './config.js';
import { checkAuth, initInterface, showLoader } from './sessionCheck.js';

// Verificar autenticação antes de qualquer coisa
if (!checkAuth()) {
    throw new Error('Não autorizado');
}

// Inicializar interface
initInterface();

// Função para processar dados da tabela
function processTableData(filteredData) {
    return filteredData.reduce((acc, curr) => {
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
}

// Função para inicializar DataTable
function initializeDataTable(tableData) {
    if (!tableData || Object.keys(tableData).length === 0) {
        throw new Error('Dados inválidos para a tabela');
    }

    return new DataTable('#mainTable', {
        data: Object.values(tableData),
        columns: [
            { data: 'instituicao' },
            { data: 'curso' },
            { data: 'turma' },
            { data: 'turno' },
            { 
                data: 'totalAlunos',
                render: function(data) {
                    return data.toLocaleString('pt-BR');
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
        },
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
        order: [[0, 'asc']],
        pageLength: 25,
        responsive: true
    });
}

// Função principal de carregamento de dados
async function loadDashboardData() {
    const userToken = sessionStorage.getItem('userToken');
    if (!userToken) {
        throw new Error('Token não encontrado');
    }

    showLoader(true);
    
    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=dashboard&token=${encodeURIComponent(userToken)}`);
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const result = await response.json();
        if (!result.autorizado) {
            sessionStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        const { data } = result;
        if (!data || !data.analytics || !data.filteredData) {
            throw new Error('Dados inválidos recebidos do servidor');
        }

        // Atualizar estatísticas
        document.getElementById('totalAlunos').textContent = 
            (data.analytics.totalAlunos || 0).toLocaleString('pt-BR');
        
        const totalTransporte = Object.values(data.analytics.transporteEscola || {})
            .reduce((a, b) => a + b, 0);
        document.getElementById('totalTransporte').textContent = 
            totalTransporte.toLocaleString('pt-BR');
        
        const totalBolsa = Object.keys(data.analytics.alunosBolsaFamilia || {}).length;
        document.getElementById('totalBolsa').textContent = 
            totalBolsa.toLocaleString('pt-BR');

        // Preparar e exibir tabela
        document.getElementById('dataTableContainer').innerHTML = `
            <table id="mainTable" class="display">
                <thead>
                    <tr>
                        <th>Instituição</th>
                        <th>Curso</th>
                        <th>Turma</th>
                        <th>Turno</th>
                        <th>Total</th>
                    </tr>
                </thead>
            </table>
        `;

        const processedData = processTableData(data.filteredData);
        const dataTable = initializeDataTable(processedData);

        // Adicionar evento de clique nas linhas
        document.querySelector('#mainTable tbody').addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row) {
                const rowData = dataTable.row(row).data();
                if (rowData) {
                    window.location.href = `details.html?instituicao=${encodeURIComponent(rowData.instituicao)}`;
                }
            }
        });

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
    } finally {
        showLoader(false);
    }
}

// Iniciar carregamento dos dados
loadDashboardData();