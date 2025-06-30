/**
 * Application configuration constants
 */
export const CONFIG = {
  // API Configuration
  API: {
    ISS_POSITION_URL: "http://api.open-notify.org/iss-now.json",
    POLLING_INTERVAL: 5000, // 5 seconds
    TIMEOUT: 10000, // 10 seconds
  },

  // 3D Scene Configuration
  SCENE: {
    CAMERA_FOV: 45,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 1000,
    CAMERA_INITIAL_Z: 3,
    CAMERA_RADIUS: 3,
    ROTATION_SPEED: 0.001,
    EARTH_RADIUS: 1,
    ISS_ORBIT_HEIGHT: 1.05,
    ISS_MARKER_RADIUS: 0.05,
  },

  // Visual Configuration
  VISUAL: {
    EARTH_SEGMENTS: 64,
    ISS_SEGMENTS: 32,
    DEFAULT_ISS_COLOR: 0xff0000,
    AMBIENT_LIGHT_COLOR: 0xffffff,
    AMBIENT_LIGHT_INTENSITY: 1,
  },

  // UI Configuration
  UI: {
    STATUS_AUTO_HIDE_DELAY: 3000,
    COORDINATE_UPDATE_HIGHLIGHT_DURATION: 500,
    PANEL_ANIMATION_DURATION: 300,
  },

  // Default ISS Position (fallback)
  DEFAULT_POSITION: {
    lat: 39.8027,
    lon: 162.8492,
  },

  // Controls Configuration
  CONTROLS: {
    ENABLE_DAMPING: true,
    DAMPING_FACTOR: 0.05,
    ROTATE_SPEED: 0.3,
    ENABLE_ZOOM: true,
    ENABLE_PAN: false,
  },

  // Application Metadata
  APP: {
    NAME: "ISS Tracker 3D",
    VERSION: "2.0.0",
    DESCRIPTION: "Suivi en temps réel de la Station Spatiale Internationale",
    AUTHOR: "ISS Tracker Team",
  },
};

// Validation functions for configuration
export const VALIDATORS = {
  /**
   * Validate latitude value
   * @param {number} lat - Latitude to validate
   * @returns {boolean} True if valid
   */
  isValidLatitude(lat) {
    return typeof lat === "number" && lat >= -90 && lat <= 90;
  },

  /**
   * Validate longitude value
   * @param {number} lon - Longitude to validate
   * @returns {boolean} True if valid
   */
  isValidLongitude(lon) {
    return typeof lon === "number" && lon >= -180 && lon <= 180;
  },

  /**
   * Validate position object
   * @param {Object} position - Position to validate {lat, lon}
   * @returns {boolean} True if valid
   */
  isValidPosition(position) {
    return (
      position &&
      this.isValidLatitude(position.lat) &&
      this.isValidLongitude(position.lon)
    );
  },
};

// Environment detection
export const ENVIRONMENT = {
  isDevelopment: import.meta.env?.DEV || false,
  isProduction: import.meta.env?.PROD || false,

  // Browser capabilities
  supportsWebGL: (() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch (e) {
      return false;
    }
  })(),

  // Performance detection
  isHighPerformance: (() => {
    return navigator.hardwareConcurrency > 4;
  })(),

  // Mobile detection
  isMobile: (() => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  })(),
};

// Adjust configuration based on environment
if (ENVIRONMENT.isMobile) {
  CONFIG.VISUAL.EARTH_SEGMENTS = 32; // Reduce for mobile performance
  CONFIG.VISUAL.ISS_SEGMENTS = 16;
  CONFIG.API.POLLING_INTERVAL = 10000; // Reduce polling frequency on mobile
}

if (!ENVIRONMENT.isHighPerformance) {
  CONFIG.VISUAL.EARTH_SEGMENTS = Math.min(CONFIG.VISUAL.EARTH_SEGMENTS, 32);
  CONFIG.VISUAL.ISS_SEGMENTS = Math.min(CONFIG.VISUAL.ISS_SEGMENTS, 16);
}
