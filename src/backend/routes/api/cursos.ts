/**
 * CRUD de Cursos
 * Autor: Rafael Leal
 */

import { Router, Request, Response } from 'express';
import { executeQuery } from '../../database/connection';

const router = Router();

/**
 * POST /api/cursos
 * Cria um novo curso vinculado a uma instituição
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, instituicao_id } = req.body;

    // Validações
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do curso é obrigatório'
      });
    }

    if (!instituicao_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID da instituição é obrigatório'
      });
    }

    // Verificar se a instituição existe
    const instituicaoExiste = await executeQuery(
      'SELECT id FROM instituicoes WHERE id = :id',
      [instituicao_id]
    );

    if (!instituicaoExiste.rows || instituicaoExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Instituição não encontrada'
      });
    }

    // Inserir curso
    await executeQuery(
      `INSERT INTO cursos (instituicao_id, nome) 
       VALUES (:instituicao_id, :nome)`,
      {
        instituicao_id,
        nome: nome.trim()
      }
    );

    // Buscar o último curso criado para esta instituição
    const cursoCriado = await executeQuery(
      `SELECT id, instituicao_id, nome, criado_em 
       FROM cursos 
       WHERE instituicao_id = :instituicao_id 
       ORDER BY criado_em DESC 
       FETCH FIRST 1 ROWS ONLY`,
      [instituicao_id]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Curso criado com sucesso',
      dados: cursoCriado.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao criar curso:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar curso',
      erro: error.message
    });
  }
});

/**
 * GET /api/cursos
 * Lista todos os cursos
 * Query params: ?instituicao_id=X (opcional)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instituicao_id } = req.query;

    let query = 'SELECT id, instituicao_id, nome, criado_em FROM cursos';
    let params: any[] = [];

    if (instituicao_id) {
      query += ' WHERE instituicao_id = :instituicao_id';
      params = [Number(instituicao_id)];
    }

    query += ' ORDER BY criado_em DESC';

    const resultado = await executeQuery(query, params);

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows || []
    });

  } catch (error: any) {
    console.error('Erro ao listar cursos:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar cursos',
      erro: error.message
    });
  }
});

/**
 * GET /api/cursos/:id
 * Busca um curso específico por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resultado = await executeQuery(
      'SELECT id, instituicao_id, nome, criado_em FROM cursos WHERE id = :id',
      [Number(id)]
    );

    if (!resultado.rows || resultado.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Curso não encontrado'
      });
    }

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows[0]
    });

  } catch (error: any) {
    console.error('Erro ao buscar curso:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar curso',
      erro: error.message
    });
  }
});

/**
 * PUT /api/cursos/:id
 * Atualiza um curso existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, instituicao_id } = req.body;

    // Validações
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do curso é obrigatório'
      });
    }

    // Verificar se o curso existe
    const cursoExiste = await executeQuery(
      'SELECT id FROM cursos WHERE id = :id',
      [Number(id)]
    );

    if (!cursoExiste.rows || cursoExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Curso não encontrado'
      });
    }

    // Se instituicao_id for fornecido, verificar se existe
    if (instituicao_id) {
      const instituicaoExiste = await executeQuery(
        'SELECT id FROM instituicoes WHERE id = :id',
        [instituicao_id]
      );

      if (!instituicaoExiste.rows || instituicaoExiste.rows.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Instituição não encontrada'
        });
      }
    }

    // Atualizar curso
    let query = 'UPDATE cursos SET nome = :nome';
    const params: any = { nome: nome.trim(), id: Number(id) };

    if (instituicao_id) {
      query += ', instituicao_id = :instituicao_id';
      params.instituicao_id = instituicao_id;
    }

    query += ' WHERE id = :id';

    await executeQuery(query, params);

    // Buscar curso atualizado
    const cursoAtualizado = await executeQuery(
      'SELECT id, instituicao_id, nome, criado_em FROM cursos WHERE id = :id',
      [Number(id)]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Curso atualizado com sucesso',
      dados: cursoAtualizado.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao atualizar curso:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar curso',
      erro: error.message
    });
  }
});

/**
 * DELETE /api/cursos/:id
 * Exclui um curso
 * REGRA: Não pode excluir se tiver disciplinas vinculadas
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o curso existe
    const cursoExiste = await executeQuery(
      'SELECT id, nome FROM cursos WHERE id = :id',
      [Number(id)]
    );

    if (!cursoExiste.rows || cursoExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Curso não encontrado'
      });
    }

    // Verificar se há disciplinas vinculadas
    const disciplinasVinculadas = await executeQuery(
      'SELECT COUNT(*) as total FROM disciplinas WHERE curso_id = :id',
      [Number(id)]
    );

    const totalDisciplinas = disciplinasVinculadas.rows?.[0]?.TOTAL || 0;

    if (totalDisciplinas > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível excluir este curso pois ele possui ${totalDisciplinas} disciplina(s) vinculada(s). Exclua as disciplinas primeiro.`
      });
    }

    // Excluir curso
    await executeQuery(
      'DELETE FROM cursos WHERE id = :id',
      [Number(id)]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Curso excluído com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao excluir curso:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao excluir curso',
      erro: error.message
    });
  }
});

export default router;
