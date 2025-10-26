import { Express } from 'express';
import path from 'path';

export function registerHomeRoutes(app: Express, screensDir: string): void {
  // Normaliza variações de caixa
  app.get('/Home', (req, res) => res.redirect('/home'));

  app.get('/home', (req, res) => {
    res.sendFile(path.join(screensDir, 'Home', 'home.html'));
  });

  app.get('/home/home.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Home', 'home.css'));
  });

  app.get('/home/home.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Home', 'home.js'));
  });
}
