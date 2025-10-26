// Capturar token da URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const form = document.getElementById('redefinirForm');
const novaSenhaInput = document.getElementById('novaSenha');
const confirmaSenhaInput = document.getElementById('confirmaSenha');
const mensagemDiv = document.getElementById('mensagem');
const submitBtn = form.querySelector('button[type="submit"]');

// Verificar se há token
if (!token) {
    mostrarMensagem('Link inválido. Solicite um novo link de recuperação.', false);
    submitBtn.disabled = true;
}

// Validação de senhas em tempo real
confirmaSenhaInput.addEventListener('input', () => {
    const novaSenha = novaSenhaInput.value;
    const confirmaSenha = confirmaSenhaInput.value;

    if (confirmaSenha && novaSenha !== confirmaSenha) {
        confirmaSenhaInput.setCustomValidity('As senhas não conferem');
    } else {
        confirmaSenhaInput.setCustomValidity('');
    }
});

// Submissão do formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novaSenha = novaSenhaInput.value;
    const confirmaSenha = confirmaSenhaInput.value;

    // Validações
    if (novaSenha.length < 6) {
        mostrarMensagem('A senha deve ter no mínimo 6 caracteres', false);
        return;
    }

    if (novaSenha !== confirmaSenha) {
        mostrarMensagem('As senhas não conferem', false);
        return;
    }

    // Desabilitar botão durante o envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'Redefinindo...';

    try {
        const response = await fetch('/api/auth/redefinir-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token,
                novaSenha: novaSenha
            })
        });

        const data = await response.json();

        if (data.ok) {
            mostrarMensagem('✅ ' + data.message, true);
            
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            mostrarMensagem('❌ ' + data.message, false);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Redefinir Senha';
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao conectar com o servidor. Tente novamente.', false);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Redefinir Senha';
    }
});

function mostrarMensagem(texto, sucesso) {
    mensagemDiv.textContent = texto;
    mensagemDiv.className = sucesso ? 'sucesso' : 'erro';
    mensagemDiv.style.display = 'block';
}
