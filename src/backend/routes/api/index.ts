import { Express } from 'express';
import authRoutes from './auth';
import instituicoesRoutes from './instituicoes';
import cursosRoutes from './cursos';
import disciplinasRoutes from './disciplinas';
import turmasRoutes from './turmas';
import alunosRoutes from './alunos';

export function registerApiRoutes(app: Express): void {
  // Rotas de autenticação
  app.use('/api/auth', authRoutes);

  // Rotas de instituições
  app.use('/api/instituicoes', instituicoesRoutes);

  // Rotas de cursos
  app.use('/api/cursos', cursosRoutes);

  // Rotas de disciplinas
  app.use('/api/disciplinas', disciplinasRoutes);

  // Rotas de turmas
  app.use('/api/turmas', turmasRoutes);

  // Rotas de alunos
  app.use('/api/alunos', alunosRoutes);
}
