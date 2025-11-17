//Edson Luan Rocha Forest Autor
// Constantes
const API_URL = 'http://localhost:5000/api';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está logado
    const usuarioId = getUsuarioId();
    if (!usuarioId) {
        window.location.href = '/login';
        return;
    }
    // Carrega os eventos da página
    configurarEventos();
});

// Pega o ID do usuário do localStorage
function getUsuarioId() {
    return localStorage.getItem('usuarioId');
}

// Configura os event listeners da página (navegação e formulário)
function configurarEventos() {
    // Botão para voltar ao Dashboard
    document.getElementById('btnDashboard').addEventListener('click', () => {
        window.location.href = '/dashboard';
    });

    // Botão de Sair
    document.getElementById('btnSair').addEventListener('click', () => {
        if (confirm('Deseja realmente sair?')) {
            localStorage.removeItem('usuarioId');
            window.location.href = '/login';
        }
    });

    // Evento de envio do formulário de importação
    document.getElementById('formImportar').addEventListener('submit', importarArquivo);
}

// Lida com o envio do formulário de importação
async function importarArquivo(e) {
    e.preventDefault(); // Impede o recarregamento da página

    // Elementos do DOM
    const inputArquivo = document.getElementById('inputArquivoCsv');
    const feedbackDiv = document.getElementById('areaFeedback');
    const btnImportar = document.getElementById('btnImportar');
    const usuarioId = getUsuarioId();

    // Validação: verifica se um arquivo foi selecionado
    if (inputArquivo.files.length === 0) {
        exibirFeedback('<strong>Falha:</strong> Por favor, selecione um arquivo.', 'erro');
        return;
    }

    const arquivo = inputArquivo.files[0];
    
    // Cria o FormData para enviar o arquivo (multipart/form-data)
    const formData = new FormData();
    formData.append('arquivoCsv', arquivo); 

    // Desabilita o botão e mostra "processando"
    btnImportar.disabled = true;
    btnImportar.innerHTML = '<span>⏳</span> Processando...';
    feedbackDiv.style.display = 'none';
    feedbackDiv.innerHTML = '';

    // Bloco try-catch para a requisição fetch
    try {
        // Envia o arquivo para a API
        const response = await fetch(`${API_URL}/alunos/importar?usuario_id=${usuarioId}`, {
            method: 'POST',
            body: formData, 
            // Não definimos Content-Type, o browser faz isso com FormData
        });

        const data = await response.json();

        // Verifica a resposta do servidor
        if (data.sucesso) {
            exibirFeedback(`<strong>Sucesso!</strong> ${data.mensagem || 'Alunos importados.'}`, 'sucesso');
            document.getElementById('formImportar').reset(); // Limpa o campo
        } else {
            exibirFeedback(`<strong>Erro na importação:</strong> ${data.mensagem || 'Ocorreu um problema.'}`, 'erro');
        }

    } catch (error) {
        // Erro de rede ou conexão
        console.error('Erro:', error);
        exibirFeedback('<strong>Erro de Conexão:</strong> Não foi possível conectar ao servidor.', 'erro');
    
    } finally {
        // Reabilita o botão (executa sempre, dando certo ou errado)
        btnImportar.disabled = false;
        btnImportar.innerHTML = '<span>📤</span> Importar Arquivo';
    }
}

// Exibe uma mensagem de feedback na tela (sucesso ou erro)
function exibirFeedback(mensagem, tipo = 'sucesso') {
    const feedbackDiv = document.getElementById('areaFeedback');
    
    // Define a classe CSS baseada no tipo ('feedback-sucesso' ou 'feedback-erro')
    const classeCss = tipo === 'sucesso' ? 'feedback-sucesso' : 'feedback-erro';
    
    feedbackDiv.innerHTML = `<div class="${classeCss}">${mensagem}</div>`;
    feedbackDiv.style.display = 'block';
}
