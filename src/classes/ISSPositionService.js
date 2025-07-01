import {CONFIG} from "../config/config.js";

/**
 * Service responsible for fetching ISS position data from the API
 */
export class ISSPositionService {
    constructor() {
        this.currentPosition = {...CONFIG.DEFAULT_POSITION}; // Default position
        this.listeners = [];
        this.isPolling = false;
    }

    /**
     * Fetch current ISS position from API
     * @returns {Promise<{lat: number, lon: number}|null>}
     */
    async fetchCurrentPosition() {
        try {
            const response = await fetch(CONFIG.API.ISS_POSITION_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const {latitude, longitude} = await response.json();

            const position = {
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
            };
            console.log("Position fetched from API:", position);

            console.log(
                `[ISS Position] Latitude: ${position.lat}, Longitude: ${position.lon}`
            );
            this.updatePosition(position);

            return position;
        } catch (error) {
            console.error("Error fetching ISS position:", error);
            return null;
        }
    }

    /**
     * Update current position and notify listeners
     * @param {Object} position - The new position {lat, lon}
     */
    updatePosition(position) {
        this.currentPosition = position;
        this.notifyListeners(position);
    }

    /**
     * Add a listener for position updates
     * @param {Function} callback - Callback function to be called on position update
     */
    addPositionListener(callback) {
        if (typeof callback === "function") {
            this.listeners.push(callback);
        }
    }

    /**
     * Remove a position listener
     * @param {Function} callback - Callback function to remove
     */
    removePositionListener(callback) {
        this.listeners = this.listeners.filter((listener) => listener !== callback);
    }

    /**
     * Notify all listeners of position change
     * @param {Object} position - The updated position
     */
    notifyListeners(position) {
        this.listeners.forEach((listener) => {
            try {
                listener(position);
            } catch (error) {
                console.error("Error in position listener:", error);
            }
        });
    }

    /**
     * Start polling ISS position at regular intervals
     */
    startPolling() {
        if (this.isPolling) {
            console.warn("Polling is already active");
            return;
        }

        this.isPolling = true;

        // Fetch initial position
        this.fetchCurrentPosition();

        // Set up interval for periodic updates
        this.pollingInterval = setInterval(() => {
            this.fetchCurrentPosition();
        }, CONFIG.API.POLLING_INTERVAL);

        console.log("ISS position polling started");
    }

    /**
     * Stop polling ISS position
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.isPolling = false;
        console.log("ISS position polling stopped");
    }

    /**
     * Get current position
     * @returns {Object} Current ISS position {lat, lon}
     */
    getCurrentPosition() {
        return {...this.currentPosition};
    }
}
