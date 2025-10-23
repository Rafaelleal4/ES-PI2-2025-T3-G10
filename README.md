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

2. **Edite o arquivo `.env`** com suas credenciais Oracle:
   ```env
   ORACLE_USER=seu_usuario_puc
   ORACLE_PASSWORD=sua_senha_puc
   ORACLE_HOST=172.16.12.14
   ORACLE_PORT=1521
   ORACLE_SID=XE
   PORT=3000
   ```

**⚠️ IMPORTANTE:** Nunca faça commit do arquivo `.env` no Git!

### 4) Configurar o banco de dados Oracle

#### 4.1) Conectar via VPN PUC
- Certifique-se de que a VPN da PUC está conectada

#### 4.2) Executar o schema no SQL Developer

1. Abra o **SQL Developer**
2. Conecte ao seu schema Oracle
3. Execute o schema:
   - **File > Open...** → Selecione `db/oracle/schema.sql`
   - Pressione **F5** (Run Script)
   - Aguarde a criação de 10 tabelas, 10 índices e 2 triggers

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
Servidor rodando em http://localhost:3000
```

---

## 🌐 Páginas e Endpoints

### Páginas HTML

- **Login:** http://localhost:3000/login
- **Cadastro:** http://localhost:3000/cadastro
- **Recuperação de senha:** http://localhost:3000/recuperacao-senha

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
  "ok": true,
  "message": "Cadastro realizado com sucesso!",
  "data": {
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
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "ok": true,
  "message": "Login realizado com sucesso!",
  "data": {
    "id": 1,
    "nome": "Prof. João Silva",
    "email": "joao.silva@puc.br",
    "telefone": "(11) 98765-4321"
  }
}
```

#### POST `/api/auth/recuperacao-senha`
Inicia processo de recuperação de senha (stub - envio de email não implementado).

**Body:**
```json
{
  "email": "joao.silva@puc.br"
}
```

**Resposta (200):**
```json
{
  "ok": true,
  "message": "Se o email estiver cadastrado, você receberá um link de recuperação"
}
```

#### GET `/api/auth/status`
Verifica status da conexão com banco Oracle.

**Resposta (200):**
```json
{
  "ok": true,
  "message": "Conexão com banco OK",
  "database": "Oracle",
  "timestamp": "2025-10-23T19:50:00.000Z"
}
```

---

## 🧪 Testando as APIs

### Teste com curl (PowerShell)

```powershell
# Testar status da conexão
curl http://localhost:3000/api/auth/status

# Cadastrar novo professor
curl -X POST http://localhost:3000/api/auth/cadastro `
  -H "Content-Type: application/json" `
  -d '{\"nome\":\"Prof. Teste\",\"email\":\"teste@puc.br\",\"senha\":\"senha123\"}'

# Login
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"joao.silva@puc.br\",\"password\":\"senha123\"}'
```

### Teste com navegador (Postman/Insomnia)

Importe as requisições ou use o navegador para testar os endpoints.

---

## � Estrutura do Projeto

```
ES-PI2-2025-T3-G10/
├── db/
│   └── oracle/
│       ├── schema.sql          # DDL do banco
│       └── seed.sql            # Dados de teste
├── src/
│   ├── backend/
│   │   ├── config/
│   │   │   └── database.ts     # Configurações do Oracle
│   │   ├── database/
│   │   │   └── connection.ts   # Pool de conexões
│   │   └── routes/
│   │       ├── auth.ts         # Rotas de autenticação
│   │       └── pages.ts        # Rotas de páginas HTML
│   ├── screens/                # Telas HTML/CSS/JS
│   │   ├── Login/
│   │   ├── Cadastro/
│   │   └── Recuperacão Senha/
│   └── index.ts                # Ponto de entrada
├── .env                        # Variáveis de ambiente (não commitar!)
├── .env.example                # Exemplo de configuração
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Segurança

- ✅ Variáveis sensíveis em arquivo `.env` (não versionado)
- ✅ Pool de conexões Oracle
- ✅ Validação de entrada nos endpoints
- ⚠️ **Nota:** Projeto simplificado para fins acadêmicos

---

## 🐛 Troubleshooting

### Erro: "Pool de conexões não inicializado"
- Certifique-se de que o arquivo `.env` está configurado corretamente
- Verifique se a VPN da PUC está conectada
- Teste a conexão com: `GET /api/auth/status`

### Erro: "ORA-12541: TNS:no listener"
- Verifique se o `ORACLE_HOST`, `ORACLE_PORT` e `ORACLE_SERVICE` estão corretos
- Confirme que a VPN está conectada
- Teste a conexão manual no SQL Developer

### Erro: "ORA-01017: invalid username/password"
- Verifique `ORACLE_USER` e `ORACLE_PASSWORD` no arquivo `.env`
- Confirme as credenciais no SQL Developer

### PowerShell bloqueia npm
- Use `npm.cmd` em vez de `npm`
- Ou ajuste a política: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## � Equipe

Projeto Integrador II - Engenharia de Software  
PUC Campinas - 2025  
Turma 3 - Grupo 10

---

## 📄 Licença

Este projeto é de uso exclusivamente acadêmico para a disciplina de Projeto Integrador II.

