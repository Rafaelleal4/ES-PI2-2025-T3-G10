import { Express } from 'express';
import path from 'path';

export function registerTurmasRoutes(app: Express, screensDir: string): void {
  app.get('/turmas', (req, res) => {
    res.sendFile(path.join(screensDir, 'Turmas', 'turmas.html'));
  });

  app.get('/turmas/turmas.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Turmas', 'turmas.css'));
  });

  app.get('/turmas/turmas.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Turmas', 'turmas.js'));
  });
}
