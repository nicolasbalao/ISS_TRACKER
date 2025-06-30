import { SceneManager } from "./classes/SceneManager.js";
import { ISSPositionService } from "./classes/ISSPositionService.js";
import { ISSMarker } from "./classes/ISSMarker.js";
import { UIManager } from "./classes/UIManager.js";

/**
 * Main application class that coordinates all components
 */
class ISSTrackerApp {
  constructor() {
    this.sceneManager = null;
    this.positionService = null;
    this.issMarker = null;
    this.uiManager = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log("Initializing ISS Tracker App...");

      // Initialize UI first
      this.uiManager = new UIManager();
      this.uiManager.showLoading();

      // Initialize 3D scene
      const canvas = document.querySelector("#scene");
      if (!canvas) {
        throw new Error("Canvas element not found");
      }

      this.sceneManager = new SceneManager(canvas); // Initialize ISS marker
      this.issMarker = new ISSMarker(this.sceneManager.getScene());

      // Connect ISS marker to scene manager for animation
      this.sceneManager.setISSMarker(this.issMarker);

      // Wait for ISS marker to load before proceeding
      await this.issMarker.waitForLoad();

      // Initialize position service
      this.positionService = new ISSPositionService();

      // Setup event handlers
      this.setupEventHandlers();

      // Start services
      await this.startServices();

      this.isInitialized = true;
      this.uiManager.hideLoading();
      this.uiManager.showSuccess("ISS Tracker initialized successfully");

      console.log("ISS Tracker App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);
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
    this.positionService.addPositionListener((position) => {
      this.handlePositionUpdate(position);
    });

    // Handle UI rotation toggle
    this.uiManager.on("onRotationToggle", (enabled) => {
      this.handleRotationToggle(enabled);
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
   * @param {Object} position - New ISS position {lat, lon}
   */
  handlePositionUpdate(position) {
    if (!position) return;

    try {
      // Update 3D marker position
      if (this.issMarker) {
        this.issMarker.updatePosition(position);
      }

      // Update UI display
      if (this.uiManager) {
        this.uiManager.updatePositionDisplay(position);
      }

      console.log(`Position updated: ${position.lat}, ${position.lon}`);
    } catch (error) {
      console.error("Error handling position update:", error);
      if (this.uiManager) {
        this.uiManager.showError("Error updating position");
      }
    }
  }

  /**
   * Handle rotation toggle
   * @param {boolean} enabled - Whether rotation is enabled
   */
  handleRotationToggle(enabled) {
    if (this.sceneManager) {
      this.sceneManager.setRotationEnabled(enabled);
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
    if (this.positionService) {
      const initialPosition = await this.positionService.fetchCurrentPosition();
      if (initialPosition) {
        this.handlePositionUpdate(initialPosition);
      }
    }

    // Start position polling
    if (this.positionService) {
      this.positionService.startPolling();
    }
  }

  /**
   * Stop application services
   */
  stopServices() {
    if (this.positionService) {
      this.positionService.stopPolling();
    }

    if (this.sceneManager) {
      this.sceneManager.stopAnimation();
    }
  }

  /**
   * Get current ISS position
   * @returns {Object} Current position {lat, lon}
   */
  getCurrentPosition() {
    return this.positionService
      ? this.positionService.getCurrentPosition()
      : null;
  }

  /**
   * Manually refresh ISS position
   */
  async refreshPosition() {
    if (!this.positionService) return;

    try {
      this.uiManager?.showLoading();
      const position = await this.positionService.fetchCurrentPosition();

      if (position) {
        this.uiManager?.showSuccess("Position updated");
      } else {
        this.uiManager?.showError("Failed to fetch position");
      }
    } catch (error) {
      console.error("Error refreshing position:", error);
      this.uiManager?.showError("Network error");
    } finally {
      this.uiManager?.hideLoading();
    }
  }

  /**
   * Toggle between different view modes
   * @param {string} mode - View mode ('orbit', 'follow', 'fixed')
   */
  setViewMode(mode) {
    // Implementation for different camera modes
    console.log(`View mode set to: ${mode}`);
    // This could be extended to support different camera behaviors
  }

  /**
   * Clean up and dispose of resources
   */
  dispose() {
    console.log("Disposing ISS Tracker App...");

    this.stopServices();

    if (this.issMarker) {
      this.issMarker.destroy();
    }

    if (this.sceneManager) {
      this.sceneManager.dispose();
    }

    if (this.positionService) {
      this.positionService.stopPolling();
    }

    if (this.uiManager) {
      this.uiManager.dispose();
    }

    this.isInitialized = false;
    console.log("ISS Tracker App disposed");
  }

  /**
   * Check if the application is initialized
   * @returns {boolean} True if initialized
   */
  isReady() {
    return this.isInitialized;
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
