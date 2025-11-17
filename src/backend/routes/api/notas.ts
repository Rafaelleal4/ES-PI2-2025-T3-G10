/**
 * CRUD de Componentes de Nota
 * Autor: Kayo Gabriel
 */
3
import { Router, Request, Response } from 'express';
import { executeQuery } from '../../database/connection';

const router = Router();

/**
 * POST /api/notas
 * Cria ou atualiza uma nota de um aluno em um componente
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { aluno_id, componente_id, nota } = req.body;

    // Validações
    if (!aluno_id || !componente_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Aluno e componente são obrigatórios'
      });
    }

    if (nota < 0 || nota > 10) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'A nota deve estar entre 0 e 10'
      });
    }

    // Verifica se a nota já existe
    const notaExistente = await executeQuery(
      `SELECT id FROM notas WHERE aluno_id = :aluno_id AND componente_id = :componente_id`,
      [aluno_id, componente_id]
    );

    if (notaExistente.rows && notaExistente.rows.length > 0) {
      // Atualiza nota existente
      await executeQuery(
        `UPDATE notas 
         SET nota = :nota, atualizado_em = CURRENT_TIMESTAMP 
         WHERE aluno_id = :aluno_id AND componente_id = :componente_id`,
        { nota, aluno_id, componente_id }
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Nota atualizada com sucesso'
      });
    } else {
      // Insere nova nota
      await executeQuery(
        `INSERT INTO notas (aluno_id, componente_id, nota) 
         VALUES (:aluno_id, :componente_id, :nota)`,
        { aluno_id, componente_id, nota }
      );

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Nota registrada com sucesso'
      });
    }

  } catch (error: any) {
    console.error('Erro ao salvar nota:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao salvar nota',
      erro: error.message
    });
  }
});

/**
 * GET /api/notas?turma_id=1
 * Lista notas de todos os alunos de uma turma
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { turma_id } = req.query;

    if (!turma_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID da turma é obrigatório'
      });
    }

    const resultado = await executeQuery(
      `SELECT a.id AS aluno_id, a.nome AS aluno_nome, 
              c.id AS componente_id, c.nome AS componente_nome,
              n.nota
       FROM alunos a
       JOIN turmas t ON t.id = a.turma_id
       JOIN disciplinas d ON d.id = t.disciplina_id
       JOIN componente_nota c ON c.id_disciplina = d.id
       LEFT JOIN notas n ON n.aluno_id = a.id AND n.componente_id = c.id
       WHERE t.id = :turma_id
       ORDER BY a.nome`,
      [turma_id]
    );

    return res.status(200).json({
      sucesso: true,
      dados: resultado.rows
    });

  } catch (error: any) {
    console.error('Erro ao listar notas:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar notas',
      erro: error.message
    });
  }
});

export default router;
