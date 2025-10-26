import { Express } from 'express';
import path from 'path';

export function registerAlunosRoutes(app: Express, screensDir: string): void {
  app.get('/alunos', (req, res) => {
    res.sendFile(path.join(screensDir, 'Alunos', 'alunos.html'));
  });

  app.get('/alunos/alunos.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Alunos', 'alunos.css'));
  });

  app.get('/alunos/alunos.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Alunos', 'alunos.js'));
  });
}
