
// On attend que toute la page soit chargée avant d'exécuter le JS
document.addEventListener('DOMContentLoaded', function () {

  const themeToggleBtn = document.getElementById('themeToggle');

  // Vérification : si le bouton n'existe pas dans le HTML, on arrête
  if (!themeToggleBtn) {
    console.warn('Bouton #themeToggle introuvable dans le HTML !');
    return;
  }

  // Lire le thème sauvegardé (ou "light" par défaut)
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  // Clic sur le bouton
  themeToggleBtn.addEventListener('click', function () {
    // On lit le thème actuel sur <body data-theme="...">
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    // Sauvegarder le choix dans localStorage
    localStorage.setItem('theme', newTheme);
  });

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    // Optionnel : changer l'icône du bouton
    themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

});