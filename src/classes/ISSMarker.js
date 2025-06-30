import { MathUtils } from "./MathUtils.js";
import { CONFIG } from "../config/config.js";
import { Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { GLTFLoader } from "three/addons";

/**
 * Class representing the ISS marker in the 3D scene
 */
export class ISSMarker {
  constructor(scene, color = CONFIG.VISUAL.DEFAULT_ISS_COLOR) {
    this.scene = scene;
    this.mesh = null;
    this.currentPosition = { lat: 0, lon: 0 };
    this.fallbackColor = color;
    this.isLoading = true;
    this.loadingPromise = null;

    this.createMarker3dMesh();
  }

  /**
   * Create the 3D sprite for the ISS marker
   * @param {number} color - Hex color for fallback marker (unused for sprite)
   */
  createMarkerMesh(color) {
    const geometry = new SphereGeometry(
      CONFIG.SCENE.ISS_MARKER_RADIUS,
      CONFIG.VISUAL.ISS_SEGMENTS,
      CONFIG.VISUAL.ISS_SEGMENTS
    );

    const material = new MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.2,
    });

    return new Mesh(geometry, material);
  }

  /**
   * Create the 3D model for the ISS marker with fallback to sphere
   */
  createMarker3dMesh() {
    const loader = new GLTFLoader();

    this.loadingPromise = new Promise((resolve, reject) => {
      loader.load(
        CONFIG.ISS_MODEL.PATH, // Utiliser la configuration
        (gltf) => {
          try {
            const iss = gltf.scene;

            // Configuration du modèle 3D depuis la config
            iss.scale.set(
              CONFIG.ISS_MODEL.SCALE,
              CONFIG.ISS_MODEL.SCALE,
              CONFIG.ISS_MODEL.SCALE
            );
            iss.rotation.set(
              CONFIG.ISS_MODEL.INITIAL_ROTATION.x,
              CONFIG.ISS_MODEL.INITIAL_ROTATION.y,
              CONFIG.ISS_MODEL.INITIAL_ROTATION.z
            );

            // Traverse le modèle pour optimiser les matériaux
            iss.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Améliorer l'apparence avec un léger émissif
                if (child.material) {
                  child.material.emissiveIntensity = 0.1;
                }
              }
            });

            this.mesh = iss;
            this.isLoading = false;
            this.addToScene();

            console.log("ISS 3D model loaded successfully");
            resolve(iss);
          } catch (error) {
            console.error("Error processing ISS 3D model:", error);
            this.createFallbackMarker();
            reject(error);
          }
        },
        (progress) => {
          // Optionnel: callback de progression
          const percentage = (progress.loaded / progress.total) * 100;
          console.log(`Loading ISS model: ${percentage.toFixed(1)}%`);
        },
        (error) => {
          console.error("Error loading ISS 3D model:", error);
          console.log("Falling back to sphere marker");
          this.createFallbackMarker();
          reject(error);
        }
      );
    });

    return this.loadingPromise;
  }

  /**
   * Create fallback sphere marker when 3D model fails to load
   */
  createFallbackMarker() {
    console.log("Creating fallback sphere marker");
    this.mesh = this.createMarkerMesh(this.fallbackColor);
    this.isLoading = false;
    this.addToScene();
  }

  /**
   * Add marker to the scene
   */
  addToScene() {
    if (this.scene && this.mesh) {
      this.scene.add(this.mesh);
      console.log("ISS marker added to scene");
    }
  }

  /**
   * Remove marker from the scene
   */
  removeFromScene() {
    if (this.scene && this.mesh) {
      this.scene.remove(this.mesh);
      this.disposeMesh();
      console.log("ISS marker removed from scene");
    }
  }

  /**
   * Update the marker position based on latitude and longitude
   * @param {Object} position - Position object {lat, lon}
   */
  updatePosition(position) {
    if (
      !position ||
      !MathUtils.isValidLatitude(position.lat) ||
      !MathUtils.isValidLongitude(position.lon)
    ) {
      console.warn("Invalid position provided to ISS marker:", position);
      return;
    }

    this.currentPosition = { ...position };

    const vector3Position = MathUtils.convertLatLonToVector3D(
      position.lat,
      position.lon,
      CONFIG.SCENE.ISS_ORBIT_HEIGHT
    );

    // Si le mesh n'est pas encore chargé, attendre qu'il le soit
    if (this.isLoading && this.loadingPromise) {
      this.loadingPromise
        .then(() => {
          if (this.mesh) {
            this.mesh.position.copy(vector3Position);
          }
        })
        .catch(() => {
          // Le fallback marker sera déjà positionné
        });
    } else if (this.mesh) {
      this.mesh.position.copy(vector3Position);
    }

    console.log(
      `ISS marker position updated: lat=${position.lat}, lon=${position.lon}`
    );
  }

  /**
   * Get current position
   * @returns {Object} Current position {lat, lon}
   */
  getCurrentPosition() {
    return { ...this.currentPosition };
  }

  /**
   * Get the 3D mesh object
   * @returns {Mesh} The mesh object
   */
  getMesh() {
    return this.mesh;
  }

  /**
   * Update marker color
   * @param {number} color - New hex color
   */
  updateColor(color) {
    if (this.mesh && this.mesh.material) {
      this.mesh.material.color.setHex(color);
      this.mesh.material.emissive.setHex(color);
    }
  }

  /**
   * Set marker visibility
   * @param {boolean} visible - Whether the marker should be visible
   */
  setVisible(visible) {
    if (this.mesh) {
      this.mesh.visible = visible;
    }
  }

  /**
   * Update ISS orientation based on velocity vector (optional enhancement)
   * @param {Object} velocity - Velocity vector {x, y, z}
   */
  updateOrientation(velocity) {
    if (this.mesh && velocity && !this.isLoading) {
      // Orienter l'ISS dans la direction de son mouvement
      this.mesh.lookAt(
        this.mesh.position.x + velocity.x,
        this.mesh.position.y + velocity.y,
        this.mesh.position.z + velocity.z
      );
    }
  }

  /**
   * Add subtle rotation animation to the ISS model
   * @param {number} deltaTime - Time since last frame
   */
  animate(deltaTime) {
    if (this.mesh && !this.isLoading) {
      // Rotation subtile autour de l'axe Y pour simuler le mouvement
      this.mesh.rotation.y += deltaTime * CONFIG.ISS_MODEL.ROTATION_SPEED;
    }
  }

  /**
   * Get loading state
   * @returns {boolean} True if still loading
   */
  isLoadingModel() {
    return this.isLoading;
  }

  /**
   * Wait for the model to be loaded
   * @returns {Promise} Promise that resolves when model is loaded
   */
  async waitForLoad() {
    if (this.loadingPromise) {
      try {
        await this.loadingPromise;
      } catch (error) {
        // Fallback marker will be used
        console.log("Using fallback marker due to loading error");
      }
    }
  }

  /**
   * Clean up resources (enhanced for 3D models)
   */
  disposeMesh() {
    if (this.mesh) {
      // Pour les modèles 3D complexes, nettoyer récursivement
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            // Gérer les matériaux multiples
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => {
                if (material.map) material.map.dispose();
                if (material.normalMap) material.normalMap.dispose();
                if (material.emissiveMap) material.emissiveMap.dispose();
                material.dispose();
              });
            } else {
              if (child.material.map) child.material.map.dispose();
              if (child.material.normalMap) child.material.normalMap.dispose();
              if (child.material.emissiveMap)
                child.material.emissiveMap.dispose();
              child.material.dispose();
            }
          }
        }
      });
    }
  }

  /**
   * Destroy the marker and clean up resources
   */
  destroy() {
    this.removeFromScene();
    this.disposeMesh();
    this.mesh = null;
    this.scene = null;
  }
}
