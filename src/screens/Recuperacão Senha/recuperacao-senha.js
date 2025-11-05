/**
 * Lógica da Tela de Recuperação de Senha
 * Autor: Rafael Leal
 */

function validarEmail(email) {
    // Regex para validação de e-mail
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById('recuperacaoForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem');
    const submitBtn = this.querySelector('button[type="submit"]');
    
    mensagem.style.color = '';
    mensagem.textContent = '';

    if (!validarEmail(email)) {
        mensagem.style.color = 'red';
        mensagem.textContent = 'Por favor, insira um e-mail válido.';
        return;
    }

    // Desabilitar botão durante envio
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    mensagem.style.color = '#666';
    mensagem.textContent = 'Processando solicitação...';

    try {
        const response = await fetch('/api/auth/recuperacao-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.ok) {
            mensagem.style.color = '#22c55e';
            mensagem.textContent = '✅ ' + data.message;
            document.getElementById('email').value = '';
        } else {
            mensagem.style.color = '#ef4444';
            mensagem.textContent = '❌ ' + data.message;
        }
    } catch (error) {
        console.error('Erro:', error);
        mensagem.style.color = '#ef4444';
        mensagem.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar';
    }
});
