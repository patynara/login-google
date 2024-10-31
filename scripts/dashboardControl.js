// URL do Web App do Google Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEPx4T8zPdCQY4I2P3KQCUDhpGEUYlQkpKf1ySMdQ1ku2T2mGDdKvM2Ppd524tfsXo/exec';

let globalTotals = {};

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

function updateDashboard(data) {
    // Atualizar totalizadores gerais
    updateEstatisticasGerais(data.totals);
  
    // Atualizar gráficos
    createCharts(data.totals);
  
    // Armazenar os totais globalmente
    globalTotals = data.totals;
  
    // Criar tabela inicial
    const criteriaSelect = document.getElementById('criteriaSelect');
    const selectedField = criteriaSelect.value;
    const selectedLabel = criteriaSelect.options[criteriaSelect.selectedIndex].text;
    createDataTable(globalTotals, selectedField, selectedLabel);
  }

function updateEstatisticasGerais(totals) {
    document.getElementById('totalAlunos').textContent = totals.totalAlunos || 0;
    document.getElementById('totalTransporte').textContent = totals.porTransporteTipo['Ônibus'] || 0;
    document.getElementById('totalBolsa').textContent = totals.porBolsaFamilia['sim'] || 0;
  }

function createDataTable(totals, field, label) {
  const data = Object.entries(totals[field]).map(([key, count]) => ({ key, count }));

  const container = document.getElementById('dataTableContainer');
  if (!container) return;

  container.innerHTML = '';

  const table = document.createElement('table');
  table.classList.add('datatable');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const thField = document.createElement('th');
  thField.textContent = label;
  const thCount = document.createElement('th');
  thCount.textContent = 'Quantidade de Alunos';
  headerRow.appendChild(thField);
  headerRow.appendChild(thCount);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(item => {
    const tr = document.createElement('tr');
    const tdField = document.createElement('td');
    tdField.textContent = item.key;
    tdField.classList.add('field-cell');
    const tdCount = document.createElement('td');
    tdCount.textContent = item.count;
    tr.appendChild(tdField);
    tr.appendChild(tdCount);
    tbody.appendChild(tr);

    tr.addEventListener('click', () => {
      // Salvar o filtro nos parâmetros da URL
      const params = new URLSearchParams();
      params.append('filterField', field);
      params.append('filterValue', item.key);
      window.location.href = `details.html?${params.toString()}`;
    });
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function handleCriteriaSelection() {
  const criteriaSelect = document.getElementById('criteriaSelect');
  criteriaSelect.addEventListener('change', function() {
    const selectedField = criteriaSelect.value;
    const selectedLabel = criteriaSelect.options[criteriaSelect.selectedIndex].text;

    createDataTable(globalTotals, selectedField, selectedLabel);
  });
}

function createCharts(totals) {
  // Exemplo de criação de gráfico de Pizza para Sexo
  const ctxSexo = document.getElementById('sexoChart');
  if (ctxSexo) {
    new Chart(ctxSexo, {
      type: 'pie',
      data: {
        labels: Object.keys(totals.porSexo),
        datasets: [{
          data: Object.values(totals.porSexo),
          backgroundColor: ['#4a90e2', '#ff6b6b', '#50c878', '#ffd700']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
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

document.addEventListener('DOMContentLoaded', async function() {
  if (!checkAuth()) return;

  initSidebar();
  handleCriteriaSelection();

  try {
    const data = await fetchDashboardData();
    if (data) {
      updateDashboard(data);
    }
  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error);
  }
});
