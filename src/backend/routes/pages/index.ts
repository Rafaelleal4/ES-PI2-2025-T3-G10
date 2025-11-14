/**
 * Autor: Rafael Leal
 */

import { Express } from 'express';
import { registerLoginRoutes } from './login';
import { registerCadastroRoutes } from './cadastro';
import { registerRecuperacaoSenhaRoutes } from './recuperacao-senha';
import { registerDashboardRoutes } from './dashboard';
import { registerInstituicoesRoutes } from './instituicoes';
import { registerRedefinirSenhaRoutes } from './redefinir-senha';
import { registerCursosRoutes } from './cursos';
import { registerDisciplinasRoutes } from './disciplinas';
import { registerTurmasRoutes } from './turmas';
import { registerAlunosRoutes } from './alunos';
import { registerNotasRoutes } from './notas';

export function registerPageRoutes(app: Express, screensDir: string): void {
  registerLoginRoutes(app, screensDir);
  registerCadastroRoutes(app, screensDir);
  registerRecuperacaoSenhaRoutes(app, screensDir);
  registerRedefinirSenhaRoutes(app, screensDir);
  registerDashboardRoutes(app, screensDir);
  registerInstituicoesRoutes(app, screensDir);
  registerCursosRoutes(app, screensDir);
  registerDisciplinasRoutes(app, screensDir);
  registerTurmasRoutes(app, screensDir);
  registerAlunosRoutes(app, screensDir);
  registerNotasRoutes(app, screensDir);

  // Rota raiz - redireciona para dashboard
  app.get('/', (req, res) => {
    res.redirect('/dashboard');
  });
}
