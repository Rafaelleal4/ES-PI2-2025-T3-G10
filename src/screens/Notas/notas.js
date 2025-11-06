/**
 * NotaDez - Sistema de Gerenciamento de Notas
 * Página: Gerenciar Componentes de Nota
 * Autor: Rafael Leal & Kayo Gabriel
 */

const API_URL = 'http://localhost:5000/api';
let componentes = [];
let componenteEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) { window.location.href = '/login'; return; }

    carregarComponentes();
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

    document.getElementById('btnCancelarExclusao').addEventListener('click', fecharModalConfirmacao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => modal.style.display = 'none');

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });
}

/* ==============================
   CRUD - COMPONENTES DE NOTA
   ============================== */

async function carregarComponentes() {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/componentes-nota?usuario_id=${usuarioId}`);
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
                <td colspan="6">Nenhum componente cadastrado</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = componentes.map(comp => `
        <tr>
            <td>${comp.nome || comp.NOME}</td>
            <td>${comp.sigla || comp.SIGLA}</td>
            <td>${comp.descricao || comp.DESCRICAO || '-'}</td>
            <td>${comp.peso || comp.PESO}</td>
            <td>${comp.id_disciplina || comp.ID_DISCIPLINA}</td>
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="editarComponente(${comp.id || comp.ID})">✏️ Editar</button>
                <button class="btn-icon btn-excluir" onclick="excluirComponente(${comp.id || comp.ID}, '${(comp.nome || comp.NOME).replace(/'/g, "\\'")}')">🗑️ Excluir</button>
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
    componenteEditando = componentes.find(c => (c.id || c.ID) == id);
    if (!componenteEditando) return;

    document.getElementById('modalTitulo').textContent = 'Editar Componente de Nota';
    document.getElementById('componenteId').value = (componenteEditando.id || componenteEditando.ID);
    document.getElementById('inputNome').value = (componenteEditando.nome || componenteEditando.NOME || '');
    document.getElementById('inputSigla').value = (componenteEditando.sigla || componenteEditando.SIGLA || '');
    document.getElementById('inputDescricao').value = (componenteEditando.descricao || componenteEditando.DESCRICAO || '');
    document.getElementById('inputPeso').value = (componenteEditando.peso || componenteEditando.PESO || 0);
    document.getElementById('inputDisciplina').value = (componenteEditando.id_disciplina || componenteEditando.ID_DISCIPLINA || '');
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

    if (!nome || !sigla || isNaN(peso) || isNaN(id_disciplina)) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    if (peso < 0 || peso > 1) {
        alert('O peso deve estar entre 0 e 1 (ex: 0.4)');
        return;
    }

    const dados = { nome, sigla, descricao, peso, id_disciplina };

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

/* ==============================
   FECHAR MODAIS
   ============================== */

function fecharModal() {
    document.getElementById('modalComponente').style.display = 'none';
    componenteEditando = null;
}

function fecharModalConfirmacao() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    componenteEditando = null;
}
