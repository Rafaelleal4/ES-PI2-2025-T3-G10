import express from 'express';
import path from 'path';
import { registerPageRoutes } from './backend/routes/pages';

const app = express();
app.use(express.json());

// Caminhos base (lembrando: este arquivo será compilado para lib/)
const ROOT_DIR = path.resolve(__dirname, '..'); // projeto
const SCREENS_DIR = path.join(ROOT_DIR, 'src', 'screens');

// Servir diretório de telas como fallback em /screens (opcional)
app.use('/screens', express.static(SCREENS_DIR));

app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on http://localhost:3000');
});

// Rotas
registerPageRoutes(app, SCREENS_DIR);
