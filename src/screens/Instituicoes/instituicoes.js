/**
 * Gerenciar Instituições - Sistema de Notas
 * Autor: Rafael Leal
 */

const API_URL = 'http://localhost:5000/api';
let instituicoes = [];
let instituicaoEditando = null;
let instituicaoExcluindo = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = getUsuarioId();
    if (!usuarioId) {
        window.location.href = '/login';
        return;
    }
    carregarInstituicoes();
    configurarEventos();
});

function getUsuarioId() {
    return localStorage.getItem('usuarioId');
}

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

    document.getElementById('btnNovaInstituicao').addEventListener('click', abrirModalNovo);
    document.getElementById('formInstituicao').addEventListener('submit', salvarInstituicao);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);
    document.getElementById('btnCancelarExclusao').addEventListener('click', fecharModalConfirmacao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

async function carregarInstituicoes() {
    try {
        const usuarioId = getUsuarioId();
        const response = await fetch(`${API_URL}/instituicoes?usuario_id=${usuarioId}`);
        const data = await response.json();

        if (data.sucesso) {
            instituicoes = data.dados;
            renderizarTabela();
        } else {
            alert('Erro ao carregar instituições: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function renderizarTabela() {
    const tbody = document.getElementById('listaInstituicoes');

    if (!instituicoes || instituicoes.length === 0) {
        tbody.innerHTML = `
            <tr class="sem-dados">
                <td colspan="2">Nenhuma instituição cadastrada</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = instituicoes.map(instituicao => `
        <tr>
            <td>${instituicao.nome || instituicao.NOME || ''}</td>
            <td class="acoes-tabela">
                <button class="btn-icon btn-editar" onclick="editarInstituicao(${instituicao.id || instituicao.ID})">
                    ✏️ Editar
                </button>
                <button class="btn-icon btn-excluir" onclick="excluirInstituicao(${instituicao.id || instituicao.ID}, '${(instituicao.nome || instituicao.NOME || '').replace(/'/g, "\\'")}')">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

function abrirModalNovo() {
    instituicaoEditando = null;
    document.getElementById('modalTitulo').textContent = 'Nova Instituição';
    document.getElementById('instituicaoId').value = '';
    document.getElementById('inputNomeInstituicao').value = '';
    document.getElementById('modalInstituicao').style.display = 'block';
}

function editarInstituicao(id) {
    instituicaoEditando = instituicoes.find(i => (i.id || i.ID) == id);
    
    if (!instituicaoEditando) {
        alert('Instituição não encontrada');
        return;
    }

    document.getElementById('modalTitulo').textContent = 'Editar Instituição';
    document.getElementById('instituicaoId').value = instituicaoEditando.id || instituicaoEditando.ID;
    document.getElementById('inputNomeInstituicao').value = instituicaoEditando.nome || instituicaoEditando.NOME;
    document.getElementById('modalInstituicao').style.display = 'block';
}

async function salvarInstituicao(e) {
    e.preventDefault();

    const usuarioId = getUsuarioId();
    const instituicaoId = document.getElementById('instituicaoId').value;
    const nome = document.getElementById('inputNomeInstituicao').value.trim();

    if (!nome) {
        alert('Por favor, preencha o nome da instituição');
        return;
    }

    const dados = {
        nome,
        usuario_id: Number(usuarioId)
    };

    try {
        let response;
        if (instituicaoId) {
            response = await fetch(`${API_URL}/instituicoes/${instituicaoId}?usuario_id=${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            response = await fetch(`${API_URL}/instituicoes?usuario_id=${usuarioId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModal();
            carregarInstituicoes();
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar instituição');
    }
}

function excluirInstituicao(id, nome) {
    instituicaoExcluindo = { id, nome };
    document.getElementById('instituicaoNomeExcluir').textContent = nome;
    document.getElementById('modalConfirmacao').style.display = 'block';
}

async function confirmarExclusao() {
    if (!instituicaoExcluindo) return;

    try {
        const usuarioId = getUsuarioId();
        const response = await fetch(`${API_URL}/instituicoes/${instituicaoExcluindo.id}?usuario_id=${usuarioId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.sucesso) {
            alert(data.mensagem);
            fecharModalConfirmacao();
            carregarInstituicoes();
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir instituição');
    }
}

function fecharModal() {
    document.getElementById('modalInstituicao').style.display = 'none';
    document.getElementById('formInstituicao').reset();
    instituicaoEditando = null;
}

function fecharModalConfirmacao() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    instituicaoExcluindo = null;
}

