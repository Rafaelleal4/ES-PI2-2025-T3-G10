/**
 * Autor: Kayo Gabriel
 * Página: Gerenciar Componentes de Nota
 */

const API_URL = 'http://localhost:5000/api';

let componentes = [];
let disciplinas = [];
let componenteEditando = null;

document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuarioId');
  if (!usuarioId) {
    window.location.href = '/login';
    return;
  }

  carregarDisciplinas();
  configurarEventos();
});

function configurarEventos() {
  document.getElementById('btnDashboard').addEventListener('click', () => {
    window.location.href = '/';
  });

  document.getElementById('btnSair').addEventListener('click', () => {
    if (confirm('Deseja realmente sair?')) {
      localStorage.removeItem('usuarioId');
      window.location.href = '/login';
    }
  });

  document.getElementById('btnNovoComponente').addEventListener('click', abrirModalNovo);
  document.getElementById('formComponente').addEventListener('submit', salvarComponente);
  document.getElementById('btnCancelar').addEventListener('click', fecharModal);
  document.getElementById('selectDisciplinaFiltro').addEventListener('change', carregarComponentes);
  document.getElementById('btnCancelarExclusao').addEventListener('click', fecharModalConfirmacao);
  document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);

  document.querySelectorAll('.modal').forEach(modal => {
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => (modal.style.display = 'none'));

    modal.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });
}

async function carregarDisciplinas() {
  try {
    const usuarioId = localStorage.getItem('usuarioId');

    const response = await fetch(`${API_URL}/disciplinas?usuario_id=${usuarioId}`);
    const data = await response.json();

    if (!data.sucesso) {
      console.error("Erro ao carregar disciplinas:", data.mensagem);
      return;
    }

    disciplinas = data.dados;

    const selectFiltro = document.getElementById("selectDisciplinaFiltro");
    const selectModal = document.getElementById("inputDisciplina");

    selectFiltro.innerHTML = `<option value="">Selecione...</option>`;
    selectModal.innerHTML = `<option value="">Selecione...</option>`;

    disciplinas.forEach(d => {
      const option1 = document.createElement("option");
      option1.value = d.id;
      option1.textContent = `${d.codigo || d.CODIGO} - ${d.nome || d.NOME}`;
      selectFiltro.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = d.id;
      option2.textContent = `${d.codigo || d.CODIGO} - ${d.nome || d.NOME}`;
      selectModal.appendChild(option2);
    });

  } catch (error) {
    console.error('Erro ao carregar disciplinas:', error);
  }
}

async function carregarComponentes() {
  try {
    const disciplinaId = document.getElementById('selectDisciplinaFiltro').value;
    const usuarioId = localStorage.getItem('usuarioId');

    if (!disciplinaId) {
      document.getElementById('listaComponentes').innerHTML = `
        <tr class="sem-dados">
          <td colspan="6">Selecione uma disciplina para exibir os componentes</td>
        </tr>
      `;
      return;
    }

    const response = await fetch(`${API_URL}/componentes-nota?id_disciplina=${disciplinaId}&usuario_id=${usuarioId}`);
    const data = await response.json();

    if (data.sucesso) {
      componentes = data.dados;
      renderizarTabela();
    } else {
      alert('Erro ao carregar componentes: ' + data.mensagem);
    }

  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor');
  }
}

function renderizarTabela() {
  const tbody = document.getElementById('listaComponentes');

  if (!componentes || componentes.length === 0) {
    tbody.innerHTML = `
      <tr class="sem-dados">
        <td colspan="6">Nenhum componente cadastrado para esta disciplina</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = componentes.map(c => `
    <tr>
      <td>${c.nome || '-'}</td>
      <td>${c.sigla || '-'}</td>
      <td>${c.descricao || '-'}</td>
      <td>${c.peso || '-'}</td>
      <td>${c.id_disciplina || '-'}</td>
      <td class="acoes-tabela">
        <button class="btn-icon btn-editar" onclick="editarComponente(${c.id})">✏️ Editar</button>
        <button class="btn-icon btn-excluir" onclick="excluirComponente(${c.id}, '${(c.nome || '').replace(/'/g, "\\'")}')">🗑️ Excluir</button>
      </td>
    </tr>
  `).join('');
}

function abrirModalNovo() {
  componenteEditando = null;

  document.getElementById('modalTitulo').textContent = 'Novo Componente de Nota';
  document.getElementById('componenteId').value = '';
  document.getElementById('inputNome').value = '';
  document.getElementById('inputSigla').value = '';
  document.getElementById('inputDescricao').value = '';
  document.getElementById('inputPeso').value = '';
  document.getElementById('inputDisciplina').value = '';

  document.getElementById('modalComponente').style.display = 'block';
}

function editarComponente(id) {
  componenteEditando = componentes.find(c => c.id == id);
  if (!componenteEditando) return;

  document.getElementById('modalTitulo').textContent = 'Editar Componente de Nota';
  document.getElementById('componenteId').value = componenteEditando.id;
  document.getElementById('inputNome').value = componenteEditando.nome || '';
  document.getElementById('inputSigla').value = componenteEditando.sigla || '';
  document.getElementById('inputDescricao').value = componenteEditando.descricao || '';
  document.getElementById('inputPeso').value = componenteEditando.peso || '';
  document.getElementById('inputDisciplina').value = componenteEditando.id_disciplina || '';

  document.getElementById('modalComponente').style.display = 'block';
}

async function salvarComponente(e) {
  e.preventDefault();

  const id = document.getElementById('componenteId').value;
  const nome = document.getElementById('inputNome').value.trim();
  const sigla = document.getElementById('inputSigla').value.trim();
  const descricao = document.getElementById('inputDescricao').value.trim();
  const peso = parseFloat(document.getElementById('inputPeso').value);
  const id_disciplina = parseInt(document.getElementById('inputDisciplina').value);
  const usuario_id = Number(localStorage.getItem('usuarioId'));

  if (!nome || !sigla || !id_disciplina) {
    alert('Preencha todos os campos obrigatórios');
    return;
  }

  if (peso < 0 || peso > 1 || isNaN(peso)) {
    alert('O peso deve estar entre 0 e 1');
    return;
  }

  const dados = { nome, sigla, descricao, peso, id_disciplina, usuario_id };

  try {
    const url = id ? `${API_URL}/componentes-nota/${id}` : `${API_URL}/componentes-nota`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const data = await response.json();

    if (data.sucesso) {
      alert(data.mensagem);
      fecharModal();
      carregarComponentes();
    } else {
      alert('Erro: ' + data.mensagem);
    }

  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor');
  }
}

function excluirComponente(id, nome) {
  componenteEditando = { id, nome };
  document.getElementById('componenteNomeExcluir').textContent = nome;
  document.getElementById('modalConfirmacao').style.display = 'block';
}

async function confirmarExclusao() {
  if (!componenteEditando) return;

  try {
    const usuarioId = localStorage.getItem('usuarioId');
    const response = await fetch(`${API_URL}/componentes-nota/${componenteEditando.id}?usuario_id=${usuarioId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.sucesso) {
      alert(data.mensagem);
      fecharModalConfirmacao();
      carregarComponentes();
    } else {
      alert('Erro: ' + data.mensagem);
    }

  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor');
  }
}

function fecharModal() {
  document.getElementById('modalComponente').style.display = 'none';
  componenteEditando = null;
}

function fecharModalConfirmacao() {
  document.getElementById('modalConfirmacao').style.display = 'none';
  componenteEditando = null;
}
