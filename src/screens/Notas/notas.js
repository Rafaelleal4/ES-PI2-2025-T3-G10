//Edson Luan Rocha Forest Autor

const API_URL = 'http://localhost:5000/api';

// Guarda os dados das notas globalmente para usar na exportação
let dadosParaExportar = [];

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    // Pega o ID do usuário (simulando, já que não temos o 'auth.js' aqui)
    const usuarioId = localStorage.getItem('usuarioId'); 
    if (!usuarioId) {
        // Se não tiver, volta pro login
        // window.location.href = '/login'; 
        console.warn('Usuário não logado, mas continuando para teste.');
    }

    configurarEventos();
    carregarQuadroDeNotas();
});

// --- CONFIGURA TODOS OS BOTÕES ---
function configurarEventos() {
    // Botões de Navegação
    document.getElementById('btnDashboard').addEventListener('click', () => {
        window.location.href = '/dashboard';
    });
    document.getElementById('btnSair').addEventListener('click', () => {
        // Lógica de Sair (limpar localStorage, etc.)
        window.location.href = '/login';
    });

    // Botões de Exportação (da issue)
    document.getElementById('btnExportarCSV').addEventListener('click', () => {
        exportarParaCSV(dadosParaExportar, 'quadro_de_notas');
    });
    document.getElementById('btnExportarJSON').addEventListener('click', () => {
        exportarParaJSON(dadosParaExportar, 'quadro_de_notas');
    });
}

// --- 1. BUSCA DADOS DA API E MANDA RENDERIZAR ---
async function carregarQuadroDeNotas() {
    const tbody = document.getElementById('corpo-tabela-notas');
    tbody.innerHTML = '<tr class="sem-dados"><td colspan="8">Carregando...</td></tr>';

    try {
        // ! IMPORTANTE: Você precisa criar este endpoint no seu backend!
        const response = await fetch(`${API_URL}/notas/quadro`); 
        
        if (!response.ok) {
            throw new Error('Falha ao buscar dados da API');
        }
        
        const data = await response.json();

        if (data.sucesso && data.dados.length > 0) {
            dadosParaExportar = data.dados; // Salva os dados para exportar
            renderizarTabela(data.dados);
        } else {
            tbody.innerHTML = '<tr class="sem-dados"><td colspan="8">Nenhuma nota encontrada.</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao carregar notas:', error);
        tbody.innerHTML = `<tr class="sem-dados"><td colspan="8" style="color: red;">Erro ao carregar dados. Verifique o console.</td></tr>`;
    }
}

// --- 2. DESENHA A TABELA NO HTML ---
function renderizarTabela(dados) {
    const tbody = document.getElementById('corpo-tabela-notas');
    tbody.innerHTML = ''; // Limpa a tabela

    dados.forEach(nota => {
        // Lógica da issue: Se 'nota_manual' existir, use-a. Senão, use a 'nota_calculada'.
        const notaFinal = nota.nota_manual_ajustada !== null ? nota.nota_manual_ajustada : nota.nota_calculada;

        const tr = document.createElement('tr');
        tr.setAttribute('data-id-nota', nota.id_nota); // Guarda o ID na linha

        tr.innerHTML = `
            <td>${nota.aluno_nome}</td>
            <td>${nota.disciplina_nome}</td>
            <td>${nota.nota_p1 || 'N/A'}</td>
            <td>${nota.nota_p2 || 'N/A'}</td>
            <td>${nota.nota_p3 || 'N/A'}</td>
            <td>${nota.nota_calculada.toFixed(2)}</td>
            
            <td class="nota-final-editavel" data-valor="${notaFinal.toFixed(2)}">
                <strong>${notaFinal.toFixed(2)}</strong>
            </td>
            
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="iniciarEdicao(${nota.id_nota})">
                    Editar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 3. FUNÇÕES DE EXPORTAÇÃO (DA ISSUE) ---

function exportarParaJSON(dados, nomeArquivo) {
  const jsonString = JSON.stringify(dados, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${nomeArquivo}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportarParaCSV(dados, nomeArquivo) {
  if (dados.length === 0) return;

  // Pega os cabeçalhos (nomes das colunas) do primeiro objeto
  const cabecalhos = Object.keys(dados[0]);
  let csvString = cabecalhos.join(",") + "\n";

  // Adiciona cada linha de dados
  dados.forEach(linha => {
    const valores = cabecalhos.map(cabecalho => {
        let val = linha[cabecalho];
        // Trata valores nulos e strings com vírgula
        if (val === null || val === undefined) val = '';
        if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
        return val;
    });
    csvString += valores.join(",") + "\n";
  });

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${nomeArquivo}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}




function iniciarEdicao(idNota) {
    alert(`FUNCIONALIDADE: Iniciar edição para a Nota ID: ${idNota}. Próximo passo é implementar!`);
    
    
    
}