import { Vector3 } from "three";
import {degToRad} from "three/src/math/MathUtils.js";
import {CONFIG} from "../config/config.js";

/**
 * Utility class for mathematical calculations and conversions
 */
export class MathUtils {

  static  convertLatLonAltToVector3D(lat, lon, alt = 0, baseRadius = CONFIG.SCENE.EARTH_RADIUS) {

    const latR = degToRad(lat);
    const lonR = degToRad(-lon);

    const radius = baseRadius + (CONFIG.SCENE.EARTH_RADIUS === 1 ? alt / 6371 : alt);

    const x = radius * Math.cos(latR) * Math.cos(lonR);
    const y = radius * Math.sin(latR);
    const z = radius * Math.cos(latR) * Math.sin(lonR);

    return new Vector3(x, y, z);
  }

  /**
   * Validate latitude value
   * @param {number} lat - Latitude to validate
   * @returns {boolean} True if valid
   */
  static isValidLatitude(lat) {
    return typeof lat === "number" && lat >= -90 && lat <= 90;
  }

  /**
   * Validate longitude value
   * @param {number} lon - Longitude to validate
   * @returns {boolean} True if valid
   */
  static isValidLongitude(lon) {
    return typeof lon === "number" && lon >= -180 && lon <= 180;
  }

  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(start, end, t) {
    return start + (end - start) * this.clamp(t, 0, 1);
  }
}
