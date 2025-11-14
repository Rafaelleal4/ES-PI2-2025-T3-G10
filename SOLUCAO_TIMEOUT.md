# Solução para Erro de Timeout ao Carregar Instituições

## Problema Identificado
```
NJS-510: connection to host 172.16.12.14 port 1521 timed out. 
Request exceeded "transportConnectTimeout" of 20 seconds.
```

## Causa Raiz
O servidor está tentando conectar ao banco Oracle na rede interna da PUC (172.16.12.14), mas:

1. **VPN pode estar desconectada**
2. **Banco de dados pode estar offline**
3. **Firewall pode estar bloqueando a conexão**

## Soluções Implementadas no Código

### 1. Timeout de Conexão Aumentado
- **Antes**: 20 segundos (padrão)
- **Agora**: 90 segundos para connectTimeout
- **Arquivo**: `src/backend/config/database.ts`

### 2. Configurações de Pool Melhoradas
```typescript
poolMin: 1,
poolMax: 10,
poolIncrement: 1,
poolTimeout: 60,
queueTimeout: 60000,
connectTimeout: 90
```

## Como Resolver

### ✅ Opção 1: Verificar VPN (Recomendado)
1. Confirme que está conectado à VPN da PUC
2. Teste a conectividade:
   ```powershell
   Test-NetConnection -ComputerName 172.16.12.14 -Port 1521
   ```
3. Se retornar `TcpTestSucceeded: True`, a conexão está OK
4. Reinicie o servidor Node.js

### ✅ Opção 2: Verificar Arquivo .env
1. Certifique-se de que o arquivo `.env` existe na raiz do projeto
2. Verifique as credenciais:
   ```env
   ORACLE_USER=seu_usuario_correto
   ORACLE_PASSWORD=sua_senha_correta
   ORACLE_HOST=172.16.12.14
   ORACLE_PORT=1521
   ORACLE_SID=XE
   ```

### ✅ Opção 3: Usar Banco Local (Desenvolvimento)
Se não tiver acesso à VPN:
1. Instale Oracle XE localmente
2. Altere no `.env`:
   ```env
   ORACLE_HOST=localhost
   ```

## Verificação de Logs
Após reiniciar o servidor, verifique os logs:
```
Conectando ao Oracle...
Connection string: 172.16.12.14:1521/XE
✅ Conectado com sucesso!
✅ Teste de conexão bem-sucedido!
```

## Próximos Passos
1. Compile o TypeScript: `npm run build`
2. Reinicie o servidor: `npm start`
3. Tente carregar a página de alunos novamente
4. Se o erro persistir, verifique a conectividade de rede

## Melhorias Futuras
- Implementar retry automático em caso de timeout
- Adicionar health check endpoint
- Cache de dados para funcionamento offline
