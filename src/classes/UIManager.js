/**
 * Class responsible for managing the user interface elements
 */
export class UIManager {
  constructor() {
    this.elements = {};
    this.callbacks = {};
    this.initialize();
  }

  /**
   * Initialize UI elements and event listeners
   */
  initialize() {
    this.cacheElements();
    this.setupEventListeners();
    console.log("UI Manager initialized");
  }

  /**
   * Cache DOM elements for better performance
   */
  cacheElements() {
    this.elements = {
      latitudeDisplay: document.getElementById("latitude-display"),
      longitudeDisplay: document.getElementById("longitude-display"),
      velocityDisplay: document.getElementById("velocity-display"),
      altitudeDisplay: document.getElementById("altitude-display"),
      statusIndicator: document.getElementById("status-indicator"),
      coordinatesPanel: document.getElementById("coordinates-panel"),
      controlsPanel: document.getElementById("controls-panel"),
      // Camera mode buttons
      orbitModeBtn: document.getElementById("orbit-mode"),
      followISSModeBtn: document.getElementById("follow-iss-mode"),
      staticModeBtn: document.getElementById("static-mode"),
      cameraModeButtons: document.querySelectorAll(".camera-btn"),
    };

    // Validate that required elements exist
    this.validateElements();
  }

  /**
   * Validate that required DOM elements exist
   */
  validateElements() {
    const requiredElements = [
      "latitudeDisplay",
      "longitudeDisplay",
      "rotationToggle",
    ];
    const missingElements = requiredElements.filter(
      (key) => !this.elements[key]
    );

    if (missingElements.length > 0) {
      console.warn(`Missing UI elements: ${missingElements.join(", ")}`);
    }
  }

  /**
   * Setup event listeners for UI elements
   */
  setupEventListeners() {
    // Camera mode buttons
    this.elements.cameraModeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const mode = event.currentTarget.dataset.mode;
        this.handleCameraModeChange(mode);
      });
    });
  }

  /**
   * Handle camera mode change
   * @param {string} mode - Camera mode: 'orbit', 'follow-iss', 'static'
   */
  handleCameraModeChange(mode) {
    // Update visual state of buttons
    this.elements.cameraModeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === mode);
    });

    // Call callback if registered
    if (this.callbacks.onCameraModeChange) {
      this.callbacks.onCameraModeChange(mode);
    }

    // Update status indicator
    const modeNames = {
      orbit: "Mode Orbite",
      "follow-iss": "Suivi ISS",
      static: "Mode Statique",
    };
    this.updateStatusIndicator(modeNames[mode] || "Mode Inconnu");
    console.log(`Camera mode changed to: ${mode}`);
  }

  /**
   * Update the ISS position display
   * @param {Object} position - Position object {lat, lon}
   */
  updatePositionDisplay(position) {
    if (!position) return;

    if (this.elements.latitudeDisplay) {
      this.elements.latitudeDisplay.textContent = this.formatCoordinate(
        position.lat,
        "lat"
      );
    }

    if (this.elements.longitudeDisplay) {
      this.elements.longitudeDisplay.textContent = this.formatCoordinate(
        position.lon,
        "lon"
      );
    }

    // Add visual feedback for position update
    this.highlightCoordinatesPanel();
  }

  updateVelocityDisplay(velocity) {
    if (!velocity || !this.elements.velocityDisplay) return;

    // Format velocity to 2 decimal places
    const formattedVelocity = velocity.toFixed(2);
    this.elements.velocityDisplay.textContent = `${formattedVelocity} km/h`;

    // Add visual feedback for velocity update
    this.highlightCoordinatesPanel();
  }
  
  updateAltitudeDisplay(altitude) {
    if (!altitude || !this.elements.velocityDisplay) return;

    // Format velocity to 2 decimal places
    const formattedVelocity = altitude.toFixed(2);
    this.elements.altitudeDisplay.textContent = `${formattedVelocity} km`;

    // Add visual feedback for velocity update
    this.highlightCoordinatesPanel();
  }

  /**
   * Format coordinate for display
   * @param {number} value - Coordinate value
   * @param {string} type - 'lat' or 'lon'
   * @returns {string} Formatted coordinate string
   */
  formatCoordinate(value, type) {
    const direction = this.getDirection(value, type);
    const absoluteValue = Math.abs(value);
    return `${absoluteValue.toFixed(4)}° ${direction}`;
  }

  /**
   * Get direction indicator for coordinate
   * @param {number} value - Coordinate value
   * @param {string} type - 'lat' or 'lon'
   * @returns {string} Direction indicator
   */
  getDirection(value, type) {
    if (type === "lat") {
      return value >= 0 ? "N" : "S";
    } else {
      return value >= 0 ? "E" : "W";
    }
  }

  /**
   * Update status indicator
   * @param {string} message - Status message
   * @param {string} type - Status type ('success', 'warning', 'error')
   */
  updateStatusIndicator(message, type = "info") {
    if (!this.elements.statusIndicator) return;

    this.elements.statusIndicator.textContent = message;
    this.elements.statusIndicator.className = `status-indicator ${type}`;

    // Auto-hide status after 3 seconds
    setTimeout(() => {
      if (this.elements.statusIndicator) {
        this.elements.statusIndicator.textContent = "";
        this.elements.statusIndicator.className = "status-indicator";
      }
    }, 3000);
  }

  /**
   * Highlight coordinates panel to show update
   */
  highlightCoordinatesPanel() {
    if (!this.elements.coordinatesPanel) return;

    this.elements.coordinatesPanel.classList.add("updated");

    setTimeout(() => {
      if (this.elements.coordinatesPanel) {
        this.elements.coordinatesPanel.classList.remove("updated");
      }
    }, 500);
  }



  /**
   * Show loading state
   */
  showLoading() {
    this.updateStatusIndicator("Loading ISS position...", "info");

    if (this.elements.coordinatesPanel) {
      this.elements.coordinatesPanel.classList.add("loading");
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    if (this.elements.coordinatesPanel) {
      this.elements.coordinatesPanel.classList.remove("loading");
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.updateStatusIndicator(message, "error");
    console.error("UI Error:", message);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.updateStatusIndicator(message, "success");
  }

  /**
   * Register callback for UI events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (typeof callback === "function") {
      this.callbacks[event] = callback;
    }
  }

  /**
   * Unregister callback for UI events
   * @param {string} event - Event name
   */
  off(event) {
    delete this.callbacks[event];
  }

  /**
   * Toggle panel visibility
   * @param {string} panelName - Panel element key
   * @param {boolean} visible - Whether panel should be visible
   */
  togglePanel(panelName, visible) {
    const panel = this.elements[panelName];
    if (panel) {
      panel.style.display = visible ? "block" : "none";
    }
  }

  /**
   * Clean up event listeners and references
   */
  dispose() {

    // Clear references
    this.elements = {};
    this.callbacks = {};

    console.log("UI Manager disposed");
  }
}
