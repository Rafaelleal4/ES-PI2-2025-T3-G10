function validarEmail(email) {
    // Regex simples para validação de e-mail
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById('recuperacaoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const mensagem = document.getElementById('mensagem');
    mensagem.style.color = '';

    if (!validarEmail(email)) {
        mensagem.style.color = 'red';
        mensagem.innerHTML = 'Por favor, insira um e-mail válido.';
        return;
    }

    // Aqui você pode fazer uma requisição para o backend
    // fetch('/api/recuperar-senha', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } })
    //   .then(...)
    mensagem.style.color = 'green';
    mensagem.innerHTML = 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.';
});
