/* ================================================================
   MAIN.JS – AfriTalent
   Contient : Dark Mode, Navbar scroll, Retour en haut,
              Fade-in sections, Compteurs animés, Filtrage, Formulaire
================================================================ */

// On attend que tout le HTML soit chargé avant d'exécuter le JS
document.addEventListener('DOMContentLoaded', function () {

  /* ================================================================
     COMMIT 6 – DARK / LIGHT MODE avec localStorage
     Principe : on met data-theme="dark" sur <body>
     Le CSS réagit avec body[data-theme="dark"] { ... }
  ================================================================ */

  const themeToggleBtn = document.getElementById('themeToggle');

  // Si le bouton n'existe pas sur cette page, on ne fait rien
  if (themeToggleBtn) {

    // Lire le thème sauvegardé dans localStorage (ou "light" par défaut)
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Au clic : on bascule entre dark et light
    themeToggleBtn.addEventListener('click', function () {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      // Sauvegarder pour que ça persiste entre les pages
      localStorage.setItem('theme', newTheme);
    });
  }

  // Applique le thème : met data-theme sur <body> + change l'icône du bouton
  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  /* ================================================================
     COMMIT 6 – NAVBAR qui change au scroll
     Principe : on ajoute la classe .scrolled quand l'utilisateur scrolle
  ================================================================ */

  const navbar    = document.querySelector('.navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {

    // Navbar : ajoute une ombre après 60px de scroll
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Bouton retour en haut : visible après 300px de scroll
    if (backToTop) {
      backToTop.style.opacity      = window.scrollY > 300 ? '1' : '0';
      backToTop.style.pointerEvents = window.scrollY > 300 ? 'all' : 'none';
    }
  });

  /* ================================================================
     COMMIT 6 – BOUTON RETOUR EN HAUT
     Principe : scrollTo avec behavior smooth = animation fluide
  ================================================================ */

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ================================================================
     COMMIT 7 – ANIMATIONS FADE-IN au scroll (IntersectionObserver)
     Principe : on observe les éléments .fade-section
     Quand ils entrent dans l'écran → on ajoute la classe .visible
     CSS : .fade-section.visible { opacity: 1; transform: none; }
  ================================================================ */

  const fadeSections = document.querySelectorAll('.fade-section');

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 }); // déclenche quand 10% est visible

  fadeSections.forEach(function (section) {
    fadeObserver.observe(section);
  });

  // Fix : sur les pages courtes, certains éléments sont déjà visibles
  // sans scroll → on les affiche directement au chargement
  setTimeout(function () {
    fadeSections.forEach(function (section) {
      if (section.getBoundingClientRect().top < window.innerHeight) {
        section.classList.add('visible');
      }
    });
  }, 100);

  /* ================================================================
     COMMIT 7 – COMPTEURS ANIMÉS en boucle
     Principe : setInterval incrémente le chiffre jusqu'à data-target
     Puis repart de 0 après 1 seconde (boucle infinie)
  ================================================================ */

  const compteurs = document.querySelectorAll('[data-target]');

  // IntersectionObserver : démarre le compteur quand visible à 50%
  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        lancerCompteur(el, target);
      }
    });
  }, { threshold: 0.5 });

  compteurs.forEach(function (el) {
    counterObserver.observe(el);
  });

  // Fonction qui anime le chiffre de 0 → target, puis repart en boucle
  function lancerCompteur(el, target) {
    let current = 0;

    const timer = setInterval(function () {
      current += target / 60; // on divise en 60 étapes

      if (current >= target) {
        el.textContent = target; // valeur finale exacte
        clearInterval(timer);    // on stoppe l'intervalle

        // Pause de 1 seconde puis on repart de 0
        setTimeout(function () {
          el.textContent = 0;
          lancerCompteur(el, target); // relance !
        }, 1000);

      } else {
        el.textContent = Math.floor(current); // arrondi à l'entier
      }

    }, 1200 / 60); // durée totale : 1.2 secondes / 60 étapes
  }

}); // fin DOMContentLoaded

/* ================================================================
   COMMIT 8 – FILTRAGE DYNAMIQUE des freelances
   Principe : on cache/affiche les .carte selon data-categorie
   "this" est passé depuis le HTML pour savoir quel bouton est cliqué
================================================================ */

function filtrer(categorie, boutonClique) {

  // 1. Remettre tous les boutons en style "outline"
  const boutons = document.querySelectorAll('[onclick^="filtrer"]');
  boutons.forEach(function (btn) {
    btn.classList.remove('btn-warning');
    btn.classList.add('btn-outline-secondary');
  });

  // 2. Mettre en surbrillance le bouton cliqué
  boutonClique.classList.add('btn-warning');
  boutonClique.classList.remove('btn-outline-secondary');

  // 3. Afficher ou cacher chaque carte selon sa catégorie
  const cartes = document.querySelectorAll('.carte');
  cartes.forEach(function (carte) {
    const cat = carte.getAttribute('data-categorie');
    if (categorie === 'tous' || cat === categorie) {
      carte.style.display = 'block'; // afficher
    } else {
      carte.style.display = 'none';  // cacher
    }
  });
}

/* ================================================================
   COMMIT 8 – VALIDATION FORMULAIRE DE CONTACT
   Vérifie : nom, prénom, email (regex), sujet, message (min 20 car.)
   Affiche les erreurs sous chaque champ si invalide
================================================================ */

function validerFormulaire() {
  let valide = true; // on suppose que tout est OK

  const nom     = document.getElementById('nom');
  const prenom  = document.getElementById('prenom');
  const email   = document.getElementById('email');
  const sujet   = document.getElementById('sujet');
  const message = document.getElementById('message');

  // Si on n'est pas sur la page contact, les champs n'existent pas
  if (!nom) return;

  // Vérification Nom
  if (nom.value.trim() === '') {
    nom.classList.add('is-invalid');
    valide = false;
  } else {
    nom.classList.remove('is-invalid');
  }

  // Vérification Prénom
  if (prenom && prenom.value.trim() === '') {
    prenom.classList.add('is-invalid');
    valide = false;
  } else if (prenom) {
    prenom.classList.remove('is-invalid');
  }

  // Vérification Email avec une regex (format nom@domaine.ext)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    email.classList.add('is-invalid');
    valide = false;
  } else {
    email.classList.remove('is-invalid');
  }

  // Vérification Sujet
  if (sujet && sujet.value === '') {
    sujet.classList.add('is-invalid');
    valide = false;
  } else if (sujet) {
    sujet.classList.remove('is-invalid');
  }

  // Vérification Message (minimum 20 caractères)
  if (message.value.trim().length < 20) {
    message.classList.add('is-invalid');
    valide = false;
  } else {
    message.classList.remove('is-invalid');
  }

  // Si tout est valide : afficher le message de succès et vider le formulaire
  if (valide) {
    const msgSucces = document.getElementById('messageSucces');
    if (msgSucces) {
      msgSucces.classList.remove('d-none');
      // Vider les champs
      nom.value = '';
      if (prenom)  prenom.value  = '';
      email.value = '';
      if (sujet)   sujet.value   = '';
      message.value = '';
      // Cacher le message après 4 secondes
      setTimeout(function () {
        msgSucces.classList.add('d-none');
      }, 4000);
    }
  }
}