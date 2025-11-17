import { Express } from 'express';
import path from 'path';

export function registerImportacaoRoutes(app: Express, screensDir: string): void {
    
    
    app.get('/importar', (req, res) => {
       
        res.sendFile(path.join(screensDir, 'importação', 'importação.html'));
    });

    
    app.get('/importar/importar.css', (req, res) => {
        res.sendFile(path.join(screensDir, 'importação', 'importação.css'));
    });

    
    app.get('/importar/importar.js', (req, res) => {
        res.sendFile(path.join(screensDir, 'importação', 'importação.js'));
    });
}