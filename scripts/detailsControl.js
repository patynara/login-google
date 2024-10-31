// detailsControl.js
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

    // Obter parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const instituicao = urlParams.get('instituicao');

    if (!instituicao) {
        window.location.replace('dashboard.html');
    } else {
        // Carregar dados uma única vez
        (async function() {
            try {
                // Mostrar loader
                document.getElementById('loader').style.display = 'block';
                
                // Buscar dados
                const response = await fetch(`${APPS_SCRIPT_URL}?action=dashboard&token=${userToken}&filterField=instituicao&filterValue=${encodeURIComponent(instituicao)}`);
                const result = await response.json();

                if (!result.autorizado) throw new Error('Não autorizado');

                // Atualizar título
                document.getElementById('detailTitle').textContent = `Detalhes - ${instituicao}`;

                // Processar dados para o gráfico
                const analytics = result.data.analytics;
                const sexoData = {
                    'Masculino': 0,
                    'Feminino': 0
                };

                Object.entries(analytics.alunosPorSexoCurso || {}).forEach(([key, value]) => {
                    const sexo = key.split('-')[0];
                    if (sexo === 'MASCULINO') sexoData['Masculino'] += value;
                    if (sexo === 'FEMININO') sexoData['Feminino'] += value;
                });

                // Criar gráfico
                new Chart(document.getElementById('sexoChart'), {
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

            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao carregar dados');
            } finally {
                document.getElementById('loader').style.display = 'none';
            }
        })();
    }
}