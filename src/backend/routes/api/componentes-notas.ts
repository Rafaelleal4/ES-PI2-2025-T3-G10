/**
 * CRUD de Componentes de Nota
 * Autor: Kayo Gabriel
 */

import { Router, Request, Response } from 'express';
import { executeQuery } from '../../database/connection';

const router = Router();

/**
 * POST /api/componentes-nota
 * Cria um novo componente de nota
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, sigla, disciplina_id } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do componente é obrigatório'
      });
    }

    if (!sigla || !sigla.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'A sigla do componente é obrigatória'
      });
    }

    if (!disciplina_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O ID da disciplina é obrigatório'
      });
    }

    const disciplinaExiste = await executeQuery(
      'SELECT id FROM disciplinas WHERE id = :id',
      { id: disciplina_id }
    );

    if (!disciplinaExiste.rows || disciplinaExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada'
      });
    }

    await executeQuery(
      `INSERT INTO componentes_nota (nome, sigla, disciplina_id)
       VALUES (:nome, :sigla, :disciplina_id)`,
      { nome: nome.trim(), sigla: sigla.trim(), disciplina_id }
    );

    const componenteCriado = await executeQuery(
      `SELECT id, nome, sigla, disciplina_id
       FROM componentes_nota
       WHERE disciplina_id = :disciplina_id
       ORDER BY id DESC
       FETCH FIRST 1 ROWS ONLY`,
      { disciplina_id }
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Componente criado com sucesso',
      dados: componenteCriado.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao criar componente de nota:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar componente de nota',
      erro: error.message
    });
  }
});

/**
 * GET /api/componentes-nota
 * Lista componentes
 * Opcional: ?disciplina_id=X
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { disciplina_id } = req.query;

    let query = `
      SELECT id, nome, sigla, disciplina_id
      FROM componentes_nota
    `;

    if (disciplina_id) {
      query += ` WHERE disciplina_id = :disciplina_id ORDER BY id DESC`;

      const resultado = await executeQuery(query, {
        disciplina_id: Number(disciplina_id)
      });

      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows || []
      });
    }

    query += ` ORDER BY id DESC`;

    const resultadoTodos = await executeQuery(query, {});

    return res.status(200).json({
      sucesso: true,
      dados: resultadoTodos.rows || []
    });

  } catch (error: any) {
    console.error('Erro ao listar componentes:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar componentes',
      erro: error.message
    });
  }
});

/**
 * GET /api/componentes-nota/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resultado = await executeQuery(
      `SELECT id, nome, sigla, disciplina_id
       FROM componentes_nota
       WHERE id = :id`,
      { id: Number(id) }
    );

    if (!resultado.rows || resultado.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Componente de nota não encontrado'
      });
    }

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows[0]
    });

  } catch (error: any) {
    console.error('Erro ao buscar componente:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar componente de nota',
      erro: error.message
    });
  }
});

/**
 * PUT /api/componentes-nota/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, sigla, disciplina_id } = req.body;

    if (!nome || !sigla || !disciplina_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, sigla e ID da disciplina são obrigatórios'
      });
    }

    const existe = await executeQuery(
      'SELECT id FROM componentes_nota WHERE id = :id',
      { id: Number(id) }
    );

    if (!existe.rows || existe.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Componente de nota não encontrado'
      });
    }

    await executeQuery(
      `UPDATE componentes_nota
       SET nome = :nome,
           sigla = :sigla,
           disciplina_id = :disciplina_id
       WHERE id = :id`,
      { nome, sigla, disciplina_id, id: Number(id) }
    );

    const atualizado = await executeQuery(
      `SELECT id, nome, sigla, disciplina_id
       FROM componentes_nota
       WHERE id = :id`,
      { id: Number(id) }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Componente atualizado com sucesso',
      dados: atualizado.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao atualizar componente:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar componente',
      erro: error.message
    });
  }
});

/**
 * DELETE /api/componentes-nota/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await executeQuery(
      'SELECT id FROM componentes_nota WHERE id = :id',
      { id: Number(id) }
    );

    if (!existe.rows || existe.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Componente de nota não encontrado'
      });
    }

    await executeQuery(
      'DELETE FROM componentes_nota WHERE id = :id',
      { id: Number(id) }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Componente excluído com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao excluir componente:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao excluir componente',
      erro: error.message
    });
  }
});

export default router;
