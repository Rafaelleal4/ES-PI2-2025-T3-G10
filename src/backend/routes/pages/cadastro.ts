/**
 * Autor: Rafael Leal
 */

import { Express } from 'express';
import path from 'path';

export function registerCadastroRoutes(app: Express, screensDir: string): void {
  app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cadastro', 'cadastro.html'));
  });

  app.get('/cadastro/cadastro.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cadastro', 'cadastro.css'));
  });

  app.get('/cadastro/cadastro.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cadastro', 'cadastro.js'));
  });
}
