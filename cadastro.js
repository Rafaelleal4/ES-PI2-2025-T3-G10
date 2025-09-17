
//*codigo para formatar o campo do telefone//

const telefoneInput = document.getElementById('telefone');

telefoneInput.addEventListener('input', function (e) {
  
 
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
    } else {
        msgConfirmacao.textContent = 'As senhas não conferem!';
        msgConfirmacao.className = 'invalido';
    }
}