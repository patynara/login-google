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

    // Carregar dados uma única vez
    (async function() {
        try {
            // Mostrar loader
            document.getElementById('loader').style.display = 'block';
            
            // Buscar dados
            const response = await fetch(`${APPS_SCRIPT_URL}?action=dashboard&token=${userToken}`);
            const result = await response.json();

            if (!result.autorizado) throw new Error('Não autorizado');

            const data = result.data;

            // Atualizar estatísticas
            document.getElementById('totalAlunos').textContent = data.analytics.totalAlunos || 0;
            document.getElementById('totalTransporte').textContent = 
                Object.values(data.analytics.transporteEscola || {}).reduce((a, b) => a + b, 0);
            document.getElementById('totalBolsa').textContent = 
                Object.keys(data.analytics.alunosBolsaFamilia || {}).length;

            // Criar estrutura da tabela
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

            // Preparar dados agrupados
            const groupedData = data.filteredData.reduce((acc, curr) => {
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

            // Inicializar DataTable
            const dataTable = new DataTable('#mainTable', {
                data: Object.values(groupedData),
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
                buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
            });

            // Adicionar evento de clique
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
            console.error('Erro:', error);
            alert('Erro ao carregar dados');
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    })();
}