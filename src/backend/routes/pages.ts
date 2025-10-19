import express, { type Express, type Request, type Response } from 'express';
import path from 'path';

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isSenhaForte(senha: string) {
  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(senha);
}

export function registerPageRoutes(app: Express, screensDir: string) {
  // Home -> /login
  app.get('/', (_req: Request, res: Response) => {
    res.redirect('/login');
  });

  // Login
  app.get('/login', (_req: Request, res: Response) => {
    res.sendFile(path.join(screensDir, 'Login', 'pagina.html'));
  });
  app.use('/login', express.static(path.join(screensDir, 'Login')));

  // Cadastro
  app.get('/cadastro', (_req: Request, res: Response) => {
    res.sendFile(path.join(screensDir, 'Cadastro', 'cadastro.html'));
  });
  app.use('/cadastro', express.static(path.join(screensDir, 'Cadastro')));

  // Recuperação de Senha
  app.get('/recuperacao-senha', (_req: Request, res: Response) => {
    res.sendFile(path.join(screensDir, 'Recuperacão Senha', 'recuperacao-senha.html'));
  });
  app.use('/recuperacao-senha', express.static(path.join(screensDir, 'Recuperacão Senha')));

  // POST Login
  app.post('/login', express.urlencoded({ extended: true }), (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    let error = '';
    if (!email || !password) {
      error = 'E-mail e senha são obrigatórios.';
    } else if (!isEmailValid(email)) {
      error = 'E-mail inválido.';
    }
    if (error) {
      return res.status(400).send(`<p style='color:red;'>${error}</p><a href='/login'>Voltar</a>`);
    }
    // Aqui você pode validar no banco depois
    return res.send(`<p style='color:green;'>Login realizado com sucesso!</p><a href='/login'>Voltar</a>`);
  });

  // POST Cadastro
  app.post('/cadastro', express.urlencoded({ extended: true }), (req: Request, res: Response) => {
    const { nome, telefone, email, senha, ['confirma-senha']: confirmaSenha } = req.body || {};
    let error = '';
    if (!nome || !telefone || !email || !senha || !confirmaSenha) {
      error = 'Preencha todos os campos.';
    } else if (!isEmailValid(email)) {
      error = 'E-mail inválido.';
    } else if (!isSenhaForte(senha)) {
      error = 'A senha não atende aos requisitos mínimos.';
    } else if (senha !== confirmaSenha) {
      error = 'As senhas não conferem!';
    }
    if (error) {
      return res.status(400).send(`<p style='color:red;'>${error}</p><a href='/cadastro'>Voltar</a>`);
    }
    // Aqui você pode salvar no banco depois
    return res.send(`<p style='color:green;'>Cadastro realizado com sucesso!</p><a href='/cadastro'>Voltar</a>`);
  });

  // POST Recuperação de Senha
  app.post('/recuperacao-senha', express.urlencoded({ extended: true }), (req: Request, res: Response) => {
    const { email } = req.body || {};
    let error = '';
    if (!email) {
      error = 'E-mail é obrigatório.';
    } else if (!isEmailValid(email)) {
      error = 'E-mail inválido.';
    }
    if (error) {
      return res.status(400).send(`<p style='color:red;'>${error}</p><a href='/recuperacao-senha'>Voltar</a>`);
    }
    // Aqui você pode enviar e-mail depois
    return res.send(`<p style='color:green;'>Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.</p><a href='/recuperacao-senha'>Voltar</a>`);
  });
}
