document.addEventListener('DOMContentLoaded', function() {
    // Dados exemplo - Em produção, você buscaria estes dados de uma API
    const monthlyData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            label: 'Vendas',
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: '#4a90e2'
        }]
    };

    const distributionData = {
        labels: ['Categoria A', 'Categoria B', 'Categoria C', 'Categoria D'],
        datasets: [{
            data: [30, 25, 25, 20],
            backgroundColor: ['#4a90e2', '#50c878', '#ff6b6b', '#ffd700']
        }]
    };

    // Configurar gráficos
    const generalStats = new Chart(document.getElementById('generalStats'), {
        type: 'bar',
        data: monthlyData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    const monthlyChart = new Chart(document.getElementById('monthlyData'), {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Crescimento',
                data: [20, 35, 45, 30, 55, 65],
                borderColor: '#50c878',
                tension: 0.1
            }]
        },
        options: {
            responsive: true
        }
    });

    const distributionChart = new Chart(document.getElementById('distributionChart'), {
        type: 'doughnut',
        data: distributionData,
        options: {
            responsive: true
        }
    });

    // Preencher tabela com dados exemplo
    const tableData = [
        { data: '2024-01-01', descricao: 'Projeto A', status: 'Concluído', valor: 'R$ 1.500,00' },
        { data: '2024-01-15', descricao: 'Projeto B', status: 'Em andamento', valor: 'R$ 2.300,00' },
        { data: '2024-02-01', descricao: 'Projeto C', status: 'Pendente', valor: 'R$ 800,00' },
        { data: '2024-02-15', descricao: 'Projeto D', status: 'Concluído', valor: 'R$ 3.200,00' }
    ];

    const tableBody = document.getElementById('tableBody');
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.data}</td>
            <td>${row.descricao}</td>
            <td>${row.status}</td>
            <td>${row.valor}</td>
        `;
        tableBody.appendChild(tr);
    });
});