import { SRGBColorSpace } from "three";

/**
 * Resource configuration for the ISS Tracker application
 * Defines all assets that need to be loaded before the app starts
 */
export const RESOURCE_CONFIG = {
  // HDR Environment Maps
  HDR: [
    {
      name: "hdr_environment",
      type: "hdr",
      url: "./HDR_white_local_star.hdr",
      description: "Environnement HDR principal",
    },
    {
      name: "hdr_planet",
      type: "hdr",
      url: "./HDR_artificial_planet.hdr",
      description: "Environnement HDR planète artificielle",
      optional: true, // Optional resource - won't block loading if failed
    },
  ],

  // Textures
  TEXTURES: [
    {
      name: "earth_diffuse",
      type: "texture",
      url: "./ISS_TRACKER/earth.jpg",
      description: "Texture de la Terre",
      options: {
        colorSpace: SRGBColorSpace,
      },
    },
    {
      name: "earth_bump",
      type: "texture",
      url: "./Bump.jpg",
      description: "Carte de relief de la Terre",
    },
    {
      name: "clouds_alpha",
      type: "texture",
      url: "./Clouds.png",
      description: "Texture des nuages",
    },
    {
      name: "satellite_icon",
      type: "texture",
      url: "./sattelite.png",
      description: "Icône satellite",
      optional: true,
    },
  ],

  // 3D Models
  MODELS: [
    {
      name: "iss_station",
      type: "model",
      url: "./ISS_stationary.glb",
      description: "Modèle 3D de l'ISS",
    },
  ],
};

/**
 * Get all resources as a flat array
 * @param {boolean} includeOptional - Whether to include optional resources
 * @returns {Array} Array of resource definitions
 */
export function getAllResources(includeOptional = true) {
  const resources = [];

  // Add HDR resources
  resources.push(
    ...RESOURCE_CONFIG.HDR.filter((r) => includeOptional || !r.optional)
  );

  // Add texture resources
  resources.push(
    ...RESOURCE_CONFIG.TEXTURES.filter((r) => includeOptional || !r.optional)
  );

  // Add model resources
  resources.push(
    ...RESOURCE_CONFIG.MODELS.filter((r) => includeOptional || !r.optional)
  );

  return resources;
}

/**
 * Get resources by category
 * @param {string} category - Resource category ('HDR', 'TEXTURES', 'MODELS')
 * @param {boolean} includeOptional - Whether to include optional resources
 * @returns {Array} Array of resource definitions
 */
export function getResourcesByCategory(category, includeOptional = true) {
  const categoryResources = RESOURCE_CONFIG[category] || [];
  return categoryResources.filter((r) => includeOptional || !r.optional);
}

/**
 * Get resource by name
 * @param {string} name - Resource name
 * @returns {Object|null} Resource definition or null if not found
 */
export function getResourceByName(name) {
  const allResources = getAllResources(true);
  return allResources.find((r) => r.name === name) || null;
}
