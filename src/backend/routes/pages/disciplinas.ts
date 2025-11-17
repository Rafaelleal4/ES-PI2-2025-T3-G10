/**
 * Autor: Rafael Leal
 */

import { Express } from 'express';
import path from 'path';

export function registerDisciplinasRoutes(app: Express, screensDir: string): void {
  app.get('/disciplinas', (req, res) => {
    res.sendFile(path.join(screensDir, 'Disciplinas', 'disciplinas.html'));
  });

  app.get('/disciplinas/disciplinas.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Disciplinas', 'disciplinas.css'));
  });

  app.get('/disciplinas/disciplinas.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Disciplinas', 'disciplinas.js'));
  });
}
