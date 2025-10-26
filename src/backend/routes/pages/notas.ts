import { Express } from 'express';
import path from 'path';

export function registerNotasRoutes(app: Express, screensDir: string): void {
  app.get('/notas', (req, res) => {
    res.sendFile(path.join(screensDir, 'Notas', 'notas.html'));
  });

  app.get('/notas/notas.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Notas', 'notas.css'));
  });

  app.get('/notas/notas.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Notas', 'notas.js'));
  });
}
