import { Express } from 'express';
import authRoutes from '../auth';

export function registerApiRoutes(app: Express): void {
  // Rotas de autenticação
  app.use('/api/auth', authRoutes);

  // Futuras rotas de API podem ser adicionadas aqui, ex:
  // app.use('/api/instituicoes', instituicoesRoutes);
  // app.use('/api/cursos', cursosRoutes);
  // app.use('/api/disciplinas', disciplinasRoutes);
}
