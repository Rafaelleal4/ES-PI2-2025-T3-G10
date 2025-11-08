/**
 * Autor: Rafael Leal
 */

const API_URL = 'http://localhost:5000/api';
let instituicoes = [];
let cursos = [];
let disciplinas = [];
let instituicaoSelecionada = null;
let cursoSelecionado = null;
let disciplinaEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        window.location.href = '/login';
        return;
    }
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
        if (instituicaoId) {
            instituicaoSelecionada = instituicoes.find(i => i.id == instituicaoId);
            carregarCursos(instituicaoId);
            selectCurso.disabled = false;
        } else {
            instituicaoSelecionada = null;
            cursos = [];
            preencherSelectCursos();
            selectCurso.disabled = true;
            document.getElementById('btnNovaDisciplina').disabled = true;
            limparTabela();
        }
    });

    document.getElementById('selectCurso').addEventListener('change', (e) => {
        const cursoId = e.target.value;
        if (cursoId) {
            cursoSelecionado = cursos.find(c => c.id == cursoId);
            document.getElementById('btnNovaDisciplina').disabled = false;
            carregarDisciplinas(cursoId);
        } else {
            cursoSelecionado = null;
            document.getElementById('btnNovaDisciplina').disabled = true;
            limparTabela();
        }
    });

    document.getElementById('btnNovaDisciplina').addEventListener('click', abrirModalNova);
    document.getElementById('formDisciplina').addEventListener('submit', salvarDisciplina);
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
            renderizarTabela();
        } else {
            alert('Erro ao carregar disciplinas: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function renderizarTabela() {
    const tbody = document.getElementById('listaDisciplinas');

    if (!disciplinas || disciplinas.length === 0) {
        tbody.innerHTML = `
            <tr class="sem-dados">
                <td colspan="6">Nenhuma disciplina encontrada para este curso</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = disciplinas.map(disciplina => `
        <tr>
            <td>${(disciplina.codigo || disciplina.CODIGO) ?? '-'}</td>
            <td>${disciplina.nome || disciplina.NOME || '-'}</td>
            <td>${disciplina.sigla || disciplina.SIGLA || '-'}</td>
            <td>${(disciplina.periodo || disciplina.PERIODO) ?? '-'}</td>
            <td>${disciplina.curso_nome || disciplina.CURSO_NOME || '-'}</td>
            <td>${disciplina.instituicao_nome || disciplina.INSTITUICAO_NOME || '-'}</td>
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="editarDisciplina(${disciplina.id || disciplina.ID})">
                    ✏️ Editar
                </button>
                <button class="btn-icon btn-excluir" onclick="excluirDisciplina(${disciplina.id || disciplina.ID}, '${(disciplina.nome || disciplina.NOME || '').replace(/'/g, "\\'")}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

function limparTabela() {
    const tbody = document.getElementById('listaDisciplinas');
    tbody.innerHTML = `
        <tr class="sem-dados">
            <td colspan="7">Selecione uma instituição e um curso para visualizar as disciplinas</td>
        </tr>
    `;
}

function abrirModalNova() {
    if (!cursoSelecionado) {
        alert('Selecione um curso primeiro');
        return;
    }

    disciplinaEditando = null;
    document.getElementById('modalTitulo').textContent = 'Nova Disciplina';
    document.getElementById('disciplinaId').value = '';
    document.getElementById('disciplinaCursoId').value = cursoSelecionado.id;
    document.getElementById('inputCodigo').value = '';
    document.getElementById('inputNome').value = '';
    document.getElementById('inputSigla').value = '';
    document.getElementById('inputPeriodo').value = '';
    document.getElementById('inputCursoModal').value = cursoSelecionado.nome;
    document.getElementById('modalDisciplina').style.display = 'block';
}

function editarDisciplina(id) {
    disciplinaEditando = disciplinas.find(d => (d.id || d.ID) == id);
    if (!disciplinaEditando) return;

    document.getElementById('modalTitulo').textContent = 'Editar Disciplina';
    document.getElementById('disciplinaId').value = (disciplinaEditando.id || disciplinaEditando.ID);
    document.getElementById('disciplinaCursoId').value = (disciplinaEditando.curso_id || disciplinaEditando.CURSO_ID);
    document.getElementById('inputCodigo').value = (disciplinaEditando.codigo || disciplinaEditando.CODIGO || '');
    document.getElementById('inputNome').value = (disciplinaEditando.nome || disciplinaEditando.NOME || '');
    document.getElementById('inputSigla').value = (disciplinaEditando.sigla || disciplinaEditando.SIGLA || '');
    document.getElementById('inputPeriodo').value = (disciplinaEditando.periodo || disciplinaEditando.PERIODO || '');
    document.getElementById('inputCursoModal').value = (disciplinaEditando.curso_nome || disciplinaEditando.CURSO_NOME || '');
    document.getElementById('modalDisciplina').style.display = 'block';
}

async function salvarDisciplina(e) {
    e.preventDefault();

    const id = document.getElementById('disciplinaId').value;
    const codigo = document.getElementById('inputCodigo').value.trim();
    const nome = document.getElementById('inputNome').value.trim();
    const sigla = document.getElementById('inputSigla').value.trim();
    const periodo = document.getElementById('inputPeriodo').value;
    const cursoId = document.getElementById('disciplinaCursoId').value;

    if (!nome || !sigla) {
        alert('Por favor, preencha os campos obrigatórios (Nome e Sigla)');
        return;
    }

    const dados = {
        codigo: codigo || null,
        nome,
        sigla,
        periodo: periodo ? parseInt(periodo) : null,
        curso_id: parseInt(cursoId),
        usuario_id: Number(localStorage.getItem('usuarioId'))
    };

    try {
        const url = id ? `${API_URL}/disciplinas/${id}` : `${API_URL}/disciplinas`;
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
            carregarDisciplinas(cursoId);
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function excluirDisciplina(id, nome) {
    disciplinaEditando = { id, nome };
    document.getElementById('disciplinaNomeExcluir').textContent = nome;
    document.getElementById('modalConfirmacao').style.display = 'block';
}

async function confirmarExclusao() {
    if (!disciplinaEditando) return;

    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/disciplinas/${disciplinaEditando.id}?usuario_id=${usuarioId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModalConfirmacao();
            if (cursoSelecionado) {
                carregarDisciplinas(cursoSelecionado.id);
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
    document.getElementById('modalDisciplina').style.display = 'none';
    disciplinaEditando = null;
}

function fecharModalConfirmacao() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    disciplinaEditando = null;
}
