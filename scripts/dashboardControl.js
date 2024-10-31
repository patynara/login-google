// dashboardControl.js
import { APPS_SCRIPT_URL } from './config.js';

// Verificar autenticação
const userToken = sessionStorage.getItem('userToken');
const userName = sessionStorage.getItem('userName');

if (!userToken || !userName) {
    window.location.replace('index.html');
} else {
    // Configurar interface básica
    document.getElementById('userName').textContent = userName;
    document.getElementById('logoutBtn').onclick = () => {
        sessionStorage.clear();
        window.location.replace('index.html');
    };

    // Função para processar os dados da tabela
    function processTableData(filteredData) {
        // Agrupar dados por instituição, curso, turma e turno
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

    // Inicializar DataTable
    function initializeDataTable(tableData) {
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

    // Carregar dados uma única vez
    (async function() {
        const loader = document.getElementById('loader');
        try {
            loader.style.display = 'block';
            
            const response = await fetch(`${APPS_SCRIPT_URL}?action=dashboard&token=${encodeURIComponent(userToken)}`);
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            
            const result = await response.json();
            if (!result.autorizado) throw new Error('Não autorizado');

            const { data } = result;
            if (!data || !data.analytics || !data.filteredData) {
                throw new Error('Dados inválidos recebidos do servidor');
            }

            // Atualizar estatísticas
            const analytics = data.analytics;
            document.getElementById('totalAlunos').textContent = 
                (analytics.totalAlunos || 0).toLocaleString('pt-BR');
            
            const totalTransporte = Object.values(analytics.transporteEscola || {})
                .reduce((a, b) => a + b, 0);
            document.getElementById('totalTransporte').textContent = 
                totalTransporte.toLocaleString('pt-BR');
            
            const totalBolsa = Object.keys(analytics.alunosBolsaFamilia || {}).length;
            document.getElementById('totalBolsa').textContent = 
                totalBolsa.toLocaleString('pt-BR');

            // Preparar tabela
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

            // Processar e exibir dados
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
            loader.style.display = 'none';
        }
    })();
}