const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const form = document.getElementById('loginForm');
const globalError = document.getElementById('globalError');
const globalCheck = document.getElementById('globalCheck');

form.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Validação básica no cliente
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1 || !password) {
        globalCheck.textContent = '';
        globalError.textContent = 'E-mail ou senha incorretos ou inválidos.';
        return;
    }

    globalError.textContent = '';
    globalCheck.textContent = 'Entrando...';

    try {
        const resp = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await resp.json().catch(() => ({ ok: false, message: 'Erro inesperado.' }));

        if (!resp.ok || !data.ok) {
            globalCheck.textContent = '';
            globalError.textContent = data?.message || 'Falha no login.';
            return;
        }

        // Salvar dados do usuário no localStorage
        if (data.data && data.data.id) {
            localStorage.setItem('usuarioId', data.data.id);
            localStorage.setItem('usuarioNome', data.data.nome);
            localStorage.setItem('usuarioEmail', data.data.email);
        }

        // Sucesso: redireciona para a Home
        globalCheck.textContent = 'Login realizado com sucesso! Redirecionando...';
        setTimeout(() => {
            // Redireciona para o novo Dashboard
            window.location.assign('/dashboard/');
        }, 600);

    } catch (err) {
        globalCheck.textContent = '';
        globalError.textContent = 'Não foi possível conectar ao servidor.';
    }
});