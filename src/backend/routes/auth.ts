/**
 * Rotas de Autenticação
 * Autor: Equipe G10
 */

import { Router, Request, Response } from 'express';
import oracledb from 'oracledb';
import { executeQuery } from '../database/connection';

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

// GET /api/auth/status
router.get('/status', async (req: Request, res: Response) => {
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
