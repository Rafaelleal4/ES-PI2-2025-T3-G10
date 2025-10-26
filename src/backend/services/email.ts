/**
 * Serviço de Envio de E-mails
 * Autor: Equipe G10
 * Utiliza Nodemailer para envio de e-mails de recuperação de senha
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true para porta 465, false para outras
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envia e-mail de recuperação de senha
 * @param destinatario E-mail do destinatário
 * @param nomeUsuario Nome do usuário
 * @param token Token de recuperação
 * @returns Promise com resultado do envio
 */
export async function enviarEmailRecuperacao(
  destinatario: string,
  nomeUsuario: string,
  token: string
): Promise<boolean> {
  try {
    const linkRecuperacao = `${process.env.BASE_URL || 'http://localhost:5000'}/redefinir-senha?token=${token}`;
    
    const htmlEmail = `
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1b3a6f; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #3b82f6; 
            color: #ffffff !important; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NotaDez</h1>
          </div>
          <div class="content">
            <h2>Recuperação de Senha</h2>
            <p>Olá, <strong>${nomeUsuario}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema NotaDez.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="text-align: center;">
              <a href="${linkRecuperacao}" class="button">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
              ${linkRecuperacao}
            </p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou a recuperação de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>
          </div>
          <div class="footer">
            <p>NotaDez - Sistema de Gerenciamento de Notas</p>
            <p>Projeto Integrador II - PUC Campinas - 2025</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textoEmail = `
      NotaDez - Recuperação de Senha
      
      Olá, ${nomeUsuario}!
      
      Recebemos uma solicitação para redefinir a senha da sua conta.
      
      Clique no link abaixo para criar uma nova senha:
      ${linkRecuperacao}
      
      Este link expira em 1 hora.
      
      Se você não solicitou a recuperação de senha, ignore este e-mail.
      
      ---
      NotaDez - Sistema de Gerenciamento de Notas
      Projeto Integrador II - PUC Campinas - 2025
    `;

    const info = await transporter.sendMail({
      from: `"NotaDez" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'NotaDez - Recuperação de Senha',
      text: textoEmail,
      html: htmlEmail
    });

    console.log('E-mail enviado com sucesso:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

/**
 * Verifica se o serviço de e-mail está configurado corretamente
 */
export async function verificarConfiguracaoEmail(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Servidor de e-mail configurado corretamente');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração do servidor de e-mail:', error);
    return false;
  }
}
