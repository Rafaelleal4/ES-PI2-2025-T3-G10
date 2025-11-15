# ES-PI2-2025-T3-G10 - NotaDez

Sistema web para gerenciamento de notas por professores/docentes do ensino superior.

## 📋 Pré-requisitos

- **Node.js** v18+ (testado com v22.x)
- **npm** (vem junto com o Node)
- **Oracle Database** 12c+ (acesso via VPN PUC)
- **SQL Developer** (para executar scripts no banco)
- **VPN PUC** (para conectar ao banco Oracle)

---

## 🚀 Como rodar este projeto no Windows (PowerShell)

### 1) Clonar o repositório

```powershell
git clone https://github.com/Rafaelleal4/ES-PI2-2025-T3-G10.git
cd ES-PI2-2025-T3-G10
```

### 2) Instalar dependências

No PowerShell, o Windows pode bloquear o script `npm.ps1`. Se você ver o erro de "execução de scripts foi desabilitada", use `npm.cmd`:

```powershell
# Checar versões (opcional)
node -v
npm.cmd -v

# Instalar dependências
npm.cmd install
```

**Alternativa (opcional):** ajustar a política de execução do PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Depois disso, `npm install` funcionará normalmente.

### 3) Configurar variáveis de ambiente

1. **Copie o arquivo de exemplo:**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edite o arquivo `.env`** com suas credenciais Oracle e configurações de e-mail:
   ```env
   # Configurações do Banco de Dados Oracle
   ORACLE_USER=seu_usuario_puc
   ORACLE_PASSWORD=sua_senha_puc
   ORACLE_HOST=172.16.12.14
   ORACLE_PORT=1521
   ORACLE_SID=XE

   # Porta do servidor Node.js
   PORT=5000

   # Configurações de E-mail (para recuperação de senha)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_de_app

   # URL base da aplicação (para links de recuperação)
   BASE_URL=http://localhost:5000
   ```

**⚠️ IMPORTANTE:** Nunca faça commit do arquivo `.env` no Git!

### 4) Configurar o banco de dados Oracle

#### 4.1) Conectar via VPN PUC
- Certifique-se de que a VPN da PUC está conectada

#### 4.2) Executar o schema no SQL Developer

1. Abra o **SQL Developer**
2. Conecte ao seu schema Oracle
3. Execute os scripts na seguinte ordem:
   - **File > Open...** → Selecione `db/oracle/schema.sql`
   - Pressione **F5** (Run Script)
   - Aguarde a criação de todas as tabelas, índices e triggers
   - Execute `db/oracle/tokens_recuperacao.sql` para criar a tabela de tokens de recuperação de senha

#### 4.3) Inserir dados de teste (opcional, mas recomendado)

1. Execute o seed:
   - **File > Open...** → Selecione `db/oracle/seed.sql`
   - Pressione **F5** (Run Script)

**Dados de teste inseridos:**
- 1 professor: `joao.silva@puc.br` / senha: `senha123`
- 1 instituição, 1 curso, 1 disciplina, 1 turma
- 3 alunos: Maria, Pedro, Ana
- 3 componentes: P1, P2, P3
- 6 notas de exemplo

### 5) Iniciar o servidor

```powershell
npm.cmd start
```

Ao iniciar com sucesso, você verá:

```
Conectando ao Oracle...
✅ Conectado com sucesso!
Servidor rodando em http://localhost:5000
```

---

## 🌐 Páginas e Endpoints

### Páginas HTML

- **Dashboard:** http://localhost:5000/
- **Login:** http://localhost:5000/login
- **Cadastro:** http://localhost:5000/cadastro
- **Recuperação de senha:** http://localhost:5000/recuperacao-senha
- **Redefinir senha (via link do e-mail):** http://localhost:5000/redefinir-senha?token=SEU_TOKEN
- **Instituições:** http://localhost:5000/instituicoes
- **Cursos:** http://localhost:5000/cursos
- **Disciplinas:** http://localhost:5000/disciplinas
- **Turmas:** http://localhost:5000/turmas
- **Alunos:** http://localhost:5000/alunos
- **Notas:** http://localhost:5000/notas

### API REST - Autenticação

#### POST `/api/auth/cadastro`
Cadastra um novo professor no sistema.

**Body:**
```json
{
  "nome": "Prof. Maria Silva",
  "email": "maria.silva@puc.br",
  "telefone": "(11) 98765-4321",
  "senha": "senha123"
}
```

**Resposta (201):**
```json
{
  "sucesso": true,
  "mensagem": "Cadastro realizado com sucesso!",
  "dados": {
    "id": 2,
    "nome": "Prof. Maria Silva",
    "email": "maria.silva@puc.br"
  }
}
```

#### POST `/api/auth/login`
Autentica um professor no sistema.

**Body:**
```json
{
  "email": "joao.silva@puc.br",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso!",
  "dados": {
    "id": 1,
    "nome": "Prof. João Silva",
    "email": "joao.silva@puc.br",
    "telefone": "(11) 98765-4321"
  }
}
```

#### POST `/api/auth/recuperacao-senha`
Inicia o processo de recuperação de senha: gera token (1h de validade), salva no banco e envia e-mail com o link de redefinição.

**Body:**
```json
{
  "email": "joao.silva@puc.br"
}
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Se o email estiver cadastrado, você receberá um link de recuperação"
}
```

#### POST `/api/auth/redefinir-senha`
Redefine a senha a partir de um token válido e não utilizado.

**Body:**
```json
{
  "token": "uuid-do-email",
  "novaSenha": "senha123"
}
```

**Resposta (200):**
```json
{
  "sucesso": true,
  "mensagem": "Senha redefinida com sucesso! Você já pode fazer login."
}
```

---

## 📚 API REST - Gerenciamento

### Instituições

#### GET `/api/instituicoes?usuario_id=1`
Lista todas as instituições do professor.

#### POST `/api/instituicoes`
Cria uma nova instituição.

#### PUT `/api/instituicoes/:id`
Atualiza uma instituição existente.

#### DELETE `/api/instituicoes/:id?usuario_id=1`
Exclui uma instituição (apenas se não tiver cursos vinculados).

### Cursos

#### GET `/api/cursos?instituicao_id=1&usuario_id=1`
Lista cursos de uma instituição.

#### POST `/api/cursos`
Cria um novo curso.

#### PUT `/api/cursos/:id`
Atualiza um curso existente.

#### DELETE `/api/cursos/:id?usuario_id=1`
Exclui um curso (apenas se não tiver disciplinas vinculadas).

### Disciplinas

#### GET `/api/disciplinas?curso_id=1&usuario_id=1`
Lista disciplinas de um curso.

#### POST `/api/disciplinas`
Cria uma nova disciplina.

#### PUT `/api/disciplinas/:id`
Atualiza uma disciplina existente.

#### DELETE `/api/disciplinas/:id?usuario_id=1`
Exclui uma disciplina (apenas se não tiver turmas vinculadas).

### Turmas

#### GET `/api/turmas?disciplina_id=1&usuario_id=1`
Lista turmas de uma disciplina.

#### GET `/api/turmas/:id/alunos?usuario_id=1`
Lista alunos de uma turma específica.

#### POST `/api/turmas`
Cria uma nova turma.

#### PUT `/api/turmas/:id`
Atualiza uma turma existente.

#### DELETE `/api/turmas/:id?usuario_id=1`
Exclui uma turma.

### Alunos

#### GET `/api/alunos?usuario_id=1`
Lista todos os alunos do professor.

#### POST `/api/alunos`
Cria um novo aluno.

#### POST `/api/alunos/:id/vincular-turma`
Vincula um aluno a uma turma.

#### PUT `/api/alunos/:id`
Atualiza dados de um aluno.

#### DELETE `/api/alunos/:id?usuario_id=1`
Exclui um aluno.

---

## 🎯 Funcionalidades Implementadas

- ✅ Autenticação (login/cadastro)
- ✅ Recuperação de senha por e-mail
- ✅ Dashboard com navegação
- ✅ CRUD de Instituições
- ✅ CRUD de Cursos (vinculados a instituições)
- ✅ CRUD de Disciplinas (vinculadas a cursos)
- ✅ CRUD de Turmas (vinculadas a disciplinas)
- ✅ CRUD de Alunos
- ✅ Vinculação de alunos a turmas
- ✅ Filtros em cascata (Instituição → Curso → Disciplina → Turma)
- ✅ Interface responsiva e moderna
- ⏳ Sistema de notas (em desenvolvimento)

---

## � Estrutura do Projeto

```
ES-PI2-2025-T3-G10/
├── db/
│   └── oracle/
│       ├── schema.sql              # DDL do banco (tabelas principais)
│       ├── tokens_recuperacao.sql  # Tabela de tokens de recuperação
│       └── seed.sql                # Dados de teste
├── src/
│   ├── backend/
│   │   ├── config/
│   │   │   └── database.ts         # Configurações do Oracle
│   │   ├── database/
│   │   │   └── connection.ts       # Pool de conexões
│   │   ├── routes/
│   │   │   ├── auth.ts             # Rotas de autenticação
│   │   │   ├── api/
│   │   │   │   ├── index.ts        # Agregador de rotas API
│   │   │   │   ├── auth.ts         # API de autenticação
│   │   │   │   ├── instituicoes.ts # API de instituições
│   │   │   │   ├── cursos.ts       # API de cursos
│   │   │   │   ├── disciplinas.ts  # API de disciplinas
│   │   │   │   ├── turmas.ts       # API de turmas
│   │   │   │   └── alunos.ts       # API de alunos
│   │   │   └── pages/              # Rotas de páginas HTML
│   │   │       ├── index.ts        # Agregador de páginas
│   │   │       ├── login.ts
│   │   │       ├── cadastro.ts
│   │   │       ├── dashboard.ts
│   │   │       ├── instituicoes.ts
│   │   │       ├── cursos.ts
│   │   │       ├── disciplinas.ts
│   │   │       ├── turmas.ts
│   │   │       ├── alunos.ts
│   │   │       └── notas.ts
│   │   └── services/
│   │       └── email.ts            # Serviço de envio de e-mail
│   ├── screens/                    # Telas HTML/CSS/JS (frontend)
│   │   ├── Login/
│   │   ├── Cadastro/
│   │   ├── Dashboard/
│   │   ├── Recuperacão Senha/
│   │   ├── Redefinir Senha/
│   │   ├── Instituicoes/
│   │   ├── Cursos/
│   │   ├── Disciplinas/
│   │   ├── Turmas/
│   │   ├── Alunos/
│   │   └── Notas/
│   └── index.ts                    # Ponto de entrada do servidor
├── .env                            # Variáveis de ambiente (não commitar!)
├── .env.example                    # Exemplo de configuração
├── package.json
├── tsconfig.json
├── Documento.md                    # Documento de visão do projeto
└── README.md
```

---

## 🔒 Segurança

- ✅ Variáveis sensíveis em arquivo `.env` (não versionado)
- ✅ Pool de conexões Oracle com timeout configurado
- ✅ Validação de entrada nos endpoints
- ✅ Tokens de recuperação de senha com expiração (1 hora)
- ✅ Limpeza automática de tokens expirados via trigger
- ✅ Proteção contra SQL injection (uso de bind parameters)
- ⚠️ **Nota:** Projeto simplificado para fins acadêmicos

---

## 📧 Configuração de E-mail (Gmail)

Para a funcionalidade de recuperação de senha funcionar:

1. Use uma conta Gmail
2. Ative a **verificação em duas etapas**
3. Gere uma **senha de app**:
   - Acesse: https://myaccount.google.com/security
   - Vá em "Senhas de app"
   - Gere uma nova senha para "E-mail"
   - Use essa senha no campo `EMAIL_PASS` do `.env`

---

## 🐛 Troubleshooting

### Erro: "Pool de conexões não inicializado"
- Certifique-se de que o arquivo `.env` está configurado corretamente
- Verifique se a VPN da PUC está conectada
- Execute `npm run build` para compilar o TypeScript

### Erro: "NJS-510: connection timeout"
- Verifique se a VPN da PUC está ativa e conectada
- Teste a conectividade: `Test-NetConnection -ComputerName 172.16.12.14 -Port 1521`
- O timeout foi aumentado para 90 segundos no código

### Erro: "ORA-12541: TNS:no listener"
- Verifique se `ORACLE_HOST`, `ORACLE_PORT` e `ORACLE_SID` estão corretos no `.env`
- Confirme que a VPN está conectada
- Teste a conexão manual no SQL Developer

### Erro: "ORA-01017: invalid username/password"
- Verifique `ORACLE_USER` e `ORACLE_PASSWORD` no arquivo `.env`
- Confirme as credenciais no SQL Developer

### PowerShell bloqueia npm
- Use `npm.cmd` em vez de `npm`
- Ou ajuste a política: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### E-mail de recuperação não chega
- Verifique se o `EMAIL_USER` e `EMAIL_PASS` estão corretos
- Confirme que a senha de app do Gmail foi gerada corretamente
- Verifique a pasta de spam do destinatário
- Confira os logs do servidor para mensagens de erro

---

## � Equipe

Projeto Integrador II - Engenharia de Software  
PUC Campinas - 2025  
Turma 3 - Grupo 10

---

## 📄 Licença

Este projeto é de uso exclusivamente acadêmico para a disciplina de Projeto Integrador II.

