// Estado da aplicação
let usuarioId = null;
let instituicaoParaExcluir = null;
let modoEdicao = false;

// Elementos do DOM
const formInstituicao = document.getElementById('formInstituicao');
const inputNome = document.getElementById('nomeInstituicao');
const inputId = document.getElementById('instituicaoId');
const tituloForm = document.getElementById('tituloForm');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const btnNova = document.getElementById('btnNova');
const btnSair = document.getElementById('btnSair');

const mensagem = document.getElementById('mensagem');
const loading = document.getElementById('loading');
const listaVazia = document.getElementById('listaVazia');
const tabelaInstituicoes = document.getElementById('tabelaInstituicoes');
const corpoTabela = document.getElementById('corpoTabela');

const modalExcluir = document.getElementById('modalExcluir');
const mensagemExclusao = document.getElementById('mensagemExclusao');
const btnConfirmarExcluir = document.getElementById('btnConfirmarExcluir');
const btnCancelarExcluir = document.getElementById('btnCancelarExcluir');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  inicializar();
});

async function inicializar() {
  // Verificar se há usuário logado (simulação - em produção viria de sessão/token)
  const usuarioLogado = localStorage.getItem('usuarioId');
  
  if (!usuarioLogado) {
    mostrarMensagem('Você precisa fazer login primeiro', 'erro');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return;
  }

  usuarioId = usuarioLogado;
  
  // Carregar lista de instituições
  await carregarInstituicoes();

  // Event listeners
  formInstituicao.addEventListener('submit', handleSubmit);
  btnCancelar.addEventListener('click', cancelarEdicao);
  btnNova.addEventListener('click', mostrarFormularioNovo);
  btnConfirmarExcluir.addEventListener('click', confirmarExclusao);
  btnCancelarExcluir.addEventListener('click', fecharModalExcluir);
  btnSair.addEventListener('click', handleSair);

  // Esconder formulário inicialmente
  formInstituicao.parentElement.classList.add('oculto');
}

// Carregar instituições do servidor
async function carregarInstituicoes() {
  try {
    mostrarLoading(true);
    ocultarMensagem();

    const response = await fetch(`/api/instituicoes?usuario_id=${usuarioId}`);
    const resultado = await response.json();

    mostrarLoading(false);

    if (!resultado.sucesso) {
      mostrarMensagem(resultado.mensagem, 'erro');
      return;
    }

    renderizarLista(resultado.dados);

  } catch (error) {
    mostrarLoading(false);
    mostrarMensagem('Erro ao carregar instituições: ' + error.message, 'erro');
    console.error('Erro:', error);
  }
}

// Renderizar lista de instituições
function renderizarLista(instituicoes) {
  corpoTabela.innerHTML = '';

  if (!instituicoes || instituicoes.length === 0) {
    tabelaInstituicoes.classList.add('oculto');
    listaVazia.classList.remove('oculto');
    return;
  }

  tabelaInstituicoes.classList.remove('oculto');
  listaVazia.classList.add('oculto');

  instituicoes.forEach(inst => {
    const tr = document.createElement('tr');
    
    const dataFormatada = formatarData(inst.CRIADO_EM);

    tr.innerHTML = `
      <td>${inst.ID}</td>
      <td><strong>${inst.NOME}</strong></td>
      <td>${dataFormatada}</td>
      <td class="acoes">
        <button class="btn btn-primary btn-small" onclick="editarInstituicao(${inst.ID}, '${escapeHtml(inst.NOME)}')">
          ✏️ Editar
        </button>
        <button class="btn btn-danger btn-small" onclick="abrirModalExcluir(${inst.ID}, '${escapeHtml(inst.NOME)}')">
          🗑️ Excluir
        </button>
      </td>
    `;

    corpoTabela.appendChild(tr);
  });
}

// Mostrar formulário para nova instituição
function mostrarFormularioNovo() {
  modoEdicao = false;
  formInstituicao.parentElement.classList.remove('oculto');
  tituloForm.textContent = '➕ Nova Instituição';
  btnSalvar.textContent = '💾 Salvar';
  inputId.value = '';
  inputNome.value = '';
  inputNome.focus();
  
  // Scroll para o formulário
  formInstituicao.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Editar instituição
function editarInstituicao(id, nome) {
  modoEdicao = true;
  formInstituicao.parentElement.classList.remove('oculto');
  tituloForm.textContent = '✏️ Editar Instituição';
  btnSalvar.textContent = '💾 Atualizar';
  inputId.value = id;
  inputNome.value = nome;
  inputNome.focus();
  
  // Scroll para o formulário
  formInstituicao.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Cancelar edição
function cancelarEdicao() {
  formInstituicao.parentElement.classList.add('oculto');
  formInstituicao.reset();
  inputId.value = '';
  modoEdicao = false;
}

// Submeter formulário (criar ou editar)
async function handleSubmit(e) {
  e.preventDefault();
  
  const nome = inputNome.value.trim();
  
  if (!nome) {
    mostrarMensagem('O nome da instituição é obrigatório', 'erro');
    return;
  }

  const id = inputId.value;
  
  if (id) {
    await atualizarInstituicao(id, nome);
  } else {
    await criarInstituicao(nome);
  }
}

// Criar nova instituição
async function criarInstituicao(nome) {
  try {
    btnSalvar.disabled = true;
    btnSalvar.textContent = '⏳ Salvando...';

    const response = await fetch('/api/instituicoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome,
        usuario_id: usuarioId
      })
    });

    const resultado = await response.json();

    btnSalvar.disabled = false;
    btnSalvar.textContent = '💾 Salvar';

    if (!resultado.sucesso) {
      mostrarMensagem(resultado.mensagem, 'erro');
      return;
    }

    mostrarMensagem('✅ Instituição criada com sucesso!', 'sucesso');
    formInstituicao.reset();
    cancelarEdicao();
    await carregarInstituicoes();

  } catch (error) {
    btnSalvar.disabled = false;
    btnSalvar.textContent = '💾 Salvar';
    mostrarMensagem('Erro ao criar instituição: ' + error.message, 'erro');
    console.error('Erro:', error);
  }
}

// Atualizar instituição existente
async function atualizarInstituicao(id, nome) {
  try {
    btnSalvar.disabled = true;
    btnSalvar.textContent = '⏳ Atualizando...';

    const response = await fetch(`/api/instituicoes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome,
        usuario_id: usuarioId
      })
    });

    const resultado = await response.json();

    btnSalvar.disabled = false;
    btnSalvar.textContent = '💾 Atualizar';

    if (!resultado.sucesso) {
      mostrarMensagem(resultado.mensagem, 'erro');
      return;
    }

    mostrarMensagem('✅ Instituição atualizada com sucesso!', 'sucesso');
    formInstituicao.reset();
    cancelarEdicao();
    await carregarInstituicoes();

  } catch (error) {
    btnSalvar.disabled = false;
    btnSalvar.textContent = '💾 Atualizar';
    mostrarMensagem('Erro ao atualizar instituição: ' + error.message, 'erro');
    console.error('Erro:', error);
  }
}

// Abrir modal de confirmação de exclusão
function abrirModalExcluir(id, nome) {
  instituicaoParaExcluir = id;
  mensagemExclusao.textContent = `Tem certeza que deseja excluir "${nome}"?`;
  modalExcluir.classList.remove('oculto');
}

// Fechar modal de exclusão
function fecharModalExcluir() {
  instituicaoParaExcluir = null;
  modalExcluir.classList.add('oculto');
}

// Confirmar exclusão
async function confirmarExclusao() {
  if (!instituicaoParaExcluir) return;

  try {
    btnConfirmarExcluir.disabled = true;
    btnConfirmarExcluir.textContent = '⏳ Excluindo...';

    const response = await fetch(`/api/instituicoes/${instituicaoParaExcluir}?usuario_id=${usuarioId}`, {
      method: 'DELETE'
    });

    const resultado = await response.json();

    btnConfirmarExcluir.disabled = false;
    btnConfirmarExcluir.textContent = '🗑️ Sim, Excluir';

    if (!resultado.sucesso) {
      fecharModalExcluir();
      mostrarMensagem(resultado.mensagem, 'erro');
      return;
    }

    mostrarMensagem('✅ Instituição excluída com sucesso!', 'sucesso');
    fecharModalExcluir();
    await carregarInstituicoes();

  } catch (error) {
    btnConfirmarExcluir.disabled = false;
    btnConfirmarExcluir.textContent = '🗑️ Sim, Excluir';
    fecharModalExcluir();
    mostrarMensagem('Erro ao excluir instituição: ' + error.message, 'erro');
    console.error('Erro:', error);
  }
}

// Utilitários
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
  mensagem.classList.remove('oculto');
  
  // Auto-ocultar após 5 segundos
  setTimeout(() => {
    ocultarMensagem();
  }, 5000);
}

function ocultarMensagem() {
  mensagem.classList.add('oculto');
}

function mostrarLoading(mostrar) {
  if (mostrar) {
    loading.classList.remove('oculto');
    tabelaInstituicoes.classList.add('oculto');
    listaVazia.classList.add('oculto');
  } else {
    loading.classList.add('oculto');
  }
}

function formatarData(dataISO) {
  if (!dataISO) return '-';
  
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function handleSair(e) {
  e.preventDefault();
  if (confirm('Deseja realmente sair?')) {
    localStorage.removeItem('usuarioId');
    window.location.href = '/login';
  }
}

// Tornar funções globais para uso nos botões inline
window.editarInstituicao = editarInstituicao;
window.abrirModalExcluir = abrirModalExcluir;
