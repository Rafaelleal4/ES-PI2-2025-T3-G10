/**
 * Rotas de Autenticação
 * Autor: Equipe G10
 */

import { Router, Request, Response } from 'express';
import oracledb from 'oracledb';
import crypto from 'crypto';
import { executeQuery } from '../../database/connection';
import { enviarEmailRecuperacao, verificarConfiguracaoEmail } from '../../services/email';

const router = Router();

interface Usuario {
  ID: number;
  NOME: string;
  EMAIL: string;
  TELEFONE: string;
  SENHA_HASH: string;
}

// POST /api/auth/cadastro
router.post('/cadastro', async (req: Request, res: Response) => {
  try {
    const { nome, email, telefone, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ ok: false, message: 'Campos obrigatórios faltando' });
    }

    // Verificar se email já existe
    const checkEmail = await executeQuery<{ TOTAL: number }>(
      'SELECT COUNT(*) AS total FROM usuarios WHERE LOWER(email) = LOWER(:email)',
      { email }
    );

    if (checkEmail.rows && checkEmail.rows[0].TOTAL > 0) {
      return res.status(409).json({ ok: false, message: 'Email já cadastrado' });
    }

    // Inserir usuário (senha em texto puro - simplificado para projeto acadêmico)
    const result = await executeQuery(
      `INSERT INTO usuarios (nome, email, telefone, senha_hash)
       VALUES (:nome, :email, :telefone, :senha_hash)
       RETURNING id INTO :id`,
      {
        nome,
        email,
        telefone: telefone || null,
        senha_hash: senha,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const novoId = result.outBinds?.id;

    return res.status(201).json({
      ok: true,
      message: 'Cadastro realizado!',
      data: { id: novoId, nome, email }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ ok: false, message: 'Erro ao cadastrar' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email e senha obrigatórios' });
    }

    const result = await executeQuery<Usuario>(
      'SELECT id, nome, email, telefone, senha_hash FROM usuarios WHERE LOWER(email) = LOWER(:email)',
      { email }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ ok: false, message: 'Email ou senha incorretos' });
    }

    const usuario = result.rows[0];
    
    // Comparação simples de senha (texto puro)
    if (password !== usuario.SENHA_HASH) {
      return res.status(401).json({ ok: false, message: 'Email ou senha incorretos' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Login OK!',
      data: {
        id: usuario.ID,
        nome: usuario.NOME,
        email: usuario.EMAIL,
        telefone: usuario.TELEFONE
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ ok: false, message: 'Erro ao fazer login' });
  }
});

// POST /api/auth/recuperacao-senha
router.post('/recuperacao-senha', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ ok: false, message: 'E-mail é obrigatório' });
    }

    // Verificar se o usuário existe
    const result = await executeQuery<Usuario>(
      'SELECT id, nome, email FROM usuarios WHERE LOWER(email) = LOWER(:email)',
      { email }
    );

    // Sempre retorna sucesso (segurança: não revelar se o e-mail existe)
    if (!result.rows || result.rows.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação'
      });
    }

    const usuario = result.rows[0];

    // Gerar token único (UUID v4)
    const token = crypto.randomUUID();
    
    // Token expira em 1 hora
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1);

    // Salvar token no banco
    await executeQuery(
      `INSERT INTO tokens_recuperacao (usuario_id, token, expira_em)
       VALUES (:usuario_id, :token, TO_TIMESTAMP(:expira_em, 'YYYY-MM-DD HH24:MI:SS'))`,
      {
        usuario_id: usuario.ID,
        token,
        expira_em: expiraEm.toISOString().replace('T', ' ').substring(0, 19)
      }
    );

    // Enviar e-mail com link de recuperação
    const emailEnviado = await enviarEmailRecuperacao(usuario.EMAIL, usuario.NOME, token);

    if (!emailEnviado) {
      console.error('Falha ao enviar e-mail de recuperação para:', usuario.EMAIL);
      // Não revela erro ao usuário por questões de segurança
    }

    return res.status(200).json({
      ok: true,
      message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação'
    });
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return res.status(500).json({ ok: false, message: 'Erro ao processar solicitação' });
  }
});

// POST /api/auth/redefinir-senha
router.post('/redefinir-senha', async (req: Request, res: Response) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ ok: false, message: 'Token e nova senha são obrigatórios' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ ok: false, message: 'A senha deve ter no mínimo 6 caracteres' });
    }

    // Buscar token válido
    const result = await executeQuery<{
      ID: number;
      USUARIO_ID: number;
      USADO: number;
      EXPIRA_EM: Date;
    }>(
      `SELECT id, usuario_id, usado, expira_em 
       FROM tokens_recuperacao 
       WHERE token = :token`,
      { token }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(400).json({ ok: false, message: 'Token inválido ou expirado' });
    }

    const tokenData = result.rows[0];

    // Verificar se já foi usado
    if (tokenData.USADO === 1) {
      return res.status(400).json({ ok: false, message: 'Este link já foi utilizado' });
    }

    // Verificar se expirou
    const agora = new Date();
    const expiraEm = new Date(tokenData.EXPIRA_EM);
    
    if (agora > expiraEm) {
      return res.status(400).json({ ok: false, message: 'Este link expirou. Solicite um novo.' });
    }

    // Atualizar senha do usuário
    await executeQuery(
      'UPDATE usuarios SET senha_hash = :nova_senha WHERE id = :usuario_id',
      {
        nova_senha: novaSenha,
        usuario_id: tokenData.USUARIO_ID
      }
    );

    // Marcar token como usado
    await executeQuery(
      'UPDATE tokens_recuperacao SET usado = 1 WHERE id = :token_id',
      { token_id: tokenData.ID }
    );

    return res.status(200).json({
      ok: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.'
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ ok: false, message: 'Erro ao redefinir senha' });
  }
});

// GET /api/auth/email-test - verifica configuração do servidor de e-mail
router.get('/email-test', async (_req: Request, res: Response) => {
  const ok = await verificarConfiguracaoEmail();
  return res.status(ok ? 200 : 500).json({
    ok,
    message: ok ? 'Servidor de e-mail OK' : 'Falha na configuração do servidor de e-mail'
  });
});

// GET /api/auth/status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    await executeQuery('SELECT 1 FROM dual');
    return res.status(200).json({
      ok: true,
      message: 'Conexão OK',
      database: 'Oracle'
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Erro na conexão',
      error: String(error)
    });
  }
});

export default router;
