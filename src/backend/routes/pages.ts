/**
 * Rotas de Páginas HTML
 * Autor: Equipe G10
 */

import { Express } from 'express';
import path from 'path';

export function registerPageRoutes(app: Express, screensDir: string): void {
  // Rota: Login
  app.get('/login', (req, res) => {
    res.sendFile(path.join(screensDir, 'Login', 'pagina.html'));
  });

  app.get('/login/login.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Login', 'login.css'));
  });

  app.get('/login/login.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Login', 'login.js'));
  });

  // Rota: Cadastro
  app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cadastro', 'cadastro.html'));
  });

  app.get('/cadastro/cadastro.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cadastro', 'cadastro.css'));
  });

  app.get('/cadastro/cadastro.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Cadastro', 'cadastro.js'));
  });

  // Rota: Recuperação de senha
  app.get('/recuperacao-senha', (req, res) => {
    res.sendFile(path.join(screensDir, 'Recuperacão Senha', 'recuperacao-senha.html'));
  });

  app.get('/recuperacao-senha/recuperacao-senha.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Recuperacão Senha', 'recuperacao-senha.css'));
  });

  app.get('/recuperacao-senha/recuperacao-senha.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Recuperacão Senha', 'recuperacao-senha.js'));
  });

  // Rota raiz
  app.get('/', (req, res) => {
    res.redirect('/login');
  });
}
