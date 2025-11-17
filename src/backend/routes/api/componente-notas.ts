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
    const { nome, sigla, descricao, id_disciplina, peso } = req.body;

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

    if (!id_disciplina) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O ID da disciplina é obrigatório'
      });
    }

    if (peso < 0 || peso > 1) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O peso do componente deve estar entre 0 e 1 (exemplo: 0.2 para 20%)'
      });
    }

    const disciplinaExiste = await executeQuery(
      'SELECT id FROM disciplinas WHERE id = :id',
      [id_disciplina]
    );

    if (!disciplinaExiste.rows || disciplinaExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada'
      });
    }

    await executeQuery(
      `INSERT INTO componente_nota (nome, sigla, descricao, id_disciplina, peso)
       VALUES (:nome, :sigla, :descricao, :id_disciplina, :peso)`,
      { nome: nome.trim(), sigla: sigla.trim(), descricao, id_disciplina, peso }
    );

    const componenteCriado = await executeQuery(
      `SELECT id, nome, sigla, descricao, id_disciplina, peso
       FROM componente_nota
       WHERE id_disciplina = :id_disciplina
       ORDER BY id DESC
       FETCH FIRST 1 ROWS ONLY`,
      [id_disciplina]
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
 * Opcional: ?id_disciplina=X
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { id_disciplina } = req.query;

    let query = `
      SELECT id, nome, sigla, descricao, id_disciplina, peso
      FROM componente_nota
    `;

    // Se veio disciplina, filtra
    if (id_disciplina) {
      query += ` WHERE id_disciplina = :id_disciplina ORDER BY id DESC`;

      const resultado = await executeQuery(query, [Number(id_disciplina)]);

      return res.status(200).json({
        sucesso: true,
        dados: resultado.rows || []
      });
    }

    // Se não veio → lista tudo
    query += ` ORDER BY id DESC`;

    const resultadoTodos = await executeQuery(query, []);

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
      `SELECT id, nome, sigla, descricao, id_disciplina, peso
       FROM componente_nota
       WHERE id = :id`,
      [Number(id)]
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
    const { nome, sigla, descricao, id_disciplina, peso } = req.body;

    if (!nome || !sigla || !id_disciplina) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, sigla e ID da disciplina são obrigatórios'
      });
    }

    if (peso < 0 || peso > 1) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O peso deve estar entre 0 e 1'
      });
    }

    const existe = await executeQuery(
      'SELECT id FROM componente_nota WHERE id = :id',
      [Number(id)]
    );

    if (!existe.rows || existe.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Componente de nota não encontrado'
      });
    }

    await executeQuery(
      `UPDATE componente_nota
       SET nome = :nome,
           sigla = :sigla,
           descricao = :descricao,
           id_disciplina = :id_disciplina,
           peso = :peso
       WHERE id = :id`,
      { nome, sigla, descricao, id_disciplina, peso, id: Number(id) }
    );

    const atualizado = await executeQuery(
      `SELECT id, nome, sigla, descricao, id_disciplina, peso
       FROM componente_nota
       WHERE id = :id`,
      [Number(id)]
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
      'SELECT id FROM componente_nota WHERE id = :id',
      [Number(id)]
    );

    if (!existe.rows || existe.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Componente de nota não encontrado'
      });
    }

    await executeQuery(
      'DELETE FROM componente_nota WHERE id = :id',
      [Number(id)]
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
