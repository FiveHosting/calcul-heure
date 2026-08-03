(function () {
  window.CALCUL_HEURES_CONFIG = {
    // Web: laisser vide pour utiliser le même domaine que le site.
    // Mobile: remplacer par l’URL HTTPS du backend avant `npx cap sync`.
    // Exemple: apiBaseUrl: 'https://calcul-heures.example.com'
    apiBaseUrl: '',

    ads: {
      // Gardé à false tant que les vrais IDs AdMob ne sont pas créés.
      enabled: false,
      provider: 'admob',
      testMode: true,
      showBannerAfterLogin: true,
      bannerMargin: 96,

      // IDs de test Google AdMob pour le développement. À remplacer avant publication.
      androidBannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
      iosBannerAdUnitId: 'ca-app-pub-3940256099942544/2934735716'
    }
  };
})();
