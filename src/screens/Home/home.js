document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Como ainda não há sessão/JWT, apenas redireciona para login
      window.location.href = '/login';
    });
  }
});
