/**
 * Autor: Rafael Leal
 */

import { Express } from 'express';
import path from 'path';

export function registerRecuperacaoSenhaRoutes(app: Express, screensDir: string): void {
  // Observação: pasta com acento e espaço
  const dir = path.join(screensDir, 'Recuperacão Senha');

  app.get('/recuperacao-senha', (req, res) => {
    res.sendFile(path.join(dir, 'recuperacao-senha.html'));
  });

  app.get('/recuperacao-senha/recuperacao-senha.css', (req, res) => {
    res.sendFile(path.join(dir, 'recuperacao-senha.css'));
  });

  app.get('/recuperacao-senha/recuperacao-senha.js', (req, res) => {
    res.sendFile(path.join(dir, 'recuperacao-senha.js'));
  });
}
