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
  ],

  // Textures
  TEXTURES: [
    {
      name: "earth_diffuse",
      type: "texture",
      // url: "./earth.jpg",
      url: "./8k_earth_daymap.jpg",
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
      // url: "./Clouds.png",
      url: "./8k_earth_clouds.jpg",
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
 * @returns {Array} Array of resource definitions
 */
export function getAllResources() {
  const resources = [];

  // Add HDR resources
  resources.push(
    ...RESOURCE_CONFIG.HDR,
  );

  // Add texture resources
  resources.push(
    ...RESOURCE_CONFIG.TEXTURES,
  );

  // Add model resources
  resources.push(
    ...RESOURCE_CONFIG.MODELS,
  );

  return resources;
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
