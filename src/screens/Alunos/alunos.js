/**
 * Autor: Rafael Leal
 */

// URL da API
const API_URL = 'http://localhost:5000/api';

// Variáveis para armazenar dados
let alunos = [];
let disciplinas = [];
let turmas = [];
let alunoEditando = null;
let alunoVinculando = null;

// Executa ao carregar a página
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

    document.getElementById('btnNovoAluno').addEventListener('click', abrirModalNovo);
    document.getElementById('formAluno').addEventListener('submit', salvarAluno);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);
    
    document.getElementById('formVincular').addEventListener('submit', vincularAluno);
    document.getElementById('btnCancelarVincular').addEventListener('click', fecharModalVincular);
    
    document.getElementById('selectDisciplina').addEventListener('change', carregarTurmasPorDisciplina);
    
    // Listener para filtro de instituição - carrega cursos quando selecionada
    document.getElementById('filterInstituicao').addEventListener('change', async (e) => {
        const instituicaoId = e.target.value;
        const filterCurso = document.getElementById('filterCurso');
        const filterDisc = document.getElementById('filterDisciplina');
        const filterTurma = document.getElementById('filterTurma');

        if (!instituicaoId) {
            filterCurso.innerHTML = '<option value="">Selecione uma instituição primeiro...</option>';
            filterCurso.disabled = true;
            filterDisc.innerHTML = '<option value="">Selecione um curso primeiro...</option>';
            filterDisc.disabled = true;
            filterTurma.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
            filterTurma.disabled = true;
            mostrarMensagemSelecione();
            return;
        }

        await carregarCursosFilter(instituicaoId);
    });

    document.getElementById('filterCurso').addEventListener('change', async (e) => {
        const cursoId = e.target.value;
        const filterDisc = document.getElementById('filterDisciplina');
        const filterTurma = document.getElementById('filterTurma');

        if (!cursoId) {
            filterDisc.innerHTML = '<option value="">Selecione um curso primeiro...</option>';
            filterDisc.disabled = true;
            filterTurma.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
            filterTurma.disabled = true;
            mostrarMensagemSelecione();
            return;
        }

        await carregarDisciplinasPorCurso(cursoId);
    });
    // event listeners para filtros
    document.getElementById('filterDisciplina').addEventListener('change', async (e) => {
        const disciplinaId = e.target.value;
        const filterTurma = document.getElementById('filterTurma');
        if (!disciplinaId) {
            filterTurma.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
            filterTurma.disabled = true;
            mostrarMensagemSelecione();
            return;
        }
        await carregarTurmasFilter(disciplinaId);
    });

    document.getElementById('filterTurma').addEventListener('change', async (e) => {
        const turmaId = e.target.value;
        if (!turmaId) {
            carregarAlunos();
            return;
        }
        await carregarAlunosPorTurma(turmaId);
    });

    document.getElementById('btnLimparFiltro').addEventListener('click', () => {
        document.getElementById('filterInstituicao').value = '';
        const filterCurso = document.getElementById('filterCurso');
        const filterDisc = document.getElementById('filterDisciplina');
        const filterTurma = document.getElementById('filterTurma');
        filterCurso.innerHTML = '<option value="">Selecione uma instituição primeiro...</option>';
        filterCurso.disabled = true;
        filterDisc.innerHTML = '<option value="">Selecione um curso primeiro...</option>';
        filterDisc.disabled = true;
        filterTurma.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
        filterTurma.disabled = true;
        mostrarMensagemSelecione();
    });
    
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
        // Não usar carregamento global — alunos só são mostrados quando uma turma for selecionada
        return;
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function carregarDisciplinas() {
    try {
        // Mantido para compatibilidade; prefira carregar por curso com carregarDisciplinasPorCurso
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/disciplinas?usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            disciplinas = data.dados;
            preencherSelectFiltroDisciplinas();
        } else {
            console.error('Erro ao carregar disciplinas:', data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function preencherSelectFiltroDisciplinas() {
    const select = document.getElementById('filterDisciplina');
    select.innerHTML = '<option value="">Todas as disciplinas</option>';
    disciplinas.forEach(d => {
        const option = document.createElement('option');
        option.value = (d.id || d.ID);
        option.textContent = `${(d.nome || d.NOME || '-')}${(d.curso_nome || d.CURSO_NOME) ? ' - ' + (d.curso_nome || d.CURSO_NOME) : ''}`;
        select.appendChild(option);
    });
}

// --- INSTITUIÇÕES / CURSOS / DISCIPLINAS helpers para os filtros ---
// Carrega as instituições para o filtro
async function carregarInstituicoes() {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/instituicoes?usuario_id=${usuarioId}`);
        const data = await response.json();
        console.log('carregarInstituicoes response', data);

        const select = document.getElementById('filterInstituicao');
        select.innerHTML = '<option value="">Selecione uma instituição...</option>';

        if (data.sucesso && Array.isArray(data.dados) && data.dados.length > 0) {
            data.dados.forEach(i => {
                const option = document.createElement('option');
                option.value = (i.id || i.ID);
                option.textContent = (i.nome || i.NOME || '-');
                select.appendChild(option);
            });
        } else {
            console.warn('Nenhuma instituição encontrada ou erro:', data.mensagem);
            select.innerHTML = '<option value="">Nenhuma instituição encontrada</option>';
            select.disabled = true;
            // garantir que outros filtros estejam desabilitados
            document.getElementById('filterCurso').innerHTML = '<option value="">Selecione uma instituição primeiro...</option>';
            document.getElementById('filterCurso').disabled = true;
            document.getElementById('filterDisciplina').innerHTML = '<option value="">Selecione um curso primeiro...</option>';
            document.getElementById('filterDisciplina').disabled = true;
            document.getElementById('filterTurma').innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
            document.getElementById('filterTurma').disabled = true;
            mostrarMensagemSelecione();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Carrega cursos da instituição selecionada
async function carregarCursosFilter(instituicaoId) {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/cursos?instituicao_id=${instituicaoId}&usuario_id=${usuarioId}`);
        const data = await response.json();

        const select = document.getElementById('filterCurso');
        const selectDisc = document.getElementById('filterDisciplina');
        const selectTurma = document.getElementById('filterTurma');

        if (data.sucesso) {
            select.innerHTML = '<option value="">Selecione um curso...</option>';
            data.dados.forEach(c => {
                const option = document.createElement('option');
                option.value = (c.id || c.ID);
                option.textContent = (c.nome || c.NOME || '-');
                select.appendChild(option);
            });
            select.disabled = false;
            selectDisc.innerHTML = '<option value="">Selecione um curso primeiro...</option>';
            selectDisc.disabled = true;
            selectTurma.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
            selectTurma.disabled = true;
            mostrarMensagemSelecione();
        } else {
            alert('Erro ao carregar cursos: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

// Carrega disciplinas do curso selecionado
async function carregarDisciplinasPorCurso(cursoId) {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/disciplinas?curso_id=${cursoId}&usuario_id=${usuarioId}`);
        const data = await response.json();

        const select = document.getElementById('filterDisciplina');
        const selectTurma = document.getElementById('filterTurma');

        if (data.sucesso) {
            select.innerHTML = '<option value="">Selecione uma disciplina...</option>';
            (data.dados || []).forEach(d => {
                const option = document.createElement('option');
                option.value = (d.id || d.ID);
                option.textContent = (d.nome || d.NOME || '-');
                select.appendChild(option);
            });
            select.disabled = false;
            selectTurma.innerHTML = '<option value="">Selecione uma disciplina primeiro...</option>';
            selectTurma.disabled = true;
            mostrarMensagemSelecione();
        } else {
            alert('Erro ao carregar disciplinas: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function mostrarMensagemSelecione() {
    const tbody = document.getElementById('listaAlunos');
    tbody.innerHTML = `
        <tr class="sem-dados">
            <td colspan="3">Selecione Instituição, Curso, Disciplina e Turma para visualizar os alunos</td>
        </tr>
    `;
}

async function carregarTurmasFilter(disciplinaId) {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/turmas?disciplina_id=${disciplinaId}&usuario_id=${usuarioId}`);
        const data = await response.json();

        const selectTurma = document.getElementById('filterTurma');
        if (data.sucesso) {
            const turmasFilter = data.dados || [];
            selectTurma.innerHTML = '<option value="">Selecione uma turma...</option>';
            turmasFilter.forEach(t => {
                const option = document.createElement('option');
                option.value = (t.id || t.ID);
                option.textContent = (t.nome || t.NOME || '-');
                selectTurma.appendChild(option);
            });
            selectTurma.disabled = false;
        } else {
            alert('Erro ao carregar turmas para filtro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

// Busca os alunos de uma turma específica
async function carregarAlunosPorTurma(turmaId) {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/turmas/${turmaId}/alunos?usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            alunos = data.dados;
            renderizarTabela();
        } else {
            alert('Erro ao carregar alunos da turma: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
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

// Atualiza chamadas que recarregam a lista para respeitar filtro ativo
function recarregarAlunosAposOperacao() {
    const turmaFilter = document.getElementById('filterTurma').value;
    if (turmaFilter) {
        carregarAlunosPorTurma(turmaFilter);
    } else {
        mostrarMensagemSelecione();
    }
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
            recarregarAlunosAposOperacao();
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

// Vincula um aluno a uma turma
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
            recarregarAlunosAposOperacao();
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
            recarregarAlunosAposOperacao();
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
