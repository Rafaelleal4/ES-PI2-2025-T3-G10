/**
 * Autor: Rafael Leal
 */

import { Express } from 'express';
import path from 'path';

export function registerInstituicoesRoutes(app: Express, screensDir: string): void {
  app.get('/instituicoes', (req, res) => {
    res.sendFile(path.join(screensDir, 'Instituicoes', 'instituicoes.html'));
  });

  app.get('/instituicoes/instituicoes.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Instituicoes', 'instituicoes.css'));
  });

  app.get('/instituicoes/instituicoes.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Instituicoes', 'instituicoes.js'));
  });
}
