/**
 * Dashboard - Sistema NotaDez
 * Autor: Rafael Leal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticação
  const usuarioId = localStorage.getItem('usuarioId');
  
  if (!usuarioId) {
    // Usuário não autenticado, redireciona para login
    window.location.href = '/login';
    return;
  }

  // Carregar dados do usuário
  const usuarioNome = localStorage.getItem('usuarioNome') || 'Usuário';
  
  // Espaço para lógica futura da dashboard
});
