function validarEmail(email) {
    // Regex para validação de e-mail
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById('recuperacaoForm').addEventListener('submit', function(e) {
    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem');
    mensagem.style.color = '';
    mensagem.textContent = '';

    if (!validarEmail(email)) {
        mensagem.style.color = 'red';
        mensagem.textContent = 'Por favor, insira um e-mail válido.';
        e.preventDefault();
        return;
    }
    // Permite submit normal para o backend
});
