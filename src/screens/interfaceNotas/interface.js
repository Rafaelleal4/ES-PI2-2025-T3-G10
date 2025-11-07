document.addEventListener("DOMContentLoaded", () => {
    
    const btnSalvar = document.getElementById("btnSalvar");
    const btnAdicionar = document.getElementById("btnAdicionar"); 
    const tabelaBody = document.querySelector(".tabela-notas tbody"); 

    // ADICIONAR ALUNO
    btnAdicionar.addEventListener("click", () => {
        
        const nomeAluno = prompt("Digite o nome do novo aluno:");

        if (nomeAluno) {
            
            //Cria a nova linha
            const novaLinha = document.createElement("tr");
            const novoId = "novo-" + Date.now(); // ID temporário

            //Define TODO o HTML interno da linha de uma vez
            novaLinha.innerHTML = `
                <td data-aluno-id="${novoId}">${nomeAluno}</td>
                <td><input type="number" class="input-nota" min="0" max="10" step="0.5"></td>
                <td><input type="number" class="input-nota" min="0" max="10" step="0.5"></td>
                <td><input type="number" class="input-nota" min="0" max="10" step="0.5"></td>
            `;
            
            //Adiciona a linha pronta na tabela
            tabelaBody.appendChild(novaLinha);
            alert(`Aluno "${nomeAluno}" adicionado à tabela.`);
        }
    });

    //SALVAR NOTAS 
    // Esta parte lê a tabela e cria o objeto de dados.
    // usar 'todasAsNotas' para enviar backend/banco de dados.
    btnSalvar.addEventListener("click", () => { 
        
        const todasAsNotas = [];
        const linhasTabela = document.querySelectorAll(".tabela-notas tbody tr");
        linhasTabela.forEach(linha => {
            
            const celulaAluno = linha.querySelector("td[data-aluno-id]");
            const alunoNome = celulaAluno.textContent;
            const alunoId = celulaAluno.getAttribute("data-aluno-id");

            const inputsNota = linha.querySelectorAll(".input-nota");

            const notasDoAluno = {
                id: alunoId,
                nome: alunoNome,
                componente1: inputsNota[0].value || "N/A",
                componente2: inputsNota[1].value || "N/A",
                componente3: inputsNota[2].value || "N/A"
            };

            todasAsNotas.push(notasDoAluno);
        });

        console.log("--- Dados Prontos para Enviar ao Backend ---");
        console.log(todasAsNotas);

        alert("Notas salvas! (Verifique o console para ver os dados)");
    });
});