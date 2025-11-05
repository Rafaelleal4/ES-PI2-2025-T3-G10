/**
 * Autor: Rafael Leal
 */

const API_URL = 'http://localhost:5000/api';
let alunos = [];
let disciplinas = [];
let turmas = [];
let alunoEditando = null;
let alunoVinculando = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) { window.location.href = '/login'; return; }
    carregarAlunos();
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

    document.getElementById('btnNovoAluno').addEventListener('click', abrirModalNovo);
    document.getElementById('formAluno').addEventListener('submit', salvarAluno);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);
    
    document.getElementById('formVincular').addEventListener('submit', vincularAluno);
    document.getElementById('btnCancelarVincular').addEventListener('click', fecharModalVincular);
    
    document.getElementById('selectDisciplina').addEventListener('change', carregarTurmasPorDisciplina);
    
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

async function carregarAlunos() {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/alunos?usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            alunos = data.dados;
            renderizarTabela();
        } else {
            alert('Erro ao carregar alunos: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function carregarDisciplinas() {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/disciplinas?usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            disciplinas = data.dados;
        } else {
            console.error('Erro ao carregar disciplinas:', data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function carregarTurmasPorDisciplina() {
    const disciplinaId = document.getElementById('selectDisciplina').value;
    const selectTurma = document.getElementById('selectTurma');
    
    if (!disciplinaId) {
        selectTurma.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
        selectTurma.disabled = true;
        return;
    }

    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/turmas?disciplina_id=${disciplinaId}&usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            turmas = data.dados;
            selectTurma.innerHTML = '<option value="">Selecione uma turma...</option>';
            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = (turma.id || turma.ID);
                option.textContent = (turma.nome || turma.NOME || '-');
                selectTurma.appendChild(option);
            });
            selectTurma.disabled = false;
        } else {
            alert('Erro ao carregar turmas: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function renderizarTabela() {
    const tbody = document.getElementById('listaAlunos');

    if (!alunos || alunos.length === 0) {
        tbody.innerHTML = `
            <tr class="sem-dados">
                <td colspan="3">Nenhum aluno cadastrado</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = alunos.map(aluno => `
        <tr>
            <td>${aluno.identificador || aluno.IDENTIFICADOR || '-'}</td>
            <td>${aluno.nome || aluno.NOME || '-'}</td>
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="editarAluno(${aluno.id || aluno.ID})">
                    ✏️ Editar
                </button>
                <button class="btn-icon btn-vincular" onclick="abrirModalVincularAluno(${aluno.id || aluno.ID}, '${(aluno.nome || aluno.NOME || '').replace(/'/g, "\\'")}')">
                    🔗 Vincular
                </button>
                <button class="btn-icon btn-excluir" onclick="excluirAluno(${aluno.id || aluno.ID}, '${(aluno.nome || aluno.NOME || '').replace(/'/g, "\\'")}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

function abrirModalNovo() {
    alunoEditando = null;
    document.getElementById('modalTitulo').textContent = 'Novo Aluno';
    document.getElementById('alunoId').value = '';
    document.getElementById('inputIdentificador').value = '';
    document.getElementById('inputNome').value = '';
    document.getElementById('modalAluno').style.display = 'block';
}

function editarAluno(id) {
    alunoEditando = alunos.find(a => (a.id || a.ID) == id);
    if (!alunoEditando) return;

    document.getElementById('modalTitulo').textContent = 'Editar Aluno';
    document.getElementById('alunoId').value = (alunoEditando.id || alunoEditando.ID);
    document.getElementById('inputIdentificador').value = (alunoEditando.identificador || alunoEditando.IDENTIFICADOR || '');
    document.getElementById('inputNome').value = (alunoEditando.nome || alunoEditando.NOME || '');
    document.getElementById('modalAluno').style.display = 'block';
}

async function salvarAluno(e) {
    e.preventDefault();

    const id = document.getElementById('alunoId').value;
    const identificador = document.getElementById('inputIdentificador').value.trim();
    const nome = document.getElementById('inputNome').value.trim();

    if (!identificador || !nome) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    const dados = {
        identificador,
        nome,
        usuario_id: Number(localStorage.getItem('usuarioId'))
    };

    try {
        const url = id ? `${API_URL}/alunos/${id}` : `${API_URL}/alunos`;
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
            carregarAlunos();
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function abrirModalVincularAluno(id, nome) {
    alunoVinculando = { id, nome };
    document.getElementById('alunoIdVincular').value = id;
    document.getElementById('inputAlunoVincular').value = nome;
    
    const selectDisciplina = document.getElementById('selectDisciplina');
    selectDisciplina.innerHTML = '<option value="">Selecione uma disciplina...</option>';
    disciplinas.forEach(disciplina => {
        const option = document.createElement('option');
        option.value = disciplina.id;
        option.textContent = `${disciplina.nome} - ${disciplina.curso_nome}`;
        selectDisciplina.appendChild(option);
    });
    
    document.getElementById('selectTurma').innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
    document.getElementById('selectTurma').disabled = true;
    
    document.getElementById('modalVincular').style.display = 'block';
}

async function vincularAluno(e) {
    e.preventDefault();

    const alunoId = document.getElementById('alunoIdVincular').value;
    const turmaId = document.getElementById('selectTurma').value;

    if (!turmaId) {
        alert('Por favor, selecione uma turma');
        return;
    }

    const dados = {
        turma_id: parseInt(turmaId),
        usuario_id: Number(localStorage.getItem('usuarioId'))
    };

    try {
        const response = await fetch(`${API_URL}/alunos/${alunoId}/vincular-turma`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModalVincular();
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function excluirAluno(id, nome) {
    alunoEditando = { id, nome };
    document.getElementById('alunoNomeExcluir').textContent = nome;
    document.getElementById('modalConfirmacao').style.display = 'block';
}

async function confirmarExclusao() {
    if (!alunoEditando) return;

    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/alunos/${alunoEditando.id}?usuario_id=${usuarioId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModalConfirmacao();
            carregarAlunos();
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function fecharModal() {
    document.getElementById('modalAluno').style.display = 'none';
    alunoEditando = null;
}

function fecharModalVincular() {
    document.getElementById('modalVincular').style.display = 'none';
    alunoVinculando = null;
}

function fecharModalConfirmacao() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    alunoEditando = null;
}
