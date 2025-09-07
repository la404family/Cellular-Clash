// Import du module d'effet de lumière
import LightEffect from './modules/lightEffect.js';


if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    const lightEffect = new LightEffect();
    lightEffect.init();
}

