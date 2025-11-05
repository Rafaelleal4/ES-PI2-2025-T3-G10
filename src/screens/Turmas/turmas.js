/**
 * Autor: Rafael Leal
 */

const API_URL = 'http://localhost:5000/api';
let disciplinas = [];
let turmas = [];
let disciplinaSelecionada = null;
let turmaEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarDisciplinas();
    configurarEventos();
});

function configurarEventos() {
    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = '../Disciplinas/disciplinas.html';
    });

    document.getElementById('selectDisciplina').addEventListener('change', (e) => {
        const disciplinaId = e.target.value;
        if (disciplinaId) {
            disciplinaSelecionada = disciplinas.find(d => d.id == disciplinaId);
            document.getElementById('btnNovaTurma').disabled = false;
            carregarTurmas(disciplinaId);
        } else {
            disciplinaSelecionada = null;
            document.getElementById('btnNovaTurma').disabled = true;
            limparTabela();
        }
    });

    document.getElementById('btnNovaTurma').addEventListener('click', abrirModalNova);
    document.getElementById('formTurma').addEventListener('submit', salvarTurma);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);
    document.getElementById('btnCancelarExclusao').addEventListener('click', fecharModalConfirmacao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

async function carregarDisciplinas() {
    try {
        const usuarioId = 1;
        const response = await fetch(`${API_URL}/disciplinas?usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            disciplinas = data.dados;
            preencherSelectDisciplinas();
        } else {
            alert('Erro ao carregar disciplinas: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function preencherSelectDisciplinas() {
    const select = document.getElementById('selectDisciplina');
    select.innerHTML = '<option value="">Selecione uma disciplina...</option>';

    disciplinas.forEach(disciplina => {
        const option = document.createElement('option');
        option.value = disciplina.id;
        option.textContent = `${disciplina.nome} - ${disciplina.curso_nome}`;
        select.appendChild(option);
    });
}

async function carregarTurmas(disciplinaId) {
    try {
        const usuarioId = 1;
        const response = await fetch(`${API_URL}/turmas?disciplina_id=${disciplinaId}&usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            turmas = data.dados;
            renderizarTabela();
        } else {
            alert('Erro ao carregar turmas: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function renderizarTabela() {
    const tbody = document.getElementById('listaTurmas');

    if (!turmas || turmas.length === 0) {
        tbody.innerHTML = `
            <tr class="sem-dados">
                <td colspan="3">Nenhuma turma encontrada para esta disciplina</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = turmas.map(turma => `
        <tr>
            <td>${turma.nome}</td>
            <td>${turma.disciplina_nome}</td>
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="editarTurma(${turma.id})">
                    ✏️ Editar
                </button>
                <button class="btn-icon btn-excluir" onclick="excluirTurma(${turma.id}, '${turma.nome}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

function limparTabela() {
    const tbody = document.getElementById('listaTurmas');
    tbody.innerHTML = `
        <tr class="sem-dados">
            <td colspan="3">Selecione uma disciplina para visualizar as turmas</td>
        </tr>
    `;
}

function abrirModalNova() {
    if (!disciplinaSelecionada) {
        alert('Selecione uma disciplina primeiro');
        return;
    }

    turmaEditando = null;
    document.getElementById('modalTitulo').textContent = 'Nova Turma';
    document.getElementById('turmaId').value = '';
    document.getElementById('turmaDisciplinaId').value = disciplinaSelecionada.id;
    document.getElementById('inputNomeTurma').value = '';
    document.getElementById('inputDisciplinaModal').value = disciplinaSelecionada.nome;
    document.getElementById('modalTurma').style.display = 'block';
}

function editarTurma(id) {
    turmaEditando = turmas.find(t => t.id === id);
    if (!turmaEditando) return;

    document.getElementById('modalTitulo').textContent = 'Editar Turma';
    document.getElementById('turmaId').value = turmaEditando.id;
    document.getElementById('turmaDisciplinaId').value = turmaEditando.disciplina_id;
    document.getElementById('inputNomeTurma').value = turmaEditando.nome;
    document.getElementById('inputDisciplinaModal').value = turmaEditando.disciplina_nome;
    document.getElementById('modalTurma').style.display = 'block';
}

async function salvarTurma(e) {
    e.preventDefault();

    const id = document.getElementById('turmaId').value;
    const nome = document.getElementById('inputNomeTurma').value.trim();
    const disciplinaId = document.getElementById('turmaDisciplinaId').value;

    if (!nome) {
        alert('Por favor, preencha o nome da turma');
        return;
    }

    const dados = {
        nome,
        disciplina_id: parseInt(disciplinaId),
        usuario_id: 1
    };

    try {
        const url = id ? `${API_URL}/turmas/${id}` : `${API_URL}/turmas`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModal();
            carregarTurmas(disciplinaId);
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function excluirTurma(id, nome) {
    turmaEditando = { id, nome };
    document.getElementById('turmaNomeExcluir').textContent = nome;
    document.getElementById('modalConfirmacao').style.display = 'block';
}

async function confirmarExclusao() {
    if (!turmaEditando) return;

    try {
        const response = await fetch(`${API_URL}/turmas/${turmaEditando.id}?usuario_id=1`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModalConfirmacao();
            if (disciplinaSelecionada) {
                carregarTurmas(disciplinaSelecionada.id);
            }
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function fecharModal() {
    document.getElementById('modalTurma').style.display = 'none';
    turmaEditando = null;
}

function fecharModalConfirmacao() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    turmaEditando = null;
}
