import dotenv from 'dotenv';

// IMPORTANTE: Carregar variáveis de ambiente ANTES de tudo
dotenv.config();

import express from 'express';
import path from 'path';
import { registerPageRoutes } from './backend/routes/pages/index';
import { registerApiRoutes } from './backend/routes/api';
import { initializeDatabase } from './backend/database/connection';

const app = express();
app.use(express.json());
// Permite receber formulários HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Caminhos base (lembrando: este arquivo será compilado para lib/)
const ROOT_DIR = path.resolve(__dirname, '..'); // projeto
const SCREENS_DIR = path.join(ROOT_DIR, 'src', 'screens');

// Servir diretório de telas como fallback em /screens (opcional)
app.use('/screens', express.static(SCREENS_DIR));

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    // Conectar ao banco Oracle
    await initializeDatabase();

  // Registrar rotas de páginas
    registerPageRoutes(app, SCREENS_DIR);
    
  // Registrar rotas de API
  registerApiRoutes(app);

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
