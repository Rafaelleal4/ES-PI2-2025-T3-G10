import { Router, Request, Response } from 'express';
import { executeQuery } from '../../database/connection';

const router = Router();

/**
 * POST /api/disciplinas
 * Cria uma nova disciplina vinculada a um curso
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { curso_id, codigo, nome, sigla, periodo } = req.body;

    // Validações
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome da disciplina é obrigatório'
      });
    }

    if (!sigla || !sigla.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'A sigla da disciplina é obrigatória'
      });
    }

    if (!curso_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do curso é obrigatório'
      });
    }

    // Verificar se o curso existe
    const cursoExiste = await executeQuery(
      'SELECT id FROM cursos WHERE id = :id',
      [curso_id]
    );

    if (!cursoExiste.rows || cursoExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Curso não encontrado'
      });
    }

    // Verificar se já existe uma disciplina com a mesma sigla neste curso
    const siglaExiste = await executeQuery(
      'SELECT id FROM disciplinas WHERE curso_id = :curso_id AND sigla = :sigla',
      [curso_id, sigla.trim().toUpperCase()]
    );

    if (siglaExiste.rows && siglaExiste.rows.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Já existe uma disciplina com a sigla "${sigla}" neste curso`
      });
    }

    // Inserir disciplina
    await executeQuery(
      `INSERT INTO disciplinas (curso_id, codigo, nome, sigla, periodo) 
       VALUES (:curso_id, :codigo, :nome, :sigla, :periodo)`,
      {
        curso_id,
        codigo: codigo ? codigo.trim() : null,
        nome: nome.trim(),
        sigla: sigla.trim().toUpperCase(),
        periodo: periodo || null
      }
    );

    // Buscar a última disciplina criada para este curso
    const disciplinaCriada = await executeQuery(
      `SELECT id, curso_id, codigo, nome, sigla, periodo, criado_em 
       FROM disciplinas 
       WHERE curso_id = :curso_id 
       ORDER BY criado_em DESC 
       FETCH FIRST 1 ROWS ONLY`,
      [curso_id]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Disciplina criada com sucesso',
      dados: disciplinaCriada.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao criar disciplina:', error);
    
    // Tratamento específico para erro de constraint única
    if (error.message && error.message.includes('UK_DISCIPLINAS_CURSO_SIGLA')) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Já existe uma disciplina com esta sigla neste curso'
      });
    }
    
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar disciplina',
      erro: error.message
    });
  }
});

/**
 * GET /api/disciplinas
 * Lista todas as disciplinas
 * Query params: ?curso_id=X (opcional)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { curso_id } = req.query;

    let query = 'SELECT id, curso_id, codigo, nome, sigla, periodo, criado_em FROM disciplinas';
    let params: any[] = [];

    if (curso_id) {
      query += ' WHERE curso_id = :curso_id';
      params = [Number(curso_id)];
    }

    query += ' ORDER BY criado_em DESC';

    const resultado = await executeQuery(query, params);

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows || []
    });

  } catch (error: any) {
    console.error('Erro ao listar disciplinas:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar disciplinas',
      erro: error.message
    });
  }
});

/**
 * GET /api/disciplinas/:id
 * Busca uma disciplina específica por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resultado = await executeQuery(
      'SELECT id, curso_id, codigo, nome, sigla, periodo, criado_em FROM disciplinas WHERE id = :id',
      [Number(id)]
    );

    if (!resultado.rows || resultado.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada'
      });
    }

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows[0]
    });

  } catch (error: any) {
    console.error('Erro ao buscar disciplina:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar disciplina',
      erro: error.message
    });
  }
});

/**
 * PUT /api/disciplinas/:id
 * Atualiza uma disciplina existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { codigo, nome, sigla, periodo } = req.body;

    // Validações
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome da disciplina é obrigatório'
      });
    }

    if (!sigla || !sigla.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'A sigla da disciplina é obrigatória'
      });
    }

    // Verificar se a disciplina existe
    const disciplinaExiste = await executeQuery(
      'SELECT id, curso_id FROM disciplinas WHERE id = :id',
      [Number(id)]
    );

    if (!disciplinaExiste.rows || disciplinaExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada'
      });
    }

    const cursoId = disciplinaExiste.rows[0].CURSO_ID;

    // Verificar se a sigla já está em uso por outra disciplina do mesmo curso
    const siglaEmUso = await executeQuery(
      'SELECT id FROM disciplinas WHERE curso_id = :curso_id AND sigla = :sigla AND id != :id',
      [cursoId, sigla.trim().toUpperCase(), Number(id)]
    );

    if (siglaEmUso.rows && siglaEmUso.rows.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Já existe outra disciplina com a sigla "${sigla}" neste curso`
      });
    }

    // Atualizar disciplina
    await executeQuery(
      `UPDATE disciplinas 
       SET codigo = :codigo, nome = :nome, sigla = :sigla, periodo = :periodo 
       WHERE id = :id`,
      {
        codigo: codigo ? codigo.trim() : null,
        nome: nome.trim(),
        sigla: sigla.trim().toUpperCase(),
        periodo: periodo || null,
        id: Number(id)
      }
    );

    // Buscar disciplina atualizada
    const disciplinaAtualizada = await executeQuery(
      'SELECT id, curso_id, codigo, nome, sigla, periodo, criado_em FROM disciplinas WHERE id = :id',
      [Number(id)]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Disciplina atualizada com sucesso',
      dados: disciplinaAtualizada.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao atualizar disciplina:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar disciplina',
      erro: error.message
    });
  }
});

/**
 * DELETE /api/disciplinas/:id
 * Exclui uma disciplina
 * REGRA: Não pode excluir se tiver turmas vinculadas
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se a disciplina existe
    const disciplinaExiste = await executeQuery(
      'SELECT id, nome FROM disciplinas WHERE id = :id',
      [Number(id)]
    );

    if (!disciplinaExiste.rows || disciplinaExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Disciplina não encontrada'
      });
    }

    // Verificar se há turmas vinculadas
    const turmasVinculadas = await executeQuery(
      'SELECT COUNT(*) as total FROM turmas WHERE disciplina_id = :id',
      [Number(id)]
    );

    const totalTurmas = turmasVinculadas.rows?.[0]?.TOTAL || 0;

    if (totalTurmas > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível excluir esta disciplina pois ela possui ${totalTurmas} turma(s) vinculada(s). Exclua as turmas primeiro.`
      });
    }

    // Excluir disciplina
    await executeQuery(
      'DELETE FROM disciplinas WHERE id = :id',
      [Number(id)]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Disciplina excluída com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao excluir disciplina:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao excluir disciplina',
      erro: error.message
    });
  }
});

export default router;
