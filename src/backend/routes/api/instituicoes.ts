import { Router, Request, Response } from 'express';
import { executeQuery } from '../../database/connection';

const router = Router();

/**
 * POST /api/instituicoes
 * Cria uma nova instituição para o professor logado
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, usuario_id } = req.body;

    // Validações
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome da instituição é obrigatório'
      });
    }

    if (!usuario_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do usuário é obrigatório'
      });
    }

    // Verificar se o usuário existe
    const usuarioExiste = await executeQuery(
      'SELECT id FROM usuarios WHERE id = :id',
      [usuario_id]
    );

    if (!usuarioExiste.rows || usuarioExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Inserir instituição
    await executeQuery(
      `INSERT INTO instituicoes (usuario_id, nome) 
       VALUES (:usuario_id, :nome)`,
      {
        usuario_id,
        nome: nome.trim()
      }
    );

    // Buscar a última instituição criada por este usuário
    const instituicaoCriada = await executeQuery(
      `SELECT id, usuario_id, nome, criado_em 
       FROM instituicoes 
       WHERE usuario_id = :usuario_id 
       ORDER BY criado_em DESC 
       FETCH FIRST 1 ROWS ONLY`,
      [usuario_id]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Instituição criada com sucesso',
      dados: instituicaoCriada.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao criar instituição:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar instituição',
      erro: error.message
    });
  }
});

/**
 * GET /api/instituicoes
 * Lista todas as instituições do professor logado
 * Query params: ?usuario_id=X
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do usuário é obrigatório'
      });
    }

    const resultado = await executeQuery(
      `SELECT id, usuario_id, nome, criado_em 
       FROM instituicoes 
       WHERE usuario_id = :usuario_id 
       ORDER BY criado_em DESC`,
      [Number(usuario_id)]
    );

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows || []
    });

  } catch (error: any) {
    console.error('Erro ao listar instituições:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar instituições',
      erro: error.message
    });
  }
});

/**
 * GET /api/instituicoes/:id
 * Busca uma instituição específica por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do usuário é obrigatório'
      });
    }

    const resultado = await executeQuery(
      `SELECT id, usuario_id, nome, criado_em 
       FROM instituicoes 
       WHERE id = :id AND usuario_id = :usuario_id`,
      [Number(id), Number(usuario_id)]
    );

    if (!resultado.rows || resultado.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Instituição não encontrada'
      });
    }

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows[0]
    });

  } catch (error: any) {
    console.error('Erro ao buscar instituição:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar instituição',
      erro: error.message
    });
  }
});

/**
 * PUT /api/instituicoes/:id
 * Atualiza uma instituição existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, usuario_id } = req.body;

    // Validações
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome da instituição é obrigatório'
      });
    }

    if (!usuario_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do usuário é obrigatório'
      });
    }

    // Verificar se a instituição existe e pertence ao usuário
    const instituicaoExiste = await executeQuery(
      'SELECT id FROM instituicoes WHERE id = :id AND usuario_id = :usuario_id',
      [Number(id), usuario_id]
    );

    if (!instituicaoExiste.rows || instituicaoExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Instituição não encontrada ou você não tem permissão para editá-la'
      });
    }

    // Atualizar instituição
    await executeQuery(
      'UPDATE instituicoes SET nome = :nome WHERE id = :id',
      { nome: nome.trim(), id: Number(id) }
    );

    // Buscar instituição atualizada
    const instituicaoAtualizada = await executeQuery(
      'SELECT id, usuario_id, nome, criado_em FROM instituicoes WHERE id = :id',
      [Number(id)]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Instituição atualizada com sucesso',
      dados: instituicaoAtualizada.rows?.[0]
    });

  } catch (error: any) {
    console.error('Erro ao atualizar instituição:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar instituição',
      erro: error.message
    });
  }
});

/**
 * DELETE /api/instituicoes/:id
 * Exclui uma instituição
 * REGRA: Não pode excluir se tiver cursos vinculados
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do usuário é obrigatório'
      });
    }

    // Verificar se a instituição existe e pertence ao usuário
    const instituicaoExiste = await executeQuery(
      'SELECT id, nome FROM instituicoes WHERE id = :id AND usuario_id = :usuario_id',
      [Number(id), Number(usuario_id)]
    );

    if (!instituicaoExiste.rows || instituicaoExiste.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Instituição não encontrada ou você não tem permissão para excluí-la'
      });
    }

    // Verificar se há cursos vinculados
    const cursosVinculados = await executeQuery(
      'SELECT COUNT(*) as total FROM cursos WHERE instituicao_id = :id',
      [Number(id)]
    );

    const totalCursos = cursosVinculados.rows?.[0]?.TOTAL || 0;

    if (totalCursos > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível excluir esta instituição pois ela possui ${totalCursos} curso(s) vinculado(s). Exclua os cursos primeiro.`
      });
    }

    // Excluir instituição
    await executeQuery(
      'DELETE FROM instituicoes WHERE id = :id',
      [Number(id)]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Instituição excluída com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao excluir instituição:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao excluir instituição',
      erro: error.message
    });
  }
});

export default router;
