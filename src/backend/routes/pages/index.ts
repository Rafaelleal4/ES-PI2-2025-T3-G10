import { Express } from 'express';
import { registerLoginRoutes } from './login';
import { registerCadastroRoutes } from './cadastro';
import { registerRecuperacaoSenhaRoutes } from './recuperacao-senha';
import { registerHomeRoutes } from './home';

export function registerPageRoutes(app: Express, screensDir: string): void {
  registerLoginRoutes(app, screensDir);
  registerCadastroRoutes(app, screensDir);
  registerRecuperacaoSenhaRoutes(app, screensDir);
  registerHomeRoutes(app, screensDir);

  // Rota raiz
  app.get('/', (req, res) => {
    res.redirect('/login');
  });
}
