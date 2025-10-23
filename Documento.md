# Documento de Visão - Projeto NotaDez

**Pontifícia Universidade Católica de Campinas - PUC-Campinas**

**Componente:** Projeto Integrador 2

**Curso:** Engenharia de Software - 2025

**Autores:** Prof. Me. Mateus Dias, Profa. Dra. Renata Arantes e Prof. Dr. Luã Muriana

**Local:** Campinas – 2025

---

## 1. O que é este documento

Este documento trata do escopo e limites da proposta de projeto chamada **NotaDez** que deverá ser implementada no decorrer da disciplina de Projeto Integrador 2.

### 1.1. Autores

- Prof. Me. Mateus Dias
- Profa. Dra. Renata Arantes
- Prof. Dr. Luã Muriana

### 1.2. Quem deve ler esse documento de visão

Dedicado para os estudantes que estão cursando neste semestre a disciplina de **Projeto Integrador 2** do curso de Engenharia de Software.

### 1.3. Encontrei um erro ou problema neste documento. O que devo fazer?

Contatar seus professores orientadores da disciplina de Projeto Integrador 2 para retirar as suas dúvidas e fazer ajustes caso sejam coerentes e necessários.

### 1.4. Direitos autorais

⚠️ **IMPORTANTE:** Este documento está protegido nos termos da **lei de direitos autorais de 9.610/98**.

**Restrições:**

- ❌ Este documento não deve ser encaminhado de maneira digital ou impressa para outras pessoas externas à disciplina
- ❌ Apenas alunos de Projeto Integrador 2, matriculados em 2025 no curso de Engenharia de Software podem ter acesso
- ❌ Nenhuma ideia, solução, parte ou textos integrais podem ser reaproveitados fora do contexto estritamente acadêmico

**Se você recebeu este documento sem autorização:**

Apague-o imediatamente e informe os autores relatando como este documento chegou até você.

**Para uso comercial:**

Só serão analisados pedidos realizados por meio de um profissional jurídico ou escritório especialista em propriedade intelectual, com procuração devidamente concedida. Pedidos feitos sem o envolvimento de profissional da área jurídica serão automaticamente recusados.

**Contatos dos autores:**

- mateus.dias@puc-campinas.edu.br
- renata.arantes@puc-campinas.edu.br
- lua.marcelo@puc-campinas.edu.br

---

## 2. O Projeto NotaDez

### 2.1. Contexto e motivação

Na atualidade, docentes do ensino superior precisam de uma ferramenta particular e única para gerenciar as notas de seus estudantes, muito além de sistemas acadêmicos institucionais, pois é propriedade intelectual do docente ter documentado as notas de seus estudantes ao longo dos seus anos de atuação. Essa não é uma informação apenas institucional, mas de propriedade compartilhada entre: professor, estudante e instituição.

Costumeiramente, os docentes utilizam o Excel ou editor de planilhas para fazer controle pessoal de notas e, de fato, são softwares excelentes e consagrados. No entanto, muitas vezes não há integração desses aplicativos com outras ferramentas institucionais, pois não é tão trivial realizar esse trabalho por parte das instituições e, além disso, por ser uma ferramenta mais ampla e tratar de diversos casos de uso, não atende especificamente esse nicho de problema: o controle de notas.

### 2.2. Funcionalidades principais

Ao utilizar **NotaDez**, o docente poderá:

1.  **Cadastrar** uma ou mais instituições onde trabalha (nome, disciplinas, turmas)
2.  **Gerenciar disciplinas** (código, nome e apelido)
3.  **Gerenciar turmas** (código, nome e apelido)
4.  **Importar/cadastrar estudantes** vinculados a uma turma
5.  **Apontar notas** em diversas atividades, provas
6.  **Calcular automaticamente** a nota final da disciplina

### 2.3. Características técnicas

- ✅ Aplicação **100% Web**
- ✅ Capacidade de **exportar e importar dados**
- ✅ Pode ser hospedada na **nuvem ou servidor dedicado**
- ✅ Acesso de **qualquer lugar**

---

## 3. Requisitos do NotaDez

### 3.1. Autenticação

**Requisitos obrigatórios:**

O docente que desejar usar o NotaDez deve criar uma conta de acesso usando um endereço de e-mail pessoal.

**Dados exigidos para criação de conta:**

- Nome
- E-mail
- Telefone celular
- Senha

**Funcionalidades:**

- ✅ Recurso de recuperação de senha por e-mail ("esqueci a minha senha")
- ❌ Não existirá acesso anônimo ou modo visitante
- ✅ Primeira página exibida: página de autenticação
- ❌ Não há necessidade de hotsite ou páginas explicativas

> 💡 **Nota técnica:** Este projeto é totalmente um software web, não se trata de um portal informativo.

---

### 3.2. Gerenciar instituições, disciplinas e turmas

#### 3.2.1. Primeiro acesso

Após o cadastro, quando o docente acessa o sistema pela primeira vez, deve informar:

1.  **Pelo menos uma instituição** onde trabalha (ex: PUC-Campinas)
2.  **Um curso** que leciona (ex: Engenharia de Software)

#### 3.2.2. Cadastro de disciplinas

O docente poderá criar disciplinas informando:

- **Nome** da disciplina
- **Sigla**
- **Código**
- **Período do curso** (1º semestre, 2º semestre, etc.)

#### 3.2.3. Cadastro de turmas

> **Turma:** Conjunto de estudantes que frequentam uma disciplina em um determinado dia, horário e local.

O docente pode criar quantas turmas desejar (ex: Turma 1, Turma 2) associadas às disciplinas.

#### 3.2.4. Regras de exclusão

**Exclusão de turmas:**

- ⚠️ Se a turma já possui notas lançadas: enviar e-mail de confirmação *(pode ser substituído por modal simples)*...
- 🔴 A exclusão de uma turma é **irrevogável**

**Exclusão de instituições:**

- ❌ Não pode excluir instituição que tenha disciplinas e turmas
- ✅ Ordem de exclusão: Turmas → Disciplinas → Instituição

> 📌 **SIMPLIFICAÇÃO:** O envio de e-mail e link de confirmação pode ser substituído por uma confirmação modal simples ("Tem certeza que deseja excluir esta turma?").

---

### 3.3. Cadastro de alunos ou importação de arquivo CSV

#### 3.3.1. Cadastro manual

Ao acessar uma turma, o docente poderá:

- ✅ Incluir estudantes
- ✅ Editar alunos existentes
- ✅ Remover alunos (um a um ou por múltipla seleção)

#### 3.3.2. Importação via CSV

O docente poderá importar estudantes a partir de arquivos **CSV**.

**Formato esperado (exemplo):**

| Matrícula | Nome |
| :--- | :--- |
| 11111 | Abel Antimônio |
| 11112 | Bianca Nióbio |
| 11113 | Carla Polônio |
| 11114 | Carlos Zinco |
| 11115 | Leonardo Plutônio |
| 11116 | Matheus Basalto |

**Regras de importação:**

- ✅ Sistema utiliza **apenas as DUAS PRIMEIRAS COLUNAS**
- ✅ Primeira coluna = identificador do aluno
- ✅ Segunda coluna = nome completo do estudante
- ❌ Qualquer outra coluna será **DESCONSIDERADA**

#### 3.3.3. Tratamento de duplicatas

Caso já existam estudantes na turma e seja feita nova importação:

- ✅ Sistema verifica duplicatas pelo **identificador do estudante**
- ❌ Não podem existir dois estudantes com o mesmo identificador
- ✅ Em caso de conflito: **dados no NotaDez = fonte da verdade** (não sobrescrever)

> 📌 **SIMPLIFICAÇÃO:** Importação via JSON foi **removida**. Manter apenas CSV.

---

### 3.4. Criar componente de nota

#### 3.4.1. O que é um componente de nota?

**Componente de nota:** Qualquer exercício, atividade, tarefa ou prova que o docente aplicou para uma turma e deseje registrar no sistema.

É entendido como **uma parte da composição** de um cálculo maior que define a nota final para cada estudante em uma determinada disciplina.

#### 3.4.2. Características

**Valores aceitos:**

- ✅ Nota numérica de **0.00 até 10.00**
- ✅ Precisão de **duas casas decimais**
- ✅ Exemplos válidos: 0.55, 0.99, 1.81, 10.00, 9.50

**Dados do componente:**

- **Nome** (ex: Prova 1)
- **Sigla** usada na fórmula (ex: P1)
- **Descrição** (ex: Prova teórica sobre conteúdo do primeiro módulo)

#### 3.4.3. Exemplo de tabela de notas

Após cadastrar componentes P1, P2 e P3 para a disciplina:

| Matrícula | Nome | P1 | P2 | P3 |
| :--- | :--- | :--- | :--- | :--- |
| 11111 | Abel Antimônio | - | - | - |
| 11112 | Bianca Nióbio | - | - | - |
| 11113 | Carla Polônio | - | - | - |
| 11114 | Carlos Zinco | - | - | - |
| 11115 | Leonardo Plutônio | - | - | - |
| 11116 | Matheus Basalto | - | - | - |

> 💡 A tabela sempre abrirá em **modo de visualização** para que o docente não edite sem querer uma determinada nota.

---

### 3.5. Apontar notas dos componentes

#### 3.5.1. Modo de edição

O docente poderá apontar notas de **um único componente por vez** (ex: P1 ou P2).

**Modo de Edição Completa (OPCIONAL):**

- Permite editar qualquer nota de qualquer componente
- Útil para editar notas de componentes distintos com cuidado

> 📌 **SIMPLIFICAÇÃO:** Manter só a edição por componente de nota já é suficiente.

#### 3.5.2. Limitações

❌ Nesta versão do projeto, **não** controlaremos recursos de desfazer ou refazer notas já modificadas.

---

### 3.6. Painel de auditoria

#### 3.6.1. Objetivo

A cada nota lançada pela primeira vez ou modificada, o sistema deverá **salvar** as informações em um registro de auditoria.

#### 3.6.2. Formato das mensagens

**Exemplo:**

dd/mm/yyyy HH:MM:ss - (Aluno João Silva) - Nota de 5.0 para 5.5 modificada e salva.


Onde `dd/mm/yyyy HH:MM:ss` = data e horário atual que o servidor registrou a operação.

#### 3.6.3. Características

- ✅ Mensagens salvas no **banco de dados**
- ✅ Ordenadas por **data/hora decrescente**
- ✅ Só aparecem mensagens de notas **confirmadas pelo backend**
- ✅ Auditoria é **obrigatória**, nenhum docente poderá desabilitá-la

> 📌 **SIMPLIFICAÇÃO:** A auditoria agora é apenas deixar registrado o log (**via trigger**) no banco de dados; **não exibe mais** painel visual.

---

### 3.7. Cálculo de notas finais

#### 3.7.1. Configuração da fórmula

Ao acessar a disciplina (que contém 1 ou mais turmas), o sistema verificará se existe um ou mais componentes de nota cadastrados.

Se sim, liberará um campo texto chamado **Nota Final** onde o docente informará a expressão matemática para cálculo.

**Exemplo de fórmula:**

(P1 + P2 + P3) / 3


#### 3.7.2. Validação

O sistema deverá:

- ✅ Interpretar a fórmula informada pelo professor
- ✅ Verificar se **todos os componentes cadastrados** estão utilizados na fórmula
- ✅ Fazer o cálculo automaticamente de acordo com o critério especificado

> ⚠️ **DESAFIO:** É um desafio para a equipe resolver essa parte do sistema. Os professores de web ou projeto integrador 2 **não vão tirar dúvidas** ou auxiliar as equipes a resolver este requisito.

#### 3.7.3. Visualização

Quando o professor voltar para a tela de lançamento de notas da turma:

- ✅ Visualizará a coluna de cálculo da **nota final**
- ❌ **Não poderá editar** os dados (cálculo automático)

> 📌 **SIMPLIFICAÇÃO:** O TIME pode fixar a média simples ou ponderada das notas:
>
> - Média simples: `(P1 + P2 + P3) / 3`
> - Média ponderada: `(P1*0.4 + P2*0.3 + P3*0.3)`

---

### 3.8. Coluna Notas Finais Ajustadas

> 📌 **REQUISITO REMOVIDO:** Essa coluna pode ser retirada sem prejuízo, ou seja, requisito foi **retirado do projeto por completo**.

---

### 3.9. Exportação de notas CSV

#### 3.9.1. Funcionalidade

Quando o docente acessar as notas de uma turma, poderá escolher a opção **"Exportar"** para obter os dados em formato CSV.

#### 3.9.2. Condições para exportação

O arquivo **só poderá ser gerado** quando:

- ✅ Todas as notas (componentes) estiverem atribuídas a todos os estudantes
- ✅ Nenhuma nota estiver em branco ou "-"
- ✅ O cálculo final para todos os estudantes foi realizado

#### 3.9.3. Formato do arquivo

**Padrão de nome:**

YYYY-MM-DD_HHmmssms-TurmaX_Sigla.csv


**Exemplo:**

2025-12-10_223001001-T1-PI2.csv


#### 3.9.4. Comportamento

- ✅ Download **imediato** após geração
- ❌ Sistema **não guarda** arquivo exportado no banco de dados ou servidor

> 📌 **SIMPLIFICAÇÃO:** Exportação via JSON foi **removida**. Manter apenas CSV.