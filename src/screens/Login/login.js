const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const form = document.getElementById('loginForm');
const globalError = document.getElementById('globalError');
const globalCheck = document.getElementById('globalCheck');


form.addEventListener('submit', function(event) {
    event.preventDefault();

    let email = emailInput.value.trim();
    let password = passwordInput.value;

    if (email === "") {
        globalError.textContent = "E-mail ou senha incorretos ou inválidos.";
        return;
    }

    if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
        globalError.textContent = "E-mail ou senha incorretos ou inválidos.";
        return;
    }

    if (password === "") {
        globalError.textContent = "E-mail ou senha incorretos ou inválidos.";
        return;
    }

    globalError.textContent = "";
    globalCheck.textContent = "Login realizado com sucesso!";
    emailInput.value = "";
    passwordInput.value = "";
});