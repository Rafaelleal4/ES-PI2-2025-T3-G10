import { Express } from 'express';
import authRoutes from './auth';
import instituicoesRoutes from './instituicoes';
import cursosRoutes from './cursos';
import disciplinasRoutes from './disciplinas';

export function registerApiRoutes(app: Express): void {
  // Rotas de autenticação
  app.use('/api/auth', authRoutes);

  // Rotas de instituições
  app.use('/api/instituicoes', instituicoesRoutes);

  // Rotas de cursos
  app.use('/api/cursos', cursosRoutes);

  // Rotas de disciplinas
  app.use('/api/disciplinas', disciplinasRoutes);

  // Futuras rotas de API podem ser adicionadas aqui, ex:
  // app.use('/api/turmas', turmasRoutes);
  // app.use('/api/alunos', alunosRoutes);
}
