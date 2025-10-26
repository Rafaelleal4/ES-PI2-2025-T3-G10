import { Express } from 'express';
import path from 'path';

export function registerRedefinirSenhaRoutes(app: Express, screensDir: string): void {
  const dir = path.join(screensDir, 'Redefinir Senha');

  app.get('/redefinir-senha', (req, res) => {
    res.sendFile(path.join(dir, 'redefinir-senha.html'));
  });

  app.get('/redefinir-senha/redefinir-senha.css', (req, res) => {
    res.sendFile(path.join(dir, 'redefinir-senha.css'));
  });

  app.get('/redefinir-senha/redefinir-senha.js', (req, res) => {
    res.sendFile(path.join(dir, 'redefinir-senha.js'));
  });
}
