import {MathUtils} from "./MathUtils.js";
import {CONFIG} from "../config/config.js";
import {Mesh, MeshStandardMaterial, SphereGeometry} from "three";

/**
 * Class representing the ISS marker in the 3D scene
 */
export class ISSMarker {
    constructor(scene, color = CONFIG.VISUAL.DEFAULT_ISS_COLOR) {
        this.scene = scene;
        this.mesh = this.createMarkerMesh(color);
        this.currentPosition = {lat: 0, lon: 0};

        this.addToScene();
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

        this.currentPosition = {...position};

        const vector3Position = MathUtils.convertLatLonToVector3D(
            position.lat,
            position.lon,
            CONFIG.SCENE.ISS_ORBIT_HEIGHT
        );

        this.mesh.position.copy(vector3Position);

        console.log(
            `ISS marker position updated: lat=${position.lat}, lon=${position.lon}`
        );
    }

    /**
     * Get current position
     * @returns {Object} Current position {lat, lon}
     */
    getCurrentPosition() {
        return {...this.currentPosition};
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
     * Clean up resources
     */
    disposeMesh() {
        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material) {
                this.mesh.material.dispose();
            }
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
