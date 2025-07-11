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
      // Mobile toggle buttons
      infoToggleBtn: document.getElementById("info-toggle-btn"),
    };

    // Validate that required elements exist
    this.validateElements();
    
    // Initialize mobile UI state
    this.initializeMobileUI();
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

    // Mobile info toggle button
    if (this.elements.infoToggleBtn) {
      this.elements.infoToggleBtn.addEventListener("click", () => {
        this.toggleInfoPanel();
      });
    }

    // Handle window resize for responsive behavior
    window.addEventListener("resize", () => {
      this.handleResize();
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

  updateISSInformationUI(data) {
    if (!data) return;

    const { lat, lon, velocity, altitude } = data;

    // Update latitude and longitude displays
    this.updatePositionDisplay({ lat, lon });

    // Update velocity display
    this.updateVelocityDisplay(velocity);

    // Update altitude display
    this.updateAltitudeDisplay(altitude);

    // Show success message
    this.showSuccess("ISS position updated successfully");
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
   * Clean up event listeners and references
   */
  dispose() {

    // Clear references
    this.elements = {};
    this.callbacks = {};

    console.log("UI Manager disposed");
  }

  /**
   * Initialize mobile UI state and behavior
   */
  initializeMobileUI() {
    this.isMobile = window.innerWidth <= 768;
    this.infoPanelVisible = !this.isMobile; // Masquer par défaut sur mobile
    
    if (this.isMobile && this.elements.coordinatesPanel) {
      this.elements.coordinatesPanel.classList.toggle("hidden", !this.infoPanelVisible);
    }
  }

  /**
   * Toggle info panel visibility on mobile
   */
  toggleInfoPanel() {
    if (!this.elements.coordinatesPanel || !this.isMobile) return;

    this.infoPanelVisible = !this.infoPanelVisible;
    this.elements.coordinatesPanel.classList.toggle("hidden", !this.infoPanelVisible);

    // Update toggle button icon
    if (this.elements.infoToggleBtn) {
      this.elements.infoToggleBtn.textContent = this.infoPanelVisible ? "❌" : "📊";
      this.elements.infoToggleBtn.setAttribute(
        "aria-label", 
        this.infoPanelVisible ? "Masquer les informations ISS" : "Afficher les informations ISS"
      );
    }

    // Provide haptic feedback on mobile devices
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }

  /**
   * Handle window resize for responsive behavior
   */
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    // Reset panel visibility when switching between mobile/desktop
    if (wasMobile !== this.isMobile) {
      if (this.elements.coordinatesPanel) {
        if (this.isMobile) {
          this.infoPanelVisible = false;
          this.elements.coordinatesPanel.classList.add("hidden");
          if (this.elements.infoToggleBtn) {
            this.elements.infoToggleBtn.textContent = "📊";
          }
        } else {
          this.infoPanelVisible = true;
          this.elements.coordinatesPanel.classList.remove("hidden");
        }
      }
    }
  }
}
