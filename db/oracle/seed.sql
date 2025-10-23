-- NotaDez - Dados de Teste
-- Projeto Integrador II - Dados iniciais para testes

-- USUÁRIO (PROFESSOR)
-- Senha: senha123
INSERT INTO usuarios (id, nome, email, telefone, senha_hash) VALUES
(1, 'Prof. João Silva', 'joao.silva@puc.br', '(11) 98765-4321', 'senha123');

-- INSTITUIÇÃO
INSERT INTO instituicoes (id, usuario_id, nome) VALUES
(1, 1, 'PUC Campinas');

-- CURSO
INSERT INTO cursos (id, instituicao_id, nome) VALUES
(1, 1, 'Engenharia de Software');

-- DISCIPLINA
INSERT INTO disciplinas (id, curso_id, codigo, nome, sigla, periodo) VALUES
(1, 1, 'PI2', 'Projeto Integrador II', 'PI2', 3);

-- TURMA
INSERT INTO turmas (id, disciplina_id, nome) VALUES
(1, 1, 'Turma G10');

-- COMPONENTES DE NOTA
INSERT INTO componentes_nota (id, disciplina_id, sigla, nome) VALUES (1, 1, 'P1', 'Prova 1');
INSERT INTO componentes_nota (id, disciplina_id, sigla, nome) VALUES (2, 1, 'P2', 'Prova 2');
INSERT INTO componentes_nota (id, disciplina_id, sigla, nome) VALUES (3, 1, 'P3', 'Prova 3');

-- ALUNOS
INSERT INTO alunos (id, usuario_id, identificador, nome) VALUES (1, 1, '2021001234', 'Maria Santos');
INSERT INTO alunos (id, usuario_id, identificador, nome) VALUES (2, 1, '2021001235', 'Pedro Oliveira');
INSERT INTO alunos (id, usuario_id, identificador, nome) VALUES (3, 1, '2021001236', 'Ana Costa');

-- MATRICULAR ALUNOS NA TURMA
INSERT INTO turmas_alunos (turma_id, aluno_id) VALUES (1, 1);
INSERT INTO turmas_alunos (turma_id, aluno_id) VALUES (1, 2);
INSERT INTO turmas_alunos (turma_id, aluno_id) VALUES (1, 3);

-- NOTAS
INSERT INTO notas (turma_id, aluno_id, componente_id, valor, atualizado_por) VALUES (1, 1, 1, 8.50, 1);
INSERT INTO notas (turma_id, aluno_id, componente_id, valor, atualizado_por) VALUES (1, 1, 2, 9.00, 1);
INSERT INTO notas (turma_id, aluno_id, componente_id, valor, atualizado_por) VALUES (1, 1, 3, 9.50, 1);
INSERT INTO notas (turma_id, aluno_id, componente_id, valor, atualizado_por) VALUES (1, 2, 1, 7.00, 1);
INSERT INTO notas (turma_id, aluno_id, componente_id, valor, atualizado_por) VALUES (1, 2, 2, 7.50, 1);
INSERT INTO notas (turma_id, aluno_id, componente_id, valor, atualizado_por) VALUES (1, 3, 1, 6.50, 1);

COMMIT;

-- Verificar dados inseridos
SELECT 'Dados inseridos com sucesso!' AS status FROM dual;
SELECT COUNT(*) AS total_alunos FROM alunos;
SELECT COUNT(*) AS total_notas FROM notas;
