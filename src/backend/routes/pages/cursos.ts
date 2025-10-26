import { Express } from 'express';
import path from 'path';

export function registerCursosRoutes(app: Express, screensDir: string): void {
  app.get('/cursos', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cursos', 'cursos.html'));
  });

  app.get('/cursos/cursos.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cursos', 'cursos.css'));
  });

  app.get('/cursos/cursos.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cursos', 'cursos.js'));
  });
}
