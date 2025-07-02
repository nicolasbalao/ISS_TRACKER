import {CONFIG} from "../config/config.js";

/**
 * Service responsible for fetching ISS position data from the API
 */
export class ISSDataService {
    constructor() {
        this.listeners = [];
        this.isPolling = false;
    }

    /**
     * Fetch current ISS position from API
     * @returns {Promise<{lat: number, lon: number}|null>}
     */
    async fetchCurrentData() {
        try {
            const response = await fetch(CONFIG.API.ISS_POSITION_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const {latitude, longitude, velocity, altitude} = await response.json();


            const position = {
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
            };
            console.log("Position fetched from API:", position);

            console.log(
                `[ISS Position] Latitude: ${position.lat}, Longitude: ${position.lon}`
            );
            this.updateData({lat: latitude, lon: longitude, velocity, altitude});

            return position;
        } catch (error) {
            console.error("Error fetching ISS position:", error);
            return null;
        }
    }


    updateData(data){
        this.notifyListeners(data);
    }

    /**
     * Add a listener for position updates
     * @param {Function} callback - Callback function to be called on position update
     */
    addListener(callback) {
        if (typeof callback === "function") {
            this.listeners.push(callback);
        }
    }

    /**
     * Notify all listeners of position change
     * @param {Object} data - The updated data {lat, lon, velocity, altitude}
     */
    notifyListeners(data) {
        this.listeners.forEach((listener) => {
            try {
                listener(data);
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
        this.fetchCurrentData();

        // Set up interval for periodic updates
        this.pollingInterval = setInterval(() => {
            this.fetchCurrentData();
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
}
