/**
 * CRUD de Alunos
 * Autor: Rafael Leal
 */

import { Router, Request, Response } from 'express';
import { executeQuery } from '../../database/connection';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { identificador, nome } = req.body;
    const usuario_id = req.body.usuario_id;

    if (!identificador || !identificador.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O identificador do aluno é obrigatório'
      });
    }

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do aluno é obrigatório'
      });
    }

    const alunoExiste = await executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) AS TOTAL
       FROM alunos
       WHERE usuario_id = :usuario_id 
       AND UPPER(identificador) = UPPER(:identificador)`,
      { usuario_id, identificador: identificador.trim() }
    );

    console.log('Verificação de duplicidade:', {
      usuario_id,
      identificador: identificador.trim(),
      resultado: alunoExiste.rows,
      total: alunoExiste.rows?.[0]?.TOTAL
    });

    if (alunoExiste.rows && alunoExiste.rows[0].TOTAL > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Já existe um aluno com este identificador'
      });
    }

    await executeQuery(
      `INSERT INTO alunos (usuario_id, identificador, nome)
       VALUES (:usuario_id, :identificador, :nome)`,
      {
        usuario_id,
        identificador: identificador.trim(),
        nome: nome.trim()
      }
    );

    const resultado = await executeQuery<{
      ID: number;
      USUARIO_ID: number;
      IDENTIFICADOR: string;
      NOME: string;
      CRIADO_EM: Date;
    }>(
      `SELECT id, usuario_id, identificador, nome, criado_em
       FROM alunos
       WHERE usuario_id = :usuario_id
       ORDER BY criado_em DESC
       FETCH FIRST 1 ROWS ONLY`,
      { usuario_id }
    );

    const novoAluno = resultado.rows?.[0];

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Aluno criado com sucesso',
      dados: {
        id: novoAluno?.ID,
        usuario_id: novoAluno?.USUARIO_ID,
        identificador: novoAluno?.IDENTIFICADOR,
        nome: novoAluno?.NOME,
        criado_em: novoAluno?.CRIADO_EM
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar aluno:', error);
    
    if (error.errorNum === 1 || error.code === 'ORA-00001') {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Já existe um aluno com este identificador'
      });
    }
    
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao criar aluno'
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const usuario_id = req.query.usuario_id || req.body.usuario_id;

    const resultado = await executeQuery<{
      ID: number;
      USUARIO_ID: number;
      IDENTIFICADOR: string;
      NOME: string;
      CRIADO_EM: Date;
    }>(
      `SELECT id, usuario_id, identificador, nome, criado_em
       FROM alunos
       WHERE usuario_id = :usuario_id
       ORDER BY nome ASC`,
      { usuario_id }
    );

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows?.map(a => ({
        id: a.ID,
        usuario_id: a.USUARIO_ID,
        identificador: a.IDENTIFICADOR,
        nome: a.NOME,
        criado_em: a.CRIADO_EM
      })) || []
    });

  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao listar alunos'
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario_id = req.query.usuario_id || req.body.usuario_id;

    const resultado = await executeQuery<{
      ID: number;
      USUARIO_ID: number;
      IDENTIFICADOR: string;
      NOME: string;
      CRIADO_EM: Date;
    }>(
      `SELECT id, usuario_id, identificador, nome, criado_em
       FROM alunos
       WHERE id = :id 
       AND usuario_id = :usuario_id`,
      { id, usuario_id }
    );

    if (!resultado.rows || resultado.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno não encontrado ou você não tem permissão'
      });
    }

    const aluno = resultado.rows[0];

    return res.status(200).json({
      sucesso: true,
      dados: {
        id: aluno.ID,
        usuario_id: aluno.USUARIO_ID,
        identificador: aluno.IDENTIFICADOR,
        nome: aluno.NOME,
        criado_em: aluno.CRIADO_EM
      }
    });

  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao buscar aluno'
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { identificador, nome } = req.body;
    const usuario_id = req.body.usuario_id;

    if (!identificador || !identificador.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O identificador do aluno é obrigatório'
      });
    }

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do aluno é obrigatório'
      });
    }

    const alunoCheck = await executeQuery(
      `SELECT id
       FROM alunos
       WHERE id = :id 
       AND usuario_id = :usuario_id`,
      { id, usuario_id }
    );

    if (!alunoCheck.rows || alunoCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno não encontrado ou você não tem permissão'
      });
    }

    const identificadorExiste = await executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) AS TOTAL
       FROM alunos
       WHERE usuario_id = :usuario_id 
       AND UPPER(identificador) = UPPER(:identificador)
       AND id != :id`,
      { usuario_id, identificador: identificador.trim(), id }
    );

    if (identificadorExiste.rows && identificadorExiste.rows[0].TOTAL > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Já existe outro aluno com este identificador'
      });
    }

    await executeQuery(
      `UPDATE alunos
       SET identificador = :identificador,
           nome = :nome
       WHERE id = :id`,
      {
        id,
        identificador: identificador.trim(),
        nome: nome.trim()
      }
    );

    const resultado = await executeQuery<{
      ID: number;
      USUARIO_ID: number;
      IDENTIFICADOR: string;
      NOME: string;
      CRIADO_EM: Date;
    }>(
      `SELECT id, usuario_id, identificador, nome, criado_em
       FROM alunos
       WHERE id = :id`,
      { id }
    );

    const alunoAtualizado = resultado.rows?.[0];

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Aluno atualizado com sucesso',
      dados: {
        id: alunoAtualizado?.ID,
        usuario_id: alunoAtualizado?.USUARIO_ID,
        identificador: alunoAtualizado?.IDENTIFICADOR,
        nome: alunoAtualizado?.NOME,
        criado_em: alunoAtualizado?.CRIADO_EM
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao atualizar aluno'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario_id = Number((req.query.usuario_id as string) || (req.body as any).usuario_id);

    const alunoCheck = await executeQuery(
      `SELECT id
       FROM alunos
       WHERE id = :id 
       AND usuario_id = :usuario_id`,
      { id: Number(id), usuario_id }
    );

    if (!alunoCheck.rows || alunoCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno não encontrado ou você não tem permissão'
      });
    }

    const notasCheck = await executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) AS TOTAL
       FROM notas
       WHERE aluno_id = :id`,
      { id: Number(id) }
    );

    const totalNotas = notasCheck.rows?.[0]?.TOTAL || 0;

    if (totalNotas > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível excluir este aluno pois existem ${totalNotas} nota(s) lançada(s). Exclua as notas primeiro.`
      });
    }

    await executeQuery(
      `DELETE FROM turmas_alunos WHERE aluno_id = :id`,
      { id: Number(id) }
    );

    await executeQuery(
      `DELETE FROM alunos WHERE id = :id`,
      { id: Number(id) }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Aluno excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao excluir aluno'
    });
  }
});

router.post('/:id/vincular-turma', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { turma_id } = req.body;
    const usuario_id = req.body.usuario_id;

    if (!turma_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID da turma é obrigatório'
      });
    }

    const alunoCheck = await executeQuery(
      `SELECT id
       FROM alunos
       WHERE id = :id 
       AND usuario_id = :usuario_id`,
      { id, usuario_id }
    );

    if (!alunoCheck.rows || alunoCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno não encontrado ou você não tem permissão'
      });
    }

    const turmaCheck = await executeQuery(
      `SELECT t.id
       FROM turmas t
       JOIN disciplinas d ON t.disciplina_id = d.id
       JOIN cursos c ON d.curso_id = c.id
       JOIN instituicoes i ON c.instituicao_id = i.id
       WHERE t.id = :turma_id 
       AND i.usuario_id = :usuario_id`,
      { turma_id, usuario_id }
    );

    if (!turmaCheck.rows || turmaCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Turma não encontrada ou você não tem permissão'
      });
    }

    const vinculoExiste = await executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) as total
       FROM turmas_alunos
       WHERE turma_id = :turma_id 
       AND aluno_id = :aluno_id`,
      { turma_id, aluno_id: id }
    );

    if (vinculoExiste.rows && vinculoExiste.rows[0].TOTAL > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Aluno já está vinculado a esta turma'
      });
    }

    await executeQuery(
      `INSERT INTO turmas_alunos (turma_id, aluno_id)
       VALUES (:turma_id, :aluno_id)`,
      { turma_id, aluno_id: id }
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Aluno vinculado à turma com sucesso'
    });

  } catch (error) {
    console.error('Erro ao vincular aluno à turma:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao vincular aluno à turma'
    });
  }
});

router.delete('/:id/desvincular-turma/:turma_id', async (req: Request, res: Response) => {
  try {
    const { id, turma_id } = req.params;
    const usuario_id = Number((req.query.usuario_id as string) || (req.body as any).usuario_id);

    const alunoCheck = await executeQuery(
      `SELECT id
       FROM alunos
       WHERE id = :id 
       AND usuario_id = :usuario_id`,
      { id: Number(id), usuario_id }
    );

    if (!alunoCheck.rows || alunoCheck.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno não encontrado ou você não tem permissão'
      });
    }

    await executeQuery(
      `DELETE FROM turmas_alunos
       WHERE turma_id = :turma_id 
       AND aluno_id = :aluno_id`,
      { turma_id: Number(turma_id), aluno_id: Number(id) }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Aluno desvinculado da turma com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desvincular aluno da turma:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao desvincular aluno da turma'
    });
  }
});

export default router;
