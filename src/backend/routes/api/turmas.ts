/**
 * CRUD de Turmas
 * Autor: Rafael Leal
 */

import { Router, Request, Response } from 'express';
import { executeQuery } from '../../database/connection';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { disciplina_id, nome } = req.body;
    const usuario_id = req.body.usuario_id;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome da turma é obrigatório'
      });
    }

    if (!disciplina_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID da disciplina é obrigatório'
      });
    }

    const disciplinaCheck = await executeQuery<{ ID: number }>(
      `SELECT d.id 
       FROM disciplinas d
       JOIN cursos c ON d.curso_id = c.id
       JOIN instituicoes i ON c.instituicao_id = i.id
       WHERE d.id = :disciplina_id 
       AND i.usuario_id = :usuario_id`,
      { disciplina_id, usuario_id }
    );

    if (!disciplinaCheck.rows || disciplinaCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada ou você não tem permissão para acessá-la'
      });
    }

    await executeQuery(
      `INSERT INTO turmas (disciplina_id, nome)
       VALUES (:disciplina_id, :nome)`,
      { disciplina_id, nome: nome.trim() }
    );

    const resultado = await executeQuery<{
      ID: number;
      DISCIPLINA_ID: number;
      NOME: string;
      CRIADO_EM: Date;
    }>(
      `SELECT id, disciplina_id, nome, criado_em
       FROM turmas
       WHERE disciplina_id = :disciplina_id
       ORDER BY criado_em DESC
       FETCH FIRST 1 ROWS ONLY`,
      { disciplina_id }
    );

    const novaTurma = resultado.rows?.[0];

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Turma criada com sucesso',
      dados: {
        id: novaTurma?.ID,
        disciplina_id: novaTurma?.DISCIPLINA_ID,
        nome: novaTurma?.NOME,
        criado_em: novaTurma?.CRIADO_EM
      }
    });

  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao criar turma'
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { disciplina_id } = req.query;
    const usuario_id = req.query.usuario_id || req.body.usuario_id;

    if (!disciplina_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID da disciplina é obrigatório'
      });
    }

    const disciplinaCheck = await executeQuery(
      `SELECT d.id 
       FROM disciplinas d
       JOIN cursos c ON d.curso_id = c.id
       JOIN instituicoes i ON c.instituicao_id = i.id
       WHERE d.id = :disciplina_id 
       AND i.usuario_id = :usuario_id`,
      { disciplina_id: Number(disciplina_id), usuario_id: Number(usuario_id) }
    );

    if (!disciplinaCheck.rows || disciplinaCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada ou você não tem permissão'
      });
    }

    const resultado = await executeQuery<{
      ID: number;
      DISCIPLINA_ID: number;
      NOME: string;
      CRIADO_EM: Date;
      DISCIPLINA_NOME: string;
    }>(
      `SELECT t.id, t.disciplina_id, t.nome, t.criado_em, d.nome AS disciplina_nome
       FROM turmas t
       JOIN disciplinas d ON t.disciplina_id = d.id
       WHERE t.disciplina_id = :disciplina_id
       ORDER BY t.criado_em ASC`,
      { disciplina_id: Number(disciplina_id) }
    );

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows?.map(t => ({
        id: t.ID,
        disciplina_id: t.DISCIPLINA_ID,
        nome: t.NOME,
        criado_em: t.CRIADO_EM,
        disciplina_nome: t.DISCIPLINA_NOME
      })) || []
    });

  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao listar turmas'
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario_id = req.query.usuario_id || req.body.usuario_id;

    const resultado = await executeQuery<{
      ID: number;
      DISCIPLINA_ID: number;
      NOME: string;
      CRIADO_EM: Date;
    }>(
      `SELECT t.id, t.disciplina_id, t.nome, t.criado_em
       FROM turmas t
       JOIN disciplinas d ON t.disciplina_id = d.id
       JOIN cursos c ON d.curso_id = c.id
       JOIN instituicoes i ON c.instituicao_id = i.id
       WHERE t.id = :id 
       AND i.usuario_id = :usuario_id`,
      { id: Number(id), usuario_id: Number(usuario_id) }
    );

    if (!resultado.rows || resultado.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Turma não encontrada ou você não tem permissão'
      });
    }

    const turma = resultado.rows[0];

    return res.status(200).json({
      sucesso: true,
      dados: {
        id: turma.ID,
        disciplina_id: turma.DISCIPLINA_ID,
        nome: turma.NOME,
        criado_em: turma.CRIADO_EM
      }
    });

  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao buscar turma'
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    const usuario_id = req.body.usuario_id;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome da turma é obrigatório'
      });
    }

    const turmaCheck = await executeQuery(
      `SELECT t.id
       FROM turmas t
       JOIN disciplinas d ON t.disciplina_id = d.id
       JOIN cursos c ON d.curso_id = c.id
       JOIN instituicoes i ON c.instituicao_id = i.id
       WHERE t.id = :id 
       AND i.usuario_id = :usuario_id`,
      { id, usuario_id }
    );

    if (!turmaCheck.rows || turmaCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Turma não encontrada ou você não tem permissão'
      });
    }

    await executeQuery(
      `UPDATE turmas
       SET nome = :nome
       WHERE id = :id`,
      { id, nome: nome.trim() }
    );

    const resultado = await executeQuery<{
      ID: number;
      DISCIPLINA_ID: number;
      NOME: string;
      CRIADO_EM: Date;
    }>(
      `SELECT id, disciplina_id, nome, criado_em
       FROM turmas
       WHERE id = :id`,
      { id }
    );

    const turmaAtualizada = resultado.rows?.[0];

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Turma atualizada com sucesso',
      dados: {
        id: turmaAtualizada?.ID,
        disciplina_id: turmaAtualizada?.DISCIPLINA_ID,
        nome: turmaAtualizada?.NOME,
        criado_em: turmaAtualizada?.CRIADO_EM
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao atualizar turma'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario_id = Number((req.query.usuario_id as string) || (req.body as any).usuario_id);

    const turmaCheck = await executeQuery(
      `SELECT t.id
       FROM turmas t
       JOIN disciplinas d ON t.disciplina_id = d.id
       JOIN cursos c ON d.curso_id = c.id
       JOIN instituicoes i ON c.instituicao_id = i.id
       WHERE t.id = :id 
       AND i.usuario_id = :usuario_id`,
      { id: Number(id), usuario_id }
    );

    if (!turmaCheck.rows || turmaCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Turma não encontrada ou você não tem permissão'
      });
    }

    const notasCheck = await executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) as total
       FROM notas
       WHERE turma_id = :id`,
      { id: Number(id) }
    );

    const totalNotas = notasCheck.rows?.[0]?.TOTAL || 0;

    if (totalNotas > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível excluir esta turma pois existem ${totalNotas} nota(s) lançada(s). Exclua as notas primeiro.`
      });
    }

    const alunosCheck = await executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) as total
       FROM turmas_alunos
       WHERE turma_id = :id`,
      { id: Number(id) }
    );

    const totalAlunos = alunosCheck.rows?.[0]?.TOTAL || 0;

    if (totalAlunos > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível excluir esta turma pois existem ${totalAlunos} aluno(s) vinculado(s). Desvincule os alunos primeiro.`
      });
    }

    await executeQuery(
      `DELETE FROM turmas WHERE id = :id`,
      { id: Number(id) }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Turma excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao excluir turma'
    });
  }
});

export default router;
