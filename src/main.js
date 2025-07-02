import { SceneManager } from "./classes/SceneManager.js";
import { ISSDataService } from "./classes/ISSDataService.js";
import { ISSMarker } from "./classes/ISSMarker.js";
import { UIManager } from "./classes/UIManager.js";
import { GroundReferenceMarker } from "./classes/GroundReferenceMarker.js";
import { LoadingScreen } from "./classes/LoadingScreen.js";
import { getAllResources } from "./config/resources.js";

/**
 * Main application class that coordinates all components
 */
class ISSTrackerApp {
  constructor() {
    this.sceneManager = null;
    this.ISSDataService = null;
    this.issMarker = null;
    this.uiManager = null;
    this.groundReferenceMarker = null; // For future use
    this.loadingScreen = null;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log("Initializing ISS Tracker App...");

      // Create and show advanced loading screen
      this.loadingScreen = new LoadingScreen();
      this.loadingScreen.show();

      // Initialize UI manager but keep original loading hidden
      this.uiManager = new UIManager();

      // Initialize 3D scene
      const canvas = document.querySelector("#scene");
      if (!canvas) {
        throw new Error("Canvas element not found");
      }

      this.sceneManager = new SceneManager(canvas);

      // Setup resource loading callbacks
      const resourceLoader = this.sceneManager.getResourceLoader();

      resourceLoader.onProgress((progress, loaded, total) => {
        this.loadingScreen.updateProgress(progress, loaded, total);
      });

      // Start scene initialization
      await this.sceneManager.startInitialization();

      // Track individual resource loading based on centralized config
      const allResources = getAllResources();
      allResources.forEach((resource) => {
        this.loadingScreen.updateResourceStatus(resource.name, "loading");
      });

      resourceLoader.onComplete(() => {
        // Update all resources as loaded
        allResources.forEach((resource) => {
          this.loadingScreen.updateResourceStatus(resource.name, "loaded");
        });
      });

      resourceLoader.onError((error, resourceName) => {
        console.error(`Failed to load resource: ${resourceName}`, error);
        this.loadingScreen.updateResourceStatus(resourceName, "error");
      });

      // Wait for all 3D resources to load
      this.loadingScreen.setStatus("Chargement des textures 3D...");
      await this.sceneManager.waitForResources();

      // Initialize ISS marker
      this.loadingScreen.setStatus("Création du modèle ISS...");
      this.issMarker = new ISSMarker(this.sceneManager.getScene());

      this.groundReferenceMarker = new GroundReferenceMarker(
        this.sceneManager.getScene()
      );

      // Connect ISS marker to scene manager for animation
      this.sceneManager.setISSMarker(this.issMarker);

      // Wait for ISS marker to load before proceeding
      this.loadingScreen.setStatus("Chargement du modèle ISS...");
      await this.issMarker.waitForLoad();

      // Initialize position service
      this.loadingScreen.setStatus("Connexion au service de position...");
      this.ISSDataService = new ISSDataService();

      // Setup event handlers
      this.setupEventHandlers();

      // Start services
      this.loadingScreen.setStatus("Démarrage des services...");
      await this.startServices();


      // Hide loading screen with delay for smooth transition
      this.loadingScreen.setStatus("Finalisation...");
      setTimeout(() => {
        this.loadingScreen.hide();
        this.uiManager.showSuccess("ISS Tracker initialized successfully");
      }, 1000);

      console.log("ISS Tracker App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);

      if (this.loadingScreen) {
        this.loadingScreen.setStatus("Erreur lors du chargement");
        setTimeout(() => {
          this.loadingScreen.hide();
        }, 2000);
      }

      if (this.uiManager) {
        this.uiManager.showError("Failed to initialize application");
      }
    }
  }

  /**
   * Setup event handlers between components
   */
  setupEventHandlers() {
    // Handle position updates from service
    this.ISSDataService.addListener((data) => {
      this.handleISSDataUpdate(data);
    });

    // Handle camera mode change
    this.uiManager.on("onCameraModeChange", (mode) => {
      this.handleCameraModeChange(mode);
    });

    // Handle errors
    this.setupErrorHandling();
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      if (this.uiManager) {
        this.uiManager.showError("An unexpected error occurred");
      }
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      if (this.uiManager) {
        this.uiManager.showError("Network error occurred");
      }
    });
  }

  /**
   * Handle position updates
   * @param {Object} data - New ISS position {lat, lon, velocity, altitude}
   */
  handleISSDataUpdate(data) {
    if (!data) return;

    const {lat, lon, altitude} = data;

    try {
      // Update 3D marker position
      if(lat && lon){
        if (this.issMarker) {
          this.issMarker.updatePosition({lat, lon}, altitude);
        }

        if (this.groundReferenceMarker) {
          this.groundReferenceMarker.updatePosition(data);
          this.groundReferenceMarker.createConnectionLine(
            this.issMarker.mesh.position
          );
        }
      }

      // Update UI display
      if (this.uiManager) {
        this.uiManager.updateISSInformationUI(data);
      }

      console.log(`Position updated: ${data.lat}, ${data.lon}`);
    } catch (error) {
      console.error("Error handling position update:", error);
      if (this.uiManager) {
        this.uiManager.showError("Error updating position");
      }
    }
  }


  /**
   * Handle camera mode change from UI
   * @param {string} mode - Camera mode: 'orbit', 'follow-iss', 'static'
   */
  handleCameraModeChange(mode) {
    if (this.sceneManager) {
      this.sceneManager.setCameraMode(mode);
    }
  }

  /**
   * Start application services
   */
  async startServices() {
    // Start 3D scene animation
    if (this.sceneManager) {
      this.sceneManager.startAnimation();
    }

    // Fetch initial position
    if (this.ISSDataService) {
      const initialPosition = await this.ISSDataService.fetchCurrentData();
      if (initialPosition) {
        this.handleISSDataUpdate(initialPosition);
      }
    }

    // Start position polling
    if (this.ISSDataService) {
      this.ISSDataService.startPolling();
    }
  }

  /**
   * Stop application services
   */
  stopServices() {
    if (this.ISSDataService) {
      this.ISSDataService.stopPolling();
    }

    if (this.sceneManager) {
      this.sceneManager.stopAnimation();
    }
  }

  /**
   * Clean up and dispose of resources
   */
  dispose() {
    console.log("Disposing ISS Tracker App...");

    this.stopServices();

    if (this.loadingScreen) {
      this.loadingScreen.dispose();
    }

    if (this.issMarker) {
      this.issMarker.destroy();
    }

    if (this.groundReferenceMarker) {
      this.issMarker.dispose();
    }

    if (this.sceneManager) {
      this.sceneManager.dispose();
    }

    if (this.ISSDataService) {
      this.ISSDataService.stopPolling();
    }

    if (this.uiManager) {
      this.uiManager.dispose();
    }

    console.log("ISS Tracker App disposed");
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing ISS Tracker...");

  const app = new ISSTrackerApp();
  await app.initialize();

  // Make app globally available for debugging
  window.issTrackerApp = app;

  // Handle page unload
  window.addEventListener("beforeunload", () => {
    app.dispose();
  });
});

// Export for potential module use
export default ISSTrackerApp;
