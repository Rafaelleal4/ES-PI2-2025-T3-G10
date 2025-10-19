
//*codigo para formatar o campo do telefone//

const telefoneInput = document.getElementById('telefone');

// Adiciona um "ouvinte" que roda toda vez que o usuário digitar no input
telefoneInput.addEventListener('input', function (e) {

  // Pega o valor digitado e remove tudo que não for número (ex: letras, traços, espaços)
  //replace = substituir espaço por texto
  let valor = e.target.value.replace(/\D/g, '');

  valor = valor.substring(0, 11);

  let valorFormatado = '';

  if (valor.length > 0) {
    valorFormatado = '(' + valor.substring(0, 2);
  }
  if (valor.length > 2) {
    valorFormatado += ') ' + valor.substring(2, 7);
  }
  if (valor.length > 7) {
    valorFormatado += '-' + valor.substring(7, 11);
  }

  e.target.value = valorFormatado;
});

//*validaçao de senha e comparação//

const senhaInput = document.getElementById('senha');
const confirmaSenhaInput = document.getElementById('confirma-senha');
const msgConfirmacao = document.getElementById('msg-confirmacao');

// Correção da regex (lookaheads corretos)
const regexSenhaForte = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

senhaInput.addEventListener('input', validarConfirmacaoSenha);

confirmaSenhaInput.addEventListener('input', validarConfirmacaoSenha);

function validarConfirmacaoSenha() {
    const senha = senhaInput.value;
    const confirmaSenha = confirmaSenhaInput.value;

    if (confirmaSenha.length === 0) {
        msgConfirmacao.textContent = '';
        return;
    }
    if (senha === confirmaSenha) {
        msgConfirmacao.textContent = 'As senhas conferem!';
        msgConfirmacao.className = 'valido';
    } 
    else {
        msgConfirmacao.textContent = 'As senhas não conferem!';
        msgConfirmacao.className = 'invalido';
    }
}

// Validação básica no cliente
const formCadastro = document.querySelector('form');
if (formCadastro) {
  formCadastro.addEventListener('submit', function (e) {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = senhaInput.value;
    if (!nome || !telefone || !email || !senha) {
      mostrarMensagem('Preencha todos os campos.', false);
      e.preventDefault();
      return;
    }
    if (!regexSenhaForte.test(senha)) {
      mostrarMensagem('A senha não atende aos requisitos mínimos.', false);
      e.preventDefault();
      return;
    }
    if (senha !== confirmaSenhaInput.value) {
      mostrarMensagem('As senhas não conferem!', false);
      e.preventDefault();
      return;
    }
    // Permite submit normal para o backend
  });
}

function mostrarMensagem(texto, ok) {
  const el = document.getElementById('msg-confirmacao');
  if (!el) return;
  el.textContent = texto;
  el.className = ok ? 'valido' : 'invalido';
}