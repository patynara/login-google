import { APPS_SCRIPT_URL } from './config.js';


// Resto do código permanece igual
function getQueryParams() {
  const params = {};
  const search = window.location.search.substring(1);
  if (search) {
    search.split('&').forEach(function(param) {
      const [key, value] = param.split('=');
      params[key] = decodeURIComponent(value);
    });
  }
  return params;
}

async function fetchDashboardData(filterField, filterValue) {
  const token = sessionStorage.getItem('userToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  try {
    showLoader(true);
    let url = `${APPS_SCRIPT_URL}?action=dashboard&token=${token}&filterField=${filterField}&filterValue=${encodeURIComponent(filterValue)}`;
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

function updateDetails(data, filterField, filterValue) {
  const detailTitle = document.getElementById('detailTitle');
  if (detailTitle) {
    detailTitle.textContent = `${filterValue}`;
  }

  // Atualizar gráficos
  createCharts(data.totals);
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

  // Adicionar outros gráficos conforme necessário
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

  const params = getQueryParams();
  const filterField = params.filterField;
  const filterValue = params.filterValue;

  if (!filterField || !filterValue) {
    showMessage('Parâmetros inválidos', true);
    return;
  }

  try {
    const data = await fetchDashboardData(filterField, filterValue);
    if (data) {
      updateDetails(data, filterField, filterValue);
    }
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
  }
});
