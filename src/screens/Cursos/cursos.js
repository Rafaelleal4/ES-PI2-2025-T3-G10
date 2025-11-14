/**
 * Autor: Rafael Leal
 */

// URL base da API
const API_URL = 'http://localhost:5000/api';

// Variáveis para guardar dados e controlar estado
let instituicoes = [];
let cursos = [];
let instituicaoSelecionada = null;
let cursoEditando = null;

document.addEventListener('DOMContentLoaded', () => {
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
        if (instituicaoId) {
            instituicaoSelecionada = instituicoes.find(i => (i.id || i.ID) == instituicaoId);
            document.getElementById('btnNovoCurso').disabled = false;
            carregarCursos(instituicaoId);
        } else {
            instituicaoSelecionada = null;
            document.getElementById('btnNovoCurso').disabled = true;
            limparTabela();
        }
    });

    document.getElementById('btnNovoCurso').addEventListener('click', abrirModalNovo);
    document.getElementById('formCurso').addEventListener('submit', salvarCurso);
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

// Carrega lista de instituições do usuário
async function carregarInstituicoes() {
    try {
        const usuarioId = 1;
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

// Preenche o select com as instituições disponíveis
function preencherSelectInstituicoes() {
    const select = document.getElementById('selectInstituicao');
    select.innerHTML = '<option value="">Selecione uma instituição...</option>';

    instituicoes.forEach(instituicao => {
        const option = document.createElement('option');
        option.value = instituicao.id || instituicao.ID;
        option.textContent = instituicao.nome || instituicao.NOME;
        select.appendChild(option);
    });
}

// Busca os cursos de uma instituição específica
async function carregarCursos(instituicaoId) {
    try {
        if (!instituicaoId) {
            console.error('instituicaoId não fornecido');
            limparTabela();
            return;
        }

        const usuarioId = 1;
        const response = await fetch(`${API_URL}/cursos?instituicao_id=${instituicaoId}&usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            cursos = data.dados;
            renderizarTabela();
        } else {
            alert('Erro ao carregar cursos: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function renderizarTabela() {
    const tbody = document.getElementById('listaCursos');

    if (!cursos || cursos.length === 0) {
        tbody.innerHTML = `
            <tr class="sem-dados">
                <td colspan="3">Nenhum curso encontrado para esta instituição</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = cursos.map(curso => `
        <tr>
            <td>${curso.nome || ''}</td>
            <td>${curso.instituicao_nome || curso.INSTITUICAO_NOME || '-'}</td>
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="editarCurso(${curso.id || curso.ID})">
                    ✏️ Editar
                </button>
                <button class="btn-icon btn-excluir" onclick="excluirCurso(${curso.id || curso.ID}, '${(curso.nome || curso.NOME || '').replace(/'/g, "\\'")}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

function limparTabela() {
    const tbody = document.getElementById('listaCursos');
    tbody.innerHTML = `
        <tr class="sem-dados">
            <td colspan="3">Selecione uma instituição para visualizar os cursos</td>
        </tr>
    `;
}

function abrirModalNovo() {
    if (!instituicaoSelecionada) {
        alert('Selecione uma instituição primeiro');
        return;
    }

    cursoEditando = null;
    document.getElementById('modalTitulo').textContent = 'Novo Curso';
    document.getElementById('cursoId').value = '';
    document.getElementById('cursoInstituicaoId').value = instituicaoSelecionada.id || instituicaoSelecionada.ID;
    document.getElementById('inputNomeCurso').value = '';
    document.getElementById('inputInstituicaoModal').value = instituicaoSelecionada.nome || instituicaoSelecionada.NOME;
    document.getElementById('modalCurso').style.display = 'block';
}

function editarCurso(id) {
    cursoEditando = cursos.find(c => (c.id || c.ID) === id);
    if (!cursoEditando) return;

    document.getElementById('modalTitulo').textContent = 'Editar Curso';
    document.getElementById('cursoId').value = cursoEditando.id || cursoEditando.ID;
    document.getElementById('cursoInstituicaoId').value = cursoEditando.instituicao_id || cursoEditando.INSTITUICAO_ID;
    document.getElementById('inputNomeCurso').value = cursoEditando.nome || cursoEditando.NOME;
    document.getElementById('inputInstituicaoModal').value = cursoEditando.instituicao_nome || cursoEditando.INSTITUICAO_NOME;
    document.getElementById('modalCurso').style.display = 'block';
}

async function salvarCurso(e) {
    e.preventDefault();

    const id = document.getElementById('cursoId').value;
    const nome = document.getElementById('inputNomeCurso').value.trim();
    const instituicaoId = document.getElementById('cursoInstituicaoId').value;

    if (!nome) {
        alert('Por favor, preencha o nome do curso');
        return;
    }

    const dados = {
        nome,
        instituicao_id: parseInt(instituicaoId),
        usuario_id: 1
    };

    try {
        const url = id ? `${API_URL}/cursos/${id}` : `${API_URL}/cursos`;
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
            if (instituicaoSelecionada && (instituicaoSelecionada.id || instituicaoSelecionada.ID)) {
                carregarCursos(instituicaoSelecionada.id || instituicaoSelecionada.ID);
            }
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function excluirCurso(id, nome) {
    cursoEditando = { id, nome };
    document.getElementById('cursoNomeExcluir').textContent = nome;
    document.getElementById('modalConfirmacao').style.display = 'block';
}

async function confirmarExclusao() {
    if (!cursoEditando) return;

    try {
        const response = await fetch(`${API_URL}/cursos/${cursoEditando.id}?usuario_id=1`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModalConfirmacao();
            if (instituicaoSelecionada) {
                carregarCursos(instituicaoSelecionada.id || instituicaoSelecionada.ID);
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
    document.getElementById('modalCurso').style.display = 'none';
    cursoEditando = null;
}

function fecharModalConfirmacao() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    cursoEditando = null;
}
