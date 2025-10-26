// Arquivo legado mantido para compatibilidade.
// Redireciona o registro de rotas para o agregador em ./pages/index
import type { Express } from 'express';
import { registerPageRoutes as registerFromFolder } from './pages/index';

export function registerPageRoutes(app: Express, screensDir: string): void {
  return registerFromFolder(app, screensDir);
}
