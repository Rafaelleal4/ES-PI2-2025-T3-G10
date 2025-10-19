# ES-PI2-2025-T3-G10

## Como rodar este projeto no Windows (PowerShell)

Pré-requisitos:

- Node.js instalado (testado com v22.x)
- npm instalado (vem junto com o Node)

### 1) Instalar dependências

No PowerShell, o Windows pode bloquear o script `npm.ps1`. Se você ver o erro de "execução de scripts foi desabilitada", use `npm.cmd`:

- Checar versões (opcional):
	- `node -v`
	- `npm.cmd -v` (use `npm -v` se não tiver bloqueio)

- Instalar dependências:
	- `npm.cmd install`

Alternativa (opcional) para não precisar do `.cmd`: ajustar a política de execução do PowerShell (faça apenas se souber o que está fazendo):

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Depois disso, `npm -v` e `npm install` devem funcionar normalmente.

### 2) Iniciar o servidor de desenvolvimento

Este projeto usa TypeScript e `tsc-watch`. Para compilar em modo watch e iniciar o servidor Express:

- `npm.cmd start`

Se sua política de execução já permitir, você pode usar apenas:

- `npm start`

Ao iniciar com sucesso, você verá algo como:

```
Found 0 errors. Watching for file changes.
Server is running on http://localhost:3000
```

### 3) Páginas disponíveis

- Login: http://localhost:3000/login
- Cadastro: http://localhost:3000/cadastro
- Recuperação de senha: http://localhost:3000/recuperacao-senha

Os assets (CSS/JS) de cada tela são servidos automaticamente pelas rotas base (ex.: `/login/login.css`).

### 4) Endpoints de API (stubs)

- POST `/api/login` — body JSON: `{ email, password }`
	- 400 se faltar campo; 200 com `{ ok: true, message }` caso sucesso (stub)
- POST `/api/cadastro` — body JSON: `{ nome, telefone, email, senha }`
	- 400 se faltar campo; 201 com `{ ok: true, message }` caso sucesso (stub)
- POST `/api/recuperacao-senha` — body JSON: `{ email }`
	- 400 se faltar field; 200 com `{ ok: true, message }` caso sucesso (stub)

Observação: por enquanto os endpoints apenas simulam o comportamento; não há persistência em banco.

### 5) Acessar no navegador

Abra: http://localhost:3000

Para encerrar, use `Ctrl + C` no terminal onde o servidor está rodando.

### Estrutura relevante

- `src/index.ts`: ponto de entrada do servidor Express
- `tsconfig.json`: configura a saída para `lib/`
- `package.json`:
	- `start`: compila (watch) e roda `node ./lib/index.js`

### Notas

- Se você trocar os arquivos `.ts` em `src/`, o `tsc-watch` recompila automaticamente e o servidor reinicia.
- Caso esteja usando CMD em vez de PowerShell, `npm` funciona sem o sufixo `.cmd`.
- Se estiver com dificuldades para acessar via `curl` no PowerShell, teste diretamente no navegador.