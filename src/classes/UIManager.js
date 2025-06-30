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
            rotationToggle: document.getElementById("rotation-toggle"),
            statusIndicator: document.getElementById("status-indicator"),
            coordinatesPanel: document.getElementById("coordinates-panel"),
            controlsPanel: document.getElementById("controls-panel"),
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
        if (this.elements.rotationToggle) {
            this.elements.rotationToggle.addEventListener("change", (event) => {
                const isEnabled = event.target.checked;
                this.handleRotationToggle(isEnabled);
            });
        }
    }

    /**
     * Handle rotation toggle change
     * @param {boolean} isEnabled - Whether rotation is enabled
     */
    handleRotationToggle(isEnabled) {
        if (this.callbacks.onRotationToggle) {
            this.callbacks.onRotationToggle(isEnabled);
        }

        this.updateStatusIndicator(
            isEnabled ? "Rotation Enabled" : "Rotation Disabled"
        );
        console.log(`Rotation toggled: ${isEnabled}`);
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
     * Set rotation toggle state
     * @param {boolean} enabled - Whether rotation is enabled
     */
    setRotationToggleState(enabled) {
        if (this.elements.rotationToggle) {
            this.elements.rotationToggle.checked = enabled;
        }
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
        // Remove event listeners
        if (this.elements.rotationToggle) {
            this.elements.rotationToggle.removeEventListener(
                "change",
                this.handleRotationToggle
            );
        }

        // Clear references
        this.elements = {};
        this.callbacks = {};

        console.log("UI Manager disposed");
    }
}
