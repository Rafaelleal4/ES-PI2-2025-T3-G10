const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const form = document.getElementById('loginForm');
const globalError = document.getElementById('globalError');
const globalCheck = document.getElementById('globalCheck');

form.addEventListener('submit', function(event) {
    // Validação básica no cliente
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1 || !password) {
        globalCheck.textContent = '';
        globalError.textContent = 'E-mail ou senha incorretos ou inválidos.';
        event.preventDefault();
        return;
    }
    globalError.textContent = '';
    globalCheck.textContent = '';
    // Permite submit normal para o backend
});