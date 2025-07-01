import { Vector3 } from "three";
import {degToRad} from "three/src/math/MathUtils.js";
import {CONFIG} from "../config/config.js";

/**
 * Utility class for mathematical calculations and conversions
 */
export class MathUtils {

  static  convertLatLonToVector3D(lat, lon, radius = CONFIG.SCENE.EARTH_RADIUS) {

    const latR = degToRad(lat);
    const lonR = degToRad(-lon);

    const x = radius * Math.cos(latR) * Math.cos(lonR);
    const y = radius * Math.sin(latR);
    const z = radius * Math.cos(latR) * Math.sin(lonR) ;

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
   * Calculate distance between two points on Earth using Haversine formula
   * @param {Object} pos1 - First position {lat, lon}
   * @param {Object} pos2 - Second position {lat, lon}
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(pos1, pos2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(pos2.lat - pos1.lat);
    const dLon = this.toRadians(pos2.lon - pos1.lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(pos1.lat)) *
        Math.cos(this.toRadians(pos2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees to convert
   * @returns {number} Radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Radians to convert
   * @returns {number} Degrees
   */
  static toDegrees(radians) {
    return radians * (180 / Math.PI);
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
