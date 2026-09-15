/**
 * ValenQuest PWA Installation & Service Worker Manager
 * Handles offline registration, deferred install prompt, and iOS home screen guides.
 */

import { sound } from './audio.js';
import { speech } from './speech.js';

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isStandalone = false;
    this.isIOS = false;
  }

  init() {
    // Check if running as standalone app (already installed)
    this.isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    // Detect iOS devices
    this.isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

    // Register Service Worker for offline play
    this.registerServiceWorker();

    // Hook install prompt events
    this.setupInstallListeners();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('✨ [ValenQuest PWA] Service Worker active, scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[ValenQuest PWA] Service Worker registration failed:', err);
          });
      });
    }
  }

  setupInstallListeners() {
    const btnHeaderInstall = document.getElementById('btn-install-pwa');
    const bannerInstall = document.getElementById('pwa-install-banner');
    const btnBannerInstall = document.getElementById('btn-banner-install');
    const iosModal = document.getElementById('pwa-ios-modal');
    const btnIosDismiss = document.getElementById('btn-pwa-ios-dismiss');

    // If already installed, hide all install triggers
    if (this.isStandalone) {
      if (btnHeaderInstall) btnHeaderInstall.hidden = true;
      if (bannerInstall) bannerInstall.hidden = true;
      return;
    }

    // On iOS Safari, show the install button since beforeinstallprompt doesn't fire
    if (this.isIOS) {
      if (btnHeaderInstall) btnHeaderInstall.hidden = false;
      if (bannerInstall) bannerInstall.hidden = false;
    }

    // Capture native PWA install prompt (Android, Chrome, Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('📲 [ValenQuest PWA] Install prompt captured and ready');

      if (btnHeaderInstall) btnHeaderInstall.hidden = false;
      if (bannerInstall) bannerInstall.hidden = false;
    });

    const handleInstallClick = async () => {
      sound.playClick();

      if (this.deferredPrompt) {
        // Trigger native install dialog
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`[ValenQuest PWA] User install choice: ${outcome}`);

        if (outcome === 'accepted') {
          sound.playLevelUp();
          speech.speak('¡Descarga e instalación iniciada! ValenQuest estará en tu pantalla de inicio.');
          if (btnHeaderInstall) btnHeaderInstall.hidden = true;
          if (bannerInstall) bannerInstall.hidden = true;
        }
        this.deferredPrompt = null;
      } else if (this.isIOS) {
        // Show friendly iOS instructions modal
        if (iosModal) iosModal.hidden = false;
        speech.speak('Para instalar en tu iPad o iPhone, toca Compartir y selecciona Añadir a pantalla de inicio.');
      } else {
        // Fallback info
        speech.speak('¡ValenQuest está lista para jugar sin conexión a internet!');
        alert('Para instalar la aplicación, pulsa en el menú de tu navegador (los tres puntos) y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".');
      }
    };

    if (btnHeaderInstall) {
      btnHeaderInstall.addEventListener('click', handleInstallClick);
    }
    if (btnBannerInstall) {
      btnBannerInstall.addEventListener('click', handleInstallClick);
    }

    if (btnIosDismiss && iosModal) {
      btnIosDismiss.addEventListener('click', () => {
        sound.playClick();
        iosModal.hidden = true;
      });
    }

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('🎉 [ValenQuest PWA] Successfully installed!');
      sound.playLevelUp();
      speech.speak('¡Genial! ValenQuest se ha instalado en tu dispositivo.');
      if (btnHeaderInstall) btnHeaderInstall.hidden = true;
      if (bannerInstall) bannerInstall.hidden = true;
      this.deferredPrompt = null;
    });
  }
}

export const pwa = new PWAManager();
