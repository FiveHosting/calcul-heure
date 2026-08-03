(function () {
  const state = {
    initialized: false,
    bannerVisible: false
  };

  function getConfig() {
    return window.CALCUL_HEURES_CONFIG || {};
  }

  function isNativeApp() {
    return Boolean(window.Capacitor?.isNativePlatform?.()) || ['capacitor:', 'file:'].includes(window.location.protocol);
  }

  function getPlatform() {
    if (typeof window.Capacitor?.getPlatform === 'function') {
      return window.Capacitor.getPlatform();
    }

    return /iPhone|iPad|iPod/i.test(window.navigator.userAgent) ? 'ios' : 'android';
  }

  function getAdMob() {
    return window.Capacitor?.Plugins?.AdMob || null;
  }

  function getBannerAdUnitId() {
    const ads = getConfig().ads || {};
    return getPlatform() === 'ios' ? ads.iosBannerAdUnitId : ads.androidBannerAdUnitId;
  }

  async function initialize() {
    const ads = getConfig().ads || {};

    if (!isNativeApp() || !ads.enabled) return false;
    if (state.initialized) return true;

    const AdMob = getAdMob();
    if (!AdMob) {
      console.warn('AdMob non disponible dans cette build Capacitor.');
      return false;
    }

    try {
      await AdMob.initialize({
        initializeForTesting: ads.testMode !== false
      });

      if (typeof AdMob.trackingAuthorizationStatus === 'function' && typeof AdMob.requestTrackingAuthorization === 'function') {
        const trackingInfo = await AdMob.trackingAuthorizationStatus();
        if (trackingInfo?.status === 'notDetermined') {
          await AdMob.requestTrackingAuthorization();
        }
      }

      if (ads.requestConsent !== false && typeof AdMob.requestConsentInfo === 'function') {
        let consentInfo = await AdMob.requestConsentInfo();
        if (consentInfo?.canRequestAds === false && typeof AdMob.showConsentForm === 'function') {
          consentInfo = await AdMob.showConsentForm();
        }

        if (consentInfo?.canRequestAds === false) {
          console.warn('Consentement publicitaire non accordé, bannière non affichée.');
          return false;
        }
      }

      state.initialized = true;
      return true;
    } catch (error) {
      console.warn('Initialisation AdMob impossible:', error);
      return false;
    }
  }

  async function showBanner() {
    const ads = getConfig().ads || {};

    if (!ads.showBannerAfterLogin || state.bannerVisible) return;
    if (!(await initialize())) return;

    const AdMob = getAdMob();
    const adId = getBannerAdUnitId();
    if (!AdMob || !adId) return;

    try {
      await AdMob.showBanner({
        adId,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: Number(ads.bannerMargin || 96),
        isTesting: ads.testMode !== false
      });

      state.bannerVisible = true;
      document.body.classList.add('has-native-ad-banner');
    } catch (error) {
      console.warn('Bannière AdMob impossible:', error);
    }
  }

  async function hideBanner() {
    if (!state.bannerVisible) return;

    const AdMob = getAdMob();
    if (!AdMob || typeof AdMob.hideBanner !== 'function') {
      state.bannerVisible = false;
      document.body.classList.remove('has-native-ad-banner');
      return;
    }

    try {
      await AdMob.hideBanner();
    } catch (error) {
      console.warn('Masquage AdMob impossible:', error);
    } finally {
      state.bannerVisible = false;
      document.body.classList.remove('has-native-ad-banner');
    }
  }

  window.CalculHeuresAds = {
    initialize,
    showBanner,
    hideBanner
  };
})();
