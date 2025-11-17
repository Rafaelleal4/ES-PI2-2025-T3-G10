import { Router, Request, Response } from "express";
import { executeQuery } from "../../database/connection";

const router = Router();

/**
 * POST /api/notas
 * Cria ou atualiza uma nota
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { turma_id, aluno_id, componente_id, valor, atualizado_por } = req.body;

    const turmaId = Number(turma_id);
    const alunoId = Number(aluno_id);
    const componenteId = Number(componente_id);
    const valorNum = Number(valor);
    const atualizadoPorId = Number(atualizado_por);

    if (isNaN(turmaId) || isNaN(alunoId) || isNaN(componenteId) || isNaN(atualizadoPorId)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "turma_id, aluno_id, componente_id e atualizado_por são obrigatórios."
      });
    }

    if (isNaN(valorNum) || valorNum < 0 || valorNum > 10) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "O valor da nota deve ser um número entre 0 e 10."
      });
    }

    // Verifica se a nota já existe
    const existe = await executeQuery(
      `SELECT id
         FROM notas
        WHERE aluno_id = :aluno_id
          AND componente_id = :componente_id
          AND turma_id = :turma_id`,
      { aluno_id: alunoId, componente_id: componenteId, turma_id: turmaId }
    );

    if (existe.rows?.length) {
      // Atualiza nota existente
      await executeQuery(
        `UPDATE notas
            SET valor = :valor,
                atualizado_por = :atualizado_por,
                atualizado_em = SYSTIMESTAMP
          WHERE aluno_id = :aluno_id
            AND componente_id = :componente_id
            AND turma_id = :turma_id`,
        { valor: valorNum, atualizado_por: atualizadoPorId, aluno_id: alunoId, componente_id: componenteId, turma_id: turmaId }
      );

      return res.json({
        sucesso: true,
        mensagem: "Nota atualizada com sucesso."
      });
    }

    // Insere nova nota
    await executeQuery(
      `INSERT INTO notas (turma_id, aluno_id, componente_id, valor, atualizado_por)
       VALUES (:turma_id, :aluno_id, :componente_id, :valor, :atualizado_por)`,
      { turma_id: turmaId, aluno_id: alunoId, componente_id: componenteId, valor: valorNum, atualizado_por: atualizadoPorId }
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Nota cadastrada com sucesso."
    });

  } catch (error: any) {
    console.error("Erro ao cadastrar nota:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar nota.",
      erro: error.message
    });
  }
});

/**
 * GET /api/notas?turma_id=1
 * Lista notas de uma turma
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { turma_id } = req.query;

    const turmaId = Number(turma_id);
    if (isNaN(turmaId)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "turma_id é obrigatório."
      });
    }

    const resultado = await executeQuery(
      `SELECT n.id,
              a.nome AS aluno,
              c.nome AS componente,
              n.valor,
              n.atualizado_em
         FROM notas n
         JOIN alunos a ON a.id = n.aluno_id
         JOIN componentes_nota c ON c.id = n.componente_id
        WHERE n.turma_id = :turma_id
        ORDER BY a.nome`,
      { turma_id: turmaId }
    );

    return res.json({
      sucesso: true,
      dados: resultado.rows || []
    });

  } catch (error: any) {
    console.error("Erro ao listar notas:", error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar notas.",
      erro: error.message
    });
  }
});

export default router;
