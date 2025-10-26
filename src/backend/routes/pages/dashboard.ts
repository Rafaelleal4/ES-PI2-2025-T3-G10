import { Express } from 'express';
import path from 'path';

export function registerDashboardRoutes(app: Express, screensDir: string): void {
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(screensDir, 'Dashboard', 'dashboard.html'));
  });

  app.get('/dashboard/dashboard.css', (req, res) => {
    res.sendFile(path.join(screensDir, 'Dashboard', 'dashboard.css'));
  });

  app.get('/dashboard/dashboard.js', (req, res) => {
    res.sendFile(path.join(screensDir, 'Dashboard', 'dashboard.js'));
  });
}
