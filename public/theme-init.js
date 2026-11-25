(function () {
  try {
    var theme = window.localStorage.getItem('tarbiyah_theme') === 'night' ? 'night' : 'light';
    var locale = window.localStorage.getItem('tarbiyah_locale') === 'en' ? 'en' : 'id';
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'night');
    root.lang = locale;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.lang = 'id';
  }
})();
