/**
 * Autor: Rafael Leal
 */

const API_URL = 'http://localhost:5000/api';
let instituicoes = [];
let cursos = [];
let disciplinas = [];
let turmas = [];
let instituicaoSelecionada = null;
let cursoSelecionado = null;
let disciplinaSelecionada = null;
let turmaEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) { window.location.href = '/login'; return; }
    carregarInstituicoes();
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

    document.getElementById('selectInstituicao').addEventListener('change', (e) => {
        const instituicaoId = e.target.value;
        const selectCurso = document.getElementById('selectCurso');
        const selectDisc = document.getElementById('selectDisciplina');
        if (instituicaoId) {
            instituicaoSelecionada = instituicoes.find(i => i.id == instituicaoId);
            carregarCursos(instituicaoId);
            selectCurso.disabled = false;
            selectDisc.disabled = true;
            selectDisc.innerHTML = '<option value="">Selecione um curso primeiro...</option>';
            document.getElementById('btnNovaTurma').disabled = true;
            limparTabela();
        } else {
            instituicaoSelecionada = null;
            cursos = [];
            preencherSelectCursos();
            selectCurso.disabled = true;
            selectDisc.disabled = true;
            selectDisc.innerHTML = '<option value="">Selecione um curso primeiro...</option>';
            document.getElementById('btnNovaTurma').disabled = true;
            limparTabela();
        }
    });

    document.getElementById('selectCurso').addEventListener('change', (e) => {
        const cursoId = e.target.value;
        const selectDisc = document.getElementById('selectDisciplina');
        if (cursoId) {
            cursoSelecionado = cursos.find(c => c.id == cursoId);
            carregarDisciplinas(cursoId);
            selectDisc.disabled = false;
        } else {
            cursoSelecionado = null;
            disciplinas = [];
            preencherSelectDisciplinas();
            selectDisc.disabled = true;
            document.getElementById('btnNovaTurma').disabled = true;
            limparTabela();
        }
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

async function carregarInstituicoes() {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/instituicoes?usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            instituicoes = data.dados;
            preencherSelectInstituicoes();
        } else {
            alert('Erro ao carregar instituições: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function preencherSelectInstituicoes() {
    const select = document.getElementById('selectInstituicao');
    select.innerHTML = '<option value="">Selecione uma instituição...</option>';
    instituicoes.forEach(inst => {
        const option = document.createElement('option');
        option.value = (inst.id || inst.ID);
        option.textContent = (inst.nome || inst.NOME || '-');
        select.appendChild(option);
    });
}

async function carregarCursos(instituicaoId) {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/cursos?instituicao_id=${instituicaoId}&usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            cursos = data.dados;
            preencherSelectCursos();
        } else {
            alert('Erro ao carregar cursos: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function preencherSelectCursos() {
    const select = document.getElementById('selectCurso');
    select.innerHTML = '<option value="">Selecione um curso...</option>';
    cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = (curso.id || curso.ID);
        option.textContent = `${(curso.nome || curso.NOME || '-')}`;
        select.appendChild(option);
    });
}

async function carregarDisciplinas(cursoId) {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/disciplinas?curso_id=${cursoId}&usuario_id=${usuarioId}`);
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
        option.value = (disciplina.id || disciplina.ID);
        option.textContent = `${(disciplina.nome || disciplina.NOME || '-')}`;
        select.appendChild(option);
    });
}

async function carregarTurmas(disciplinaId) {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
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
            <td>${turma.nome || turma.NOME || '-'}</td>
            <td>${turma.disciplina_nome || turma.DISCIPLINA_NOME || '-'}</td>
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="editarTurma(${turma.id || turma.ID})">
                    ✏️ Editar
                </button>
                <button class="btn-icon btn-excluir" onclick="excluirTurma(${turma.id || turma.ID}, '${(turma.nome || turma.NOME || '').replace(/'/g, "\\'")}')">
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
            <td colspan="3">Selecione uma instituição, um curso e uma disciplina para visualizar as turmas</td>
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
    turmaEditando = turmas.find(t => (t.id || t.ID) == id);
    if (!turmaEditando) return;

    document.getElementById('modalTitulo').textContent = 'Editar Turma';
    document.getElementById('turmaId').value = (turmaEditando.id || turmaEditando.ID);
    document.getElementById('turmaDisciplinaId').value = (turmaEditando.disciplina_id || turmaEditando.DISCIPLINA_ID);
    document.getElementById('inputNomeTurma').value = (turmaEditando.nome || turmaEditando.NOME || '');
    document.getElementById('inputDisciplinaModal').value = (turmaEditando.disciplina_nome || turmaEditando.DISCIPLINA_NOME || '');
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
        usuario_id: Number(localStorage.getItem('usuarioId'))
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
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/turmas/${turmaEditando.id}?usuario_id=${usuarioId}`, {
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
