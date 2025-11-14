/**
 * Autor: Rafael Leal
 */

import { Express } from 'express';
import path from 'path';

export function registerLoginRoutes(app: Express, screensDir: string): void {
  app.get('/login', (req, res) => {
    res.sendFile(path.join(screensDir, 'Login', 'pagina.html'));
  });

  app.get('/login/login.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Login', 'login.css'));
  });

  app.get('/login/login.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Login', 'login.js'));
  });
}
