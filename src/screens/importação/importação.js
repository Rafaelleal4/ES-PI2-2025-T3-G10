const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = getUsuarioId();
    if (!usuarioId) {
        window.location.href = '/login';
        return;
    }
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

    document.getElementById('formImportar').addEventListener('submit', importarArquivo);
}

async function importarArquivo(e) {
    e.preventDefault(); 

    const inputArquivo = document.getElementById('inputArquivoCsv');
    const feedbackDiv = document.getElementById('areaFeedback');
    const btnImportar = document.getElementById('btnImportar');
    const usuarioId = getUsuarioId();

    if (inputArquivo.files.length === 0) {
        exibirFeedback('<strong>Falha:</strong> Por favor, selecione um arquivo.', 'erro');
        return;
    }

    const arquivo = inputArquivo.files[0];
    const formData = new FormData();
    formData.append('arquivoCsv', arquivo); 

    btnImportar.disabled = true;
    btnImportar.innerHTML = '<span>⏳</span> Processando...';
    feedbackDiv.style.display = 'none';
    feedbackDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/alunos/importar?usuario_id=${usuarioId}`, {
            method: 'POST',
            body: formData, 
        });

        const data = await response.json();

        if (data.sucesso) {
            exibirFeedback(`<strong>Sucesso!</strong> ${data.mensagem || 'Alunos importados.'}`, 'sucesso');
            document.getElementById('formImportar').reset(); 
        } else {
            exibirFeedback(`<strong>Erro na importação:</strong> ${data.mensagem || 'Ocorreu um problema.'}`, 'erro');
        }

    } catch (error) {
        console.error('Erro:', error);
        exibirFeedback('<strong>Erro de Conexão:</strong> Não foi possível conectar ao servidor.', 'erro');
    } finally {
        btnImportar.disabled = false;
        btnImportar.innerHTML = '<span>📤</span> Importar Arquivo';
    }
}

function exibirFeedback(mensagem, tipo = 'sucesso') {
    const feedbackDiv = document.getElementById('areaFeedback');
    
    const classeCss = tipo === 'sucesso' ? 'feedback-sucesso' : 'feedback-erro';
    
    feedbackDiv.innerHTML = `<div class="${classeCss}">${mensagem}</div>`;
    feedbackDiv.style.display = 'block';
}